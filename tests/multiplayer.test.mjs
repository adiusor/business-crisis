import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {MAX_PLAYERS, ROUND_MS, GRACE_MS, GRACE_PENALTY, NO_ANSWER_PENALTY, ROOM_TTL_MS, TEAM_NAME_POOL, createRoom, authorize, joinRoom, applyRoomAction, expireRoom, clockFor, viewLobby, viewFor} from "../multiplayer/room-core.mjs";

const hash = s => createHash("sha256").update(s).digest("hex");
function fixture(teamNames = ["ALPHA", "BRAVO"]) {
  const room = createRoom({code: "A1B2C3D4E5F6", hostHash: hash("host"), teamNames});
  return {room, host: {role: "host"}};
}
function enter(room, name, teamIndex, suffix) {
  const playerId = "player-00" + suffix;
  const result = joinRoom(room, {nickname: name, teamIndex, playerId, credentialHash: hash("participant-" + suffix)});
  return {room: result, actor: {role: "player", playerId}};
}
const act = (room, actor, type, extras = {}) => applyRoomAction(room, actor, {type, expectedRevision: room.revision, ...(type === "lock_advisers" ? {planIndex: 0, signalIndex: 0} : {}), ...extras});

test("validates team count, team labels and room credentials", () => {
  assert.throws(() => fixture(["ONLY"]), /2–4 teams/);
  assert.throws(() => fixture(["A", "a"]), /unique names/);
  assert.throws(() => fixture(["A", ""]), /unique names/);
  assert.throws(() => createRoom({code: "not-valid", hostHash: hash("host"), teamNames: ["A", "B"]}), /room code/);
  assert.throws(() => createRoom({code: "A1B2C3D4E5F6", hostHash: "bad", teamNames: ["A", "B"]}), /credential/);
  assert.equal(fixture(["ONE", "TWO", "THREE", "FOUR"]).room.teams.length, 4);
});

test("host and players require independently authenticated credentials", () => {
  const {room} = fixture();
  const joined = enter(room, "Alice", 0, 1);
  assert.deepEqual(authorize(joined.room, hash("host")), {role: "host"});
  assert.deepEqual(authorize(joined.room, hash("participant-1")), joined.actor);
  assert.throws(() => authorize(joined.room, hash("wrong")), /Unauthorized/);
  assert.throws(() => authorize(joined.room, ""), /Unauthorized/);
  assert.equal(JSON.stringify(joined.room).includes("participant-1"), false, "plaintext token never stored");
  assert.equal(JSON.stringify(joined.room).includes('"host"'), false, "plaintext host token never stored");
});

test("joining is lobby-only, requires unique nicknames, and stays bounded", () => {
  let {room, host} = fixture();
  assert.throws(() => enter(room, "A", 10, 1), /Invalid team/);
  assert.throws(() => enter(room, " ", 0, 1), /Nickname/);
  room = enter(room, "Alice", 0, 1).room;
  assert.throws(() => enter(room, "alice", 1, 2), /already taken/);
  assert.throws(() => act(room, host, "start"), /Each team needs a participant/);
  room = enter(room, "Bob", 1, 2).room;
  room = act(room, host, "start");
  assert.throws(() => enter(room, "Late", 0, 3), /late joining is not enabled/);
  assert.equal(room.phase, "advisers");
  let capped = fixture().room;
  for (let i = 0; i < MAX_PLAYERS; i++) capped = enter(capped, "P" + i, i % 2, i + 100).room;
  assert.equal(capped.players.length, MAX_PLAYERS);
  assert.throws(() => enter(capped, "Overflow", 0, 999), /join limit/);
});

