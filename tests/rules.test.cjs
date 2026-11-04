"use strict";
const assert=require("node:assert/strict");
require("../src/content.js");
const C=globalThis.BCContent;
const R=require("../src/rules.js");
let checks=0;
function check(ok,msg){assert.ok(ok,msg);checks++;}
check(C.episodes.length===6,"six episodes");
check(C.advisers.length===6,"six advisers");
for(const e of C.episodes){
check(e.evidence.length===3,"three evidence exhibits in "+e.id);
check(e.advice.length===6,"six episode-specific briefings in "+e.id);
check(e.plans.length===3&&e.signals.length===3,"three plans and messages");
for(const p of e.plans){check(p.benefits.length>=2&&p.cost&&p.spend>=0,"trade-offs present");}
}
const t0=R.createTeam(0,"TEST TEAM");
let one=R.applyTurn(t0,0,0,0,[0,1],0);
check(one.nextRound===1&&one.history.length===1,"one committed round");
check(one.cash===260000-8000-18000,"cash ledger first round");
check(one.ledger.reduce((s,l)=>s+l.amount,0)===260000-one.cash,"ledger reconciliation");
check(t0.nextRound===0,"pure state transition");
assert.throws(()=>R.applyTurn(one,0,0,0,[0,1],0),/already committed|out of order/);checks++;
assert.throws(()=>R.applyTurn(t0,0,0,0,[0,0],0),/two different/);checks++;
assert.throws(()=>R.applyTurn(t0,0,5,0,[0,1],0),/Invalid strategic/);checks++;
assert.throws(()=>R.applyTurn(t0,0,0,3,[0,1],0),/Invalid public/);checks++;
const promise=R.applyTurn(t0,0,1,2,[0,1],0);
check(promise.pending.length===2,"two independent delayed commitments");
let next=R.applyTurn(promise,1,0,0,[1,2],0);
check(next.pending.length===1&&next.ledger.filter(x=>x.kind==="deferred").length===1,"only the round-two liability is charged");
check(R.evaluate(next).unpaid>0,"future liability remains distinct from cash");
next=R.applyTurn(next,2,0,0,[1,2],0);
check(next.pending.every(p=>p.due>3),"due liabilities charged once");
check(next.ledger.filter(x=>x.kind==="deferred").length===2,"each due item charged exactly once");
check(R.evaluate(next).unpaid===0,"all due liabilities settled by round three");
check(!next.ledger.some(x=>x.amount===240000),"annual renewal never credited as cash");
let beforeAlloc=R.applyTurn(R.applyTurn(t0,0,0,0,[0,1],0),1,0,0,[0,1],0);
let withoutAlloc=R.applyTurn(beforeAlloc,2,0,0,[0,1],0);
let withAlloc=R.applyTurn(beforeAlloc,2,0,0,[0,1],0,{amount:10000,route:"audit"});
check(withAlloc.cash===withoutAlloc.cash-10000,"allocation is charged to cash");
check(withAlloc.risks.legal===withoutAlloc.risks.legal-7,"allocation reduces selected exposure");
check(withAlloc.history[2].allocation.amount===10000,"allocation recorded in decision trail");
assert.throws(()=>R.applyTurn(beforeAlloc,2,0,0,[0,1],0,{amount:5000,route:"audit"}),/Allocation must/);checks++;
assert.throws(()=>R.applyTurn(beforeAlloc,2,0,0,[0,1],0,{amount:10000,route:"invalid"}),/Invalid allocation/);checks++;
// The highest performance score is not automatically a business victory.
function modelTeam(id,name,cash,trust,legal,ops,customer){
const t=R.createTeam(id,name);
t.cash=cash;t.trust=trust;t.risks={legal,ops,customer,workforce:30,liquidity:30};t.pending=[];return t;
}
const atRisk=modelTeam(0,"FORGE",22000,45,40,67,70);
const conditionalTeam=modelTeam(1,"ORBIT",11000,55,45,64,60);
const noChampion=R.championshipResult([atRisk,conditionalTeam]);
check(noChampion.champion===null,"no unsigned renewal may win the championship");
check(noChampion.leader!==null,"score leader still exists without a champion");
const qualified=modelTeam(2,"SIGNED",50000,78,30,35,20);
check(R.evaluate(qualified).status==="RENEWED","qualified team has a signed renewal");
const signedResult=R.championshipResult([atRisk,qualified]);
check(signedResult.champion.team.name==="SIGNED","only renewed, solvent team can be champion");
const broke=R.deepCopy(qualified);broke.cash=-1000;
check(R.championshipResult([broke,atRisk]).champion===null,"insolvent team cannot win");
const fragile=R.deepCopy(qualified);fragile.risks.ops=80;
check(R.championshipResult([fragile,atRisk]).champion===null,"unsafe delivery cannot win");
const twin=R.deepCopy(qualified);twin.id=3;twin.name="SIGNED TWIN";
check(R.championshipResult([qualified,twin]).joint.length===2,"tied qualifying champions recognised");

