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
next=R.applyTurn(next,2,0,0,[1,2],0);
check(next.pending.every(p=>p.due>3),"due liabilities charged once");
check(next.ledger.filter(x=>x.kind==="deferred").length===2,"each due item charged exactly once");
check(R.evaluate(next).unpaid>0,"pending liabilities remain distinct");
check(!next.ledger.some(x=>x.amount===240000),"annual renewal never credited as cash");
let scenarios=0,negative=0,renewed=0,conditional=0,lost=0,ties=0,determinism=0;
let minCash=Infinity,maxCash=-Infinity,minScore=Infinity,maxScore=-Infinity;
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
console.log(JSON.stringify({passed:true,checks,seededSessions:scenarios,determinismChecks:determinism,insolvencies:negative,renewed,conditional,lost,topScoreTies:ties,cashRange:[minCash,maxCash],scoreRange:[minScore,maxScore]},null,2));
