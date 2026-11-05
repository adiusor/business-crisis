// Isolated Cloudflare Worker + Durable Object multiplayer *preview*. NO production deployment.
import {DurableObject} from "cloudflare:workers";
import QRCode from "qrcode-svg";
import CLIENT_HTML from "./client.html";
import CLIENT_STYLE from "./client-style.txt";
import CLIENT_SCRIPT from "./client-script.txt";
import CLIENT_ART from "./client-art.txt";
import {createRoom, authorize, joinRoom, applyRoomAction, viewFor, viewLobby,
  clockFor, expireRoom, rotateProjector, ROOM_CODE_ALPHABET} from "./room-core.mjs";

const HEADERS = {"content-type": "application/json; charset=utf-8", "cache-control": "no-store",
  "x-content-type-options": "nosniff", "referrer-policy": "no-referrer"};
const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self' ws: wss:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'";
const htmlResponse = (body, type) => new Response(body, {headers: {...HEADERS, "content-type": type,
  "content-security-policy": CSP}});
const json = (value, status = 200) => new Response(JSON.stringify(value), {status, headers: HEADERS});
const problem = e => json({error: e && Number.isInteger(e.status) ? e.message : "Internal room error"},
  e && Number.isInteger(e.status) ? e.status : 500);
const token = () => Array.from(crypto.getRandomValues(new Uint8Array(32)),
  x => x.toString(16).padStart(2, "0")).join("");
// Uniform CSPRNG selection across 32 symbols, never based on timestamps or counters.
const shortCode = () => Array.from(crypto.getRandomValues(new Uint8Array(4)),
  value => ROOM_CODE_ALPHABET[value & 31]).join("");
const sha256 = async value => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",
  new TextEncoder().encode(value))), x => x.toString(16).padStart(2, "0")).join("");
const fail = (status, message) => { throw Object.assign(new Error(message), {status}); };
const parse = async request => {
  const body = await request.text();
  if (body.length > 4096) fail(413, "Request too large");
  try {
    const object = JSON.parse(body);
    if (!object || typeof object !== "object" || Array.isArray(object)) fail(400, "Expected a JSON object");
    return object;
  } catch (e) {
    if (e.status) throw e;
    fail(400, "Invalid JSON");
  }
};
const bearer = request => {
  const m = /^Bearer ([0-9a-f]{64})$/.exec(request.headers.get("authorization") || "");
  if (!m) fail(401, "Unauthorized");
  return m[1];
};

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (request.method === "GET") {
        if (url.pathname === "/" || url.pathname === "/join" || url.pathname === "/projector")
          return htmlResponse(CLIENT_HTML, "text/html; charset=utf-8");
        if (url.pathname === "/room-style.css")
          return htmlResponse(CLIENT_STYLE, "text/css; charset=utf-8");
        if (url.pathname === "/room-script.js")
          return htmlResponse(CLIENT_SCRIPT, "text/javascript; charset=utf-8");
        if (url.pathname === "/room-art.js")
          return htmlResponse(CLIENT_ART, "text/javascript; charset=utf-8");
        if (url.pathname === "/healthz")
          return json({ok: true, service: "room-prototype", deployedGame: false});
      }
      // Strict same-origin checks for browser-originated HTTP writes AND WebSocket upgrades.
      const origin = request.headers.get("origin");
      if (origin && origin !== url.origin && (request.method === "POST" || request.headers.get("upgrade")))
        fail(403, "Cross-origin access is not allowed");
      if (url.pathname === "/api/rooms" && request.method === "POST") {
        // The separate founder-managed secret must NEVER be shipped in the game, a link, or GitHub.
        if (!env.ROOM_CREATION_KEY) fail(503, "Room creation is disabled");
        if (request.headers.get("authorization") !== "Bearer " + env.ROOM_CREATION_KEY)
          fail(401, "Unauthorized");
        if (!env.CRISIS_ROOMS) fail(503, "Room storage is unavailable");
        const input = await parse(request);
        if (!Number.isInteger(input.teamCount) || input.teamCount < 2 || input.teamCount > 4)
          fail(400, "Choose 2–4 teams");
        for (let tries = 0; tries < 20; tries++) {
          const code = shortCode();
          const hostToken = token();
          const stub = env.CRISIS_ROOMS.get(env.CRISIS_ROOMS.idFromName(code));
          const res = await stub.fetch(new Request("https://room.internal/create", {method: "POST",
            headers: {"content-type": "application/json"},
            body: JSON.stringify({code, hostHash: await sha256(hostToken),
              teamCount: input.teamCount, nameSeed: crypto.getRandomValues(new Uint32Array(1))[0]})}));
          if (res.status === 409) continue;
          if (!res.ok) return res;
          return json({roomCode: code, hostToken}, 201);
        }
        fail(503, "Unable to allocate a new room");
      }
      const route = /^\/api\/rooms\/((?:[2-9A-HJ-NP-Z]{4}|[A-F0-9]{12}))\/(join|lobby|state|actions|socket|qr|projector-access)$/.exec(url.pathname);
      if (!route) fail(404, "Not found");
      const [, code, action] = route;
      if (action === "qr" && request.method === "GET") {
        const link = url.origin + "/join?room=" + code;
        const qr = new QRCode({content: link, padding: 2, width: 256, height: 256,
          ecl: "M", color: "#101b25", background: "#ffffff"});
        return new Response(qr.svg(), {headers: {...HEADERS, "content-type": "image/svg+xml; charset=utf-8",
          "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox"}});
      }
      const method = {join: "POST", lobby: "GET", state: "GET", actions: "POST", socket: "GET", "projector-access": "POST"}[action];
      if (request.method !== method) fail(405, "Method not allowed");
      if (!env.CRISIS_ROOMS) fail(503, "Room storage is unavailable");
      const stub = env.CRISIS_ROOMS.get(env.CRISIS_ROOMS.idFromName(code));
      return stub.fetch(new Request("https://room.internal/" + action, request));
    } catch (e) { return problem(e); }
  }
};

