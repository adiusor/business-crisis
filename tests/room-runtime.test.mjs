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
    ws.addEventListener("open", () => ws.send(JSON.stringify({type: "authenticate", token: credential})));
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
  assert.equal((await req("/")).response.status, 200);
  const css = await req("/room-style.css"); assert.equal(css.response.status, 200);
  const script = await req("/room-script.js"); assert.equal(script.response.status, 200);
  assert.match(script.payload, /new WebSocket/);
  const rejectUnauth = await req("/api/rooms", "POST", {teamCount: 2});
  assert.equal(rejectUnauth.response.status, 401, "Founder key required");
  const created = await req("/api/rooms", "POST", {teamCount: 2}, creationKey);
  assert.equal(created.response.status, 201, "Room creates through actual Worker: " + JSON.stringify(created.payload));
  const {roomCode, hostToken} = created.payload;
  assert.match(roomCode, /^[A-F0-9]{12}$/);
  assert.match(hostToken, /^[a-f0-9]{64}$/);
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
  const bob = await req("/api/rooms/" + roomCode + "/join", "POST", {nickname: "Bob", teamIndex: 1});
  assert.equal(bob.response.status, 201);
  const bobWS = await socketFor(bob.payload.playerToken, roomCode);
  await snapshot(host, s => s.players.length === 2, "host sees two participants");
  const rename = await req("/api/rooms/" + roomCode + "/actions", "POST", {
    type: "rename_team", name: lobby.payload.teamNameOptions.find(n => !lobby.payload.teams.some(t => t.name === n)),
    expectedRevision: bob.payload.state.revision
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
  assert.equal(JSON.stringify(projectorView.payload.state).includes("Alice"),false);
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
  assert.equal(await projectorClosed,1008,"Old projector socket closed on credential rotation");
  assert.equal((await req("/api/rooms/" + roomCode + "/state","GET",undefined,rotated.payload.projectorToken)).response.status,200);


  // Browser-level preview check at actual 320px viewport, separate from the existing standalone game.
  const {chromium} = await import("playwright");
  const browser = await chromium.launch({headless: true, args: ["--no-sandbox"]});
  try {
    const hostUI = await browser.newPage({viewport: {width: 1440, height: 900}, reducedMotion: "reduce"});
    const phoneA = await browser.newPage({viewport: {width: 320, height: 720}, reducedMotion: "reduce"});
    const phoneB = await browser.newPage({viewport: {width: 390, height: 820}, reducedMotion: "reduce"});
    const browserErrors = [];
    for (const page of [hostUI, phoneA, phoneB])
      page.on("pageerror", err => browserErrors.push(err.message));
    await hostUI.goto(base, {waitUntil: "load"});
    await hostUI.locator("#create-key").fill(creationKey);
    await hostUI.locator("#create-teams").selectOption("2");
    await hostUI.locator("#create-form button.primary").click();
    await hostUI.locator("#room-screen").waitFor({state: "visible", timeout: 12000});
    const uiCode = (await hostUI.locator("#room-code").textContent()).trim();
    assert.match(uiCode, /^[A-F0-9]{12}$/);
    await hostUI.locator("#join-qr").evaluate(async image => {
      if (image.complete && image.naturalWidth > 0) return;
      await new Promise((resolve, reject) => {
        image.addEventListener("load", resolve, {once: true});
        image.addEventListener("error", () => reject(Error("QR image failed to load")), {once: true});
      });
    });
    await phoneA.goto(base + "/join?room=" + uiCode);
    await phoneA.locator("#join-name").fill("Mobile Alice");
    await phoneA.locator("#join-team").selectOption("0");
    await phoneA.locator("#join-form button.primary").click();
    await phoneA.locator("#room-screen").waitFor({state: "visible", timeout: 10000});
    await phoneB.goto(base + "/join?room=" + uiCode);
    await phoneB.locator("#join-name").fill("Mobile Bob");
    await phoneB.locator("#join-team").selectOption("1");
    await phoneB.locator("#join-form button.primary").click();
    await phoneB.locator("#room-screen").waitFor({state: "visible", timeout: 10000});
    await hostUI.waitForFunction(() => document.querySelector("#team-list")?.textContent?.includes("Mobile Bob"));
    // Host can issue a projection link without revealing their own host bearer token.
    await hostUI.locator("#rotate-projector").click();
    await hostUI.locator("#projector-link").waitFor({state:"visible"});
    const projectorHref=await hostUI.locator("#projector-link").getAttribute("href");
    assert.match(projectorHref,/\/projector\?room=[A-F0-9]{12}#access=[a-f0-9]{64}$/);
    const projected=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:"reduce"});
    projected.on("pageerror",err=>browserErrors.push(err.message));
    await projected.goto(projectorHref,{waitUntil:"load"});
    await projected.locator("#room-screen").waitFor({state:"visible",timeout:12000});
    assert.equal(await projected.locator("#viewer-mode").isVisible(),true);
    assert.equal(await projected.locator("#host-actions").isVisible(),false);
    assert.equal(await projected.locator("#player-actions").isVisible(),false);
    assert.equal(await projected.locator("#captain-tools").isVisible(),false);
    assert.equal(new URL(projected.url()).hash,"","Projector fragment credential cleared from browser URL");
    assert.equal((await projected.locator("#team-list").innerText()).includes("Mobile Alice"),false,
      "Player nicknames cannot reach projection display");

    const original = (await phoneA.locator(".team.mine strong").textContent()).trim();
    const options = await phoneA.locator("#team-name-choice option").evaluateAll(xs => xs.map(x => x.value));
    const newName = options.find(x => x !== original);
    assert.ok(newName, "At least one alternative team name exists");
    await phoneA.locator("#team-name-choice").selectOption(newName);
    await phoneA.locator("#rename-team").click();
    await hostUI.waitForFunction(name => document.querySelector("#team-list")?.textContent?.includes(name), newName);
    assert.match(await hostUI.locator("#episode-panel").innerText().catch(() => ""), /|^$/); // Lobby has no episode yet.
    await hostUI.locator("#host-actions button.primary").click();
    await phoneA.locator("#timer-wrap").waitFor({state: "visible", timeout: 8000});
    assert.match(await phoneA.locator("#timer-phase").textContent(), /STANDARD TIME/);
    assert.match(await phoneA.locator("#episode-panel").innerText(), /THE SEND|CONFIDENTIAL/);
    assert.equal(await phoneA.locator(".evidence-item").count(), 3);
    await projected.waitForFunction(()=>document.querySelector(".episode-panel h3")?.textContent?.includes("THE SEND"));
    assert.equal(await projected.locator(".evidence-item").count(),3);

    await phoneA.locator('[data-choice="0"]').click();
    await phoneA.locator('[data-choice="1"]').click();
    await phoneA.getByRole("button", {name: "SAVE TWO PICKS"}).click();
    await phoneA.locator('[data-plan="0"]').click();
    await phoneA.locator("#player-actions select").last().selectOption("0");
    await phoneA.getByRole("button", {name: "COMMIT STRATEGY & STATEMENT"}).click();
    await phoneB.locator('[data-choice="2"]').click();
    await phoneB.locator('[data-choice="3"]').click();
    await phoneB.getByRole("button", {name: "SAVE TWO PICKS"}).click();
    await phoneB.locator('[data-plan="1"]').click();
    await phoneB.locator("#player-actions select").last().selectOption("1");
    await phoneB.getByRole("button", {name: "COMMIT STRATEGY & STATEMENT"}).click();
    // Network loss while a team is waiting must not lose its saved session.
    await phoneB.context().setOffline(true);
    await hostUI.getByRole("button", {name: "START NEXT EPISODE"}).click();
    await phoneB.context().setOffline(false);
    await phoneB.waitForFunction(()=>document.querySelector(".episode-panel h3")?.textContent?.includes("THE FLOOR"),
      null,{timeout:15000});
    await projected.waitForFunction(()=>document.querySelector(".episode-panel h3")?.textContent?.includes("THE FLOOR"),
      null,{timeout:15000});

    await hostUI.waitForFunction(() => document.querySelector("#host-actions")?.textContent?.includes("EPISODE 2"));
    assert.match(await phoneA.locator("#round-recap").innerText(), /PREVIOUS EPISODE/);
    const overflow = await phoneA.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, "New 320px lobby overflow: " + overflow);
    await (await import("node:fs/promises")).mkdir(path.join(root, "screenshots"), {recursive: true});
    await phoneA.screenshot({path: path.join(root, "screenshots", "06-room-mobile-320.png"), fullPage: true});
    await projected.screenshot({path:path.join(root,"screenshots","07-projector-1280.png"),fullPage:true});
    assert.deepEqual(browserErrors, [], "Room preview browser JavaScript errors");
  } finally { await browser.close(); }
  console.log(JSON.stringify({passed: true, runtime: "local wrangler workerd",
    qr: "SVG generated", websocketSync: "host and two players", responsiveUI: "Chromium 320px room join and round 2",
    privacy: "role-filtered snapshots", serverClock: "3m + 1m", deployments: 0}, null, 2));
} finally { await clean(); }
