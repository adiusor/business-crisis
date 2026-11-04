// Authoritative room transitions. Identical business rules to the standalone game.
// No player credential or private advice is ever included in a public/host view.
import "../src/content.js";
import "../src/rules.js";
const C=globalThis.BCContent, R=globalThis.BCRules;
export const MAX_PLAYERS=30; // Input ceiling; NOT a verified load capacity.
export const ROOM_TTL_MS=24*60*60*1000;
export const ROUND_MS=180000, GRACE_MS=60000;
export const GRACE_PENALTY=5, NO_ANSWER_PENALTY=12;
export const TEAM_NAME_POOL=Object.freeze([
 "THE NIGHT SHIFT","BOARDROOM BANDITS","CRISIS CONTROL","THE FIXERS",
 "PANIC DEPARTMENT","THE DAMAGE LIMITERS","PLAN B","DEADLINE DIVISION",
 "THE RESCUE CREW","RED FLAG UNIT","OPERATION TOMORROW","THE LAST RESORT",
 "THE AUDIT SQUAD","THE COMEBACK TEAM","THE FIREBREAK","THE CONTINGENCY"
]);
const bad=(status,message)=>Object.assign(new Error(message),{status});
const requireState=(condition,status,message)=>{if(!condition)throw bad(status,message);};
const clone=x=>JSON.parse(JSON.stringify(x));
const fold=x=>x.toLocaleLowerCase("en");
const validNow=x=>Number.isSafeInteger(x)&&x>=0;
// New short codes avoid ambiguous 0/O and 1/I. Keep legacy 12-character codes valid.
export const ROOM_CODE_ALPHABET="23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const SHORT_ROOM_CODE=/^[2-9A-HJ-NP-Z]{4}$/;
export const LEGACY_ROOM_CODE=/^[A-F0-9]{12}$/;
export function validRoomCode(code){
 return typeof code==="string"&&(SHORT_ROOM_CODE.test(code)||LEGACY_ROOM_CODE.test(code));
}
function randomNames(n,seed){
 requireState(Number.isSafeInteger(seed)&&seed>=0,400,"Invalid name seed");
 const names=TEAM_NAME_POOL.slice();let x=seed>>>0;
 for(let i=names.length-1;i>0;i--){
  x=(Math.imul(x,1664525)+1013904223)>>>0;
  const j=x%(i+1);[names[i],names[j]]=[names[j],names[i]];
 }
 return names.slice(0,n);
}
export function createRoom({code,hostHash,teamNames,teamCount=2,nameSeed=0,createdAtMs=Date.now()}){
 requireState(validRoomCode(code),400,"Invalid room code");
 requireState(typeof hostHash==="string"&&/^[a-f0-9]{64}$/.test(hostHash),400,"Invalid host credential");
 requireState(validNow(createdAtMs),400,"Invalid room creation time");
 if(teamNames===undefined){
  requireState(Number.isInteger(teamCount)&&teamCount>=2&&teamCount<=4,400,"Use 2–4 teams");
  teamNames=randomNames(teamCount,nameSeed);
 }
 requireState(Array.isArray(teamNames)&&teamNames.length>=2&&teamNames.length<=4,400,"Use 2–4 teams");
 const names=teamNames.map(x=>typeof x==="string"?x.trim():"");
 requireState(names.every(x=>x.length>=1&&x.length<=32)&&new Set(names.map(fold)).size===names.length,400,"Teams require unique names (1–32 characters)");
 return {version:3,code,hostHash,phase:"lobby",round:0,revision:0,createdAtMs,
  expiresAtMs:createdAtMs+ROOM_TTL_MS,startedAtMs:null,variant:R.seedVariant(code),lastRecap:null,projectorHash:null,
  teams:names.map((name,i)=>({name,captainId:null,advisers:[],locked:false,timedOut:false,
   roundPenalty:0,penaltyPoints:0,roundResults:[],economic:R.createTeam(i,name)})),
  players:[]};
}
export function authorize(room,hash){
 requireState(room&&room.version===3&&typeof hash==="string"&&/^[a-f0-9]{64}$/.test(hash),401,"Unauthorized");
 if(hash===room.hostHash)return {role:"host"};
 if(room.projectorHash&&hash===room.projectorHash)return {role:"projector"};
 const p=room.players.find(p=>p.credentialHash===hash);
 requireState(!!p,401,"Unauthorized");
 return {role:"player",playerId:p.id};
}
export function rotateProjector(room,newHash){
 requireState(typeof newHash==="string"&&/^[a-f0-9]{64}$/.test(newHash)&&newHash!==room.hostHash&&
  !room.players.some(p=>p.credentialHash===newHash),400,"Invalid projector credential");
 const next=clone(room);
 next.projectorHash=newHash;next.revision++;
 return next;
}
// Default to the least populated team. Explicit player selection remains authoritative.
export function balancedTeamIndex(room){
 requireState(room&&Array.isArray(room.teams)&&room.teams.length>=2,400,"Invalid room");
 const counts=room.teams.map((t,i)=>room.players.filter(p=>p.teamIndex===i).length);
 const smallest=Math.min(...counts);
 return counts.indexOf(smallest);
}
export function joinRoom(room,{nickname,teamIndex,credentialHash,playerId}){
 requireState(room.phase==="lobby",409,"Room already started; late joining is not enabled");
 requireState(room.players.length<MAX_PLAYERS,409,"Room join limit reached");
 if(teamIndex===undefined||teamIndex===null)teamIndex=balancedTeamIndex(room);
 requireState(Number.isInteger(teamIndex)&&teamIndex>=0&&teamIndex<room.teams.length,400,"Invalid team");
 const nick=typeof nickname==="string"?nickname.trim():"";
 requireState(nick.length>=1&&nick.length<=24,400,"Nickname must contain 1–24 characters");
 requireState(!room.players.some(p=>fold(p.nickname)===fold(nick)),409,"Nickname already taken");
 requireState(typeof credentialHash==="string"&&/^[a-f0-9]{64}$/.test(credentialHash)&&credentialHash!==room.hostHash&&
  !room.players.some(p=>p.credentialHash===credentialHash),400,"Invalid participant credential");
 requireState(typeof playerId==="string"&&/^[\w-]{8,64}$/.test(playerId)&&
  !room.players.some(p=>p.id===playerId),400,"Invalid participant ID");
 const next=clone(room);
 next.players.push({id:playerId,nickname:nick,teamIndex,credentialHash});
 if(!next.teams[teamIndex].captainId)next.teams[teamIndex].captainId=playerId;
 next.revision++;
 return next;
}
export function clockFor(room,nowMs=Date.now()){
 if(room.phase!=="advisers"||!validNow(room.startedAtMs))return null;
 const normalEndsAt=room.startedAtMs+ROUND_MS,closesAt=normalEndsAt+GRACE_MS;
 return {normalEndsAt,closesAt,serverNowMs:nowMs,
  stage:nowMs<normalEndsAt?"normal":nowMs<closesAt?"grace":"closed"};
}
export function expireRoom(room,nowMs=Date.now()){
 const clock=clockFor(room,nowMs);
 if(!clock||clock.stage!=="closed"||room.teams.every(t=>t.locked))return room;
 const next=clone(room);
 for(const t of next.teams){
  if(t.locked)continue;
  t.economic=R.applyTimeout(t.economic,next.round,next.variant);
  t.locked=true;t.timedOut=true;t.advisers=[];t.roundPenalty=NO_ANSWER_PENALTY;
  t.penaltyPoints+=NO_ANSWER_PENALTY;
 }
 next.revision++;
 return next;
}
export function finalVerdict(room){
 requireState(room.phase==="complete"&&room.teams.every(t=>t.economic.nextRound===6),409,"The final verdict is not ready");
 const ranked=room.teams.map((t,i)=>{
  const outcome=R.evaluate(t.economic),score=R.clamp(outcome.score-t.penaltyPoints,0,100);
  const eligible=outcome.status==="RENEWED"&&t.economic.cash>=0&&t.economic.risks.ops<=56;
  return {id:i,name:t.name,rawScore:outcome.score,timingPenalty:t.penaltyPoints,score,
   status:outcome.status,eligible,cash:t.economic.cash,trust:t.economic.trust,
   unpaid:outcome.unpaid,avgRisk:outcome.avgRisk,reasons:outcome.reasons.slice(),
   decisions:t.economic.history.map(h=>({round:h.round,episode:h.episode,plan:h.plan,signal:h.signal,
    spent:h.roundSpent,cash:h.cash,trust:h.trust,timedOut:!!h.timedOut,fallout:h.fallout}))};
 }).sort((a,b)=>b.score-a.score||b.cash-a.cash||a.id-b.id);
 const eligible=ranked.filter(x=>x.eligible),champion=eligible[0]||null;
 const joint=champion?eligible.filter(x=>x.score===champion.score):[];
 return {ranked,leader:ranked[0].name,champions:joint.map(x=>x.name),
  championScore:champion?champion.score:null,hasChampion:!!champion,
  scoringNote:"Final score = economic score minus 5 for late answers or 12 for missed answers per episode (minimum 0). A renewed contract, solvent fund and viable operations are still required to be champion."};
}
export function publicEpisode(room){
 if(room.phase!=="advisers")return null;
 const e=C.episodes[room.round];
 return {number:e.number,time:e.time,title:e.title,kicker:e.kicker,brief:e.brief,headline:e.headline,
  evidence:e.evidence.map(x=>({type:x.type,time:x.time,title:x.title,body:x.body,clue:x.clue})),
  plans:e.plans.map(p=>({name:p.name,verb:p.verb,desc:p.desc,benefits:p.benefits.slice(),cost:p.cost,
   spend:p.spend,tag:p.tag})),
  signals:e.signals.map(x=>({name:x.name,line:x.line})),
  allocations:[2,4].includes(room.round)?R.allocations.map(a=>({id:a.id,name:a.name})):[],
  responseFund:C.initialCash,annualContractValue:C.annualContractValue};
}
export function applyRoomAction(room,actor,command,nowMs=Date.now()){
 requireState(validNow(nowMs),400,"Invalid server clock");
 requireState(command&&typeof command==="object"&&!Array.isArray(command),400,"Invalid command");
 requireState(Number.isInteger(command.expectedRevision)&&command.expectedRevision===room.revision,409,"Room changed; refresh state and retry");
 const next=clone(room),isHost=actor&&actor.role==="host";
 const player=!isHost&&actor&&actor.role==="player"&&next.players.find(p=>p.id===actor.playerId);
 const type=command.type;
 if(type==="change_team"){
  requireState(!!player&&next.phase==="lobby",403,"Only a lobby participant can change teams");
  const destination=command.teamIndex;
  requireState(Number.isInteger(destination)&&destination>=0&&destination<next.teams.length,400,"Invalid destination team");
  requireState(destination!==player.teamIndex,409,"You are already in that team");
  const previous=player.teamIndex;
  player.teamIndex=destination;
  // Captain handover follows stable join order to avoid orphaned leadership.
  if(next.teams[previous].captainId===player.id)
   next.teams[previous].captainId=next.players.find(p=>p.teamIndex===previous)?.id||null;
  if(!next.teams[destination].captainId)
   next.teams[destination].captainId=player.id;
 }else if(type==="rename_team"){
  requireState(!!player&&next.phase==="lobby",403,"Only a lobby participant can rename their team");
  const t=next.teams[player.teamIndex];
  requireState(t.captainId===player.id,403,"Only the team captain can rename");
  requireState(typeof command.name==="string"&&TEAM_NAME_POOL.includes(command.name),400,"Choose a name from the list");
  requireState(!next.teams.some((x,i)=>i!==player.teamIndex&&fold(x.name)===fold(command.name)),409,"Team name already taken");
  t.name=command.name;t.economic.name=command.name;
 }else if(type==="start"){
  requireState(isHost,403,"Only the host can start");
  requireState(next.phase==="lobby",409,"Room already started");
  requireState(next.teams.every(t=>t.captainId),409,"Each team needs a participant");
  next.phase="advisers";next.startedAtMs=nowMs;
 }else if(type==="select_advisers"||type==="lock_advisers"||type==="submit_decision"){
  requireState(!!player,403,"Only a participant can submit a decision");
  requireState(next.phase==="advisers",409,"Adviser selection is closed");
  const clock=clockFor(next,nowMs);
  requireState(clock.stage!=="closed",409,"The four-minute window has ended");
  const t=next.teams[player.teamIndex];
  requireState(t.captainId===player.id,403,"Only your team's captain can confirm selections");
  requireState(!t.locked,409,"This team's decision is locked");
  if(type==="select_advisers"){
   const picks=command.advisers;
   requireState(Array.isArray(picks)&&picks.length===2&&picks.every(x=>Number.isInteger(x)&&x>=0&&x<C.advisers.length)
    &&new Set(picks).size===2,400,"Choose exactly two different advisers");
   t.advisers=picks.slice();
  }else{
   requireState(t.advisers.length===2,409,"Choose two advisers first");
   // The entire economic decision is committed on the server in one atomic action.
   const e=C.episodes[next.round],p=command.planIndex,s=command.signalIndex;
   requireState(Number.isInteger(p)&&p>=0&&p<e.plans.length,400,"Invalid strategic choice");
   requireState(Number.isInteger(s)&&s>=0&&s<e.signals.length,400,"Invalid public statement");
   const alloc=command.allocation===undefined?{amount:0,route:null}:command.allocation;
   requireState(alloc&&typeof alloc==="object"&&!Array.isArray(alloc)&&
    Number.isInteger(alloc.amount)&&[0,10000,20000].includes(alloc.amount),400,"Invalid allocation");
   requireState(alloc.amount===0?alloc.route===null:
    ([2,4].includes(next.round)&&R.allocations.some(a=>a.id===alloc.route)),400,"Invalid allocation route or episode");
   try{t.economic=R.applyTurn(t.economic,next.round,p,s,t.advisers,next.variant,alloc);}
   catch(e){throw bad(400,e.message);}
   t.locked=true;
   if(clock.stage==="grace"){t.roundPenalty=GRACE_PENALTY;t.penaltyPoints+=GRACE_PENALTY;}
  }
 }else if(type==="advance"){
  requireState(isHost,403,"Only the host can advance");
  requireState(next.phase==="advisers",409,"Room is not awaiting choices");
  requireState(next.teams.every(t=>t.locked),409,"Not every team has locked its decisions");
  next.lastRecap={round:next.round+1,teams:next.teams.map(t=>{
   const h=t.economic.history[next.round];
   return {name:t.name,plan:h.plan,signal:h.signal,spent:h.roundSpent,cash:t.economic.cash,
    trust:t.economic.trust,timedOut:t.timedOut,timingPenalty:t.roundPenalty};
  })};
  next.teams.forEach(t=>t.roundResults.push({round:next.round+1,answered:!t.timedOut,
   penalty:t.roundPenalty,timedOut:t.timedOut})); // Never expose private adviser indices.
  if(next.round===5){next.phase="complete";next.startedAtMs=null;}
  else{
   next.round++;next.startedAtMs=nowMs;
   next.teams.forEach(t=>{t.advisers=[];t.locked=false;t.timedOut=false;t.roundPenalty=0;});
  }
 }else throw bad(400,"Unknown command");
 next.revision++;
 return next;
}
export function viewLobby(room){
 return {code:room.code,phase:room.phase,revision:room.revision,teamNameOptions:TEAM_NAME_POOL.slice(),
  teams:room.teams.map((t,i)=>({name:t.name,joined:room.players.filter(p=>p.teamIndex===i).length}))};
}
export function viewFor(room,actor,nowMs=Date.now()){
 requireState(actor&&["host","player","projector"].includes(actor.role),401,"Unauthorized");
 if(actor.role==="projector"){
  const episode=publicEpisode(room);
  return {viewer:{role:"projector"},code:room.code,phase:room.phase,round:room.round,
   revision:room.revision,expiresAtMs:room.expiresAtMs,clock:clockFor(room,nowMs),
   episode:episode?{number:episode.number,time:episode.time,title:episode.title,
    kicker:episode.kicker,brief:episode.brief,headline:episode.headline,evidence:episode.evidence}:null,
   lastRecap:room.lastRecap,
   teams:room.teams.map((t,i)=>({name:t.name,joined:room.players.filter(p=>p.teamIndex===i).length,ready:!!t.captainId,locked:t.locked,
    timedOut:t.timedOut,penaltyPoints:t.penaltyPoints,roundPenalty:t.roundPenalty})),
   verdict:room.phase==="complete"?finalVerdict(room):null};
 }
 const player=actor.role==="player"?room.players.find(p=>p.id===actor.playerId):null;
 requireState(actor.role==="host"||!!player,401,"Unauthorized");
 const shared={code:room.code,phase:room.phase,round:room.round,revision:room.revision,
  expiresAtMs:room.expiresAtMs,clock:clockFor(room,nowMs),episode:publicEpisode(room),
  lastRecap:room.lastRecap,teamNameOptions:TEAM_NAME_POOL.slice(),
  players:room.players.map(p=>({nickname:p.nickname,teamIndex:p.teamIndex})),
  teams:room.teams.map((t,i)=>({name:t.name,joined:room.players.filter(p=>p.teamIndex===i).length,
   ready:!!t.captainId,locked:t.locked,timedOut:t.timedOut,penaltyPoints:t.penaltyPoints,roundPenalty:t.roundPenalty})),
  verdict:room.phase==="complete"?finalVerdict(room):null};
 if(!player)return {...shared,viewer:{role:"host"}};
 const t=room.teams[player.teamIndex],eco=t.economic,episode=C.episodes[room.round];
 return {...shared,viewer:{role:"player",teamIndex:player.teamIndex,captain:t.captainId===player.id,nickname:player.nickname},
  privateTeam:{advisers:t.advisers.slice(),
   intelligence:room.phase==="advisers"?t.advisers.map(i=>({name:C.advisers[i].name,role:C.advisers[i].role,brief:episode.advice[i]})):[],
   economic:{cash:eco.cash,trust:eco.trust,risks:clone(eco.risks),
    pendingLiability:eco.pending.reduce((sum,x)=>sum+x.cost,0),nextRound:eco.nextRound},
   roundResults:t.roundResults.map(x=>({...x}))}};
}
