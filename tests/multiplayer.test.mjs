import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {MAX_PLAYERS, createRoom, authorize, joinRoom, applyRoomAction, viewFor} from "../multiplayer/room-core.mjs";

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
const act = (room, actor, type, extras = {}) => applyRoomAction(room, actor, {type, expectedRevision: room.revision, ...extras});

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
