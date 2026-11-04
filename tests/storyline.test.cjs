"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
require("../src/content.js");
require("../src/rules.js");
const C=globalThis.BCContent,R=globalThis.BCRules;
const keys=["legal","ops","workforce","customer","liquidity"];
test("the six incident chapters form one time-ordered, evidence-led story",()=>{
 assert.equal(C.episodes.length,6);
 assert.equal(C.advisers.length,6);
 assert.equal(C.initialCash,260000,"The response cash is not the annual contract value");
 assert.equal(C.annualContractValue,240000);
 assert.deepEqual(C.episodes.map(e=>e.id),["send","floor","client","press","warehouse","board"]);
 const minutes=C.episodes.map(e=>Number(e.time.slice(0,2))*60+Number(e.time.slice(3,5)));
 assert.ok(minutes.every((n,i)=>Number.isFinite(n)&&(i===0||n>minutes[i-1])));
 assert.equal(new Set(C.episodes.map(e=>e.title)).size,6);
 for(const [i,e] of C.episodes.entries()){
  assert.equal(e.number,String(i+1).padStart(2,"0"));
  for(const field of ["title","kicker","brief","headline"]){
   assert.equal(typeof e[field],"string");
   assert.ok(e[field].trim().length>=10,e.id+" "+field);
  }
  assert.equal(e.evidence.length,3,"Exactly three source exhibits per chapter");
  assert.equal(e.advice.length,6,"Every one of the six advisers has narrative intelligence");
  assert.equal(e.plans.length,3,"Three strategies are essential to team choice");
  assert.equal(e.signals.length,3,"Three distinct public statements are required");
  assert.ok(e.evidence.every(x=>
   ["type","time","title","body","clue"].every(field=>typeof x[field]==="string"&&x[field].trim().length>=4)));
  assert.ok(e.advice.every(x=>typeof x==="string"&&x.length>=25));
  assert.equal(new Set(e.plans.map(x=>x.name)).size,3);
  assert.equal(new Set(e.signals.map(x=>x.name)).size,3);
  for(const plan of e.plans){
   assert.ok(Number.isInteger(plan.spend)&&plan.spend>=0);
   assert.ok(plan.desc.length>=20&&plan.cost.length>=10);
   assert.ok(plan.benefits.length>=2&&plan.benefits.every(x=>x.length>=6));
   assert.ok(Object.keys(plan.delta).length>=2);
   assert.ok(Object.keys(plan.delta).every(key=>keys.includes(key)));
  }
  for(const signal of e.signals){
   assert.ok(signal.line.length>=15);
   assert.ok(Object.keys(signal.delta).length>=1);
   assert.ok(Object.keys(signal.delta).every(key=>keys.includes(key)));
  }
 }
});

test("the cash and commitment ledger react materially to competing strategy and statement choices",()=>{
 const advisers=[0,1],variant=0;
 for(let round=0;round<C.episodes.length;round++){
  let base=R.createTeam(0,"TEST");
  for(let earlier=0;earlier<round;earlier++)
   base=R.applyTurn(base,earlier,0,0,advisers,variant,{amount:0,route:null});
  const outputs=[];
  for(let plan=0;plan<3;plan++)for(let signal=0;signal<3;signal++){
   const after=R.applyTurn(base,round,plan,signal,advisers,variant,{amount:0,route:null});
   assert.equal(after.history.length,round+1);
   assert.equal(after.nextRound,round+1);
   assert.equal(after.cash,C.initialCash-after.ledger.reduce((sum,item)=>sum+item.amount,0));
   assert.ok(after.pending.every(p=>Number.isInteger(p.due)&&p.due>round+1&&p.due<=7));
   assert.ok(after.history[round].fallout.length>15);
   const h=after.history[round];
   outputs.push(JSON.stringify({spent:h.roundSpent,cash:after.cash,trust:after.trust,risks:after.risks,
    pending:after.pending.map(x=>x.cost)}));
  }
  assert.ok(new Set(outputs).size>=6,C.episodes[round].title+" must offer consequential alternatives");
 }
});

test("unverified assurances and operational fatigue entail risk rather than free guaranteed rewards",()=>{
 const first=C.episodes[0];
 const falseCertainty=first.signals.find(x=>x.name==="NO IMPACT");
 assert.ok(falseCertainty.delta.legal>0&&falseCertainty.delay.cost>0);
 const floor=C.episodes[1];
 assert.ok(floor.signals.find(x=>x.name==="PROMISE JOBS").delta.legal>0);
 const client=C.episodes[2];
 assert.ok(client.plans.find(x=>x.name==="SIGN THE GUARANTEE").delay.cost>0);
 const operation=C.episodes[4];
 assert.ok(operation.plans.find(x=>x.name==="ONE MORE SHIFT").delta.workforce>0);
 const close=C.episodes[5];
 assert.ok(close.signals.find(x=>x.name==="PROMISE EVERYTHING").delay.cost>0);
});