test("selections are team-private; host can see readiness but not adviser picks", () => {
  let {room, host} = fixture();
  const a = enter(room, "Alice", 0, 1); room = a.room;
  const b = enter(room, "Bob", 1, 2); room = b.room;
  room = act(room, host, "start");
  room = act(room, a.actor, "select_advisers", {advisers: [0, 4]});
  assert.deepEqual(viewFor(room, a.actor).privateTeam.advisers, [0, 4]);
  assert.deepEqual(viewFor(room, b.actor).privateTeam.advisers, []);
  const hostView = viewFor(room, host);
  assert.equal(Object.hasOwn(hostView, "privateTeam"), false);
  for (const view of [hostView, viewFor(room, b.actor)]) {
    assert.equal(JSON.stringify(view).includes('"advisers":[0,4]'), false, "Other roles must not receive private selections");
    assert.equal(JSON.stringify(view).includes("credentialHash"), false);
    assert.equal(JSON.stringify(view).includes("hostHash"), false);
  }
  assert.equal(hostView.teams[0].locked, false);
  assert.equal(viewFor(room, a.actor).viewer.captain, true);
});

test("only the captain changes and locks a team's advisers", () => {
  let {room, host} = fixture();
  const a = enter(room, "Alice", 0, 1); room = a.room;
  const teammate = enter(room, "Eve", 0, 3); room = teammate.room;
  const b = enter(room, "Bob", 1, 2); room = b.room;
  room = act(room, host, "start");
  assert.throws(() => act(room, teammate.actor, "select_advisers", {advisers: [0,1]}), /captain/);
  assert.throws(() => act(room, host, "select_advisers", {advisers: [0,1]}), /participant/);
  assert.throws(() => act(room, a.actor, "lock_advisers"), /Choose two advisers first/);
  for (const invalid of [[1,1], [0, 6], [0], ["0", 1]]) {
    assert.throws(() => act(room, a.actor, "select_advisers", {advisers: invalid}), /two different advisers/);
  }
  room = act(room, a.actor, "select_advisers", {advisers: [0,1]});
  room = act(room, a.actor, "select_advisers", {advisers: [2,5]}); // Change before confirmation.
  room = act(room, a.actor, "lock_advisers");
  assert.deepEqual(viewFor(room, teammate.actor).privateTeam.advisers, [2,5]);
  assert.throws(() => act(room, a.actor, "select_advisers", {advisers: [1,2]}), /locked/);
  assert.throws(() => act(room, a.actor, "lock_advisers"), /locked/);
  assert.throws(() => act(room, host, "advance"), /Not every team/);
  room = act(room, b.actor, "select_advisers", {advisers: [1,3]});
  room = act(room, b.actor, "lock_advisers");
  room = act(room, host, "advance");
  assert.equal(room.round, 1);
  assert.equal(room.teams.every(t => t.locked === false && t.advisers.length === 0), true);
});

test("revision guards reject stale writes and do not mutate prior room state", () => {
  let {room, host} = fixture();
  const a = enter(room, "Alice", 0, 1); room = a.room;
  const b = enter(room, "Bob", 1, 2); room = b.room;
  const before = structuredClone(room);
  room = act(room, host, "start");
  assert.deepEqual(before.phase, "lobby");
  assert.equal(before.revision + 1, room.revision);
  assert.throws(() => applyRoomAction(room, a.actor, {type: "select_advisers", expectedRevision: before.revision, advisers: [0,1]}), /refresh state/);
  assert.throws(() => act(room, b.actor, "advance"), /Only the host/);
  assert.throws(() => viewFor(room, {role: "player", playerId: "forged"}), /Unauthorized/);
  assert.equal(room.teams[0].advisers.length, 0);
});

test("six host-controlled rounds terminate with no hidden opponent data", () => {
  let {room, host} = fixture();
  const a = enter(room, "Alice", 0, 1); room = a.room;
  const b = enter(room, "Bob", 1, 2); room = b.room;
  room = act(room, host, "start");
  for (let round = 0; round < 6; round++) {
    assert.equal(room.round, round);
    for (const actor of [a.actor, b.actor]) {
      room = act(room, actor, "select_advisers", {advisers: [round % 6, (round + 2) % 6]});
      room = act(room, actor, "lock_advisers");
    }
    room = act(room, host, "advance");
    assert.equal(room.phase, round === 5 ? "complete" : "advisers");
  }
  assert.equal(room.round, 5);
  assert.throws(() => act(room, host, "advance"), /not awaiting choices/);
  assert.equal(JSON.stringify(viewFor(room, host)).includes("credentialHash"), false);
  assert.equal(room.players.length, 2);
});


