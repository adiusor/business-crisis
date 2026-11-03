/* BUSINESS CRISIS multiplayer foundation.
 * Cloudflare Worker + one Durable Object per room.
 * Rules run on the server. Never return unselected adviser intelligence.
 */
import "../../src/content.js";
import "../../src/rules.js";

const C = globalThis.BCContent;
const R = globalThis.BCRules;
const MAX_BODY = 8192;
const MAX_PLAYERS = 40;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const API_HEADERS = {"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"};

function respond(data, status=200) {
  return new Response(JSON.stringify(data), {status, headers:API_HEADERS});
}
function fail(message, status=400) {
  const error = new Error(message); error.status = status; throw error;
}
function cleanName(value, max=32) {
  if(typeof value!=="string" || value.trim().length<1 || value.trim().length>max || /[\u0000-\u001f\u007f]/.test(value)) fail("Invalid name");
  return value.trim();
}
async function bodyOf(req) {
  if(Number(req.headers.get("content-length")||0)>MAX_BODY) fail("Request too large",413);
  const raw=await req.text();
  if(raw.length>MAX_BODY) fail("Request too large",413);
  let data;
  try { data=JSON.parse(raw); } catch { fail("Invalid JSON"); }
  if(!data || typeof data!=="object" || Array.isArray(data)) fail("Expected JSON object");
  return data;
}
function randomHex(bytes=32) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)),x=>x.toString(16).padStart(2,"0")).join("");
}
function roomCode() {
  const b=crypto.getRandomValues(new Uint8Array(8));
  return Array.from(b,x=>ALPHABET[x%ALPHABET.length]).join("");
}
async function hash(token) {
  const bytes=new TextEncoder().encode(token);
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),x=>x.toString(16).padStart(2,"0")).join("");
}
function authToken(req) {
  const match=/^Bearer ([a-f0-9]{64})$/i.exec(req.headers.get("authorization")||"");
  return match?match[1]:"";
}
function publicEpisode(round) {
  const e=C.episodes[Math.min(round,5)];
  return {id:e.id,number:e.number,time:e.time,title:e.title,kicker:e.kicker,brief:e.brief,headline:e.headline,evidence:e.evidence,plans:e.plans.map(p=>({name:p.name,verb:p.verb,desc:p.desc,benefits:p.benefits,cost:p.cost,spend:p.spend,tag:p.tag})),signals:e.signals.map(s=>({name:s.name,line:s.line}))};
}
function publicRoom(room) {
  const revealed=room.phase==="reveal"||room.phase==="finished";
  const final=room.phase==="finished"?R.championshipResult(room.teams.map(t=>t.state)):null;
  return {
    code:room.code,phase:room.phase,round:room.round,episode:publicEpisode(room.round),
    teams:room.teams.map(t=>({
      id:t.id,name:t.name,players:t.members.length,
      advisersReady:t.advisersLocked,voteReady:!!t.vote,
      result:revealed?{cash:t.state.cash,trust:t.state.trust,score:R.evaluate(t.state).score,contract:R.evaluate(t.state).status,latest:t.state.history.at(-1)?.fallout||null}:null
    })),
    finale:final?{champion:final.champion?.team.name||null,leader:final.leader?.team.name||null,ranked:final.ranked.map(x=>({name:x.team.name,score:x.outcome.score,status:x.outcome.status,cash:x.team.cash}))}:null
  };
}
function hostView(room) {
  return {...publicRoom(room),teams:room.teams.map(t=>({
    id:t.id,name:t.name,invite:t.invite,players:t.members.map(m=>m.nickname),
    advisersReady:t.advisersLocked,voteReady:!!t.vote,
    cash:t.state.cash,trust:t.state.trust,history:t.state.history,
    result:(room.phase==="reveal"||room.phase==="finished")?R.evaluate(t.state):null
  }))};
}
function playerView(room, player) {
  const t=room.teams[player.teamId];
  return {...publicRoom(room),team:{
    id:t.id,name:t.name,members:t.members.map(m=>m.nickname),
    cash:t.state.cash,trust:t.state.trust,risks:t.state.risks,history:t.state.history,
    selected:t.picks||[],advisersLocked:t.advisersLocked,voteReady:!!t.vote
  },player:{nickname:player.nickname,teamId:player.teamId}};
}
async function identity(req,room) {
  const token=authToken(req);
  if(!token) fail("Authentication required",401);
  const digest=await hash(token);
  if(digest===room.hostHash) return {role:"host"};
  const player=room.players.find(p=>p.tokenHash===digest);
  if(!player) fail("Invalid room credential",403);
  return {role:"player",player};
}
function requireHost(id) { if(id.role!=="host") fail("Host credential required",403); }
function requirePlayer(id) { if(id.role!=="player") fail("Player credential required",403); }
function requirePhase(room,phase) { if(room.phase!==phase) fail("This action is not available in the current phase",409); }

