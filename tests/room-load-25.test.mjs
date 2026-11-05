// Twenty-five simultaneous virtual browser sessions against the real local
// Cloudflare Worker/Durable Object. This is a technical load rehearsal, NOT
// evidence from 25 physical phones or a real corporate event.
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {setTimeout as delay} from "node:timers/promises";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const port=18718;
const liveOrigin=process.env.CHALLENGE_STAGE_URL||"";
if(liveOrigin&&!/^https:\/\/the-0917-challenge-staging\.[a-zA-Z0-9-]+\.workers\.dev\/?$/.test(liveOrigin))
 throw Error("Refusing to load test any origin outside the isolated 09:17 staging Worker");
const base=liveOrigin?liveOrigin.replace(/\/$/,""):"http://127.0.0.1:"+port;
const creationKey=liveOrigin?process.env.STAGING_CREATION_KEY:"synthetic-load-only-private-staging-access";
if(!creationKey||creationKey.length<32)throw Error("Missing isolated staging credential");
const bin=path.join(root,"node_modules",".bin","wrangler");
const worker=liveOrigin?null:spawn(bin,["dev","--config","multiplayer/wrangler.0917.staging.jsonc",
 "--ip","127.0.0.1","--port",String(port),"--local",
 "--var","ROOM_CREATION_KEY:"+creationKey],{
 cwd:root,stdio:["ignore","pipe","pipe"],
 env:{...process.env,WRANGLER_SEND_METRICS:"false",CI:"true"}
});
let output="",sockets=[];
const log=x=>output=(output+String(x)).slice(-3500);
if(worker){worker.stdout.on("data",log);worker.stderr.on("data",log)}
async function req(route,method="GET",body,bearer){
 const response=await fetch(base+route,{
  method,
  headers:{...(body?{"content-type":"application/json"}:{}),
   ...(bearer?{"authorization":"Bearer "+bearer}:{})},
  body:body?JSON.stringify(body):undefined,
  signal:AbortSignal.timeout(20000)
 });
 const text=await response.text();
 let payload;
 try{payload=JSON.parse(text)}catch{payload=text}
 return {status:response.status,payload};
}
async function snapshot(token,code){
 const ws=new WebSocket(base.replace(/^http/,"ws")+"/api/rooms/"+code+"/socket");
 sockets.push(ws);
 return await new Promise((resolve,reject)=>{
  let settled=false;
  const finish=(error,result)=>{
   if(settled)return;
   settled=true;clearTimeout(timer);
   error?reject(error):resolve(result);
  };
  const timer=setTimeout(()=>finish(Error("WebSocket snapshot timeout")),10000);
  ws.addEventListener("open",()=>ws.send(JSON.stringify({type:"authenticate",token})));
  ws.addEventListener("message",event=>{
   try{const msg=JSON.parse(event.data);if(msg.type==="snapshot")finish(null,msg.state)}
   catch(e){finish(e)}
  });
  ws.addEventListener("error",()=>finish(Error("WebSocket connection failed")));
  ws.addEventListener("close",()=>finish(Error("WebSocket closed before snapshot")));
 });
}
async function cleanup(){
 for(const ws of sockets){try{ws.close()}catch{}}
 if(worker){
  worker.kill("SIGTERM");
  await Promise.race([new Promise(resolve=>worker.once("exit",resolve)),delay(3000)]);
  if(worker.exitCode===null)worker.kill("SIGKILL");
 }
}
try{
 let ok=false;
 for(let n=0;n<120;n++){
  if(worker&&worker.exitCode!==null)throw Error("Worker exited: "+output);
  try{const r=await req("/healthz");if(r.status===200&&r.payload.ok){ok=true;break}}
  catch{}
  await delay(250);
 }
 assert.ok(ok,"Worker failed to start: "+output);
 const route="/api/rooms";
 assert.equal((await req(route,"POST",{teamCount:4})).status,401,
  "Creating a room still requires the secret host key");
 const created=await req(route,"POST",{teamCount:4},creationKey);
 assert.equal(created.status,201,"Create a private four-team room");
 const {roomCode,hostToken}=created.payload;
 assert.match(roomCode,/^[2-9A-HJ-NP-Z]{4}$/);
 const players=[];
 // First four people choose different teams; the others request
 // automatic placement, so the final team sizes should differ by <= 1.
 for(let i=0;i<25;i++){
  const body={nickname:"Virtual "+String(i+1).padStart(2,"0")};
  if(i<4)body.teamIndex=i;
  const joined=await req(route+"/"+roomCode+"/join","POST",body);
  assert.equal(joined.status,201,"Player "+i+" must join: "+JSON.stringify(joined.payload));
  const state=joined.payload.state;
  players.push({token:joined.payload.playerToken,
   teamIndex:state.viewer.teamIndex,nickname:body.nickname});
 }
 const counts=Array.from({length:4},(_,i)=>players.filter(p=>p.teamIndex===i).length);
 assert.equal(players.length,25);
 assert.deepEqual(counts,[7,6,6,6],"Auto-assignment balances 25 players across 4 teams");
 const captains=Array.from({length:4},(_,i)=>players.find(p=>p.teamIndex===i));
 assert.equal((new Set(players.map(p=>p.token))).size,25);
 assert.equal((new Set(players.map(p=>p.nickname))).size,25);
 // Connect 25 independent authenticated WebSockets plus the host; each must
 // receive a role-scoped snapshot, never another team's private advisers.
 const connected=await Promise.all(players.map(p=>snapshot(p.token,roomCode)));
 assert.equal(connected.length,25);
 connected.forEach((state,i)=>{
  assert.equal(state.viewer.role,"player");
  assert.equal(state.viewer.teamIndex,players[i].teamIndex);
  assert.ok(state.privateTeam);
  assert.equal(state.phase,"lobby");
  assert.equal(Object.hasOwn(state,"credentialHash"),false);
 });
 const hostSocket=await snapshot(hostToken,roomCode);
 assert.equal(hostSocket.viewer.role,"host");
 assert.equal(Object.hasOwn(hostSocket,"privateTeam"),false);
 let host=(await req(route+"/"+roomCode+"/state","GET",undefined,hostToken)).payload.state;
 assert.deepEqual(host.teams.map(t=>t.joined),counts);
 const started=await req(route+"/"+roomCode+"/actions","POST",
  {type:"start",expectedRevision:host.revision},hostToken);
 assert.equal(started.status,200);
 const firstClock=started.payload.state.clock;
 assert.ok(firstClock.normalEndsAt-firstClock.serverNowMs>170000,
  "Three-minute decision clock must be server authoritative");
 for(let round=0;round<6;round++){
  host=(await req(route+"/"+roomCode+"/state","GET",undefined,hostToken)).payload.state;
  assert.equal(host.round,round);
  assert.equal(host.phase,"advisers");
  for(let team=0;team<4;team++){
   const vote=await req(route+"/"+roomCode+"/actions","POST",
    {type:"select_advisers",advisers:[round%6,(round+2)%6],
     expectedRevision:host.revision},captains[team].token);
   assert.equal(vote.status,200,"Captain "+team+" cannot choose advisers on round "+round);
   host=vote.payload.state;
  }
  const sameRevision=host.revision;
  const results=await Promise.all(players.map(p=>
   req(route+"/"+roomCode+"/actions","POST",{
    type:"lock_vote",
    planIndex:p.teamIndex%3,
    signalIndex:(p.teamIndex+round)%3,
    allocation:{amount:0,route:null},
    expectedRound:round,expectedRunoffOrdinal:0,expectedRevision:sameRevision
   },p.token)));
  assert.deepEqual(results.map(r=>r.status),Array(25).fill(200),
   "All 25 virtual participants must vote without stale-revision collisions on round "+round);
  host=(await req(route+"/"+roomCode+"/state","GET",undefined,hostToken)).payload.state;
  assert.equal(host.revision,sameRevision+25,
   "Each individual ballot must count exactly once");
  assert.ok(host.teams.every(t=>t.locked===true),
   "All four teams should lock one collective result each round");
  const firstPlayer=await req(route+"/"+roomCode+"/state","GET",undefined,players[0].token);
  assert.equal(firstPlayer.status,200);
  assert.equal(firstPlayer.payload.state.privateTeam.economic.nextRound,round+1,
   "One strategy charge per team, never 7 times for 7 members");
  assert.equal(Object.hasOwn(host,"privateTeam"),false);
  const next=await req(route+"/"+roomCode+"/actions","POST",
   {type:"advance",expectedRevision:host.revision},hostToken);
  assert.equal(next.status,200,"Host must advance after the 25 votes");
  host=next.payload.state;
 }
 assert.equal(host.phase,"complete");
 assert.equal(host.verdict.ranked.length,4);
 assert.ok(host.verdict.ranked.every(t=>t.decisions.length===6));
 assert.ok(host.verdict.ranked.every(t=>
  t.score===Math.max(0,t.rawScore-t.timingPenalty)));
 assert.ok(host.verdict.ranked.every(t=>
  t.scoreBreakdown?.economicScore===t.rawScore));
 for(const p of players){
  const state=(await req(route+"/"+roomCode+"/state","GET",undefined,p.token));
  assert.equal(state.status,200,"Individual final result must remain accessible");
  assert.equal(state.payload.state.phase,"complete");
 }
 assert.equal((await req(route+"/"+roomCode+"/state","GET")).status,401);
 console.log("PASS: "+(liveOrigin?"LIVE ISOLATED WORKERS.DEV":"LOCAL CLOUDFLARE WORKER")+" — 25 virtual authenticated WebSockets, 25 active players, 4 balanced teams, 150 individual votes, six full chapters, protected room and reconciled results.");
}finally{await cleanup()}