test("random fictional team names are unique, reproducible and selectable from the pool", () => {
  const params = {code: "A1B2C3D4E5F6", hostHash: hash("host"), teamCount: 4, nameSeed: 12345, createdAtMs: 1000};
  const room = createRoom(params);
  assert.equal(room.teams.length, 4);
  assert.deepEqual(room.teams.map(t => t.name), createRoom(params).teams.map(t => t.name));
  assert.equal(new Set(room.teams.map(t => t.name)).size, 4);
  assert.ok(room.teams.every(t => TEAM_NAME_POOL.includes(t.name)));
  assert.equal(room.expiresAtMs, 1000 + ROOM_TTL_MS);
  assert.notDeepEqual(room.teams.map(t => t.name), createRoom({...params, nameSeed: 67890}).teams.map(t => t.name));
});

test("captain can rename before start from unused names, not arbitrary strings", () => {
  let room = createRoom({code: "A1B2C3D4E5F6", hostHash: hash("host"), teamCount: 2, nameSeed: 99});
  const a = enter(room, "Alice", 0, 1); room = a.room;
  const b = enter(room, "Bob", 1, 2); room = b.room;
  const teammate = enter(room, "Eve", 0, 3); room = teammate.room;
  const unused = TEAM_NAME_POOL.find(n => room.teams.every(t => t.name !== n));
  assert.throws(() => act(room, teammate.actor, "rename_team", {name: unused}), /captain/);
  assert.throws(() => act(room, a.actor, "rename_team", {name: "BAD<TEAM>"}), /name from the list/);
  assert.throws(() => act(room, a.actor, "rename_team", {name: room.teams[1].name}), /already taken/);
  const before = room;
  room = act(room, a.actor, "rename_team", {name: unused});
  assert.equal(room.teams[0].name, unused);
  assert.notEqual(room, before);
  assert.equal(before.teams[0].name === unused, false);
  room = act(room, {role: "host"}, "start");
  assert.throws(() => act(room, a.actor, "rename_team", {name: TEAM_NAME_POOL[0]}), /lobby participant/);
});

test("lobby discovery does not expose tokens, nicknames or team-private choices", () => {
  let {room, host} = fixture();
  const a = enter(room, "ALICE_PRIVATE", 0, 1); room = a.room;
  const b = enter(room, "BOB_PRIVATE", 1, 2); room = b.room;
  const publicView = viewLobby(room);
  assert.equal(publicView.teams[0].joined, 1);
  assert.equal(JSON.stringify(publicView).includes("ALICE_PRIVATE"), false);
  assert.equal(JSON.stringify(publicView).includes("credentialHash"), false);
  room = act(room, host, "start");
  room = act(room, a.actor, "select_advisers", {advisers: [0, 4]});
  assert.equal(JSON.stringify(viewFor(room, host)).includes('"advisers":'), false);
  assert.deepEqual(viewFor(room, a.actor).privateTeam.advisers, [0, 4]);
  assert.deepEqual(viewFor(room, b.actor).privateTeam.advisers, []);
});

test("3m on-time, 1m grace with exactly 5 points, and no clock client override", () => {
  let {room, host} = fixture();
  const a = enter(room, "Alice", 0, 1); room = a.room;
  const b = enter(room, "Bob", 1, 2); room = b.room;
  const started = 1_700_000_000_000;
  room = applyRoomAction(room, host, {type: "start", expectedRevision: room.revision}, started);
  assert.equal(clockFor(room, started + ROUND_MS - 1).stage, "normal");
  assert.equal(clockFor(room, started + ROUND_MS).stage, "grace");
  assert.equal(clockFor(room, started + ROUND_MS + GRACE_MS).stage, "closed");
  room = applyRoomAction(room, a.actor, {type: "select_advisers", advisers: [0,1],
    expectedRevision: room.revision, nowMs: 0}, started + ROUND_MS - 10);
  room = applyRoomAction(room, a.actor, {type: "lock_advisers", planIndex: 0, signalIndex: 0,
    expectedRevision: room.revision, nowMs: 0}, started + ROUND_MS - 1);
  assert.equal(room.teams[0].penaltyPoints, 0);
  room = applyRoomAction(room, b.actor, {type: "select_advisers", advisers: [2,3],
    expectedRevision: room.revision}, started + ROUND_MS);
  room = applyRoomAction(room, b.actor, {type: "lock_advisers", planIndex: 0, signalIndex: 0,
    expectedRevision: room.revision}, started + ROUND_MS + 1500);
  assert.equal(room.teams[1].penaltyPoints, GRACE_PENALTY);
  assert.equal(room.teams[1].roundPenalty, 5);
  assert.equal(room.teams[0].roundPenalty, 0);
  room = applyRoomAction(room, host, {type: "advance", expectedRevision: room.revision}, started + ROUND_MS + 1501);
  assert.deepEqual(room.teams.map(t => t.roundResults[0].penalty), [0, 5]);
  assert.equal(room.teams[1].penaltyPoints, 5);
  assert.equal(room.startedAtMs, started + ROUND_MS + 1501);
});

