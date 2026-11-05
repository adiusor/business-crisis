// Run the real isolated Worker locally through Wrangler. No deployment, account or secret required.
// This tests HTTP, SVG QR, Durable Object persistence, role visibility and WebSocket fan-out.
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {setTimeout as delay} from "node:timers/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const port = 18717;
const base = "http://127.0.0.1:" + port;
const creationKey = "integration-test-only-do-not-use-in-production";
const bin = path.join(root, "node_modules", ".bin", "wrangler");
const child = spawn(bin, [
  "dev", "--config", "multiplayer/wrangler.jsonc", "--ip", "127.0.0.1", "--port", String(port),
  "--local", "--var", "ROOM_CREATION_KEY:" + creationKey
], {cwd: root, stdio: ["ignore", "pipe", "pipe"],
  env: {...process.env, WRANGLER_SEND_METRICS: "false", CI: "true"}});
let logs = "";
const record = chunk => {logs = (logs + String(chunk)).slice(-5000);};
child.stdout.on("data", record); child.stderr.on("data", record);
const sockets = [];
const clean = async () => {
  for (const ws of sockets) { try { ws.close(); } catch (_) {} }
  child.kill("SIGTERM");
  await Promise.race([new Promise(resolve => child.once("exit", resolve)), delay(3000)]);
  if (child.exitCode === null) child.kill("SIGKILL");
};
async function req(url, method = "GET", body, bearer) {
  const response = await fetch(base + url, {method, headers: {
    ...(body ? {"content-type": "application/json"} : {}),
    ...(bearer ? {"authorization": "Bearer " + bearer} : {})
  }, body: body ? JSON.stringify(body) : undefined});
  let payload;
  if (response.headers.get("content-type")?.includes("application/json")) payload = await response.json();
  else payload = await response.text();
  return {response, payload};
}
function socketFor(credential, code) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket("ws://127.0.0.1:" + port + "/api/rooms/" + code + "/socket");
    const messages = [];
    sockets.push(ws);
    const deadline = setTimeout(() => reject(Error("Socket authentication timeout")), 8000);
    ws.addEventListener("open", () => ws.send(JSON.stringify({type:"authenticate",token:credential})));
    ws.addEventListener("message", event => {
      let msg;
      try { msg = JSON.parse(event.data); } catch (_) { return; }
      messages.push(msg);
      if (msg.type === "snapshot") {
        clearTimeout(deadline);
        resolve({ws, messages});
      }
    });
    ws.addEventListener("error", () => {clearTimeout(deadline);reject(Error("WebSocket connection failed"));});
  });
}
async function snapshot(handle, predicate, label) {
  for (let attempt = 0; attempt < 70; attempt++) {
    const found = [...handle.messages].reverse().find(x => x.type === "snapshot" && predicate(x.state));
    if (found) return found.state;
    await delay(100);
  }
  throw Error("No synced snapshot for " + label + " ; " + logs.slice(-600));
}
try {
  let live = false;
  for (let i = 0; i < 120; i++) {
    if (child.exitCode !== null) throw Error("Wrangler exited early: " + logs);
    try { const r = await req("/healthz"); if (r.response.status === 200 && r.payload.ok) {live = true;break;} }
    catch (_) {}
    await delay(250);
  }
  assert.ok(live, "Wrangler preview never started: " + logs);
  // The new marketing site must stay unindexed on staging.
  const landing=await req("/");
  assert.equal(landing.response.status,200);
  assert.match(landing.payload,/<h1>/);
  assert.match(landing.response.headers.get("x-robots-tag"),/noindex/);
  for(const route of ["/corporate-team-building-game","/virtual-team-building","/leadership-team-building","/for-facilitators","/ro"]){
    const page=await req(route);
    assert.equal(page.response.status,200,route);
    assert.match(page.response.headers.get("x-robots-tag"),/noindex/);
    assert.match(page.payload,/meta name="description"/);
  }
  assert.match((await req("/robots.txt")).payload,/Allow: \/$/m);
  assert.equal((await req("/sitemap.xml")).response.status,404);
  for(const route of ["/play","/join","/projector","/?room=ABCD"]){
    const page=await req(route);
    assert.equal(page.response.status,200);
    assert.match(page.response.headers.get("x-robots-tag"),/noindex/);
  }
  assert.equal((await req("/site-style.css")).response.status,200);
  const css = await req("/room-style.css"); assert.equal(css.response.status, 200);
  const script = await req("/room-script.js"); assert.equal(script.response.status, 200);
  assert.match(script.payload, /new WebSocket/);
  const rejectUnauth = await req("/api/rooms", "POST", {teamCount: 2});
  assert.equal(rejectUnauth.response.status, 401, "Founder key required");
  const created = await req("/api/rooms", "POST", {teamCount: 2}, creationKey);
  assert.equal(created.response.status, 201, "Room creates through actual Worker: " + JSON.stringify(created.payload));
  const {roomCode, hostToken} = created.payload;
  assert.match(roomCode, /^[2-9A-HJ-NP-Z]{4}$/);
  assert.match(hostToken, /^[a-f0-9]{64}$/);
  const extraCodes = new Set([roomCode]);
  for (let idx = 0; idx < 12; idx++) {
    const another = await req("/api/rooms","POST",{teamCount:2},creationKey);
    assert.equal(another.response.status,201,"Collision retries must create valid rooms");
    assert.match(another.payload.roomCode,/^[2-9A-HJ-NP-Z]{4}$/);
    assert.equal(extraCodes.has(another.payload.roomCode),false,"Fresh short room codes may not collide");
    extraCodes.add(another.payload.roomCode);
  }
  const qr = await req("/api/rooms/" + roomCode + "/qr");
  assert.equal(qr.response.status, 200);
  assert.match(qr.payload, /<svg/);
  const host = await socketFor(hostToken, roomCode);
  const lobby = await req("/api/rooms/" + roomCode + "/lobby");
  assert.equal(lobby.payload.teams.length, 2);
  assert.notEqual(lobby.payload.teams[0].name, lobby.payload.teams[1].name);
  const alice = await req("/api/rooms/" + roomCode + "/join", "POST", {nickname: "Alice", teamIndex: 0});
  assert.equal(alice.response.status, 201);
  const aliceWS = await socketFor(alice.payload.playerToken, roomCode);
  const bob = await req("/api/rooms/" + roomCode + "/join", "POST", {nickname: "Bob", teamIndex: 0});
  assert.equal(bob.response.status, 201);
  const bobWS = await socketFor(bob.payload.playerToken, roomCode);
  const bothInOne=await snapshot(host, s => s.players.length === 2, "host sees both participants");
  assert.deepEqual(bothInOne.teams.map(t=>t.joined),[2,0],"reproduces same-team join issue");
  const cannotStart=await req("/api/rooms/" + roomCode + "/actions","POST",
    {type:"start",expectedRevision:bob.payload.state.revision},hostToken);
  assert.equal(cannotStart.response.status,409,"Empty opponent team prevents start");
  const moved=await req("/api/rooms/" + roomCode + "/actions","POST",
    {type:"change_team",teamIndex:1,expectedRevision:bob.payload.state.revision},bob.payload.playerToken);
  assert.equal(moved.response.status,200,"Bob can switch teams after joining");
  assert.equal(moved.payload.state.viewer.captain,true);
  assert.equal(moved.payload.state.viewer.teamIndex,1);
  const balanced=await snapshot(host,s=>s.revision===moved.payload.state.revision,"host sees moved participant");
  assert.deepEqual(balanced.teams.map(t=>t.joined),[1,1]);
  await snapshot(bobWS,s=>s.revision===moved.payload.state.revision&&s.viewer.teamIndex===1,"Bob sees new team");
  const rename = await req("/api/rooms/" + roomCode + "/actions", "POST", {
    type: "rename_team", name: lobby.payload.teamNameOptions.find(n => !lobby.payload.teams.some(t => t.name === n)),
    expectedRevision: moved.payload.state.revision
  }, alice.payload.playerToken);
  assert.equal(rename.response.status, 200, "Captain can rename room team: " + JSON.stringify(rename.payload));
  await snapshot(host, s => s.revision === rename.payload.state.revision, "host sees team rename");
  const started = await req("/api/rooms/" + roomCode + "/actions", "POST", {
    type: "start", expectedRevision: rename.payload.state.revision
  }, hostToken);
  assert.equal(started.response.status, 200);
  assert.equal(started.payload.state.phase, "advisers");
  const until = started.payload.state.clock.normalEndsAt - started.payload.state.clock.serverNowMs;
  assert.ok(until <= 180000 && until > 175000, "3-minute clock is server-owned");
  await snapshot(aliceWS, s => s.phase === "advisers", "Alice start broadcast");
  await snapshot(bobWS, s => s.phase === "advisers", "Bob start broadcast");
  const choice = await req("/api/rooms/" + roomCode + "/actions", "POST", {
    type: "select_advisers", advisers: [0, 4], expectedRevision: started.payload.state.revision
  }, alice.payload.playerToken);
  assert.equal(choice.response.status, 200);
  const hostAfter = await snapshot(host, s => s.revision === choice.payload.state.revision, "host picks broadcast");
  assert.equal(JSON.stringify(hostAfter).includes('"advisers":'), false, "host cannot read team's secrets");
  const bobAfter = await snapshot(bobWS, s => s.revision === choice.payload.state.revision, "Bob picks broadcast");
  assert.deepEqual(bobAfter.privateTeam.advisers, [], "opponent cannot inspect private picks");
  const aliceAfter = await snapshot(aliceWS, s => s.revision === choice.payload.state.revision, "Alice picks broadcast");
  assert.deepEqual(aliceAfter.privateTeam.advisers, [0, 4]);
  assert.equal((await req("/api/rooms/" + roomCode + "/state")).response.status, 401, "No unauthenticated state");

  // Complete the actual six economic episodes over HTTP to verify Worker integration.
  let rev = choice.payload.state.revision;
  let committed = await req("/api/rooms/" + roomCode + "/actions", "POST",
    {type: "submit_decision", planIndex: 0, signalIndex: 0, expectedRevision: rev}, alice.payload.playerToken);
  assert.equal(committed.response.status, 200, "First economic decision: " + JSON.stringify(committed.payload));
  assert.equal(committed.payload.state.privateTeam.economic.cash, 260000 - 8000 - 18000);
  rev = committed.payload.state.revision;
  let bobPick = await req("/api/rooms/" + roomCode + "/actions", "POST",
    {type: "select_advisers", advisers: [1, 2], expectedRevision: rev}, bob.payload.playerToken);
  assert.equal(bobPick.response.status, 200); rev = bobPick.payload.state.revision;
  let bobCommit = await req("/api/rooms/" + roomCode + "/actions", "POST",
    {type: "submit_decision", planIndex: 1, signalIndex: 1, expectedRevision: rev}, bob.payload.playerToken);
  assert.equal(bobCommit.response.status, 200); rev = bobCommit.payload.state.revision;
  let advance = await req("/api/rooms/" + roomCode + "/actions", "POST",
    {type: "advance", expectedRevision: rev}, hostToken);
  assert.equal(advance.response.status, 200); rev = advance.payload.state.revision;
  for (let round = 1; round < 6; round++) {
    const current = await req("/api/rooms/" + roomCode + "/state", "GET", undefined, hostToken);
    assert.equal(current.response.status, 200);
    assert.equal(current.payload.state.episode.number, String(round + 1).padStart(2, "0"));
    for (const credential of [alice.payload.playerToken, bob.payload.playerToken]) {
      const picks = await req("/api/rooms/" + roomCode + "/actions", "POST",
        {type: "select_advisers", advisers: [round % 6, (round + 2) % 6], expectedRevision: rev}, credential);
      assert.equal(picks.response.status, 200); rev = picks.payload.state.revision;
      const allocation = [2, 4].includes(round) ? {amount: 10000, route: "audit"} : {amount: 0, route: null};
      const response = await req("/api/rooms/" + roomCode + "/actions", "POST",
        {type: "submit_decision", planIndex: round % 3, signalIndex: (round + 1) % 3,
          allocation, expectedRevision: rev}, credential);
      assert.equal(response.response.status, 200, "Episode " + round + " economic response: " + JSON.stringify(response.payload));
      rev = response.payload.state.revision;
    }
    advance = await req("/api/rooms/" + roomCode + "/actions", "POST",
      {type: "advance", expectedRevision: rev}, hostToken);
    assert.equal(advance.response.status, 200); rev = advance.payload.state.revision;
  }
  const final = (await req("/api/rooms/" + roomCode + "/state", "GET", undefined, hostToken)).payload.state;
  assert.equal(final.phase, "complete");
  assert.equal(final.verdict.ranked.length, 2);
  assert.equal(final.verdict.ranked[0].decisions.length, 6);
  assert.ok(final.verdict.ranked.every(t => t.score === Math.max(0, t.rawScore - t.timingPenalty)));
  assert.equal(JSON.stringify(final).includes('"intelligence"'), false, "No private advice in host results");
  assert.equal(JSON.stringify(final).includes('"credentialHash"'), false, "No credentials in host results");

  // Test the facilitator recovery actions through real Durable Object storage:
  // move captainship to a teammate, then remove that (unvoted) teammate from
  // the lobby. Revoked credentials must not access the new room state.
  const admin=await req("/api/rooms","POST",{teamCount:2},creationKey);
  assert.equal(admin.response.status,201);
  const adminCode=admin.payload.roomCode,adminToken=admin.payload.hostToken;
  const anna=await req("/api/rooms/"+adminCode+"/join","POST",{nickname:"Anna",teamIndex:0});
  const ben=await req("/api/rooms/"+adminCode+"/join","POST",{nickname:"Ben",teamIndex:0});
  const cleo=await req("/api/rooms/"+adminCode+"/join","POST",{nickname:"Cleo",teamIndex:1});
  assert.equal(anna.response.status,201);
  assert.equal(ben.response.status,201);
  assert.equal(cleo.response.status,201);
  const adminView=(await req("/api/rooms/"+adminCode+"/state","GET",undefined,adminToken)).payload.state;
  assert.equal(adminView.hostRoster.length,3);
  assert.equal(JSON.stringify(anna.payload.state).includes("hostRoster"),false,
    "Players cannot see facilitator-only participant identifiers");
  const benId=adminView.hostRoster.find(p=>p.nickname==="Ben").id;
  const transferred=await req("/api/rooms/"+adminCode+"/actions","POST",
    {type:"set_captain",playerId:benId,expectedRevision:adminView.revision},adminToken);
  assert.equal(transferred.response.status,200);
  assert.equal(transferred.payload.state.hostRoster.find(p=>p.nickname==="Ben").captain,true);
  assert.equal(transferred.payload.state.interventions.length,1);
  assert.equal(transferred.payload.state.interventions[0].kind,"captain");
  assert.equal(transferred.payload.state.interventions[0].round,0);
  assert.doesNotMatch(JSON.stringify(transferred.payload.state.interventions),/Ben|player-|credential/);
  const removed=await req("/api/rooms/"+adminCode+"/actions","POST",
    {type:"remove_player",playerId:benId,expectedRevision:transferred.payload.state.revision},adminToken);
  assert.equal(removed.response.status,200);
  assert.equal(removed.payload.state.hostRoster.length,2);
  assert.deepEqual(removed.payload.state.interventions.map(x=>x.kind),["captain","removed"]);
  assert.equal(JSON.stringify(removed.payload.state.interventions).includes(benId),false,
    "Administrative trail excludes removed participant IDs");
  assert.equal(removed.payload.state.hostRoster.find(p=>p.nickname==="Anna").captain,true,
    "Original member inherits leadership after the captain leaves");
  assert.equal((await req("/api/rooms/"+adminCode+"/state","GET",undefined,ben.payload.playerToken)).response.status,401,
    "Removed user's bearer token is revoked");
  assert.equal((await req("/api/rooms/"+adminCode+"/state","GET",undefined,anna.payload.playerToken)).response.status,200);
  assert.equal((await req("/api/rooms/"+adminCode+"/state","GET",undefined,cleo.payload.playerToken)).response.status,200);

  // Real Cloudflare Durable Object burst: several phones vote from the same
  // initial room revision, so unrelated teammate votes must not cause 409s.
  const burst=await req("/api/rooms","POST",{teamCount:2},creationKey);
  assert.equal(burst.response.status,201);
  const burstCode=burst.payload.roomCode,burstHost=burst.payload.hostToken;
  const burstPeople=[];
  for(let i=0;i<6;i++){
    const joined=await req("/api/rooms/"+burstCode+"/join","POST",
      {nickname:"Parallel "+i,teamIndex:i%2});
    assert.equal(joined.response.status,201);
    burstPeople.push({token:joined.payload.playerToken,teamIndex:i%2});
  }
  let burstState=(await req("/api/rooms/"+burstCode+"/state","GET",undefined,burstHost)).payload.state;
  let transition=await req("/api/rooms/"+burstCode+"/actions","POST",
    {type:"start",expectedRevision:burstState.revision},burstHost);
  assert.equal(transition.response.status,200);
  burstState=transition.payload.state;
  for(let team=0;team<2;team++){
    const captain=burstPeople.find(p=>p.teamIndex===team);
    const pick=await req("/api/rooms/"+burstCode+"/actions","POST",
      {type:"select_advisers",advisers:[0,1],expectedRevision:burstState.revision},captain.token);
    assert.equal(pick.response.status,200);burstState=pick.payload.state;
  }
  const commonRevision=burstState.revision;
  const burstVotes=await Promise.all(burstPeople.map(p=>
    req("/api/rooms/"+burstCode+"/actions","POST",
      {type:"lock_vote",planIndex:0,signalIndex:0,
        expectedRound:0,expectedRunoffOrdinal:0,expectedRevision:commonRevision},p.token)));
  assert.deepEqual(burstVotes.map(x=>x.response.status),[200,200,200,200,200,200],
    "Concurrent team votes sharing one old global revision must all commit");
  const burstAfter=(await req("/api/rooms/"+burstCode+"/state","GET",undefined,burstHost)).payload.state;
  assert.equal(burstAfter.revision,commonRevision+6,
    "Each successful vote increments the revision without duplicate decisions");
  assert.deepEqual(burstAfter.teams.map(t=>t.locked),[true,true]);
  const burstPlayerView=await req("/api/rooms/"+burstCode+"/state","GET",undefined,burstPeople[0].token);
  assert.equal(burstPlayerView.payload.state.privateTeam.economic.cash,234000,
    "Three ballots per team must only pay for one £26k response");
  const burstAdvanced=await req("/api/rooms/"+burstCode+"/actions","POST",
    {type:"advance",expectedRevision:burstAfter.revision},burstHost);
  assert.equal(burstAdvanced.response.status,200);
  const delayed=await req("/api/rooms/"+burstCode+"/actions","POST",
    {type:"lock_vote",planIndex:0,signalIndex:0,
      expectedRound:0,expectedRunoffOrdinal:0,expectedRevision:commonRevision},burstPeople[0].token);
  assert.equal(delayed.response.status,409,"Old-episode ballot rejected after advance");
  assert.match(delayed.payload.error,/Voting round changed/);

  // Projector-only credentials: HTTP and WebSocket must expose no player identities or controls.
  const grant=await req("/api/rooms/" + roomCode + "/projector-access","POST",{},hostToken);
  assert.equal(grant.response.status,200);
  assert.match(grant.payload.projectorToken,/^[a-f0-9]{64}$/);
  const projectorAccess=grant.payload.projectorToken;
  const projectorView=await req("/api/rooms/" + roomCode + "/state","GET",undefined,projectorAccess);
  assert.equal(projectorView.response.status,200);
  assert.equal(projectorView.payload.state.viewer.role,"projector");
  assert.equal(JSON.stringify(projectorView.payload.state).includes('"players"'),false);
  assert.equal(JSON.stringify(projectorView.payload.state).includes('"privateTeam"'),false);
  assert.deepEqual(projectorView.payload.state.teams.map(t=>t.joined),[1,1]);
  assert.equal(projectorView.payload.state.rosterEvents.some(x=>x.nickname==="Alice"),true,"Arrival notification is public");
  assert.equal((await req("/api/rooms/" + roomCode + "/actions","POST",
    {type:"advance",expectedRevision:projectorView.payload.state.revision},projectorAccess)).response.status,403);
  const projectorWS=await socketFor(projectorAccess,roomCode);
  assert.equal(projectorWS.messages[0].state.viewer.role,"projector");
  const projectorClosed=new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error("Rotated projector socket remained connected")),8000);
    projectorWS.ws.addEventListener("close",e=>{clearTimeout(timeout);resolve(e.code);},{once:true});
  });
  const rotated=await req("/api/rooms/" + roomCode + "/projector-access","POST",{},hostToken);
  assert.equal(rotated.response.status,200);
  assert.notEqual(rotated.payload.projectorToken,projectorAccess);
  assert.equal((await req("/api/rooms/" + roomCode + "/state","GET",undefined,projectorAccess)).response.status,401);
  // On hibernating/local runtimes the physical close can be deferred. The
  // revoked socket must nevertheless be rejected on its next message, never
  // return another snapshot with the previous projector credential.
  if(projectorWS.ws.readyState===WebSocket.OPEN)
    projectorWS.ws.send(JSON.stringify({type:"snapshot"}));
  assert.equal(await projectorClosed,1008,"Revoked projector socket cannot access a new snapshot");
  assert.equal((await req("/api/rooms/" + roomCode + "/state","GET",undefined,rotated.payload.projectorToken)).response.status,200);


  // A websocket opened without an auth message must be evicted; otherwise 64
  // idle strangers can block every genuine team/player connection.
  const pendingSocket=new WebSocket("ws://127.0.0.1:"+port+"/api/rooms/"+roomCode+"/socket");
  sockets.push(pendingSocket);
  const pendingClose=await new Promise((resolve,reject)=>{
    let opened=false,errored=false;
    const deadline=setTimeout(()=>{
      // Local workerd sometimes leaves the peer CLOSING without delivering
      // the final close event. That state is no longer usable for auth.
      if(pendingSocket.readyState===WebSocket.CLOSING)
        resolve("closing");
      else reject(Error("Pending unauthenticated socket still usable after 17s; state="+
        pendingSocket.readyState+" opened="+opened+" errored="+errored+
        " worker="+logs.slice(-650)));
    },17000);
    pendingSocket.addEventListener("open",()=>{opened=true;},{once:true});
    pendingSocket.addEventListener("close",event=>{clearTimeout(deadline);resolve(event.code);},{once:true});
    pendingSocket.addEventListener("error",()=>{errored=true;});
  });
  assert.ok(pendingClose===1008||pendingClose==="closing",
    "Server must terminate or initiate closing of unauthenticated sockets");

  // Browser-level preview check at actual 320px viewport, separate from the existing standalone game.
  // The same complete room journey runs in Chromium and Safari's WebKit engine.
  const requestedBrowser=process.env.BC_BROWSER||"chromium";
  const browserName=["chromium","webkit","firefox"].includes(requestedBrowser)?
    requestedBrowser:"chromium";
  const engines=await import("playwright");
  const browser=await engines[browserName].launch({headless:true,
    ...(browserName==="chromium"?{args:["--no-sandbox"]}:{})});
  const screenshotDir=browserName==="chromium"?"screenshots":"screenshots/"+browserName;
  try {
    const hostUI = await browser.newPage({viewport: {width: 1440, height: 900}, reducedMotion: "reduce"});
    const phoneA = await browser.newPage({viewport: {width: 320, height: 720}, reducedMotion: "reduce"});
    const phoneB = await browser.newPage({viewport: {width: 390, height: 820}, reducedMotion: "reduce"});
    const browserErrors = [], lobbyNetworkFailures = [];
    const observePage=(page,label)=>{
      page.on("pageerror",err=>browserErrors.push(
        label+" @ "+page.url().replace(/#.*$/,"")+" ("+
        (page.isClosed()?"closed":"open")+"): "+err.message));
      // Diagnostic only: failed lobby fetches are NOT ignored or excused
      // when they also cause a JavaScript pageerror. Attribute by tab.
      page.on("requestfailed",request=>{
        if(/\/api\/rooms\/[2-9A-HJ-NP-Z]{4}\/lobby$/.test(request.url()))
          lobbyNetworkFailures.push(label+": "+String(request.failure()?.errorText||"unknown"));
      });
    };
    observePage(hostUI,"HOST 1440");
    observePage(phoneA,"PHONE A 320");
    observePage(phoneB,"PHONE B 390");
    const commercial=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"reduce"});
    observePage(commercial,"COMMERCIAL 390");
    await commercial.goto(base+"/",{waitUntil:"load"});
    assert.equal(await commercial.locator(".hero a[href=\"/play\"]").count(),1,"Host entry is easy to find");
    assert.equal(await commercial.locator(".hero a[href=\"/join\"]").count(),1,"Player entry is separate");
    await commercial.locator('.hero a[href="#try-a-decision"]').click();
    assert.match(commercial.url(),/#try-a-decision$/);
    assert.equal(await commercial.locator(".demo-choice").count(),3);
    await commercial.locator(".demo-choice").nth(1).locator("summary").click();
    assert.match(await commercial.locator(".demo-choice[open]").textContent(),/three-site concept draws attention/i);
    assert.ok(await commercial.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),
      "Commercial page mobile overflow");
    await commercial.close();

    await hostUI.goto(base+"/play", {waitUntil: "load"});
    await hostUI.locator("#create-key").fill(creationKey);
    await hostUI.locator("#create-teams").selectOption("2");
    await hostUI.locator("#create-form button.primary").click();
    await hostUI.locator("#room-screen").waitFor({state: "visible", timeout: 12000});
    assert.equal(await hostUI.locator("#host-control-room .host-command-team").count(),2,
      "The facilitator has a dedicated command centre");
    assert.match(await hostUI.locator("#host-control-room").textContent(),/PREPARE THE ROOM/);
    const uiCode=(await hostUI.locator("#room-code").textContent()).trim();
    const hostUiToken=await hostUI.evaluate(code=>
      sessionStorage.getItem("bc-preview-session-"+code),uiCode);
    assert.match(hostUiToken,/^[a-f0-9]{64}$/);
    // Safari/macOS sometimes duplicates a tab and inherits its session
    // storage. A joining link must still show player registration, not host.
    const clonedHost=await browser.newPage({viewport:{width:1280,height:800}});
    observePage(clonedHost,"CLONED HOST TAB");
    await clonedHost.addInitScript(({code,token})=>{
      sessionStorage.setItem("bc-preview-session-"+code,token);
    },{code:uiCode,token:hostUiToken});
    await clonedHost.goto(base+"/join?room="+uiCode,{waitUntil:"load"});
    await clonedHost.locator("#join-form").waitFor({state:"visible",timeout:12000});
    assert.equal(await clonedHost.locator("#host-actions").isVisible(),false,
      "A Safari tab with inherited host session must remain a player invitation");
    await clonedHost.close();
    const [playTab]=await Promise.all([
      hostUI.context().waitForEvent("page"),
      hostUI.locator("#host-play-link").click()
    ]);
    await playTab.locator("#join-form").waitFor({state:"visible",timeout:12000});
    assert.equal(await playTab.locator("#host-actions").isVisible(),false,
      "Play-as-player link opens an independent team registration");
    await playTab.close();
    assert.equal(await hostUI.locator("#game-rules").evaluate(el=>el.open),true,
      "Host's pre-game briefing opens by default");
    assert.equal(await hostUI.locator("#game-rules .rule-card").count(),6);
    assert.equal(await hostUI.locator("#rules-host-note").isVisible(),true,
      "Only host sees the read-aloud instruction");
    assert.match(uiCode, /^[2-9A-HJ-NP-Z]{4}$/);
    await hostUI.locator("#join-qr").evaluate(async image => {
      if (image.complete && image.naturalWidth > 0) return;
      await new Promise((resolve, reject) => {
        image.addEventListener("load", resolve, {once: true});
        image.addEventListener("error", () => reject(Error("QR image failed to load")), {once: true});
      });
    });
    await phoneA.goto(base + "/join");
    await phoneA.locator("#join-code-form").waitFor({state: "visible"});
    const landingOverflow=await phoneA.evaluate(()=>
      document.documentElement.scrollWidth-innerWidth);
    assert.ok(landingOverflow<=1,"Editorial opening hero must fit the 320px join screen");
    assert.equal(await phoneA.locator(".landing-city svg").count(),1,
      "The original corporate cityscape appears on the entry screen");
    assert.ok(await phoneA.locator(".landing-city").evaluate(el=>
      el.getBoundingClientRect().height<=160),"Entry artwork is compact on 320px phones");
    assert.match(await phoneA.locator(".lead-panel h1").innerText(),/ONE STORY/);
    await phoneA.locator("#join-code").fill(uiCode.toLowerCase());
    await phoneA.locator("#join-code-form button.primary").click();
    await phoneA.locator("#join-form").waitFor({state: "visible"});
    assert.match(phoneA.url(),new RegExp("room="+uiCode+"$"),"Manual 4-character code finds the right room");
    await phoneA.locator("#join-name").fill("Mobile Alice");
    assert.equal(await phoneA.locator("#join-team").inputValue(),"0",
      "A real named team, not AUTO, must be selected on first opening");
    assert.match(await phoneA.locator("#join-team-selection").textContent(),/Selected:/);
    // Do not touch the dropdown: joining must accept the already-selected team.
    await phoneA.locator("#join-form button.primary").click();
    await phoneA.locator("#room-screen").waitFor({state: "visible", timeout: 10000});
    assert.equal(await phoneA.locator("#game-rules .rule-card").count(),6);
    assert.equal(await phoneA.locator("#game-rules").evaluate(el=>el.open),true);
    assert.equal(await phoneA.locator("#rules-host-note").isVisible(),false);
    const rulesOverflow=await phoneA.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(rulesOverflow<=1,"Rules must not overflow a 320px phone: "+rulesOverflow);
    await (await import("node:fs/promises")).mkdir(path.join(root,screenshotDir),{recursive:true});
    await phoneA.screenshot({path:path.join(root,screenshotDir,"08-briefing-phone-320.png"),fullPage:true});
    await phoneA.locator("#game-rules summary").click();
    assert.equal(await phoneA.locator("#game-rules").evaluate(el=>el.open),false);
    await phoneB.goto(base + "/join?room=" + uiCode);
    await phoneB.locator("#join-name").fill("Mobile Bob");
    await phoneB.locator("#join-team").selectOption("0");
    await phoneB.locator("#join-form button.primary").click();
    await phoneB.locator("#room-screen").waitFor({state: "visible", timeout: 10000});
    await hostUI.waitForFunction(() => document.querySelector("#team-list")?.textContent?.includes("Mobile Bob"));
    assert.equal(await phoneA.locator("#game-rules").evaluate(el=>el.open),false,
      "Remote joins must not reopen a briefing the player has closed");
    assert.equal(await hostUI.locator("#host-actions button.primary").isDisabled(),true,
      "No start when all players join the same team");
    await hostUI.locator(".host-roster summary").click();
    assert.equal(await hostUI.locator(".roster-entry").count(),2,
      "Host sees a compact, collapsed-by-default participant management panel");
    assert.equal(await phoneA.locator(".host-roster").count(),0,
      "Player devices must never see host management controls");
    hostUI.once("dialog",dialog=>dialog.accept());
    await hostUI.locator(".roster-entry").filter({hasText:"Mobile Bob"})
      .getByRole("button",{name:"MAKE CAPTAIN"}).click();
    await hostUI.waitForFunction(()=>
      document.querySelector(".roster-entry")?.textContent?.includes("CAPTAIN") &&
      [...document.querySelectorAll(".roster-entry")].some(x=>
        x.textContent.includes("Mobile Bob")&&x.textContent.includes("CAPTAIN")));

    await hostUI.waitForFunction(()=>
      document.querySelector("#facilitator-log")?.hidden===false &&
      document.querySelectorAll("#facilitator-log-items li").length===1);
    assert.equal(await hostUI.locator("#facilitator-log").evaluate(el=>el.open),false,
      "Facilitator actions must remain collapsed by default");
    assert.match(await hostUI.locator("#facilitator-log-items li").first().textContent(),
      /TRANSFERRED CAPTAINSHIP/);
    await phoneA.waitForFunction(()=>document.querySelector("#facilitator-log")?.hidden===false);
    assert.doesNotMatch(await phoneA.locator("#facilitator-log").innerText(),/Mobile Bob/);

    // Host can issue a projection link without revealing their own host bearer token.
    await hostUI.locator("#rotate-projector").click();
    await hostUI.locator("#projector-link").waitFor({state:"visible"});
    assert.equal(await hostUI.locator("#copy-projector-link").isVisible(),true,
      "Host receives an obvious transferable link control");
    const projectorHref=await hostUI.locator("#projector-link").getAttribute("href");
    assert.equal(await hostUI.locator("#projector-url").inputValue(),projectorHref,
      "Host has a selectable full link if a clipboard permission is denied");
    assert.match(projectorHref,/\/projector\?room=[2-9A-HJ-NP-Z]{4}#access=[a-f0-9]{64}$/);
    const projected=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:"reduce"});
    observePage(projected,"PROJECTOR 1280");
    await projected.goto(projectorHref,{waitUntil:"load"});
    await projected.locator("#room-screen").waitFor({state:"visible",timeout:12000});
    assert.equal(await projected.locator("#viewer-mode").isVisible(),true);
    assert.equal(await projected.locator("#host-actions").isVisible(),false);
    assert.equal(await projected.locator("#player-actions").isVisible(),false);
    assert.equal(await projected.locator("#captain-tools").isVisible(),false);
    assert.equal(new URL(projected.url()).hash,"#access="+new URL(projectorHref).hash.slice(8),
      "Projector retains a transferable read-only URL when copied from the address bar");
    assert.equal(projected.url(),projectorHref,"Opening a projector must preserve the shareable URL");
    const freshProjector=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:"reduce"});
    const freshDisplay=await freshProjector.newPage();
    observePage(freshDisplay,"FRESH PROJECTOR");
    await freshDisplay.goto(projected.url(),{waitUntil:"load"});
    await freshDisplay.locator("#room-screen").waitFor({state:"visible",timeout:12000});
    assert.equal(await freshDisplay.locator("#viewer-mode").isVisible(),true,
      "Pasting the projected address into a brand new session must work");
    assert.equal(await freshDisplay.locator("#host-actions").isVisible(),false,
      "A copied projector URL must never convey host permissions");
    await freshProjector.close();
    assert.equal((await projected.locator("#team-list").innerText()).includes("Mobile Alice"),false,
      "Player nicknames cannot reach projection display");
    assert.deepEqual(await projected.locator(".team small").allTextContents(),
      ["2 PLAYERS JOINED","0 PLAYERS JOINED"],"Projector displays public counts from server, not hidden nicknames");
    assert.equal(await projected.locator("#projector-invite").isVisible(),true);
    assert.equal(await projected.locator("#game-rules").evaluate(el=>el.open),false,
      "Projector lobby initially shows the important QR and team information, not six dense rules");
    const lobbyFit=await projected.evaluate(()=>{
      const invite=document.querySelector("#projector-invite").getBoundingClientRect(),
        teams=document.querySelector("#team-list").getBoundingClientRect();
      return {height:innerHeight,scroll:document.documentElement.scrollHeight,
        qrBottom:invite.bottom,teamsBottom:teams.bottom};
    });
    assert.ok(lobbyFit.scroll<=lobbyFit.height+2 && lobbyFit.teamsBottom<=lobbyFit.height-8,
      "1280x720 projector lobby must show QR and all teams without document scroll: "+JSON.stringify(lobbyFit));
    await projected.locator("#game-rules summary").click();
    assert.equal(await projected.locator("#game-rules").evaluate(el=>el.open),true,
      "Projector rules remain available as an optional on-screen briefing");
    await projected.locator("#game-rules summary").click();
    assert.equal(await projected.locator("#game-rules .rule-card").count(),6);
    assert.equal(await projected.locator("#projector-intervention").isVisible(),true,
      "Recent facilitator changes are visible on the public projector");
    assert.match(await projected.locator("#projector-intervention").textContent(),/TRANSFERRED CAPTAINSHIP/);
    assert.equal(await projected.locator("#rules-host-note").isVisible(),false);
    await projected.screenshot({path:path.join(root,screenshotDir,"09-briefing-projector-1280.png"),fullPage:true});
    assert.match(await projected.locator("#projector-join-link").getAttribute("href"),
      new RegExp("/join\\?room="+uiCode+"$"));
    const projectionQR=await projected.locator("#projector-qr").evaluate(async img=>{
      if(!img.complete)await new Promise((resolve,reject)=>{
        img.addEventListener("load",resolve,{once:true});img.addEventListener("error",reject,{once:true});
      });
      return {ok:img.naturalWidth>0,src:img.getAttribute("src")};
    });
    assert.equal(projectionQR.ok,true);
    assert.equal(projectionQR.src,"/api/rooms/"+uiCode+"/qr");
    await phoneB.locator("#change-team-select").selectOption("1");
    await phoneB.locator("#change-team-button").click();
    await phoneB.waitForFunction(()=>document.querySelector("#change-team-select")?.value==="1");
    await projected.waitForFunction(()=>
      [...document.querySelectorAll(".team small")].map(n=>n.textContent).join("|")==="1 PLAYER JOINED|1 PLAYER JOINED",
      null,{timeout:12000});
    assert.equal(await hostUI.locator("#host-actions button.primary").isDisabled(),false,
      "Rebalancing 2 devices enables game start");
    assert.equal(await phoneB.locator("#captain-tools").isVisible(),true,
      "First participant on destination team becomes captain");
    await phoneA.waitForFunction(()=>document.querySelector("#captain-tools") &&
      !document.querySelector("#captain-tools").hidden,
      null,{timeout:12000});
    assert.equal(await hostUI.locator(".roster-entry").count(),2);


    const original = (await phoneA.locator(".team.mine strong").textContent()).trim();
    const options = await phoneA.locator("#team-name-choice option").evaluateAll(xs => xs.map(x => x.value));
    const newName = options.find(x => x !== original);
    assert.ok(newName, "At least one alternative team name exists");
    await phoneA.locator("#team-name-choice").selectOption(newName);
    await phoneA.locator("#rename-team").click();
    await hostUI.waitForFunction(name => document.querySelector("#team-list")?.textContent?.includes(name), newName);
    assert.match(await hostUI.locator("#episode-panel").innerText().catch(() => ""), /|^$/); // Lobby has no episode yet.
    await hostUI.locator("#host-actions button.primary").click();
    await phoneA.locator(".prep-adviser-panel").waitFor({state:"visible",timeout:8000});
    assert.equal(await phoneA.locator("#timer-wrap").isVisible(),false,
      "The first preparation phase has no decision clock");
    assert.equal(await hostUI.locator("#host-actions button.primary").isDisabled(),true,
      "Host cannot start a timer before every captain has selected advice");
    assert.equal(await phoneA.locator("[data-prep-adviser]").count(),6);
    await phoneA.locator('[data-prep-adviser="0"]').click();
    await phoneA.locator('[data-prep-adviser="1"]').click();
    await phoneA.getByRole("button",{name:"SAVE TWO ADVISERS"}).click();
    await phoneA.locator(".chosen-adviser").first().waitFor({state:"visible"});
    assert.equal(await hostUI.locator("#host-actions button.primary").isDisabled(),true,
      "One ready team is insufficient to begin the decision timer");
    await phoneB.locator('[data-prep-adviser="2"]').click();
    await phoneB.locator('[data-prep-adviser="3"]').click();
    await phoneB.getByRole("button",{name:"SAVE TWO ADVISERS"}).click();
    await hostUI.waitForFunction(()=>
      document.querySelector("#host-actions button.primary")?.disabled===false,
      null,{timeout:12000});
    assert.equal(await phoneA.locator("#timer-wrap").isVisible(),false,
      "No clock runs even when all teams finish adviser preparation");
    await hostUI.locator("#host-actions button.primary").click();
    await phoneA.locator("#timer-wrap").waitFor({state: "visible", timeout: 8000});
    assert.equal(await hostUI.locator("#game-rules").evaluate(el=>el.open),false,
      "Rules collapse when the host starts");
    assert.equal(await phoneB.locator("#game-rules").evaluate(el=>el.open),false,
      "All players start with the briefing collapsed");
    assert.equal(await projected.locator("#game-rules").isVisible(),false,
      "Live projection keeps rules off the screen during the episode");
    await phoneB.locator("#game-rules summary").click();
    assert.equal(await phoneB.locator("#game-rules").evaluate(el=>el.open),true,
      "Players can reopen the rules during an episode");
    await phoneB.locator("#game-rules summary").click();
    assert.match(await phoneA.locator("#timer-phase").textContent(), /STANDARD TIME/);
    assert.equal(await hostUI.locator(".roster-entry button.roster-remove:disabled").count(),2,
      "Facilitator may not remove a team's only member during a live round");

    assert.match(await phoneA.locator("#episode-panel").innerText(), /THE INVITATION|OPPORTUNITY/);
    assert.equal(await phoneA.locator(".evidence-item").count(), 3);
    assert.equal(await phoneA.locator(".scene-directive").count(),1,
      "The live incident shows a distinctive, actionable dilemma");
    assert.match(await phoneA.locator(".scene-question").textContent(),/promise before the details have been tested/i);
    assert.equal(await phoneA.locator(".scene-fact").count(),3,
      "Every incident begins with three public, verifiable facts");
    assert.deepEqual(await phoneA.locator(".scene-fact dd").allTextContents(),
      ["09:17","90 DAYS","3"],"The opening fact-strip identifies the pilot opportunity");
    const editorial=await phoneA.evaluate(()=>{
      const body=getComputedStyle(document.body),
        facts=[...document.querySelectorAll(".scene-fact dd")],
        art=document.querySelector(".scene-film");
      return {
        bodyFont:body.fontFamily,
        values:facts.map(x=>Number.parseFloat(getComputedStyle(x).fontSize)),
        filmOpacity:Number.parseFloat(getComputedStyle(art).opacity),
        overflow:document.documentElement.scrollWidth-innerWidth
      };
    });
    assert.doesNotMatch(editorial.bodyFont,/^Inter,/,
      "The type system must not depend on an undelivered Inter web font");
    assert.ok(editorial.values.every(v=>v>=14),
      "Even the 320px phone should display key incident numbers legibly");
    assert.ok(editorial.filmOpacity>=0.4,
      "The original cinematic artwork must be sufficiently visible");
    assert.ok(editorial.overflow<=1,"Incident facts must fit a 320px phone");
    assert.ok(await phoneA.locator(".scene-fact dd").evaluateAll(xs=>
      xs.every(el=>el.scrollWidth <= el.clientWidth+1)),
      "Incident values must not break in the middle of a word at 320px");
    // Cinematic scene remains scannable: one hero, six chapter markers, and
    // evidence whose full source paragraphs are progressively disclosed.
    assert.equal(await phoneA.locator(".scene-art > svg").count(),1);
    const environments=await phoneA.evaluate(()=>
      ["mail","floor","client","press","warehouse","board"].map(name=>{
        const doc=new DOMParser().parseFromString(window.BCPreviewArt.scene(name),"image/svg+xml");
        if(doc.querySelector("parsererror"))return null;
        return doc.querySelector("[data-art-environment]")?.getAttribute("data-art-environment");
      }));
    assert.deepEqual(environments,
      ["office","depot","client-suite","newsroom","warehouse","boardroom"],
      "Six cinematic chapters need six coherent, parseable locations");
    assert.equal(await phoneA.locator(".scene-film svg").count(),1,
      "Each cinematic incident contains its original illustration layer");
    assert.equal(await phoneA.locator(".episode-progress li").count(),6);
    assert.equal(await phoneA.locator(".evidence-folder").evaluate(el=>el.open),false,
      "Phone starts with a concise evidence index instead of three long cards");
    const initialDecisionOffset=await phoneA.locator("#player-actions").evaluate(el=>
      Math.round(el.getBoundingClientRect().top+scrollY));
    assert.ok(initialDecisionOffset<1600,
      "On a 320px phone the action must remain easy to reach: "+initialDecisionOffset);
    await phoneA.locator(".evidence-folder-summary").click();
    assert.equal(await phoneA.locator(".evidence-folder").evaluate(el=>el.open),true);
    assert.equal(await phoneA.locator(".evidence-item[open]").count(),0);
    assert.equal(await phoneA.locator(".briefing-details[open]").count(),0);
    assert.equal(await phoneA.locator("body.in-game").count(),1);
    await phoneA.locator(".evidence-item summary").first().click();
    assert.equal(await phoneA.locator(".evidence-item[open]").count(),1);
    assert.match(await phoneA.locator(".evidence-item[open] .evidence-source").innerText(),/Project Spark seeks a credible/);
    await phoneA.locator(".briefing-details summary").click();
    assert.match(await phoneA.locator(".briefing-details .episode-intro").innerText(),/Project Spark/);
    assert.equal(await phoneA.locator(".exposure-risk-list .risk-entry").count(),4);
    assert.equal(await phoneA.locator(".exposure-panel").evaluate(el=>el.open),false,
      "Finance panel defaults to compact disclosure on a 320px phone");
    await phoneA.locator(".exposure-summary").click();
    assert.equal(await phoneA.locator(".exposure-panel").evaluate(el=>el.open),true);
    await phoneA.locator(".exposure-summary").click();
    await phoneA.evaluate(()=>scrollTo(0,0));
    await phoneA.waitForFunction(()=>!document.querySelector("#decision-dock")?.hidden,
      null,{timeout:5000});
    assert.equal(await phoneA.locator("#decision-dock").isVisible(),true,
      "Players have a persistent route to their action despite long evidence");
    assert.match(await phoneA.locator("#decision-dock-label").textContent(),/MAKE YOUR TEAM DECISION/);
    await phoneA.locator("#decision-dock").click();
    const rulesPlacement=await phoneA.evaluate(()=>{
      const action=document.querySelector("#player-actions");
      const rules=document.querySelector("#game-rules");
      return {actionY:action.getBoundingClientRect().top+scrollY,
        rulesY:rules.getBoundingClientRect().top+scrollY};
    });
    assert.ok(rulesPlacement.rulesY>rulesPlacement.actionY,
      "During a live episode the Rules of Engagement must follow the decision, not obstruct it");
    assert.ok(await phoneA.locator("#player-actions").evaluate(el=>el.getBoundingClientRect().top<innerHeight),
      "Decision dock actually navigates to the actionable form");

    await projected.waitForFunction(()=>document.querySelector(".episode-panel h3")?.textContent?.includes("THE INVITATION"));
    await projected.locator("#projector-ticker").waitFor({state:"visible",timeout:12000});
    assert.equal(await projected.locator(".ticker-team").count(),2);
    assert.equal(await projected.locator(".ticker-clock").count(),2);
    assert.equal(await projected.locator("#team-list").isVisible(),false,
      "Projector ticker replaces below-the-fold duplicate roster");
    assert.equal(await projected.locator(".evidence-item").count(),3);
    assert.equal(await projected.locator(".scene-directive").count(),1);
    assert.equal(await projected.locator(".scene-directive").isVisible(),false,
      "Compact 720p projection prioritises source exhibits over optional player guidance");
    assert.equal(await projected.locator("#decision-dock").isVisible(),false,
      "The projector never displays personal player controls");
    assert.equal(await projected.locator(".scene-fact").count(),3,
      "Projected incident facts accompany the illustrations");
    assert.ok(await projected.locator(".scene-fact dd").first().evaluate(el=>
      Number.parseFloat(getComputedStyle(el).fontSize)>=17),
      "Public numbers are enlarged for a projector audience");
    const projectedOverflow=await projected.evaluate(()=>
      document.documentElement.scrollWidth-innerWidth);
    assert.ok(projectedOverflow<=1,"1280px projector must avoid sideways scrolling");
    const stage=await projected.evaluate(()=>{
      const proof=document.querySelector(".evidence-list").getBoundingClientRect();
      const hero=document.querySelector(".scene-hero").getBoundingClientRect();
      return {proofBottom:proof.bottom,heroBottom:hero.bottom,viewport:innerHeight};
    });
    assert.ok(stage.proofBottom<=stage.viewport-8,
      "All three evidence summaries must fit inside a real 720p projector viewport: "+
      JSON.stringify(stage));
    const stageFit=await projected.evaluate(()=>{
      const cards=[...document.querySelectorAll(".evidence-item summary")].map(x=>
        x.getBoundingClientRect());
      return {innerHeight,scroll:document.documentElement.scrollHeight,
        bodyScroll:document.body.scrollHeight,
        visible:cards.every(x=>x.bottom<=innerHeight-8&&x.top>=0)};
    });
    assert.ok(stageFit.visible && stageFit.scroll<=stageFit.innerHeight+2,
      "Full projected scene and source leads must fit without vertical scroll: "+JSON.stringify(stageFit));
    for(const dimensions of [{width:1024,height:768},{width:1920,height:1080}]){
      await projected.setViewportSize(dimensions);
      const screen=await projected.evaluate(()=>{
        const cards=[...document.querySelectorAll(".evidence-item summary")].map(x=>x.getBoundingClientRect());
        return {width:innerWidth,height:innerHeight,
          scroll:document.documentElement.scrollHeight,
          clipped:cards.some(x=>x.bottom>innerHeight-8||x.top<0)};
      });
      if(screen.scroll>screen.height+2||screen.clipped){
        const geometry=await projected.evaluate(()=>{
          const names=[".masthead",".layout",".content-panel",".scene-hero",".episode-panel",".episode-progress",".briefing-details",".evidence-folder",".evidence-list"];
          const result={};
          for(const n of names){const e=document.querySelector(n),r=e?.getBoundingClientRect();result[n]=r?{top:Math.round(r.top),bottom:Math.round(r.bottom),height:Math.round(r.height)}:null}
          return result;
        });
        console.error("PROJECTOR FIT DIAGNOSTIC",JSON.stringify({dimensions,screen,geometry}));
      }
      assert.ok(screen.scroll<=screen.height+2&&!screen.clipped,
        "Projector must fit legacy 4:3 and Full HD screens without losing evidence: "+JSON.stringify(screen));
    }
    await projected.setViewportSize({width:1280,height:720});
    await projected.locator(".evidence-item summary").first().click();
    assert.equal(await projected.locator(".evidence-item[open] .dismiss-exhibit").isVisible(),true,
      "Full evidence opens in a bounded, closable projector overlay");
    const overlayFit=await projected.locator(".evidence-item[open]").evaluate(el=>{
      const r=el.getBoundingClientRect();return r.top>=0 && r.bottom<=innerHeight+1;
    });
    assert.equal(overlayFit,true,"Expanded evidence must never push past the display");
    await projected.keyboard.press("Escape");
    assert.equal(await projected.locator(".evidence-item[open]").count(),0,
      "Escape restores the single-screen incident");
    await projected.screenshot({path:path.join(root,screenshotDir,"12-projection-actual-720p.png"),
      fullPage:false});
    await phoneA.screenshot({path:path.join(root,screenshotDir,"10-design-v4-player-320.png"),fullPage:true});
    await projected.screenshot({path:path.join(root,screenshotDir,"11-design-v4-projection-1280.png"),fullPage:true});

    assert.equal(await phoneA.locator(".adviser-portrait svg").count(),0,
      "The six-adviser picker is absent during timed decisions after its untimed selection");
    assert.equal(await phoneA.locator(".chosen-adviser").count(),2,
      "Private advice stays visible during the decision window");
    assert.equal(await phoneA.locator(".jump-decision").count(),1);
    assert.equal(await phoneA.locator("#room-screen").evaluate(el=>getComputedStyle(el).display),"flex",
      "Player decisions are prioritised over long rosters");
    await phoneA.locator(".strategy-grid .strategy-choice").first().waitFor({state:"visible"});
    assert.equal(await phoneA.locator(".chosen-adviser").count(),2,
      "The two chosen adviser briefings appear immediately under a short heading");
    assert.equal(await phoneA.locator(".adviser-portrait").count(),0,
      "The six-card adviser picker collapses after selection to reduce phone scrolling");
    assert.equal(await phoneA.locator(".adviser-edit").count(),0,
      "Adviser changes close when the timed decision phase starts");
    const adviserOrder=await phoneA.evaluate(()=>{
      const grid=document.querySelector("#player-actions .strategy-grid"),
        advice=document.querySelector(".chosen-advisers");
      return Boolean(grid&&advice&&(advice.compareDocumentPosition(grid)&Node.DOCUMENT_POSITION_FOLLOWING));
    });
    assert.equal(adviserOrder,true,"Selected adviser advice must precede strategic decisions without duplicate portraits");
    assert.equal(await phoneA.locator(".strategy-grid .strategy-choice").count(),3);
    assert.equal(await phoneA.locator(".team-pulse").count(),0,
      "No live strategy popularity gauge should influence an undecided player");
    assert.ok(await phoneA.locator(".chosen-adviser-copy small").first().evaluate(el=>
      Number.parseFloat(getComputedStyle(el).fontSize)>=11),
      "Chosen adviser role stays readable at 320px");
    assert.equal(await phoneA.getByRole("combobox",{name:"Choose a statement"}).count(),1,
      "Decision controls must have real accessible labels");
    assert.equal(await phoneA.locator(".strategy-tradeoffs[open]").count(),0);
    await phoneA.locator(".strategy-tradeoffs summary").first().click();
    assert.match(await phoneA.locator(".strategy-tradeoffs[open]").innerText(),/UPSIDE/);
    assert.equal(await phoneA.locator(".evidence-item[open]").count(),1,
      "Expanded evidence stays open on subsequent live snapshots");
    assert.equal(await phoneA.locator(".briefing-details[open]").count(),1,
      "Briefing disclosure stays open as teammates vote");

    await phoneA.locator('[data-plan="0"]').click();
    const revisionBeforeOpposingDecision=Number(
      await phoneA.locator("#room-screen").getAttribute("data-revision"));
    assert.equal(await phoneA.locator('[data-plan="0"]').evaluate(el=>el===document.activeElement),
      true,"Selected choice is keyboard-focused");
    // A rival's submitted vote broadcasts a server revision. It must not
    // reset Alice's keyboard focus, opened strategy detail or local draft.
    await phoneB.locator('[data-plan="1"]').click();
    await phoneB.locator("#player-actions select").last().selectOption("1");
    await phoneB.getByRole("button", {name: "LOCK MY VOTE"}).click();
    await phoneA.waitForFunction(rev=>
      Number(document.querySelector("#room-screen")?.dataset.revision)>rev,
      revisionBeforeOpposingDecision,{timeout:12000});
    assert.equal(await phoneA.locator('[data-plan="0"]').evaluate(el=>el===document.activeElement),
      true,"Remote WebSocket updates preserve a participant's active choice");
    assert.equal(await phoneA.locator(".strategy-tradeoffs[open]").count(),1,
      "Team updates do not collapse chosen strategy's tradeoffs");
    await phoneA.locator("#player-actions select").last().selectOption("0");
    await phoneA.getByRole("button", {name: "LOCK MY VOTE"}).click();
    await projected.waitForFunction(()=>document.querySelectorAll(".ticker-team.is-ready").length===2,
      null,{timeout:12000});
    await phoneA.waitForFunction(()=>document.querySelector("#timer-phase")?.textContent?.includes("TEAM CLOCK STOPPED"));
    await phoneA.locator(".aftershock-report").waitFor({state:"visible",timeout:12000});
    assert.equal(await phoneA.locator(".submit-game").count(),0,
      "Saving the ballot removes its submit control on every episode");
    assert.equal(await phoneA.locator(".strategy-choice").count(),0,
      "Locked player sees adviser intelligence, not another long strategy form");
    assert.equal(await phoneA.locator(".chosen-adviser").count(),2,
      "Two chosen advisers remain after the ballot locks");
    assert.match(await phoneA.locator(".vote-finished").textContent(),/TEAM RESPONSE CONFIRMED/);
    assert.match(await phoneA.locator(".aftershock-report").innerText(),/DESIGN THE PROOF/);
    assert.match(await phoneA.locator(".aftershock-report").innerText(),/£26,000/);
    assert.match(await phoneA.locator(".aftershock-report").innerText(),/\+10 pts/);
    assert.equal(await phoneB.locator(".aftershock-report").count(),1,
      "The rival receives its own consequence after voting");
    assert.doesNotMatch(await phoneB.locator(".aftershock-report").innerText(),/VERIFY & SECURE/,
      "The rival must not receive Alice's decision narrative");
    assert.equal(await hostUI.locator(".aftershock-report").count(),0);
    assert.equal(await projected.locator(".aftershock-report").count(),0);
    const frozen=await phoneA.locator("#timer").textContent();
    await delay(1200);
    assert.equal(await phoneA.locator("#timer").textContent(),frozen,"A team that locked early has a frozen timer");
    // A late player may enter a running episode without altering the current
    // electorate, vote window or locked decisions. All connected roles get a
    // short named presence notification; projector still has no private votes.
    const lateUI=await browser.newPage({viewport:{width:390,height:820},reducedMotion:"reduce"});
    observePage(lateUI,"LATE PLAYER 390");
    await lateUI.goto(base+"/join?room="+uiCode,{waitUntil:"load"});
    await lateUI.locator("#join-form").waitFor({state:"visible",timeout:10000});
    assert.match(await lateUI.locator("#join-caption").textContent(),/GAME IN PROGRESS/);
    await lateUI.locator("#join-name").fill("Late Charlie");
    await lateUI.locator("#join-team").selectOption("0");
    await lateUI.locator("#join-form button.primary").click();
    await lateUI.locator("#room-screen").waitFor({state:"visible",timeout:12000});
    assert.match(await lateUI.locator(".vote-finished").textContent(),/JOINED MID-EPISODE/);
    assert.equal(await lateUI.locator(".submit-game").count(),0,
      "Joining after the timer starts must never introduce an extra required ballot");
    await hostUI.waitForFunction(()=>
      document.querySelector("#presence-toast")?.textContent?.includes("Late Charlie JOINED"),
      null,{timeout:12000});
    await projected.waitForFunction(()=>
      document.querySelector("#presence-toast")?.textContent?.includes("Late Charlie JOINED"),
      null,{timeout:12000});
    const readyName=(await phoneA.locator(".team.mine strong").textContent()).trim();
    await phoneB.waitForFunction(name=>document.querySelector("#ready-notice")?.textContent?.includes(name),readyName);
    await hostUI.waitForFunction(()=>document.querySelector("#ready-notice")?.textContent?.includes("ALL TEAMS READY"));
    assert.equal(await hostUI.locator("#host-share").isVisible(),true,"Host can invite late entrants");
    assert.equal(await projected.locator("#projector-invite").isVisible(),false,"Projector QR hidden after game starts");
    assert.equal(await hostUI.locator("#room-code").isVisible(),false,"Room code hidden after start");
    // Network loss must not invalidate a player's token or reset a locked
    // ballot. Verify Safari's actual visible offline-to-live transition.
    const bobTokenBefore=await phoneB.evaluate(code=>
      sessionStorage.getItem("bc-preview-session-"+code),uiCode);
    const bobRevisionBefore=Number(await phoneB.locator("#room-screen").getAttribute("data-revision"));
    assert.match(bobTokenBefore,/^[a-f0-9]{64}$/);
    assert.equal(await phoneB.locator(".vote-finished").count(),1,
      "Bob's already-submitted vote remains locked before disconnection");
    await phoneB.context().setOffline(true);
    await phoneB.waitForFunction(()=>
      document.querySelector("#connection")?.textContent?.includes("OFFLINE"),
      null,{timeout:8000});
    assert.equal(await phoneB.evaluate(code=>
      sessionStorage.getItem("bc-preview-session-"+code),uiCode),bobTokenBefore,
      "Offline transition must not clear the player's credentials");
    await hostUI.locator("#host-ready-dialog").waitFor({state:"visible",timeout:10000});
    assert.equal(await hostUI.locator("#ready-next").evaluate(el=>document.activeElement===el),true,
      "The host-ready modal must move keyboard focus onto the next-episode action");
    await hostUI.keyboard.press("Shift+Tab");
    assert.equal(await hostUI.locator("#ready-later").evaluate(el=>document.activeElement===el),true,
      "Focus stays inside the two-action host prompt");
    await hostUI.keyboard.press("Tab");
    assert.equal(await hostUI.locator("#ready-next").evaluate(el=>document.activeElement===el),true);
    assert.match(await hostUI.locator("#host-ready-title").textContent(),/ready/i);
    await phoneA.evaluate(()=>scrollTo(0,document.body.scrollHeight));
    await hostUI.locator("#ready-next").click();
    await phoneB.context().setOffline(false);
    await phoneB.waitForFunction(before=>
      document.querySelector("#connection")?.textContent==="LIVE SYNC"&&
      Number(document.querySelector("#room-screen")?.dataset.revision)>before,
      bobRevisionBefore,{timeout:15000});
    assert.equal(await phoneB.evaluate(code=>
      sessionStorage.getItem("bc-preview-session-"+code),uiCode),bobTokenBefore,
      "Reconnection must reuse the same saved player identity");
    await phoneA.waitForFunction(()=>document.querySelector(".episode-panel h3")?.textContent?.includes("THE PEOPLE BEHIND THE PLAN"),
      null,{timeout:15000});
    await phoneA.waitForFunction(()=>scrollY<=12,null,{timeout:8000});
    await lateUI.waitForFunction(()=>document.querySelector(".vote-finished")===null,
      null,{timeout:12000});
    lateUI.once("dialog",dialog=>dialog.accept());
    await lateUI.locator("#leave-room").click();
    await hostUI.waitForFunction(()=>
      document.querySelector("#presence-toast")?.textContent?.includes("Late Charlie LEFT"),
      null,{timeout:12000});
    assert.equal(await hostUI.locator("#host-roster").count(),0);
    await phoneB.waitForFunction(()=>document.querySelector(".episode-panel h3")?.textContent?.includes("THE PEOPLE BEHIND THE PLAN"),
      null,{timeout:15000});
    assert.equal(await phoneB.locator(".scene-art[data-scene='2'] > svg").count(),1,
      "Each episode uses the matching cinematic illustration");
    assert.deepEqual(await phoneB.locator(".scene-fact dd").allTextContents(),
      ["600","1","NEW"],"The staff-capacity episode displays facts consistent with the story");
    await projected.waitForFunction(()=>document.querySelector(".episode-panel h3")?.textContent?.includes("THE PEOPLE BEHIND THE PLAN"),
      null,{timeout:15000});
    // Story continuity should be actual UI content, private to its team's player.
    await phoneA.locator(".team-story-thread").waitFor({state:"visible",timeout:12000});
    await phoneB.locator(".team-story-thread").waitFor({state:"visible",timeout:12000});
    assert.match(await phoneA.locator(".team-story-thread").textContent(),/evidence-first proposal/i);
    assert.match(await phoneB.locator(".team-story-thread").textContent(),/three-site vision/i);
    assert.equal(await hostUI.locator(".team-story-thread").count(),0,
      "Facilitator must not see individual team story bridges");
    assert.equal(await projected.locator(".team-story-thread").count(),0,
      "Public projector must not see private story bridges");


    await hostUI.waitForFunction(() => document.querySelector("#host-actions")?.textContent?.includes("EPISODE 2"));
    assert.match(await phoneA.locator("#round-recap").innerText(), /PREVIOUS EPISODE/);
    assert.equal(await phoneA.locator(".aftershock-report").evaluate(el=>el.open),false,
      "Previous consequence folds away so it does not delay the next timed vote");
    assert.match(await phoneA.locator(".aftershock-summary").innerText(),/DESIGN THE PROOF/);
    await phoneA.locator(".aftershock-summary").click();
    assert.match(await phoneA.locator(".aftershock-fallout").innerText(),/partner welcomes/i);
    await phoneA.locator(".recap-details summary").click();
    const publicAftershock=await phoneA.locator("#round-recap").innerText();
    assert.match(publicAftershock,/RESPONSE COST/);
    assert.doesNotMatch(publicAftershock,/CASH £|TRUST \d/,
      "Mid-game public recaps must not leak rival cash or trust");
    const overflow = await phoneA.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, "New 320px lobby overflow: " + overflow);
    await (await import("node:fs/promises")).mkdir(path.join(root, "screenshots"), {recursive: true});
    await phoneA.screenshot({path: path.join(root, "screenshots", "06-room-mobile-320.png"), fullPage: true});
    await projected.screenshot({path:path.join(root,screenshotDir,"07-projector-1280.png"),fullPage:true});
    // A complete room can render and export a stand-alone human-readable report.
    const reportHost=await browser.newPage({viewport:{width:1366,height:900},acceptDownloads:true});
    observePage(reportHost,"REPORT HOST");
    await reportHost.addInitScript(({code,token})=>{
      sessionStorage.setItem("bc-preview-session-"+code,token);
    },{code:roomCode,token:hostToken});
    await reportHost.goto(base+"/?room="+roomCode,{waitUntil:"load"});
    await reportHost.locator("#boardroom-report").waitFor({state:"visible",timeout:12000});
    // The interactive screen above is only at episode 2. Use the separate
    // six-episode completed room for the real public boardroom finale.
    const finishedAccess=await req("/api/rooms/"+roomCode+"/projector-access","POST",{},hostToken);
    assert.equal(finishedAccess.response.status,200);
    const finishedProjector=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:"reduce"});
    finishedProjector.on("pageerror",err=>browserErrors.push(err.message));
    await finishedProjector.goto(base+"/projector?room="+roomCode+"#access="+finishedAccess.payload.projectorToken);
    await finishedProjector.locator(".projection-verdict").waitFor({state:"visible",timeout:12000});
    assert.equal(await finishedProjector.locator(".projection-rank").count(),2,
      "The final projector uses concise public team rankings rather than the long report");
    const verdictFit=await finishedProjector.evaluate(()=>{
      const r=document.querySelector(".projection-verdict").getBoundingClientRect();
      return {height:innerHeight,scroll:document.documentElement.scrollHeight,bottom:r.bottom};
    });
    assert.ok(verdictFit.scroll<=verdictFit.height+2 && verdictFit.bottom<=verdictFit.height-7,
      "The final board vote must fit on 720p without scroll: "+JSON.stringify(verdictFit));
    assert.match(await reportHost.locator(".report-head h2").textContent(),/BOARDROOM VERDICT/);
    assert.equal(await reportHost.locator(".report-team").count(),2);
    assert.equal(await reportHost.locator(".report-numeric-breakdown").count(),2,
      "Both teams should get a fully reconciled numeric score explanation");
    assert.equal(await reportHost.locator(".report-learning-notes").count(),4,
      "Both teams should get documented strengths and constructive next steps");

    assert.equal(await reportHost.locator(".report-epilogue").count(),1,
      "Final report does not fabricate a partner award");
    assert.match(await reportHost.locator(".report-epilogue").innerText(),/no pilot was awarded|do not claim that a pilot was awarded/i);
    assert.equal(await reportHost.locator(".cash-trajectory svg").count(),2,
      "Final report shows actual response fund trajectory for each team");
    assert.equal(await reportHost.locator(".facilitator-debrief").count(),1,
      "Host gets optional facilitator questions without adding default reading");
    assert.equal(await reportHost.locator(".report-episode").count(),12);
    assert.equal(await reportHost.locator(".decision-trail").evaluate(el=>el.open),false,
      "The teambuilding scoreboard starts with the outcome, not 12 paragraphs");
    assert.equal(await reportHost.locator(".compare-round").count(),6);
    await reportHost.locator(".decision-trail > summary").click();
    await reportHost.locator(".compare-round > summary").first().click();
    assert.equal(await reportHost.locator(".compare-round").first().locator(".compare-team-name").count(),2,
      "Each expanded chapter directly compares both teams");
    assert.equal(await reportHost.locator(".report-advanced[open]").count(),0,
      "Long cash and risk details should be opt-in");
    assert.equal(await reportHost.getByRole("button",{name:"DOWNLOAD RESULTS · PDF"}).count(),1);
    assert.equal(await reportHost.locator(".boardroom-award").count(),4);
    assert.equal(await reportHost.locator(".boardroom-award-winner").count(),4);
    assert.equal(await reportHost.locator(".verdict-ring").count(),2,
      "Two factually grounded pie-style graphics appear in the verdict");
    assert.match(await reportHost.locator(".verdict-surprise").textContent(),/MOST EXPENSIVE CHAPTER/);
    const downloadPromise=reportHost.waitForEvent("download");
    await reportHost.getByRole("button",{name:"DOWNLOAD RESULTS · PDF"}).click();
    const downloaded=await downloadPromise;
    assert.equal(downloaded.suggestedFilename(),"the-0917-challenge-team-results.pdf",
      "A direct download must provide a real PDF, not HTML");
    const pdfBytes=await (await import("node:fs/promises")).readFile(await downloaded.path());
    const pdfContent=pdfBytes.toString("latin1");
    assert.match(pdfContent,/^%PDF-1\.4/);
    assert.match(pdfContent,/THE BOARDROOM VERDICT/);
    assert.match(pdfContent,/FINAL TEAM RANKINGS/);
    assert.match(pdfContent,/CHALLENGE SNAPSHOT/);
    assert.match(pdfContent,/WHAT EACH TEAM CHOSE/);
    assert.match(pdfContent,/THE MATH BEHIND|WHAT THE MODEL MEASURED/,
      "The PDF also contains a plain-language calculation section");
    assert.match(pdfContent,/WHAT THIS TEAM PROTECTED/,
      "The PDF has the positive learning debrief for each team");

    assert.match(pdfContent,/\/Count (?:[7-9]|[1-9][0-9])/);
    assert.doesNotMatch(pdfContent,/mailto:|emailjs|sendgrid|credentialHash/i);
    assert.doesNotMatch(pdfContent,new RegExp(hostToken));
    assert.doesNotMatch(pdfContent,new RegExp(roomCode));
    assert.ok(pdfBytes.length>10000,"PDF must contain actual graphical and textual content");
    assert.deepEqual(browserErrors, [], "Room preview browser JavaScript errors. " +
      "Failed lobby requests by named tab: "+JSON.stringify(lobbyNetworkFailures));
  } finally { await browser.close(); }
  console.log(JSON.stringify({passed: true, runtime: "local wrangler workerd",
    qr: "SVG generated", websocketSync: "host and two players", responsiveUI: "Chromium 320px room join and round 2",
    privacy: "role-filtered snapshots", serverClock: "3m + 1m", deployments: 0}, null, 2));
} finally { await clean(); }
