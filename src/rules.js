(function(g){
"use strict";
const DATA=g.BCContent;
const RISK_KEYS=["legal","ops","workforce","customer","liquidity"];
const ALLOCATIONS=[
{id:"audit",name:"ACCESSIBILITY & CONTROLS",delta:{legal:-7,customer:-3},trust:2},
{id:"capacity",name:"PILOT DELIVERY CAPACITY",delta:{ops:-8,workforce:-2},trust:1},
{id:"people",name:"TEAM SUPPORT",delta:{workforce:-9,ops:-2},trust:1}
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
    "Your evidence-first proposal is appreciated. Now the visitor and education teams want their practical suggestions included.",
    "The three-site vision impressed the partner. Operations needs real staffing and venue evidence before anyone treats it as approved.",
    "A focused first-site plan is affordable. Your team now needs to show how a smaller experience can still excite visitors."
  ],
  [
    "Co-design surfaced an accessible offline option. The supplier choice should now protect that inclusive experience.",
    "Named owners accelerated planning. The supplier needs to know whether the team has tested the visitor experience with staff.",
    "Extra crew support created capacity and a future handover cost. Procurement must account for both."
  ],
  [
    "The independently verified supplier route gave the partner stronger evidence. Public messages must reflect which locations are still conditional.",
    "The fast-track agreement added delivery commitments. The public teaser must not turn a target into a guarantee.",
    "The internal prototype demonstrates the core idea. The team still needs to explain which technical features are not fully tested."
  ],
  [
    "The public update separated confirmed details from concept sketches. The demonstration must now validate the promises.",
    "The team held back launch details. A successful dry run could supply the missing evidence; a failure requires a clear next update.",
    "Visitors have helped refine the concept. The test needs to show which inclusive features actually work."
  ],
  [
    "The funded backup supplier can support the experience, but the board must account for the future handover.",
    "The offline-first version is robust. The board must decide whether to fund improvements or launch with fewer features.",
    "The narrower pilot protects resources. The board must agree the smaller scope with its partner before presenting it as final."
  ]
];
const SIGNAL_MOMENTS=[
  [
    "The verified proposal tells the partner what has actually been tested, not simply imagined.",
    "The three-location ambition is now public as a conditional goal, creating extra questions for delivery.",
    "The first-site proposal is explicitly a pilot; a wider rollout remains subject to measurable results."
  ],
  [
    "The delivery team is invited to shape the visitor experience as well as follow the timetable.",
    "Named owners are accountable for current commitments and the next design review.",
    "Additional staff support protects capacity, but the follow-up costs must be funded."
  ],
  [
    "Procurement can check owners, evidence and dates instead of interpreting a broad assurance.",
    "The faster route increases expectations and brings an explicit future milestone review cost.",
    "Prototype verification comes before expansion, protecting accuracy at the expense of momentum."
  ],
  [
    "Visitors now know which venues and dates remain conditional.",
    "The public gets an invitation to contribute to design rather than an invented launch guarantee.",
    "An access check is promised before the next announcement. That commitment must be honoured."
  ],
  [
    "The partner receives verified prototype results, including the limitations.",
    "The backup plan raises confidence but must be checked and funded after the meeting.",
    "The team waits for additional site evidence; public expectations may continue rising."
  ],
  [
    "The board can see exactly which commitments will be funded and which features will wait.",
    "An accelerated expansion remains conditional on evidence and resources.",
    "A verified first-site handover creates a measurable basis for future expansion."
  ]
];
const RISK_FOLLOWUP={
  "legal": "Accessibility and contract approvals still need evidence before the pilot is advertised as ready.",
  "ops": "The delivery lead needs a reliable venue and supplier contingency.",
  "workforce": "The people team needs a sustainable work plan for staff and partners.",
  "customer": "The partner needs a credible demonstration and honest scope before committing."
};
// Scene 04 is one shared public teaser, but it tests each team's OWN recorded
// commitments. This is a deterministic fictional pressure, never a secret vote
// bonus. Only the same team's participants may view the personalised callout.
function spotlightTwist(team,round){
 if(round!==3||!team||!Array.isArray(team.history)||team.history.length<3)return null;
 const [first,people,supplier]=team.history;
 if([first,people,supplier].some(h=>h.timedOut)){
  return {id:"unanswered",title:"UNANSWERED PROMISES",
   text:"Your team left at least one earlier decision unresolved. The public teaser has arrived, and the partner asks who can verify the dates and accessibility claims.",
   result:"Unanswered earlier decisions increased scrutiny of public claims and partner readiness.",
   delta:{legal:3,customer:3},trust:-2};
 }
 const ambitious=first.planIndex===1||first.signalIndex===1;
 const fast=supplier.planIndex===1;
 if(ambitious&&fast){
  return {id:"ambition-fast",title:"THREE SITES, ONE QUESTION",
   text:"Your team explored a three-site pilot and chose a faster supplier route. The public now reads the teaser as a confirmed multi-site opening, although venue approval and accessibility tests remain pending.",
   result:"Earlier three-site ambition and fast-track delivery raised partner and public-claims exposure when the teaser spread.",
   delta:{legal:5,customer:4,ops:2},trust:-2};
 }
 if(ambitious){
  return {id:"ambition",title:"EXPECTATIONS ARE GROWING",
   text:"Your earlier proposal explored three locations. Visitors now expect all three to open, even though the concept was conditional and site approvals are still outstanding.",
   result:"The public interpreted your ambitious but conditional proposal too broadly, increasing verification pressure.",
   delta:{legal:3,customer:2},trust:-1};
 }
 const focused=first.planIndex===2||first.signalIndex===2;
 if(focused){
  return {id:"focused",title:"ONE SITE, THREE QUESTIONS",
   text:"Your team framed Project Spark as a first-site pilot with expansion gates. The teaser shows three possible spaces. Now the partner wants confirmation that one launch site is the only approved starting point.",
   result:"Your earlier first-site scope limited claims exposure, but the larger public concept still needed partner clarification.",
   delta:{legal:-2,customer:3},trust:1};
 }
 if(people.planIndex===0&&supplier.planIndex===0){
  return {id:"co-designed",title:"THE TEAM SAW THIS COMING",
   text:"Your staff workshop identified an accessible offline option, and your supplier choice included independent verification. The public is asking questions your team has already prepared to investigate.",
   result:"Earlier co-design and verification reduced people and public-claims exposure under the spotlight.",
   delta:{legal:-2,workforce:-2},trust:2};
 }
 return {id:"unverified",title:"THE DETAILS ARE STILL OPEN",
  text:"The teaser has created demand, but the team still needs to verify site dates, accessibility and visitor expectations. No Project Spark pilot has been awarded.",
  result:"The public's questions increased partner scrutiny; the plan remains conditional.",
  delta:{customer:2},trust:0};
}
function applySpotlightTwist(team,round){
 const twist=spotlightTwist(team,round);
 if(twist){
  addRisk(team,twist.delta);
  team.trust=clamp(team.trust+twist.trust,0,100);
 }
 return twist;
}
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
 if(team.cash<0)pressures.push("The 90-day reserve is overdrawn; the board cannot treat an unfunded pilot commitment as approved.");
 else if(team.cash<25000)pressures.push("The shared 90-day project reserve has less than £25,000 available.");
 if(pending>0)pressures.push("£"+pending.toLocaleString("en-GB")+" of future commitments remain on the books.");
 if(team.trust<35)pressures.push("Stakeholder trust is fragile after your team's earlier choices.");
 const key=["legal","ops","workforce","customer"].sort((a,b)=>team.risks[b]-team.risks[a])[0];
 if(team.risks[key]>68)pressures.push(RISK_FOLLOWUP[key]);
 return {previousRound:round,fromPlan:prev.plan,lead:lead,pressure:pressures.slice(0,2).join(" ")};
}
function adaptiveFallout(team,round,plan,signal,signalIndex,due,spotlight){
 let main=plan.fallout;
 // A prewritten success line must never claim an action was fully funded
 // after the cumulative fund has already turned negative.
 if(team.cash<0){
   main="The team chose "+plan.name.toLowerCase()+", but the response now exceeds its £"+
     DATA.initialCash.toLocaleString("en-GB")+
     " reserve. Finance cannot authorise the unfunded portion as complete: the board must revise scope or secure new finance.";
 }
 const lines=[main,SIGNAL_MOMENTS[round]?.[signalIndex]||"The public message is now part of the company's record."];
 if(spotlight)lines.unshift("EARLIER PROMISES UNDER THE SPOTLIGHT: "+spotlight.result);
 if(due.length){
   const paid=due.reduce((sum,x)=>sum+x.cost,0);
   lines.push("Earlier promises have now cost £"+paid.toLocaleString("en-GB")+" in this chapter.");
 }
 const pending=team.pending.reduce((sum,x)=>sum+x.cost,0);
 if(pending>0)lines.push("£"+pending.toLocaleString("en-GB")+" is still committed for future actions; this is not free cash.");
 if(team.cash>=0&&team.cash<25000)lines.push("Finance flags the reserve as too thin for an additional unplanned pilot commitment.");
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
const spotlight=applySpotlightTwist(team,round);
expense(team,round,plan.spend,plan.name,"strategy");
if(alloc.amount>0){
const route=ALLOCATIONS.find(x=>x.id===alloc.route),factor=alloc.amount/10000;
expense(team,round,alloc.amount,"Discretionary pilot investment / "+route.name,"allocation");
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
team.history.push({round:round+1,episode:episode.title,time:episode.time,plan:plan.name,planIndex:planIndex,signal:signal.name,signalIndex:signalIndex,advisers:advisers.slice(),allocation:alloc.amount?{amount:alloc.amount,route:alloc.route}:null,leadIn:leadIn?leadIn.lead:null,fallout:adaptiveFallout(team,round,plan,signal,signalIndex,due,spotlight),spotlight:spotlight?{id:spotlight.id,title:spotlight.title,result:spotlight.result}:null,roundSpent:roundSpent,paidDeferred:due.map(x=>x.label),cash:team.cash,trust:team.trust,risks:deepCopy(team.risks),pendingLiability:team.pending.reduce((sum,x)=>sum+x.cost,0)});
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
const spotlight=applySpotlightTwist(team,round);
addRisk(team,{legal:4,ops:8,workforce:5,customer:10});
team.trust=clamp(team.trust-10,0,100);
recalcLiquidity(team);
const roundSpent=team.ledger.filter(x=>x.round===round+1).reduce((sum,x)=>sum+x.amount,0);
team.history.push({round:round+1,episode:episode.title,time:episode.time,
plan:"NO RESPONSE",planIndex:null,signal:"NO PUBLIC STATEMENT",signalIndex:null,
advisers:[],allocation:null,timedOut:true,leadIn:leadIn?leadIn.lead:null,
fallout:(spotlight?"EARLIER PROMISES UNDER THE SPOTLIGHT: "+spotlight.result+" ":"")+"No strategic response was authorised before the deadline. Mandatory costs continued and unresolved exposures deteriorated.",
spotlight:spotlight?{id:spotlight.id,title:spotlight.title,result:spotlight.result}:null,
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
else if(risk.customer<=38&&risk.ops<=56&&risk.legal<=62&&team.trust>=60&&team.cash>=25000&&unpaid<28000)status="BOARD_READY";
else if(risk.customer<=68&&risk.ops<=76&&team.trust>=42&&team.cash>=0)status="CONDITIONAL";
const reasons=[];
if(team.cash<0)reasons.push("Project and operating spending exceeded the £260,000 reserve.");
else if(team.cash<25000)reasons.push("The remaining 90-day reserve is thin.");
if(unpaid>0)reasons.push("£"+unpaid.toLocaleString("en-GB")+" of contingent commitments remain.");
if(risk.customer>65)reasons.push("Partner confidence remains fragile.");
if(risk.ops>65)reasons.push("Operational delivery remains fragile.");
if(risk.workforce>65)reasons.push("Project staff capacity is under strain.");
if(risk.legal>65)reasons.push("Accessibility and contractual checks remain unresolved.");
if(team.trust>=70)reasons.push("Verified communication helped maintain partner confidence.");
if(!reasons.length)reasons.push("The company retains sufficient cash and has contained the most serious exposures.");
const strengths=[];
if(risk.customer<=48)strengths.push("Partner confidence: the proposed delivery path has lower exposure in this simulation.");
if(risk.ops<=55)strengths.push("Operational readiness: the pilot plan retained feasible capacity.");
if(risk.workforce<=55)strengths.push("Team sustainability: project staffing pressures are comparatively contained.");
if(risk.legal<=55)strengths.push("Governance: accessibility and contract exposure are comparatively contained.");
if(team.cash>=50000)strengths.push("Resilience: at least £50,000 remains in the 90-day reserve.");
if(team.trust>=70)strengths.push("Stakeholder communication: the trust index has recovered.");
if(!strengths.length)strengths.push("The team recorded decisions and can now identify concrete improvements.");
const nextSteps=[];
if(team.cash<0)nextSteps.push("Resolve the unfunded response before offering new commitments.");
else if(team.cash<25000)nextSteps.push("Restore the 90-day improvement reserve.");
if(unpaid>=16000)nextSteps.push("Assign owners and funding to outstanding commitments.");
if(risk.ops>60)nextSteps.push("Validate delivery capacity and staff handovers.");
if(risk.workforce>60)nextSteps.push("Protect staff and supplier capacity for the 90-day pilot.");
if(risk.customer>60)nextSteps.push("Show the partner verified milestones before expanding scope.");
if(risk.legal>60)nextSteps.push("Close unresolved accessibility and contractual checks.");
if(nextSteps.length===0)nextSteps.push("Maintain the plan and monitor the next set of evidence-based milestones.");
return {score:score,status:status,avgRisk:Math.round(avg),unpaid:unpaid,reasons:reasons,
 scoreBreakdown:scoreBreakdown,strengths:strengths.slice(0,3),nextSteps:nextSteps.slice(0,3)};
}
function rankTeams(teams){return teams.map(t=>({team:t,outcome:evaluate(t)})).sort((a,b)=>b.outcome.score-a.outcome.score||b.team.cash-a.team.cash||a.team.id-b.team.id);}
// Scores compare fictional plan-readiness. BOARD_READY is an internal simulation threshold, not a client award.
function championshipResult(teams){
const ranked=rankTeams(teams);
const eligible=ranked.filter(x=>x.outcome.status==="BOARD_READY"&&x.team.cash>=0&&x.team.risks.ops<=56);
const champion=eligible[0]||null;
const joint=champion?eligible.filter(x=>x.outcome.score===champion.outcome.score&&x.team.cash===champion.team.cash):[];
return {ranked:ranked,leader:ranked[0],champion:champion,joint:joint};
}
function sessionValid(teams,round){return Array.isArray(teams)&&teams.length>=2&&teams.length<=4&&teams.every(t=>t.nextRound===round&&t.history.length===round);}
g.BCRules={createTeam:createTeam,applyTurn:applyTurn,applyTimeout:applyTimeout,evaluate:evaluate,storyContext:storyContext,spotlightTwist:spotlightTwist,rankTeams:rankTeams,championshipResult:championshipResult,seedVariant:seedVariant,sessionValid:sessionValid,allocations:ALLOCATIONS,clamp:clamp,deepCopy:deepCopy};
if(typeof module!=="undefined"&&module.exports)module.exports=g.BCRules;
})(globalThis);