test("four-minute deadline is enforced by server, survives disconnects and is idempotent", () => {
  let {room, host} = fixture();
  const a = enter(room, "Alice", 0, 1); room = a.room;
  const b = enter(room, "Bob", 1, 2); room = b.room;
  const start = 100_000;
  room = applyRoomAction(room, host, {type: "start", expectedRevision: room.revision}, start);
  room = applyRoomAction(room, a.actor, {type: "select_advisers", advisers: [0,1],
    expectedRevision: room.revision}, start + 10);
  room = applyRoomAction(room, a.actor, {type: "lock_advisers", planIndex: 0, signalIndex: 0, expectedRevision: room.revision}, start + 11);
  assert.throws(() => applyRoomAction(room, b.actor, {type: "select_advisers", advisers: [1,2],
    expectedRevision: room.revision}, start + ROUND_MS + GRACE_MS), /four-minute/);
  assert.equal(room.teams[1].locked, false);
  const expired = expireRoom(room, start + ROUND_MS + GRACE_MS);
  assert.equal(expired.teams[1].timedOut, true);
  assert.equal(expired.teams[1].locked, true);
  assert.deepEqual(expired.teams[1].advisers, []);
  assert.equal(expired.teams[1].penaltyPoints, NO_ANSWER_PENALTY);
  assert.equal(expireRoom(expired, start + ROUND_MS + GRACE_MS + 90000), expired);
  assert.equal(expired.revision, room.revision + 1);
  room = applyRoomAction(expired, host, {type: "advance", expectedRevision: expired.revision}, start + ROUND_MS + GRACE_MS + 1);
  assert.equal(room.teams[1].roundResults[0].timedOut, true);
  assert.equal(room.teams[1].roundResults[0].penalty, 12);
  assert.equal(room.teams[1].penaltyPoints, 12);
  assert.equal(room.teams[1].locked, false);
  assert.equal(room.round, 1);
});

test("points remain cumulative over six windows without leaking other teams' answers", () => {
  let {room, host} = fixture();
  const a = enter(room, "Alice", 0, 1); room = a.room;
  const b = enter(room, "Bob", 1, 2); room = b.room;
  let now = 1_000_000;
  room = applyRoomAction(room, host, {type: "start", expectedRevision: room.revision}, now);
  for (let i = 0; i < 6; i++) {
    room = applyRoomAction(room, a.actor, {type: "select_advisers", advisers: [0,1],
      expectedRevision: room.revision}, now + 30_000);
    room = applyRoomAction(room, a.actor, {type: "lock_advisers", planIndex: 0, signalIndex: 0,
      expectedRevision: room.revision}, now + 30_001);
    room = applyRoomAction(room, b.actor, {type: "select_advisers", advisers: [2,3],
      expectedRevision: room.revision}, now + 180_001);
    room = applyRoomAction(room, b.actor, {type: "lock_advisers", planIndex: 0, signalIndex: 0,
      expectedRevision: room.revision}, now + 180_002);
    now += 190_000;
    room = applyRoomAction(room, host, {type: "advance",
      expectedRevision: room.revision}, now);
  }
  assert.equal(room.phase, "complete");
  assert.equal(room.teams[0].penaltyPoints, 0);
  assert.equal(room.teams[1].penaltyPoints, 30);
  assert.equal(room.teams[1].roundResults.length, 6);
  assert.equal(room.teams[1].roundResults.every(r => r.penalty === 5), true);
  const hostView = viewFor(room, host);
  assert.equal(JSON.stringify(hostView).includes('"advisers":'), false);
  assert.equal(JSON.stringify(viewFor(room, a.actor)).includes('"advisers":[2,3]'), false);
});

