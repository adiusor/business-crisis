// Authoritative room transitions. Identical business rules to the standalone game.
// No player credential or private advice is ever included in a public/host view.
import "../src/content.js";
import "../src/rules.js";
const C=globalThis.BCContent, R=globalThis.BCRules;
export const MAX_PLAYERS=30; // Input ceiling; NOT a verified load capacity.
export const ROOM_TTL_MS=24*60*60*1000;
export const ROUND_MS=180000, GRACE_MS=60000;
export const GRACE_PENALTY=5, NO_ANSWER_PENALTY=12;
export const EMERGENCY_REMOVAL_AFTER_MS=90000;
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
  expiresAtMs:createdAtMs+ROOM_TTL_MS,startedAtMs:null,variant:R.seedVariant(code),lastRecap:null,projectorHash:null,interventions:[],rosterEvents:[],
  teams:names.map((name,i)=>({name,captainId:null,advisers:[],locked:false,timedOut:false,
   roundPenalty:0,penaltyPoints:0,lockedAtMs:null,votes:{},participatedIds:[],runoff:null,roundResults:[],economic:R.createTeam(i,name)})),
  players:[]};
}
export function authorize(room,hash){
 requireState(room&&room.version===3&&typeof hash==="string"&&/^[a-f0-9]{64}$/.test(hash),401,"Unauthorized");
 if(hash===room.hostHash)return {role:"host"};
 if(room.projectorHash&&hash===room.projectorHash)return {role:"projector"};
 const p=room.players.find(p=>!p.departed&&p.credentialHash===hash);
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
 const counts=room.teams.map((t,i)=>room.players.filter(p=>!p.departed&&p.teamIndex===i).length);
 const smallest=Math.min(...counts);
 return counts.indexOf(smallest);
}
function rosterEvent(room,kind,nickname,team,atMs=Date.now()){
 room.rosterEvents=room.rosterEvents||[];
 room.rosterEvents.push({seq:room.revision+1,kind,nickname,team,atMs});
 room.rosterEvents=room.rosterEvents.slice(-18);
}
const liveMembers=(room,i)=>room.players.filter(p=>!p.departed&&p.teamIndex===i);
const currentVoters=(room,i)=>room.players.filter(p=>p.teamIndex===i &&
 (p.joinedRound??0)<=room.round&&(!p.departed||!!room.teams[i].votes?.[p.id]?.locked));