export class CrisisRoom extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.ctx = ctx; }
  async schedule(room, now = Date.now()) {
    const times = [room.expiresAtMs];
    const clock = clockFor(room, now);
    if (clock) {
      if (now < clock.normalEndsAt) times.push(clock.normalEndsAt);
      else if (now < clock.closesAt) times.push(clock.closesAt);
    }
    await this.ctx.storage.setAlarm(Math.min(...times));
  }
  async readRoom() {
    const stored = await this.ctx.storage.get("room");
    if (!stored) fail(404, "Room not found");
    if (Date.now() >= stored.expiresAtMs) {
      await this.ctx.storage.deleteAll();
      fail(410, "Room expired");
    }
    const effective = expireRoom(stored, Date.now());
    if (effective !== stored) {
      await this.ctx.storage.put("room", effective);
      await this.schedule(effective);
      await this.notify(effective);
    }
    return effective;
  }
  async mutate(fn) {
    let result;
    await this.ctx.storage.transaction(async txn => {
      const stored = await txn.get("room");
      if (!stored) fail(404, "Room not found");
      if (Date.now() >= stored.expiresAtMs) fail(410, "Room expired");
      const effective = expireRoom(stored, Date.now());
      result = await fn(effective);
      if (result !== stored) await txn.put("room", result);
    });
    await this.schedule(result);
    await this.notify(result);
    return result;
  }
  async actor(room, request) { return authorize(room, await sha256(bearer(request))); }
  async notify(room) {
    for (const ws of this.ctx.getWebSockets()) {
      const attachment = ws.deserializeAttachment();
      if (!attachment || attachment.role === "pending") continue;
      if(attachment.role==="player" &&
         !room.players.some(p=>!p.departed&&p.id===attachment.playerId)){
        try{ws.close(1008,"Participant access revoked");}catch(_){}
        continue;
      }
      if(attachment.role === "projector" && attachment.credentialHash !== room.projectorHash){
        try { ws.close(1008, "Projector access revoked"); } catch (_) {}
        continue;
      }
      try { ws.send(JSON.stringify({type: "snapshot", state: viewFor(room, attachment)})); }
      catch (_) { /* Socket disappeared while broadcasting. */ }
    }
  }
  async fetch(request) {
    try {
      const path = new URL(request.url).pathname;
      if (path === "/create" && request.method === "POST") {
        const data = await parse(request);
        const room = createRoom(data);
        let replacingExpired = false;
        await this.ctx.storage.transaction(async txn => {
          const existing = await txn.get("room");
          if (existing && (!Number.isSafeInteger(existing.expiresAtMs) || existing.expiresAtMs > Date.now()))
            fail(409, "Room already exists");
          if (existing) replacingExpired = true;
          await txn.put("room", room);
        });
        // Reusing an expired short code must never grant old WebSockets access to a new room.
        if (replacingExpired) for (const ws of this.ctx.getWebSockets()) {
          try { ws.close(1008, "Previous room expired"); } catch (_) {}
        }
        await this.schedule(room);
        return json({created: true}, 201);
      }
      if (path === "/lobby" && request.method === "GET")
        return json(viewLobby(await this.readRoom()));
      if (path === "/join" && request.method === "POST") {
        const input = await parse(request);
        const playerToken = token();
        const id = crypto.randomUUID();
        const hash = await sha256(playerToken);
        const next = await this.mutate(room => joinRoom(room, {...input,
          playerId: id, credentialHash: hash}));
        return json({playerToken, state: viewFor(next, {role: "player", playerId: id})}, 201);
      }
      if (path === "/state" && request.method === "GET") {
        const room = await this.readRoom();
        return json({state: viewFor(room, await this.actor(room, request))});
      }
      if (path === "/projector-access" && request.method === "POST") {
        const projectorToken = token();
        const projectorHash = await sha256(projectorToken);
        await this.mutate(async room => {
          const actor = await this.actor(room, request);
          if(actor.role !== "host") fail(403, "Only the host can rotate projector access");
          return rotateProjector(room, projectorHash);
        });
        return json({projectorToken});
      }
      if (path === "/actions" && request.method === "POST") {
        const command = await parse(request);
        let actor;
        const next = await this.mutate(async room => {
          actor = await this.actor(room, request);
          return applyRoomAction(room, actor, command, Date.now());
        });
        if(command.type==="leave_room")return json({left:true});
        return json({state: viewFor(next, actor)});
      }
      if (path === "/socket" && request.headers.get("upgrade")?.toLowerCase() === "websocket") {
        await this.readRoom();
        if (this.ctx.getWebSockets().length >= 64) fail(429, "Too many connections");
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);
        this.ctx.acceptWebSocket(server);
        server.serializeAttachment({role: "pending"});
        return new Response(null, {status: 101, webSocket: client});
      }
      fail(404, "Not found");
    } catch (e) { return problem(e); }
  }
  async webSocketMessage(ws, message) {
    const attachment = ws.deserializeAttachment() || {role: "pending"};
    try {
      if (typeof message !== "string" || message.length > 4096) fail(400, "Invalid message");
      let input;
      try { input = JSON.parse(message); } catch (_) { fail(400, "Invalid JSON"); }
      if (!input || typeof input !== "object" || Array.isArray(input)) fail(400, "Invalid message");
      const room = await this.readRoom();
      if (attachment.role === "pending") {
        if (input.type !== "authenticate" || typeof input.token !== "string" || !/^[0-9a-f]{64}$/.test(input.token))
          fail(401, "Unauthorized");
        const actor = authorize(room, await sha256(input.token));
        ws.serializeAttachment(actor.role === "projector" ?
          {...actor, credentialHash: await sha256(input.token)} : actor);
        ws.send(JSON.stringify({type: "snapshot", state: viewFor(room, actor)}));
        return;
      }
      if(attachment.role==="player" &&
         !room.players.some(p=>!p.departed&&p.id===attachment.playerId)){
        ws.close(1008,"Participant access revoked");return;
      }
      if(attachment.role === "projector" && attachment.credentialHash !== room.projectorHash){
        ws.close(1008, "Projector access revoked"); return;
      }
      if (input.type === "snapshot") {
        ws.send(JSON.stringify({type: "snapshot", state: viewFor(room, attachment)}));
      } else if (input.type === "action") {
        await this.mutate(room => applyRoomAction(room, attachment, input.command, Date.now()));
      } else fail(400, "Unknown message");
    } catch (e) {
      if (attachment.role === "pending") ws.close(1008, "Unauthorized");
      else {
        try { ws.send(JSON.stringify({type: "error",
          error: e && Number.isInteger(e.status) ? e.message : "Room error"})); }
        catch (_) { /* Client disconnected. */ }
      }
    }
  }
  async alarm() {
    try {
      const room = await this.readRoom();
      await this.schedule(room);
      await this.notify(room); // Timers enter the grace window without continuous polling.
    } catch (e) {
      if (e.status === 404 || e.status === 410) {
        for (const ws of this.ctx.getWebSockets()) {
          try { ws.close(1001, "Room expired"); } catch (_) {}
        }
        return;
      }
      throw e; // Retry transient storage failures via Durable Object alarm semantics.
    }
  }
  webSocketClose(ws, code, reason) { try { ws.close(code, reason); } catch (_) {} }
  webSocketError(ws) { try { ws.close(1011, "Socket error"); } catch (_) {} }
}
