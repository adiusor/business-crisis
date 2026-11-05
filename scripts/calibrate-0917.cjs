"use strict";
// Reproducible technical calibration; simulated choices are NOT human participants.
const assert=require("node:assert/strict");
require("../src/content.js");
const R=require("../src/rules.js"),C=globalThis.BCContent;
let seed=0x9172026;
function next(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const N=5000;
const count={BOARD_READY:0,CONDITIONAL:0,"AT RISK":0,LOST:0};
let cappedTrust=0,negativeCash=0,ledgerErrors=0;
const perRound=Array.from({length:6},()=>({trustCap:0,spent:0}));
const sample=[];
for(let n=0;n<N;n++){
 let team=R.createTeam(0,"CALIBRATION");
 const variation=Math.floor(next()*C.variants.length);
 const plans=[],signals=[];
 for(let round=0;round<6;round++){
  const p=Math.floor(next()*3),s=Math.floor(next()*3);
  plans.push(p);signals.push(s);
  const allocation=[2,4].includes(round)&&next()>.70?
    {amount:next()>.5?10000:20000,route:R.allocations[Math.floor(next()*R.allocations.length)].id}:
    {amount:0,route:null};
  const beforeCash=team.cash;
  team=R.applyTurn(team,round,p,s,[0,1],variation,allocation);
  perRound[round].trustCap+=+(team.trust===100);
  perRound[round].spent+=beforeCash-team.cash;
  if(team.cash!==C.initialCash-team.ledger.reduce((sum,e)=>sum+e.amount,0))ledgerErrors++;
 }
 const score=R.evaluate(team);
 count[score.status]++;
 cappedTrust+=+(team.trust===100);
 negativeCash+=+(team.cash<0);
 if(n<30)sample.push({score:score.score,status:score.status,cash:team.cash,trust:team.trust});
}
assert.equal(ledgerErrors,0);
assert.equal(Object.values(count).reduce((a,b)=>a+b,0),N);
const pct=x=>Number((x*100/N).toFixed(2));
console.log(JSON.stringify({
 meaning:"These are deterministic RANDOM-WALK simulations, not user outcomes or probabilities of team success",
 runs:N,seed:"0x9172026",statusCounts:count,
 statusPct:Object.fromEntries(Object.entries(count).map(([key,value])=>[key,pct(value)])),
 trustCappedAt100Pct:pct(cappedTrust),negativeCashPct:pct(negativeCash),
 perRound:perRound.map((x,i)=>({scene:i+1,trustCapPct:pct(x.trustCap),meanCashSpend:Math.round(x.spent/N)})),
 ledgerErrors,examples:sample.slice(0,3)
},null,2));
