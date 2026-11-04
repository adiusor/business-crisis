// Isolated Cloudflare Durable Object prototype; no production routes or deployments.
import { DurableObject } from "cloudflare:workers";
import { createRoom, authorize, joinRoom, applyRoomAction, viewFor } from "./room-core.mjs";

const HEADERS = {"content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff"};
const json = (value, status = 200) => new Response(JSON.stringify(value), {status, headers: HEADERS});
const problem = e => json({error: e && Number.isInteger(e.status) ? e.message : "Internal room error"}, e && Number.isInteger(e.status) ? e.status : 500);
const token = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), x => x.toString(16).padStart(2, "0")).join("");
const sha256 = async value => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), x => x.toString(16).padStart(2, "0")).join("");
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
      if (url.pathname === "/healthz" && request.method === "GET")
        return json({ok: true, service: "room-prototype", deployedGame: false});
      // Reject browser cross-origin writes. This service is intentionally same-origin only.
      if (request.method === "POST") {
        const origin = request.headers.get("origin");
        if (origin && origin !== url.origin) fail(403, "Cross-origin writes are not allowed");
      }
      if (url.pathname === "/api/rooms" && request.method === "POST") {
        // A separate founder-managed secret is required before *any* new room is created.
        // Never add this secret to the standalone game or a repository file.
        if (!env.ROOM_CREATION_KEY) fail(503, "Room creation is disabled");
        if (request.headers.get("authorization") !== "Bearer " + env.ROOM_CREATION_KEY) fail(401, "Unauthorized");
        if (!env.CRISIS_ROOMS) fail(503, "Room storage is unavailable");
        const input = await parse(request);
        for (let tries = 0; tries < 3; tries++) {
          const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
          const hostToken = token();
          const stub = env.CRISIS_ROOMS.get(env.CRISIS_ROOMS.idFromName(code));
          const res = await stub.fetch(new Request("https://room.internal/create", {method: "POST",
            headers: {"content-type": "application/json"},
            body: JSON.stringify({code, hostHash: await sha256(hostToken), teamNames: input.teamNames})}));
          if (res.status === 409) continue;
          if (!res.ok) return res;
          return json({roomCode: code, hostToken}, 201);
        }
        fail(503, "Unable to allocate a new room");
      }
      const route = /^\/api\/rooms\/([A-F0-9]{12})\/(join|state|actions|socket)$/.exec(url.pathname);
      if (!route) fail(404, "Not found");
      const method = {join: "POST", state: "GET", actions: "POST", socket: "GET"}[route[2]];
      if (request.method !== method) fail(405, "Method not allowed");
      if (!env.CRISIS_ROOMS) fail(503, "Room storage is unavailable");
      const stub = env.CRISIS_ROOMS.get(env.CRISIS_ROOMS.idFromName(route[1]));
      return stub.fetch(new Request("https://room.internal/" + route[2], request));
    } catch (e) { return problem(e); }
  }
};

export class CrisisRoom extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.ctx = ctx; }
  async room() {
    const room = await this.ctx.storage.get("room");
    if (!room) fail(404, "Room not found");
    return room;
  }
  async actor(room, request) { return authorize(room, await sha256(bearer(request))); }
  async notify(room) {
    for (const ws of this.ctx.getWebSockets()) {
      const attachment = ws.deserializeAttachment();
      if (!attachment || attachment.role === "pending") continue;
      try { ws.send(JSON.stringify({type: "snapshot", state: viewFor(room, attachment)})); }
      catch (_) { /* Disconnected socket; does not interrupt room storage. */ }
    }
  }
  async fetch(request) {
    try {
      const path = new URL(request.url).pathname;
      if (path === "/create" && request.method === "POST") {
        if (await this.ctx.storage.get("room")) fail(409, "Room already exists");
        const room = createRoom(await parse(request));
        await this.ctx.storage.put("room", room);
        return json({created: true}, 201);
      }
      const room = await this.room();
      if (path === "/join" && request.method === "POST") {
        const input = await parse(request);
        const playerToken = token();
        const id = crypto.randomUUID();
        const next = joinRoom(room, {...input, playerId: id, credentialHash: await sha256(playerToken)});
        await this.ctx.storage.put("room", next);
        await this.notify(next);
        return json({playerToken, state: viewFor(next, {role: "player", playerId: id})}, 201);
      }
      if (path === "/state" && request.method === "GET") {
        return json({state: viewFor(room, await this.actor(room, request))});
      }
      if (path === "/actions" && request.method === "POST") {
        const actor = await this.actor(room, request);
        const command = await parse(request);
        const next = applyRoomAction(room, actor, command);
        await this.ctx.storage.put("room", next);
        await this.notify(next);
        return json({state: viewFor(next, actor)});
      }
      if (path === "/socket" && request.headers.get("upgrade")?.toLowerCase() === "websocket") {
        if (this.ctx.getWebSockets().length >= 64) fail(429, "Too many connections");
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);
        this.ctx.acceptWebSocket(server);
        // No information is sent until the first message authenticates.
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
      const room = await this.room();
      if (attachment.role === "pending") {
        if (input.type !== "authenticate" || typeof input.token !== "string" || !/^[0-9a-f]{64}$/.test(input.token)) fail(401, "Unauthorized");
        const actor = authorize(room, await sha256(input.token));
        ws.serializeAttachment(actor);
        ws.send(JSON.stringify({type: "snapshot", state: viewFor(room, actor)}));
        return;
      }
      if (input.type === "snapshot") {
        ws.send(JSON.stringify({type: "snapshot", state: viewFor(room, attachment)}));
      } else if (input.type === "action") {
        const next = applyRoomAction(room, attachment, input.command);
        await this.ctx.storage.put("room", next);
        await this.notify(next);
      } else fail(400, "Unknown message");
    } catch (e) {
      if (attachment.role === "pending") {
        ws.close(1008, "Unauthorized");
      } else {
        try { ws.send(JSON.stringify({type: "error", error: e && Number.isInteger(e.status) ? e.message : "Room error"})); }
        catch (_) { /* Client disconnected. */ }
      }
    }
  }
  webSocketClose(ws, code, reason) { try { ws.close(code, reason); } catch (_) {} }
  webSocketError(ws) { try { ws.close(1011, "Socket error"); } catch (_) {} }
}
