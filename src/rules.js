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
{customer:4}
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
// These private, team-specific story bridges are driven by the actual previous
// decision. They never alter the shared public evidence or grant scoring bonuses.
const STORY_BRIDGES=[
 null,
 [
  "Your verification trail is ready. Staff now want a clear explanation of what has—and has not—been decided.",
  "The access restrictions reduced exposure, but the affected handover needs a practical staffing plan.",
  "The client appreciated the early contact. Your people team still needs verified answers before the rumour spreads."
 ],
 [
  "People have had a direct route to ask questions. The client now wants to see whether that openness translates into dependable action.",
  "The shift was covered under the manager-led plan. Some colleagues still expect a chance to speak before the next milestone.",
  "Paid support helped fill the rota. Finance has now asked the client team to account for the extra commitment."
 ],
 [
  "Independent reviewers have agreed to milestones, but the newsroom will want a shorter explanation than the audit report.",
  "The service-recovery commitments are on the table. Public messaging must not promise more than the funded schedule can deliver.",
  "Delivery evidence is improving. A public statement still needs to acknowledge the people working behind those numbers."
 ],
 [
  "The public record includes verified facts. The next test is whether operations can honour that confidence.",
  "The company waited for verified facts. Operations now needs a specific recovery update before the silence becomes its own story.",
  "Personal information stayed protected. Customers still expect service updates while the company negotiates what it can say."
 ],
 [
  "The additional supplier has taken critical work. The board must decide how to fund the transition without exhausting its reserve.",
  "Rested colleagues covered priority delivery. The board must account for the handover costs and for the clients whose work was moved.",
  "The revised priorities protected capacity. The board must justify the narrower commitment to clients and employees."
 ]
];
const SIGNAL_MOMENTS=[
 [
  "The fact-based update gives stakeholders a single verified point of reference.",
  "The dated update creates a clear promise that stakeholders can check later.",
  "Customers hear operational reassurance, while the control review still needs to prove the underlying facts."
 ],
 [
  "Colleagues now have a direct channel for questions rather than relying on screenshots.",
  "Supervisors receive a usable plan, but some employees may still want a direct conversation.",
  "The proposed changes are paused for consultation, creating clarity but requiring careful legal and scheduling follow-through."
 ],
 [
  "Procurement can compare concrete milestones rather than another generic assurance.",
  "The recovery target is public; missed dates would create a financial and credibility burden.",
  "The client receives a promise of evidence before another commitment is made."
 ],
 [
  "The company corrects the record promptly, exposing it to further questions but reducing uncertainty.",
  "Acknowledging concerns opens dialogue while leaving a few operational questions unanswered.",
  "Colleagues hear from management first; customer reassurance will need a separate follow-up."
 ],
 [
  "The milestone alert makes emerging problems visible early enough to plan around them.",
  "The priority-service statement protects confidence but creates a need for stronger contingency verification.",
  "The update waits for operational checks, leaving a brief communication gap but reducing unsupported promises."
 ],
 [
  "The board names who owns each trade-off and how progress will be measured.",
  "The accelerated public commitment raises expectations and adds a future cost of delivery.",
  "The verified handover plan gives the next shift specific responsibilities to act on."
 ]
];
const RISK_FOLLOWUP={
 legal:"Legal and compliance reviewers require documented controls before more commitments are made.",
 ops:"The operations lead warns that service continuity still depends on a stable handover.",
 workforce:"The people team is asking for rest, clear consultation and a workable staffing plan.",
 customer:"Client contacts still need a credible explanation before trusting the next milestone."
};
function storyContext(team,round){
 if(!team||!Array.isArray(team.history)||!Number.isInteger(round)||round<=0||round>=DATA.episodes.length)return null;
 const prev=team.history[round-1];
 if(!prev)return null;
 const source=STORY_BRIDGES[round];
 const lead=prev.timedOut?
  "Your team did not file a response in the previous chapter. The unanswered questions have followed you into the next meeting.":
  (source?.[prev.planIndex]||"Your previous decision is still shaping the company's options.");
 const pending=team.pending.reduce((sum,x)=>sum+x.cost,0);
 const pressures=[];
 if(team.cash<0)pressures.push("The response fund has a funding gap; another promise cannot be described as fully financed.");
 else if(team.cash<25000)pressures.push("There is less than £25,000 in the response reserve.");
 if(pending>0)pressures.push("£"+pending.toLocaleString("en-GB")+" of future commitments remain on the books.");
 if(team.trust<35)pressures.push("Stakeholder trust is fragile after your team's earlier choices.");
 const key=["legal","ops","workforce","customer"].sort((a,b)=>team.risks[b]-team.risks[a])[0];
 if(team.risks[key]>68)pressures.push(RISK_FOLLOWUP[key]);
 return {previousRound:round,fromPlan:prev.plan,lead:lead,pressure:pressures.slice(0,2).join(" ")};
}
function adaptiveFallout(team,round,plan,signal,signalIndex,due){
 let main=plan.fallout;
 // A prewritten success line must never claim an action was fully funded
 // after the cumulative fund has already turned negative.
 if(team.cash<0){
   main="The team chose "+plan.name.toLowerCase()+", but the response now exceeds its £"+
     DATA.initialCash.toLocaleString("en-GB")+
     " fund. Finance cannot authorise the unfunded portion as complete: the board must revise the scope or secure new finance.";
 }
 const lines=[main,SIGNAL_MOMENTS[round]?.[signalIndex]||"The public message is now part of the company's record."];
 if(due.length){
   const paid=due.reduce((sum,x)=>sum+x.cost,0);
   lines.push("Earlier promises have now cost £"+paid.toLocaleString("en-GB")+" in this chapter.");
 }
 const pending=team.pending.reduce((sum,x)=>sum+x.cost,0);
 if(pending>0)lines.push("£"+pending.toLocaleString("en-GB")+" is still committed for future actions; this is not free cash.");
 if(team.cash>=0&&team.cash<25000)lines.push("Finance flags the reserve as too thin for another unplanned commitment.");
 if(team.trust<30)lines.push("The board asks for a direct, verified stakeholder conversation to rebuild trust.");
 return lines.join(" ");
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
const leadIn=storyContext(team,round);
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
team.history.push({round:round+1,episode:episode.title,time:episode.time,plan:plan.name,planIndex:planIndex,signal:signal.name,signalIndex:signalIndex,advisers:advisers.slice(),allocation:alloc.amount?{amount:alloc.amount,route:alloc.route}:null,leadIn:leadIn?leadIn.lead:null,fallout:adaptiveFallout(team,round,plan,signal,signalIndex,due),roundSpent:roundSpent,paidDeferred:due.map(x=>x.label),cash:team.cash,trust:team.trust,risks:deepCopy(team.risks),pendingLiability:team.pending.reduce((sum,x)=>sum+x.cost,0)});
team.nextRound++;
return team;
}
// A missed deadline is NOT converted into a fictional strategic decision.
function applyTimeout(input,round,variant){
assert(input&&typeof input==="object","Missing team state");
assert(Number.isInteger(round)&&round>=0&&round<DATA.episodes.length,"Invalid episode");
assert(input.nextRound===round,"Episode already committed or out of order");
assert(Number.isInteger(variant)&&variant>=0&&variant<DATA.variants.length,"Invalid common scenario variant");
const team=deepCopy(input),episode=DATA.episodes[round],leadIn=storyContext(team,round),due=startEpisode(team,round,variant);
addRisk(team,{legal:4,ops:8,workforce:5,customer:10});
team.trust=clamp(team.trust-10,0,100);
recalcLiquidity(team);
const roundSpent=team.ledger.filter(x=>x.round===round+1).reduce((sum,x)=>sum+x.amount,0);
team.history.push({round:round+1,episode:episode.title,time:episode.time,
plan:"NO RESPONSE",planIndex:null,signal:"NO PUBLIC STATEMENT",signalIndex:null,
advisers:[],allocation:null,timedOut:true,leadIn:leadIn?leadIn.lead:null,
fallout:"No strategic response was authorised before the deadline. Mandatory costs continued and unresolved exposures deteriorated.",
roundSpent:roundSpent,paidDeferred:due.map(x=>x.label),cash:team.cash,trust:team.trust,
risks:deepCopy(team.risks),pendingLiability:team.pending.reduce((sum,x)=>sum+x.cost,0)});
team.nextRound++;
return team;
}
function evaluate(team){
const risk=team.risks,unpaid=team.pending.reduce((s,x)=>s+x.cost,0);
const avg=risk.legal*.24+risk.ops*.27+risk.workforce*.18+risk.customer*.31;
const riskPenalty=avg*.62;
const trustEffect=(team.trust-50)*.25;
const liquidityPenalty=Math.max(0,risk.liquidity-40)*.16;
const commitmentPenalty=Math.min(18,unpaid/4000);
const cashPenalty=team.cash<0?27:0;
const customerPenalty=risk.customer>75?13:0;
const operationsPenalty=risk.ops>75?11:0;
const reservePenalty=team.cash<25000&&team.cash>=0?7:0;
const unrounded=100-riskPenalty+trustEffect-liquidityPenalty-commitmentPenalty-
 cashPenalty-customerPenalty-operationsPenalty-reservePenalty;
const score=clamp(Math.round(unrounded),0,100);
const fmt=n=>Math.round(n*100)/100;
const scoreBreakdown={base:100,riskIndex:fmt(avg),riskPenalty:fmt(riskPenalty),
 trustEffect:fmt(trustEffect),liquidityPenalty:fmt(liquidityPenalty),
 commitmentPenalty:fmt(commitmentPenalty),cashPenalty,customerPenalty,
 operationsPenalty,reservePenalty,unrounded:fmt(unrounded),economicScore:score};
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
const strengths=[];
if(risk.customer<=48)strengths.push("Customer confidence: exposure is under control in this simulation.");
if(risk.ops<=55)strengths.push("Operational continuity: the delivery plan retained capacity.");
if(risk.workforce<=55)strengths.push("Team sustainability: workforce pressures are comparatively contained.");
if(risk.legal<=55)strengths.push("Governance: material legal exposure is comparatively contained.");
if(team.cash>=50000)strengths.push("Resilience: at least £50,000 remains available for response.");
if(team.trust>=70)strengths.push("Stakeholder communication: the trust index has recovered.");
if(!strengths.length)strengths.push("The team recorded decisions and can now identify concrete improvements.");
const nextSteps=[];
if(team.cash<0)nextSteps.push("Resolve the unfunded response before offering new commitments.");
else if(team.cash<25000)nextSteps.push("Restore the emergency response reserve.");
if(unpaid>=16000)nextSteps.push("Assign owners and funding to outstanding commitments.");
if(risk.ops>60)nextSteps.push("Validate delivery capacity and staff handovers.");
if(risk.workforce>60)nextSteps.push("Create a sustainable workforce recovery plan.");
if(risk.customer>60)nextSteps.push("Show clients verified milestones rather than general reassurance.");
if(risk.legal>60)nextSteps.push("Close unresolved legal and information-control actions.");
if(nextSteps.length===0)nextSteps.push("Maintain the plan and monitor the next set of evidence-based milestones.");
return {score:score,status:status,avgRisk:Math.round(avg),unpaid:unpaid,reasons:reasons,
 scoreBreakdown:scoreBreakdown,strengths:strengths.slice(0,3),nextSteps:nextSteps.slice(0,3)};
}
function rankTeams(teams){return teams.map(t=>({team:t,outcome:evaluate(t)})).sort((a,b)=>b.outcome.score-a.outcome.score||b.team.cash-a.team.cash||a.team.id-b.team.id);}
// Scores compare modelled performance. Championship means renewal readiness in the simulation, not a real signed contract.
function championshipResult(teams){
const ranked=rankTeams(teams);
const eligible=ranked.filter(x=>x.outcome.status==="RENEWED"&&x.team.cash>=0&&x.team.risks.ops<=56);
const champion=eligible[0]||null;
const joint=champion?eligible.filter(x=>x.outcome.score===champion.outcome.score&&x.team.cash===champion.team.cash):[];
return {ranked:ranked,leader:ranked[0],champion:champion,joint:joint};
}
function sessionValid(teams,round){return Array.isArray(teams)&&teams.length>=2&&teams.length<=4&&teams.every(t=>t.nextRound===round&&t.history.length===round);}
g.BCRules={createTeam:createTeam,applyTurn:applyTurn,applyTimeout:applyTimeout,evaluate:evaluate,storyContext:storyContext,rankTeams:rankTeams,championshipResult:championshipResult,seedVariant:seedVariant,sessionValid:sessionValid,allocations:ALLOCATIONS,clamp:clamp,deepCopy:deepCopy};
if(typeof module!=="undefined"&&module.exports)module.exports=g.BCRules;
})(globalThis);