export class CrisisRoom {
  constructor(ctx,env) {
    this.ctx=ctx;
    this.env=env;
    // Serialise read-modify-write requests, including across asynchronous storage operations.
    this.queue=Promise.resolve();
  }
  fetch(req) {
    const next=this.queue.then(()=>this.handle(req));
    this.queue=next.then(()=>{},()=>{});
    return next.catch(err=>respond({error:err.message||"Request failed"},err.status||400));
  }
  async handle(req) {
    const url=new URL(req.url);
    const action=url.pathname.split("/").at(-1);
    let room=await this.ctx.storage.get("room");
    if(url.pathname==="/internal/init" && req.method==="POST") {
      if(room) fail("Room already exists",409);
      const data=await bodyOf(req);
      room={
        code:data.code,hostHash:data.hostHash,seed:data.code,variant:R.seedVariant(data.code),
        createdAt:Date.now(),phase:"lobby",round:0,players:[],
        teams:data.names.map((name,id)=>({id,name,invite:randomHex(8),members:[],state:R.createTeam(id,name),picks:null,advisersLocked:false,vote:null}))
      };
      await this.ctx.storage.put("room",room);
      return respond({code:room.code},201);
    }
    if(!room) fail("Room not found",404);
    if(action==="projector" && req.method==="GET") return respond(publicRoom(room));
    if(action==="join" && req.method==="POST") {
      if(room.phase==="finished") fail("Session has finished",409);
      if(room.players.length>=MAX_PLAYERS) fail("Room player limit reached",409);
      const data=await bodyOf(req);
      const teamId=data.teamId;
      if(!Number.isInteger(teamId)||teamId<0||teamId>=room.teams.length) fail("Invalid team");
      if(typeof data.invite!=="string"||room.teams[teamId].invite!==data.invite.toLowerCase()) fail("Valid team invitation required",403);
      const nickname=cleanName(data.nickname,24);
      if(room.players.some(p=>p.nickname.toLowerCase()===nickname.toLowerCase())) fail("Nickname already in use",409);
      const token=randomHex();
      const player={id:randomHex(8),teamId,nickname,tokenHash:await hash(token)};
      room.players.push(player);
      room.teams[teamId].members.push({id:player.id,nickname});
      await this.ctx.storage.put("room",room);
      return respond({token,code:room.code,teamId,nickname},201);
    }
    const id=await identity(req,room);
    if(action==="state" && req.method==="GET") return respond(id.role==="host"?hostView(room):playerView(room,id.player));
    if(action==="advice" && req.method==="GET") {
      requirePlayer(id);
      const team=room.teams[id.player.teamId];
      if(!team.advisersLocked||!Array.isArray(team.picks)||room.phase==="lobby"||room.phase==="finished") fail("Advice remains sealed",403);
      return respond({episode:room.round,advice:team.picks.map(i=>({adviser:i,name:C.advisers[i].name,role:C.advisers[i].role,text:C.episodes[room.round].advice[i]}))});
    }
    requirePost(req);
    const data=await bodyOf(req);
    if(action==="start") {
      requireHost(id);requirePhase(room,"lobby");
      if(room.teams.some(t=>t.members.length===0)) fail("Each team needs at least one player",409);
      room.phase="intel";
    } else if(action==="advisers") {
      requirePlayer(id);requirePhase(room,"intel");
      const t=room.teams[id.player.teamId];
      if(t.advisersLocked) fail("Advisers already confirmed",409);
      const picks=data.picks;
      if(!Array.isArray(picks)||picks.length!==2||new Set(picks).size!==2||!picks.every(n=>Number.isInteger(n)&&n>=0&&n<C.advisers.length)) fail("Choose exactly two different advisers");
      t.picks=picks.slice();
    } else if(action==="confirm") {
      requirePlayer(id);requirePhase(room,"intel");
      const t=room.teams[id.player.teamId];
      if(t.advisersLocked) fail("Advisers already confirmed",409);
      if(!t.picks||t.picks.length!==2) fail("Select two advisers first",409);
      t.advisersLocked=true;
    } else if(action==="open-decisions") {
      requireHost(id);requirePhase(room,"intel");
      if(room.teams.some(t=>!t.advisersLocked)) fail("All teams must confirm advisers",409);
      room.phase="decision";
    } else if(action==="vote") {
      requirePlayer(id);requirePhase(room,"decision");
      const t=room.teams[id.player.teamId];
      if(t.vote) fail("Team decision already locked",409);
      if(!t.advisersLocked) fail("Advisers not confirmed",409);
      const plan=data.plan,signal=data.signal,allocation=data.allocation||{amount:0,route:null};
      // Validate with the exact deterministic engine used to settle the round.
      R.applyTurn(t.state,room.round,plan,signal,t.picks,room.variant,allocation);
      t.vote={plan,signal,allocation:{amount:allocation.amount,route:allocation.route||null}};
    } else if(action==="resolve") {
      requireHost(id);requirePhase(room,"decision");
      if(room.teams.some(t=>!t.vote)) fail("All teams must lock a decision",409);
      // Compute all transitions before changing the persisted room.
      const next=room.teams.map(t=>R.applyTurn(t.state,room.round,t.vote.plan,t.vote.signal,t.picks,room.variant,t.vote.allocation));
      room.teams.forEach((t,i)=>{t.state=next[i];});
      room.phase="reveal";
    } else if(action==="advance") {
      requireHost(id);requirePhase(room,"reveal");
      if(room.round===C.episodes.length-1) {
        room.phase="finished";
      } else {
        room.round++;
        room.phase="intel";
        room.teams.forEach(t=>{t.picks=null;t.advisersLocked=false;t.vote=null;});
      }
    } else {
      fail("Unknown action",404);
    }
    await this.ctx.storage.put("room",room);
    return respond(id.role==="host"?hostView(room):playerView(room,id.player));
  }
}
function requirePost(req) { if(req.method!=="POST") fail("Method not allowed",405); }

