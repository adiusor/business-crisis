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
  assert.equal(JSON.stringify(hostAfter).includes('"advisers"'), false, "host cannot read team's secrets");
  const bobAfter = await snapshot(bobWS, s => s.revision === choice.payload.state.revision, "Bob picks broadcast");
  assert.deepEqual(bobAfter.privateTeam.advisers, [], "opponent cannot inspect private picks");
  const aliceAfter = await snapshot(aliceWS, s => s.revision === choice.payload.state.revision, "Alice picks broadcast");
  assert.deepEqual(aliceAfter.privateTeam.advisers, [0, 4]);
  assert.equal((await req("/api/rooms/" + roomCode + "/state")).response.status, 401, "No unauthenticated state");
  console.log(JSON.stringify({passed: true, runtime: "local wrangler workerd",
    qr: "SVG generated", websocketSync: "host and two players",
    privacy: "role-filtered snapshots", serverClock: "3m + 1m", deployments: 0}, null, 2));
} finally { await clean(); }