let scenarios=0,negative=0,renewed=0,conditional=0,lost=0,ties=0,determinism=0;
let minCash=Infinity,maxCash=-Infinity,minScore=Infinity,maxScore=-Infinity;
const cashSamples=[],scoreSamples=[],riskSamples=[];
function rand(seed){let x=seed>>>0;return function(){x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
for(let seed=1;seed<=1200;seed++){
const r=rand(seed),variant=R.seedVariant("TEST-"+seed),n=2+seed%3;
const teams=Array.from({length:n},(_,i)=>R.createTeam(i,"TEAM "+(i+1)));
const decisions=[];
for(let round=0;round<6;round++){
const same=seed%13===0,sharedPlan=Math.floor(r()*3),sharedSignal=Math.floor(r()*3);
for(let i=0;i<n;i++){
const plan=same?sharedPlan:Math.floor(r()*3),signal=same?sharedSignal:Math.floor(r()*3);
const adviserA=Math.floor(r()*6),adviserB=(adviserA+1+Math.floor(r()*5))%6;
decisions.push([round,i,plan,signal]);
teams[i]=R.applyTurn(teams[i],round,plan,signal,[adviserA,adviserB],variant);
check(teams[i].cash===260000-teams[i].ledger.reduce((sum,x)=>sum+x.amount,0),"ledger reconciliation");
check(teams[i].nextRound===round+1&&teams[i].history.length===round+1,"round committed exactly once");
for(const key of ["legal","ops","workforce","customer","liquidity"])check(teams[i].risks[key]>=0&&teams[i].risks[key]<=100,"risk bounded");
}
}
const ranked=R.rankTeams(teams);
check(ranked.length===n,"all teams ranked");
for(const t of teams){
const o=R.evaluate(t);check(o.score>=0&&o.score<=100,"score bounds");
check(o.unpaid===t.pending.reduce((sum,x)=>sum+x.cost,0),"unpaid liabilities exact");
minCash=Math.min(minCash,t.cash);maxCash=Math.max(maxCash,t.cash);
minScore=Math.min(minScore,o.score);maxScore=Math.max(maxScore,o.score);
cashSamples.push(t.cash);scoreSamples.push(o.score);riskSamples.push(o.avgRisk);
negative+=t.cash<0?1:0;
renewed+=o.status==="RENEWED"?1:0;conditional+=o.status==="CONDITIONAL"?1:0;lost+=o.status==="LOST"?1:0;
}
if(ranked.length>1&&ranked[0].outcome.score===ranked[1].outcome.score)ties++;
if(seed%13===0){
const a=teams[0],b=teams[1];
check(a.cash===b.cash&&JSON.stringify(a.risks)===JSON.stringify(b.risks)&&a.trust===b.trust,"same actions, same environment, same result");
determinism++;
}
scenarios++;
}
function percentiles(samples){const sorted=samples.slice().sort((a,b)=>a-b);const at=p=>sorted[Math.floor((sorted.length-1)*p)];return {p5:at(.05),median:at(.5),p95:at(.95)};}
console.log(JSON.stringify({cashPercentiles:percentiles(cashSamples),scorePercentiles:percentiles(scoreSamples),riskPercentiles:percentiles(riskSamples),passed:true,checks,seededSessions:scenarios,determinismChecks:determinism,insolvencies:negative,renewed,conditional,lost,topScoreTies:ties,cashRange:[minCash,maxCash],scoreRange:[minScore,maxScore]},null,2));