export default {
  async fetch(req,env) {
    try {
      const url=new URL(req.url);
      if(url.pathname==="/api/content" && req.method==="GET") {
        return respond({title:"THE 09:17 INCIDENT",advisers:C.advisers.map(a=>({name:a.name,role:a.role})),episodes:C.episodes.map((_,i)=>publicEpisode(i)),allocations:R.allocations.map(a=>({id:a.id,name:a.name}))});
      }
      if(url.pathname==="/api/rooms" && req.method==="POST") {
        const data=await bodyOf(req);
        if(!Array.isArray(data.names)||data.names.length<2||data.names.length>4) fail("Create two to four teams");
        const names=data.names.map(n=>cleanName(n));
        if(new Set(names.map(n=>n.toLowerCase())).size!==names.length) fail("Team names must be different");
        for(let i=0;i<3;i++) {
          const code=roomCode(),token=randomHex();
          const stub=env.ROOMS.get(env.ROOMS.idFromName(code));
          const init=await stub.fetch(new Request("https://room.internal/internal/init",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({code,names,hostHash:await hash(token)})}));
          if(init.status===409) continue;
          if(!init.ok) return init;
          return respond({code,hostToken:token,joinUrl:url.origin+"/?room="+code+"&mode=join",hostUrl:url.origin+"/?room="+code+"&mode=host",projectorUrl:url.origin+"/?room="+code+"&mode=projector"},201);
        }
        fail("Could not allocate a room",503);
      }
      const match=/^\/api\/rooms\/([A-Z2-9]{8})\/(projector|join|state|advice|start|advisers|confirm|open-decisions|vote|resolve|advance)$/i.exec(url.pathname);
      if(match) return env.ROOMS.get(env.ROOMS.idFromName(match[1].toUpperCase())).fetch(req);
      if(url.pathname.startsWith("/api/")) fail("API endpoint not found",404);
      if(env.ASSETS) return env.ASSETS.fetch(req);
      return respond({error:"Static assets not configured"},404);
    } catch(err) {
      return respond({error:err.message||"Unexpected error"},err.status||400);
    }
  }
};