test("UI is a separate no-email preview with a real QR route and no inline credentials", async () => {
  const fs = await import("node:fs/promises");
  const html = await fs.readFile(new URL("../multiplayer/client.html", import.meta.url), "utf8");
  const script = await fs.readFile(new URL("../multiplayer/client-script.txt", import.meta.url), "utf8");
  const style = await fs.readFile(new URL("../multiplayer/client-style.txt", import.meta.url), "utf8");
  assert.match(html, /\/room-script\.js/);
  assert.match(html, /\/room-style\.css/);
  assert.match(script, /\/api\/rooms\//);
  assert.match(script, /new WebSocket/);
  assert.match(script, /sessionStorage/);
  assert.match(html, /id="join-qr"/);
  assert.doesNotMatch(script, /localStorage/);
  assert.doesNotMatch(html, /type="email"/);
  assert.ok(style.includes("320px") === false && style.includes("max-width:430px"));
  assert.doesNotThrow(() => new Function(script), "Client JS has valid syntax");
});


test("all six real episodes commit server-side and preserve the cash ledger", () => {
 let {room, host}=fixture();
 const a=enter(room,"Alice",0,1);room=a.room;
 const b=enter(room,"Bob",1,2);room=b.room;
 let now=1000000;
 room=applyRoomAction(room,host,{type:"start",expectedRevision:room.revision},now);
 for(let round=0;round<6;round++){
  const ep=viewFor(room,host).episode;
  assert.ok(ep.brief&&ep.evidence.length===3&&ep.plans.length===3&&ep.signals.length===3);
  assert.equal(typeof ep.plans[0].cost,"string");
  assert.equal(Object.hasOwn(ep,"advice"),false);
  for(const actor of [a.actor,b.actor]){
   room=applyRoomAction(room,actor,{type:"select_advisers",advisers:[0,3],expectedRevision:room.revision},now+5000);
   const privateView=viewFor(room,actor).privateTeam;
   assert.equal(privateView.intelligence.length,2,"only two sources of advice");
   const allocation=round===2||round===4?{amount:10000,route:"audit"}:{amount:0,route:null};
   room=applyRoomAction(room,actor,{type:"submit_decision",planIndex:round%3,signalIndex:(round+1)%3,
     allocation,expectedRevision:room.revision},now+20000);
   const t=room.teams[actor.playerId===a.actor.playerId?0:1];
   assert.equal(t.economic.nextRound,round+1);
   assert.equal(t.economic.history.length,round+1);
   assert.equal(t.economic.cash,260000-t.economic.ledger.reduce((sum,x)=>sum+x.amount,0));
   assert.equal(t.penaltyPoints,0);
  }
  const raw=room.teams[0].economic;
  assert.throws(()=>applyRoomAction(room,a.actor,{type:"submit_decision",planIndex:0,signalIndex:0,
    expectedRevision:room.revision},now+21000),/locked/);
  room=applyRoomAction(room,host,{type:"advance",expectedRevision:room.revision},now+25000);
  assert.equal(room.lastRecap.round,round+1);
  assert.equal(JSON.stringify(viewFor(room,host)).includes('"intelligence"'),false);
  assert.equal(room.teams[0].economic.history.length,round+1);
  assert.equal(room.teams[0].economic.cash,raw.cash);
  now+=30000;
 }
 assert.equal(room.phase,"complete");
 const verdict=viewFor(room,host).verdict;
 assert.equal(verdict.ranked.length,2);
 assert.equal(verdict.ranked[0].decisions.length,6);
 assert.equal(verdict.ranked[0].score,verdict.ranked[0].rawScore);
 assert.equal(JSON.stringify(verdict).includes('"advisers"'),false);
 assert.equal(JSON.stringify(verdict).includes('"credentialHash"'),false);
 assert.throws(()=>applyRoomAction(room,host,{type:"advance",expectedRevision:room.revision},now),/not awaiting choices/);
});

test("timeout has real economic consequences and timing points alter final ranking", () => {
 let {room,host}=fixture();
 const a=enter(room,"Alice",0,1);room=a.room;
 const b=enter(room,"Bob",1,2);room=b.room;
 let now=1000000;
 room=applyRoomAction(room,host,{type:"start",expectedRevision:room.revision},now);
 for(let round=0;round<6;round++){
  room=applyRoomAction(room,a.actor,{type:"select_advisers",advisers:[0,1],expectedRevision:room.revision},now+1);
  room=applyRoomAction(room,a.actor,{type:"submit_decision",planIndex:0,signalIndex:0,
    expectedRevision:room.revision},now+2);
  if(round%2===0){
   // B submits after the on-time window and loses five final ranking points.
   room=applyRoomAction(room,b.actor,{type:"select_advisers",advisers:[0,1],expectedRevision:room.revision},now+1);
   room=applyRoomAction(room,b.actor,{type:"submit_decision",planIndex:0,signalIndex:0,
     expectedRevision:room.revision},now+ROUND_MS+1);
  }else{
   room=expireRoom(room,now+ROUND_MS+GRACE_MS);
   const silent=room.teams[1].economic.history[round];
   assert.equal(silent.timedOut,true);
   assert.equal(silent.planIndex,null);
   assert.equal(silent.plan,"NO RESPONSE");
  }
  now+=ROUND_MS+GRACE_MS+1000;
  room=applyRoomAction(room,host,{type:"advance",expectedRevision:room.revision},now);
  now+=1000;
 }
 assert.equal(room.phase,"complete");
 const verdict=viewFor(room,host).verdict;
 const alice=verdict.ranked.find(x=>x.name==="ALPHA");
 const bob=verdict.ranked.find(x=>x.name==="BRAVO");
 assert.equal(alice.timingPenalty,0);
 assert.equal(bob.timingPenalty,3*GRACE_PENALTY+3*NO_ANSWER_PENALTY);
 assert.equal(bob.score,Math.max(0,bob.rawScore-bob.timingPenalty));
 assert.ok(bob.cash<=260000&&bob.decisions.filter(x=>x.timedOut).length===3);
 assert.equal(verdict.hasChampion,verdict.champions.length>0);
 assert.equal(room.teams[1].economic.cash,
  260000-room.teams[1].economic.ledger.reduce((sum,l)=>sum+l.amount,0));
});
test("cannot submit client-provided score, cash or adviser list after the clock",()=>{
 let {room,host}=fixture();
 const a=enter(room,"Alice",0,1);room=a.room;
 const b=enter(room,"Bob",1,2);room=b.room;
 room=applyRoomAction(room,host,{type:"start",expectedRevision:room.revision},1000);
 room=applyRoomAction(room,a.actor,{type:"select_advisers",advisers:[0,2],expectedRevision:room.revision},1001);
 assert.throws(()=>applyRoomAction(room,a.actor,{type:"submit_decision",planIndex:9,signalIndex:0,expectedRevision:room.revision},1002),/Invalid strategic/);
 assert.throws(()=>applyRoomAction(room,a.actor,{type:"submit_decision",planIndex:0,signalIndex:0,allocation:{amount:20000,route:"audit"},expectedRevision:room.revision},1002),/Invalid allocation/);
 assert.throws(()=>applyRoomAction(room,b.actor,{type:"submit_decision",planIndex:0,signalIndex:0,expectedRevision:room.revision},1002),/Choose two advisers/);
 assert.throws(()=>applyRoomAction(room,a.actor,{type:"submit_decision",planIndex:0,signalIndex:0,expectedRevision:room.revision},1000+ROUND_MS+GRACE_MS),/four-minute/);
 room=applyRoomAction(room,a.actor,{type:"submit_decision",planIndex:0,signalIndex:0,expectedRevision:room.revision,
    cash:999999,score:100},1002);
 assert.equal(room.teams[0].economic.cash,260000-8000-18000);
});
