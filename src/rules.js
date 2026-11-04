(function(g){
"use strict";
const DATA=g.BCContent;
const RISK_KEYS=["legal","ops","workforce","customer","liquidity"];
const ALLOCATIONS=[
{id:"audit",name:"AUDIT & CONTROLS",delta:{legal:-7,customer:-3},trust:2},
{id:"capacity",name:"DELIVERY CAPACITY",delta:{ops:-8,workforce:-2},trust:1},
{id:"people",name:"STAFF RECOVERY",delta:{workforce:-9,ops:-2},trust:1}
];
const ESCALATION=[
{},
{workforce:7,customer:2},
{customer:10,ops:2},
{legal:7,workforce:4,customer:3},
{ops:12,workforce:3},
{liquidity:5,customer:4}
];
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function deepCopy(obj){return JSON.parse(JSON.stringify(obj));}
function assert(ok,msg){if(!ok)throw new Error(msg);}
function seedVariant(seed){let x=0;String(seed).split("").forEach(c=>{x=(x*31+c.charCodeAt(0))>>>0;});return x%DATA.variants.length;}
function createTeam(id,name){
assert(typeof name==="string"&&name.trim().length>=1&&name.trim().length<=32,"Team name must be 1–32 characters");
return {id:id,name:name.trim(),cash:DATA.initialCash,trust:45,risks:deepCopy(DATA.baseline),nextRound:0,ledger:[],pending:[],history:[],insolvent:false};
}
function addRisk(team,deltas){if(!deltas)return;for(const k of RISK_KEYS){if(Object.prototype.hasOwnProperty.call(deltas,k))team.risks[k]=clamp(team.risks[k]+deltas[k],10,95);}}
function expense(team,round,amount,label,kind){
assert(Number.isInteger(amount)&&amount>=0,"Expense must be a nonnegative integer");
if(amount===0)return;
team.cash-=amount;
team.ledger.push({round:round+1,amount:amount,label:label,kind:kind});
}
function recalcLiquidity(team){
const pending=team.pending.reduce((sum,p)=>sum+p.cost,0);
const coverage=team.cash-pending;
team.risks.liquidity=clamp(Math.round(22+Math.max(0,DATA.initialCash-coverage)/DATA.initialCash*65+(team.cash<0?10:0)),18,95);
team.insolvent=team.cash<0;
}
function startEpisode(team,round,variant){
const episode=DATA.episodes[round],due=[];
if(round===0)addRisk(team,DATA.variants[variant].effect);
addRisk(team,ESCALATION[round]);
const remain=[];
for(const item of team.pending){
if(item.due<=round+1){expense(team,round,item.cost,item.label,"deferred");addRisk(team,item.delta);due.push(item);}
else remain.push(item);
}
team.pending=remain;
expense(team,round,episode.base,"Mandatory operating response / "+episode.title,"baseline");
return due;
}
function applyTurn(input,round,planIndex,signalIndex,advisers,variant,allocation){
assert(input&&typeof input==="object","Missing team state");
assert(Number.isInteger(round)&&round>=0&&round<DATA.episodes.length,"Invalid episode");
assert(input.nextRound===round,"Episode already committed or out of order");
const episode=DATA.episodes[round];
assert(Number.isInteger(planIndex)&&planIndex>=0&&planIndex<episode.plans.length,"Invalid strategic choice");
assert(Number.isInteger(signalIndex)&&signalIndex>=0&&signalIndex<episode.signals.length,"Invalid public statement");
assert(Array.isArray(advisers)&&advisers.length===2&&new Set(advisers).size===2&&advisers.every(n=>Number.isInteger(n)&&n>=0&&n<DATA.advisers.length),"Exactly two different advisers required");
assert(Number.isInteger(variant)&&variant>=0&&variant<DATA.variants.length,"Invalid common scenario variant");
const alloc=allocation||{amount:0,route:null};
assert(alloc&&Number.isInteger(alloc.amount)&&[0,10000,20000].includes(alloc.amount),"Allocation must be £0, £10k or £20k");
assert(alloc.amount===0||([2,4].includes(round)&&ALLOCATIONS.some(x=>x.id===alloc.route)),"Invalid allocation route or episode");
const team=deepCopy(input),plan=episode.plans[planIndex],signal=episode.signals[signalIndex];
const due=startEpisode(team,round,variant);
expense(team,round,plan.spend,plan.name,"strategy");
if(alloc.amount>0){
const route=ALLOCATIONS.find(x=>x.id===alloc.route),factor=alloc.amount/10000;
expense(team,round,alloc.amount,"Discretionary response / "+route.name,"allocation");
const delta={};for(const k of Object.keys(route.delta))delta[k]=route.delta[k]*factor;
addRisk(team,delta);
team.trust=clamp(team.trust+route.trust*factor,0,100);
}
addRisk(team,plan.delta);addRisk(team,signal.delta);
team.trust=clamp(team.trust+plan.trust+signal.trust,0,100);
if(plan.delay)team.pending.push({id:"plan-"+(round+1),due:plan.delay.due,cost:plan.delay.cost,label:plan.delay.label,delta:deepCopy(plan.delay.delta||{})});
if(signal.delay)team.pending.push({id:"signal-"+(round+1),due:signal.delay.due,cost:signal.delay.cost,label:signal.delay.label,delta:deepCopy(signal.delay.delta||{})});
recalcLiquidity(team);
const roundSpent=team.ledger.filter(x=>x.round===round+1).reduce((sum,x)=>sum+x.amount,0);
team.history.push({round:round+1,episode:episode.title,time:episode.time,plan:plan.name,planIndex:planIndex,signal:signal.name,signalIndex:signalIndex,advisers:advisers.slice(),allocation:alloc.amount?{amount:alloc.amount,route:alloc.route}:null,fallout:plan.fallout,roundSpent:roundSpent,paidDeferred:due.map(x=>x.label),cash:team.cash,trust:team.trust,risks:deepCopy(team.risks),pendingLiability:team.pending.reduce((sum,x)=>sum+x.cost,0)});
team.nextRound++;
return team;
}
// A missed deadline is NOT converted into a fictional strategic decision.
function applyTimeout(input,round,variant){
assert(input&&typeof input==="object","Missing team state");
assert(Number.isInteger(round)&&round>=0&&round<DATA.episodes.length,"Invalid episode");
assert(input.nextRound===round,"Episode already committed or out of order");
assert(Number.isInteger(variant)&&variant>=0&&variant<DATA.variants.length,"Invalid common scenario variant");
const team=deepCopy(input),episode=DATA.episodes[round],due=startEpisode(team,round,variant);
addRisk(team,{legal:4,ops:8,workforce:5,customer:10});
team.trust=clamp(team.trust-10,0,100);
recalcLiquidity(team);
const roundSpent=team.ledger.filter(x=>x.round===round+1).reduce((sum,x)=>sum+x.amount,0);
team.history.push({round:round+1,episode:episode.title,time:episode.time,
plan:"NO RESPONSE",planIndex:null,signal:"NO PUBLIC STATEMENT",signalIndex:null,
advisers:[],allocation:null,timedOut:true,
fallout:"No strategic response was authorised before the deadline. Mandatory costs continued and unresolved exposures deteriorated.",
roundSpent:roundSpent,paidDeferred:due.map(x=>x.label),cash:team.cash,trust:team.trust,
risks:deepCopy(team.risks),pendingLiability:team.pending.reduce((sum,x)=>sum+x.cost,0)});
team.nextRound++;
return team;
}
function evaluate(team){
const risk=team.risks,unpaid=team.pending.reduce((s,x)=>s+x.cost,0);
const avg=risk.legal*.24+risk.ops*.27+risk.workforce*.18+risk.customer*.31;
let score=100-avg*.62+(team.trust-50)*.25-Math.max(0,risk.liquidity-40)*.16;
score-=Math.min(18,unpaid/4000);
if(team.cash<0)score-=27;
if(risk.customer>75)score-=13;
if(risk.ops>75)score-=11;
if(team.cash<25000&&team.cash>=0)score-=7;
score=clamp(Math.round(score),0,100);
let status="AT RISK";
if(team.cash<0||risk.customer>=86||risk.ops>=90)status="LOST";
else if(risk.customer<=38&&risk.ops<=56&&risk.legal<=62&&team.trust>=60&&team.cash>=25000&&unpaid<28000)status="RENEWED";
else if(risk.customer<=68&&risk.ops<=76&&team.trust>=42&&team.cash>=0)status="CONDITIONAL";
const reasons=[];
if(team.cash<0)reasons.push("Response spending exceeded the £260,000 fund.");
else if(team.cash<25000)reasons.push("The remaining response reserve is thin.");
if(unpaid>0)reasons.push("£"+unpaid.toLocaleString("en-GB")+" of contingent commitments remain.");
if(risk.customer>65)reasons.push("Customer exposure remains elevated.");
if(risk.ops>65)reasons.push("Operational delivery remains fragile.");
if(risk.workforce>65)reasons.push("Workforce capacity is under strain.");
if(risk.legal>65)reasons.push("Legal and compliance issues remain unresolved.");
if(team.trust>=70)reasons.push("Direct, credible communication helped preserve client confidence.");
if(!reasons.length)reasons.push("The company retains sufficient cash and has contained the most serious exposures.");
return {score:score,status:status,avgRisk:Math.round(avg),unpaid:unpaid,reasons:reasons};
}
function rankTeams(teams){return teams.map(t=>({team:t,outcome:evaluate(t)})).sort((a,b)=>b.outcome.score-a.outcome.score||b.team.cash-a.team.cash||a.team.id-b.team.id);}
// Scores compare performance. The title requires the flagship renewal to be signed.
function championshipResult(teams){
const ranked=rankTeams(teams);
const eligible=ranked.filter(x=>x.outcome.status==="RENEWED"&&x.team.cash>=0&&x.team.risks.ops<=56);
const champion=eligible[0]||null;
const joint=champion?eligible.filter(x=>x.outcome.score===champion.outcome.score):[];
return {ranked:ranked,leader:ranked[0],champion:champion,joint:joint};
}
function sessionValid(teams,round){return Array.isArray(teams)&&teams.length>=2&&teams.length<=4&&teams.every(t=>t.nextRound===round&&t.history.length===round);}
g.BCRules={createTeam:createTeam,applyTurn:applyTurn,applyTimeout:applyTimeout,evaluate:evaluate,rankTeams:rankTeams,championshipResult:championshipResult,seedVariant:seedVariant,sessionValid:sessionValid,allocations:ALLOCATIONS,clamp:clamp,deepCopy:deepCopy};
if(typeof module!=="undefined"&&module.exports)module.exports=g.BCRules;
})(globalThis);