export function joinRoom(room,{nickname,teamIndex,credentialHash,playerId}){
 requireState(room.phase==="lobby"||room.phase==="advisers",409,"This room has finished");
 requireState(room.players.filter(p=>!p.departed).length<MAX_PLAYERS&&room.players.length<120,409,"Room join limit reached");
 if(teamIndex===undefined||teamIndex===null)teamIndex=balancedTeamIndex(room);
 requireState(Number.isInteger(teamIndex)&&teamIndex>=0&&teamIndex<room.teams.length,400,"Invalid team");
 const nick=typeof nickname==="string"?nickname.trim():"";
 requireState(nick.length>=1&&nick.length<=24,400,"Nickname must contain 1–24 characters");
 requireState(!room.players.some(p=>!p.departed&&fold(p.nickname)===fold(nick)),409,"Nickname already taken");
 requireState(typeof credentialHash==="string"&&/^[a-f0-9]{64}$/.test(credentialHash)&&credentialHash!==room.hostHash&&
  !room.players.some(p=>p.credentialHash===credentialHash),400,"Invalid participant credential");
 requireState(typeof playerId==="string"&&/^[\w-]{8,64}$/.test(playerId)&&
  !room.players.some(p=>p.id===playerId),400,"Invalid participant ID");
 const next=clone(room);
 next.players.push({id:playerId,nickname:nick,teamIndex,credentialHash,
  joinedRound:next.phase==="advisers"?next.round+1:0});
 if(!next.teams[teamIndex].captainId)next.teams[teamIndex].captainId=playerId;
 rosterEvent(next,"joined",nick,next.teams[teamIndex].name);
 next.revision++;
 return next;
}
export function clockFor(room,nowMs=Date.now()){
 if(room.phase!=="advisers"||!validNow(room.startedAtMs))return null;
 const normalEndsAt=room.startedAtMs+ROUND_MS,closesAt=normalEndsAt+GRACE_MS;
 return {normalEndsAt,closesAt,serverNowMs:nowMs,
  stage:nowMs<normalEndsAt?"normal":nowMs<closesAt?"grace":"closed"};
}
// A team's timer freezes at its successful server-side lock. Other teams keep running.
// Unlike the shared clock, this includes the server-stored freeze timestamp.
export function teamClockFor(room,teamIndex,nowMs=Date.now()){
 const clock=clockFor(room,nowMs);
 if(!clock)return null;
 const t=room.teams[teamIndex];
 requireState(!!t,400,"Invalid team");
 if(t.locked){
  const at=Number.isSafeInteger(t.lockedAtMs)?t.lockedAtMs:
   t.timedOut?clock.closesAt:room.startedAtMs;
  return {...clock,stage:t.timedOut?"closed":"locked",lockedAtMs:at,
   remainingMs:t.timedOut?0:Math.max(0,(at<clock.normalEndsAt?clock.normalEndsAt:clock.closesAt)-at)};
 }
 return {...clock,remainingMs:Math.max(0,(
  nowMs<clock.normalEndsAt?clock.normalEndsAt:clock.closesAt)-nowMs)};
}
const ballotKey=ballot=>JSON.stringify([ballot.planIndex,ballot.signalIndex,ballot.allocation.amount,ballot.allocation.route]);
function ballotFor(room,cmd){
 const e=C.episodes[room.round],p=cmd.planIndex,statement=cmd.signalIndex;
 requireState(Number.isInteger(p)&&p>=0&&p<e.plans.length,400,"Invalid strategic choice");
 requireState(Number.isInteger(statement)&&statement>=0&&statement<e.signals.length,400,"Invalid public statement");
 const alloc=cmd.allocation===undefined?{amount:0,route:null}:cmd.allocation;
 requireState(alloc&&typeof alloc==="object"&&!Array.isArray(alloc)&&
   Number.isInteger(alloc.amount)&&[0,10000,20000].includes(alloc.amount),400,"Invalid allocation");
 requireState(alloc.amount===0?alloc.route===null:
  ([2,4].includes(room.round)&&R.allocations.some(a=>a.id===alloc.route)),400,
  "Invalid allocation route or episode");
 return {planIndex:p,signalIndex:statement,allocation:{amount:alloc.amount,route:alloc.route}};
}
function decideTeam(room,teamIndex,ballot,atMs){
 const t=room.teams[teamIndex];
 requireState(!t.locked,409,"This team's decision is locked");
 try{t.economic=R.applyTurn(t.economic,room.round,ballot.planIndex,ballot.signalIndex,
  t.advisers,room.variant,ballot.allocation);}
 catch(e){throw bad(400,e.message);}
 t.locked=true;t.lockedAtMs=atMs;
 const clock=clockFor(room,atMs);
 if(clock.stage==="grace"){t.roundPenalty=GRACE_PENALTY;t.penaltyPoints+=GRACE_PENALTY;}
}
// The complete proposal is the ballot: strategy + statement + optional investment.
// All team members must lock. A tied leader triggers a private debate/runoff, never
// an arbitrary client decision. The countdown continues during all runoff votes.
function resolveVotes(room,teamIndex,nowMs){
 const t=room.teams[teamIndex],members=currentVoters(room,teamIndex);
 if(!members.length||!members.every(p=>t.votes?.[p.id]?.locked))return;
 const tally=new Map();
 for(const p of members){
  const vote=t.votes[p.id].ballot,key=ballotKey(vote);
  const x=tally.get(key);
  if(x)x.count++;
  else tally.set(key,{ballot:vote,count:1,first:room.players.findIndex(x=>x.id===p.id)});
 }
 const ordered=[...tally.values()].sort((a,b)=>b.count-a.count||a.first-b.first);
 const leaders=ordered.filter(x=>x.count===ordered[0].count);
 if(leaders.length===1){decideTeam(room,teamIndex,leaders[0].ballot,nowMs);return;}
 // A second tie cannot loop forever. Once everybody has had a focused private
 // debate and revoted, the captain's ballot is the agreed casting-vote rule.
 if(t.runoff){
  const casting=t.votes[t.captainId]?.ballot;
  requireState(!!casting,409,"Captain must participate in the final runoff");
  decideTeam(room,teamIndex,casting,nowMs);
  t.runoff=null;
  return;
 }
 // If 3+ proposals tie for first, select the two most similar packages
 // (strategy > public statement > investment), with stable proposer-order tie breaking.
 // This provides a focused, meaningful debate instead of arbitrary two nominees.
 const distance=(a,b)=>
   (a.planIndex===b.planIndex?0:8) +
   (a.signalIndex===b.signalIndex?0:4) +
   Math.abs(a.allocation.amount-b.allocation.amount)/10000 +
   (a.allocation.route===b.allocation.route?0:1);
 let pair=[leaders[0],leaders[1]],best=distance(pair[0].ballot,pair[1].ballot);
 for(let i=0;i<leaders.length;i++)for(let j=i+1;j<leaders.length;j++){
   const d=distance(leaders[i].ballot,leaders[j].ballot);
   if(d<best){best=d;pair=[leaders[i],leaders[j]];}
 }
 const choices=pair.map(x=>x.ballot);
 t.runoff={choices,ordinal:(t.runoff?.ordinal||0)+1};
 t.votes={};
}
export function privateVoteStatus(room,player){
 const t=room.teams[player.teamIndex],members=currentVoters(room,player.teamIndex);
 // Expose vote progress, not the leading proposal. Early tallies can bias
 // undecided teammates; full ballots are resolved only inside the room engine.
 const votes=t.votes||{};
 return {lockedVotes:members.filter(p=>votes[p.id]?.locked).length,
  totalMembers:members.length,
  canVote:!player.departed&&(player.joinedRound??0)<=room.round,
  myVote:votes[player.id]?.locked?clone(votes[player.id].ballot):null,
  runoff:t.runoff?clone(t.runoff):null};
}
export function expireRoom(room,nowMs=Date.now()){
 const clock=clockFor(room,nowMs);
 if(!clock||clock.stage!=="closed"||room.teams.every(t=>t.locked))return room;
 const next=clone(room);
 for(const t of next.teams){
  if(t.locked)continue;
  t.economic=R.applyTimeout(t.economic,next.round,next.variant);
  t.locked=true;t.timedOut=true;t.lockedAtMs=clock.closesAt;t.advisers=[];t.roundPenalty=NO_ANSWER_PENALTY;
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
 // Score ties break on remaining cash, matching the ranked ordering.
 // Only a true score-and-cash tie results in shared championship.
 const joint=champion?eligible.filter(x=>x.score===champion.score&&x.cash===champion.cash):[];
 return {ranked,leader:ranked[0].name,champions:joint.map(x=>x.name),
  championScore:champion?champion.score:null,hasChampion:!!champion,
  scoringNote:"Final score = max(0, economic score − time penalties). Late answers cost 5 and missed deadlines cost 12 points each. Score ties break on remaining cash; exact score-and-cash ties share the title. Contract renewal, solvent funds and viable operations remain championship requirements."};
}
// Mid-game recaps disclose commitments and spend, not competitors' remaining
// cash or trust. Full economic outcomes become public after the final verdict.
export function publicRecap(recap){
 if(!recap)return null;
 return {round:recap.round,teams:recap.teams.map(t=>({
  name:t.name,plan:t.plan,signal:t.signal,spent:t.spent,
  timedOut:!!t.timedOut,timingPenalty:t.timingPenalty
 }))};
}
export function publicEpisode(room){
 if(room.phase!=="advisers")return null;
 const e=C.episodes[room.round];
 return {number:e.number,time:e.time,title:e.title,kicker:e.kicker,brief:e.brief,headline:e.headline,question:e.question,pressure:e.pressure,
  evidence:e.evidence.map(x=>({type:x.type,time:x.time,title:x.title,body:x.body,clue:x.clue})),
  plans:e.plans.map(p=>({name:p.name,verb:p.verb,desc:p.desc,benefits:p.benefits.slice(),cost:p.cost,
   spend:p.spend,tag:p.tag})),
  signals:e.signals.map(x=>({name:x.name,line:x.line})),
  allocations:[2,4].includes(room.round)?R.allocations.map(a=>({id:a.id,name:a.name})):[],
  responseFund:C.initialCash,annualContractValue:C.annualContractValue};
}
function logIntervention(room,kind,teamName,nowMs){
 // Public and minimal: no participant IDs, personal reasons or ballot choices.
 if(!Array.isArray(room.interventions))room.interventions=[];
 room.interventions.push({kind,team:teamName,round:room.phase==='lobby'?0:room.round+1,atMs:nowMs});
 if(room.interventions.length>12)room.interventions=room.interventions.slice(-12);
}
export function applyRoomAction(room,actor,command,nowMs=Date.now()){
 requireState(validNow(nowMs),400,"Invalid server clock");
 requireState(command&&typeof command==="object"&&!Array.isArray(command),400,"Invalid command");
 // Other participants may lock valid ballots simultaneously. A modern vote
 // is scoped to an episode AND a runoff ordinal, not an unrelated global
 // revision. All legacy and non-vote commands keep strict revision matching.
 const scopedVote=command.type==="lock_vote"&&Object.prototype.hasOwnProperty.call(command,"expectedRound");
 if(scopedVote){
  requireState(Number.isSafeInteger(command.expectedRound)&&command.expectedRound===room.round,
   409,"Voting round changed; refresh the episode");
  requireState(Number.isSafeInteger(command.expectedRevision)&&command.expectedRevision>=0&&
   command.expectedRevision<=room.revision,409,"Room changed; refresh state and retry");
 }else{
  requireState(Number.isInteger(command.expectedRevision)&&command.expectedRevision===room.revision,
   409,"Room changed; refresh state and retry");
 }
 const next=clone(room),isHost=actor&&actor.role==="host";
 const player=!isHost&&actor&&actor.role==="player"&&next.players.find(p=>!p.departed&&p.id===actor.playerId);
 const type=command.type;
 if(type==="set_captain"){
  requireState(isHost,403,"Only the host can transfer captainship");
  requireState(next.phase==="lobby"||next.phase==="advisers",409,"Captainship changes are closed");
  const target=next.players.find(p=>!p.departed&&p.id===command.playerId);
  requireState(!!target,404,"Participant not found");
  const team=next.teams[target.teamIndex];
  requireState(team.captainId!==target.id,409,"Already the team captain");
  team.captainId=target.id;
  logIntervention(next,"captain",team.name,nowMs);
 }else if(type==="remove_player"){
  requireState(isHost,403,"Only the host can remove a participant");
  requireState(next.phase==="lobby"||next.phase==="advisers",409,"Participant removal is closed");
  const target=next.players.find(p=>!p.departed&&p.id===command.playerId);
  requireState(!!target,404,"Participant not found");
  const team=next.teams[target.teamIndex];
  if(next.phase==="advisers"){
   requireState(nowMs-next.startedAtMs>=EMERGENCY_REMOVAL_AFTER_MS,409,
    "Emergency removal opens 90 seconds after the episode starts");
   requireState(clockFor(next,nowMs).stage!=="closed",409,"Episode deadline passed");
   requireState(!team.locked,409,"The team has already finished");
   requireState(!(team.participatedIds||[]).includes(target.id) &&
    !team.votes?.[target.id]?.locked,409,
    "A participant who voted this episode cannot be removed");
   requireState(currentVoters(next,target.teamIndex).length>1,409,
    "Cannot remove the last member of a team during an episode");
  }
  next.players=next.players.filter(p=>p.id!==target.id);
   rosterEvent(next,"removed",target.nickname,team.name,nowMs);
  if(team.captainId===target.id)
   team.captainId=liveMembers(next,target.teamIndex)[0]?.id||null;
  // During play, removing a missing (unvoted) participant can reveal a
  // definitive winning vote among the remaining members. Resolve precisely
  // once using the unchanged server-authoritative economics and clock.
  if(next.phase==="advisers")resolveVotes(next,target.teamIndex,nowMs);
  logIntervention(next,"removed",team.name,nowMs);
 }else if(type==="leave_room"){
   requireState(!!player,403,"Only a joined player can leave");
   requireState(next.phase==="lobby"||next.phase==="advisers",409,"Game finished");
   const team=next.teams[player.teamIndex],name=team.name;
   player.departed=true;
   if(team.captainId===player.id)team.captainId=liveMembers(next,player.teamIndex)[0]?.id||null;
   if(next.phase==="advisers"&&!team.locked)resolveVotes(next,player.teamIndex,nowMs);
   rosterEvent(next,"left",player.nickname,name,nowMs);
  }else if(type==="change_team"){
  requireState(!!player&&next.phase==="lobby",403,"Only a lobby participant can change teams");
  const destination=command.teamIndex;
  requireState(Number.isInteger(destination)&&destination>=0&&destination<next.teams.length,400,"Invalid destination team");
  requireState(destination!==player.teamIndex,409,"You are already in that team");
  const previous=player.teamIndex;
  player.teamIndex=destination;
  // Captain handover follows stable join order to avoid orphaned leadership.
  if(next.teams[previous].captainId===player.id)
   next.teams[previous].captainId=liveMembers(next,previous)[0]?.id||null;
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
 }else if(type==="select_advisers"||type==="lock_advisers"||type==="submit_decision"||type==="lock_vote"){
  requireState(!!player,403,"Only a participant can submit a decision");
  requireState(next.phase==="advisers",409,"Adviser selection is closed");
   requireState((player.joinedRound??0)<=next.round,409,"Joined mid-episode; your first vote is in the next episode");
  const clock=clockFor(next,nowMs);
  requireState(clock.stage!=="closed",409,"The four-minute window has ended");
  const t=next.teams[player.teamIndex];
  requireState(!t.locked,409,"This team's decision is locked");
  if(type==="select_advisers"){
   requireState(t.captainId===player.id,403,"Only your team's captain can select advisers");
   requireState(!Object.values(t.votes||{}).some(v=>v.locked),409,
    "Advisers cannot change once team voting has started");
   const picks=command.advisers;
   requireState(Array.isArray(picks)&&picks.length===2&&picks.every(x=>Number.isInteger(x)&&x>=0&&x<C.advisers.length)
    &&new Set(picks).size===2,400,"Choose exactly two different advisers");
   t.advisers=picks.slice();
  }else{
   requireState(t.advisers.length===2,409,"Choose two advisers first");
   if(type==="lock_vote"){
    if(scopedVote)requireState(Number.isSafeInteger(command.expectedRunoffOrdinal)&&
     command.expectedRunoffOrdinal===(t.runoff?.ordinal||0),
     409,"Voting stage changed; refresh your team ballot");
    const vote=ballotFor(next,command);
    t.votes=t.votes||{};
    requireState(!t.votes[player.id]?.locked,409,"Your vote is already locked");
    if(t.runoff)requireState(t.runoff.choices.some(x=>ballotKey(x)===ballotKey(vote)),
      400,"Choose one of the two runoff proposals");
    t.votes[player.id]={ballot:vote,locked:true};
    if(!Array.isArray(t.participatedIds))t.participatedIds=[];
    if(!t.participatedIds.includes(player.id))t.participatedIds.push(player.id);
    resolveVotes(next,player.teamIndex,nowMs);
   }else{
    // Backwards compatibility for one-player rooms. Never allow the captain to
    // override other players' votes or commit on behalf of multiple members.
    requireState(t.captainId===player.id,403,"Only your team's captain can confirm selections");
    requireState(currentVoters(next,player.teamIndex).length===1,409,
      "Every team member must lock an individual vote");
    const vote=ballotFor(next,command);
    t.votes={[player.id]:{ballot:vote,locked:true}};
    t.participatedIds=[player.id];
    decideTeam(next,player.teamIndex,vote,nowMs);
   }

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
   next.teams.forEach(t=>{t.advisers=[];t.locked=false;t.lockedAtMs=null;t.timedOut=false;
    t.votes={};t.participatedIds=[];t.runoff=null;t.roundPenalty=0;});
  }
 }else throw bad(400,"Unknown command");
 next.revision++;
 return next;
}
// Consequences are delivered only to the team that made the choice. The boardroom
// and rival teams never receive private financial snapshots during play.
function lastTeamImpact(economic){
 const history=economic.history;
 if(!history.length)return null;
 const last=history[history.length-1],previous=history[history.length-2];
 return {round:last.round,plan:last.plan,fallout:last.fallout,
  roundSpent:last.roundSpent,trustChange:last.trust-(previous?previous.trust:45),
  pendingLiability:last.pendingLiability,paidDeferred:last.paidDeferred.slice(),
  timedOut:!!last.timedOut};
}
export function viewLobby(room){
 return {code:room.code,phase:room.phase,revision:room.revision,teamNameOptions:TEAM_NAME_POOL.slice(),
  teams:room.teams.map((t,i)=>({name:t.name,joined:liveMembers(room,i).length}))};
}
export function viewFor(room,actor,nowMs=Date.now()){
 requireState(actor&&["host","player","projector"].includes(actor.role),401,"Unauthorized");
 if(actor.role==="projector"){
  const episode=publicEpisode(room);
  return {viewer:{role:"projector"},code:room.code,phase:room.phase,round:room.round,
   revision:room.revision,expiresAtMs:room.expiresAtMs,clock:clockFor(room,nowMs),
   episode:episode?{number:episode.number,time:episode.time,title:episode.title,
    kicker:episode.kicker,brief:episode.brief,headline:episode.headline,question:episode.question,pressure:episode.pressure,evidence:episode.evidence}:null,
   lastRecap:publicRecap(room.lastRecap),interventions:(room.interventions||[]).map(x=>({...x})),rosterEvents:(room.rosterEvents||[]).map(x=>({...x})),
   teams:room.teams.map((t,i)=>({name:t.name,joined:liveMembers(room,i).length,ready:!!t.captainId,locked:t.locked,
    timedOut:t.timedOut,penaltyPoints:t.penaltyPoints,roundPenalty:t.roundPenalty,
    votesSubmitted:Object.values(t.votes||{}).filter(v=>v.locked).length,
    lockedAtMs:t.lockedAtMs||null})),
   verdict:room.phase==="complete"?finalVerdict(room):null};
 }
 const player=actor.role==="player"?room.players.find(p=>p.id===actor.playerId):null;
 requireState(actor.role==="host"||!!player&&!player.departed,401,"Unauthorized");
 const shared={code:room.code,phase:room.phase,round:room.round,revision:room.revision,
  expiresAtMs:room.expiresAtMs,clock:clockFor(room,nowMs),episode:publicEpisode(room),
  lastRecap:publicRecap(room.lastRecap),interventions:(room.interventions||[]).map(x=>({...x})),rosterEvents:(room.rosterEvents||[]).map(x=>({...x})),teamNameOptions:TEAM_NAME_POOL.slice(),
  players:room.players.filter(p=>!p.departed).map(p=>({nickname:p.nickname,teamIndex:p.teamIndex})),
  ...(actor.role==="host"?{hostRoster:room.players.filter(p=>!p.departed).map(p=>({
    id:p.id,nickname:p.nickname,teamIndex:p.teamIndex,
    captain:room.teams[p.teamIndex].captainId===p.id,
    hasVoted:(room.teams[p.teamIndex].participatedIds||[]).includes(p.id) ||
      !!room.teams[p.teamIndex].votes?.[p.id]?.locked
  }))}:{}),
  teams:room.teams.map((t,i)=>({name:t.name,joined:liveMembers(room,i).length,
   ready:!!t.captainId,locked:t.locked,timedOut:t.timedOut,penaltyPoints:t.penaltyPoints,
   roundPenalty:t.roundPenalty,votesSubmitted:Object.values(t.votes||{}).filter(v=>v.locked).length,
   lockedAtMs:t.lockedAtMs||null})),
  verdict:room.phase==="complete"?finalVerdict(room):null};
 if(!player)return {...shared,viewer:{role:"host"}};
 const t=room.teams[player.teamIndex],eco=t.economic,episode=C.episodes[room.round];
 return {...shared,viewer:{role:"player",teamIndex:player.teamIndex,captain:t.captainId===player.id,nickname:player.nickname},
  privateTeam:{advisers:t.advisers.slice(),teamClock:teamClockFor(room,player.teamIndex,nowMs),
   voting:privateVoteStatus(room,player),
   intelligence:room.phase==="advisers"?t.advisers.map(i=>({name:C.advisers[i].name,role:C.advisers[i].role,brief:episode.advice[i]})):[],
   economic:{cash:eco.cash,trust:eco.trust,risks:clone(eco.risks),
    pendingLiability:eco.pending.reduce((sum,x)=>sum+x.cost,0),nextRound:eco.nextRound},
   roundResults:t.roundResults.map(x=>({...x})),
    lastImpact:lastTeamImpact(eco)}};
}
