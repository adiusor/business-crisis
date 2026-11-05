"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
require("../../src/content.js");
require("../../src/rules.js");
require("../story.js");
const base=globalThis.BCRules;
const C=globalThis.BCLearningContent;
const R=globalThis.BCCreateRules(C);
const zero={amount:0,route:null};
test("existing 09:17 economic engine stays identical after extraction",()=>{
 const a=base.applyTurn(base.createTeam(0,"ORIGINAL"),0,0,0,[0,1],0,zero);
 assert.equal(a.cash,234000);
 assert.equal(a.trust,55);
 assert.equal(a.nextRound,1);
 assert.deepEqual(a.risks,{legal:37,ops:46,workforce:46,customer:41,liquidity:29});
});
test("Opening Night uses the SAME economic rules on its own scenario data",()=>{
 assert.equal(typeof globalThis.BCCreateRules,"function");
 assert.equal(C.episodes.length,6);
 assert.equal(C.advisers.length,6);
 assert.equal(C.initialCash,210000);
 assert.equal(C.annualContractValue,120000);
 const t=R.applyTurn(R.createTeam(0,"LEARNING"),0,0,0,[0,1],0,zero);
 assert.equal(t.cash,191000);
 assert.equal(t.trust,62);
 assert.equal(t.history[0].roundSpent,19000);
 assert.equal(t.nextRound,1);
});
test("six chronological chapters each include evidence, alternatives and an explicit lesson",()=>{
 const times=C.episodes.map(x=>Number(x.time.slice(0,2))*60+Number(x.time.slice(3,5)));
 assert.ok(times.every((n,i)=>i===0||n>times[i-1]));
 for(const e of C.episodes){
  assert.equal(e.evidence.length,3,e.title+" needs three publicly inspectable exhibits");
  assert.equal(e.plans.length,3,e.title+" needs three decisions");
  assert.equal(e.signals.length,3,e.title+" needs three public statements");
  assert.equal(e.advice.length,6,e.title+" needs private adviser perspectives");
  assert.ok(e.learning.pearsonLO.length>=3&&e.learning.topic.length>=10&&e.learning.facilitatorPrompt.length>=20);
  assert.ok(e.plans.every(p=>p.benefits.length>=2 && p.spend>=0 && typeof p.fallout==="string" && p.fallout.length>40));
 }
});
test("1,000 independent seeded strategies preserve immutable bookkeeping and deterministic outcomes",()=>{
 let totalTransitions=0,negative=0, statuses=new Set();
 for(let seed=1;seed<=1000;seed++){
  let a=R.createTeam(0,"A"),b=R.createTeam(1,"B");
  let rng=seed>>>0;
  const variant=R.seedVariant("TEST-"+seed);
  for(let round=0;round<6;round++){
   rng=(Math.imul(rng,1664525)+1013904223)>>>0;
   const plan=(rng>>>8)%3;
   rng=(Math.imul(rng,1664525)+1013904223)>>>0;
   const signal=(rng>>>8)%3;
   a=R.applyTurn(a,round,plan,signal,[0,1],variant,zero);
   b=R.applyTurn(b,round,plan,signal,[0,1],variant,zero);
   totalTransitions++;
   assert.deepEqual(a.ledger,b.ledger,"Identical decisions need identical finances");
   assert.equal(a.cash,C.initialCash-a.ledger.reduce((sum,x)=>sum+x.amount,0));
   assert.equal(a.history.length,round+1);
   assert.equal(a.nextRound,round+1);
   assert.ok(Object.values(a.risks).every(n=>n>=10&&n<=95));
  }
  if(a.cash<0)negative++;
  const evaluation=R.evaluate(a);
  assert.ok(evaluation.score>=0&&evaluation.score<=100);
  statuses.add(evaluation.status);
 }
 assert.equal(totalTransitions,6000);
 assert.ok(statuses.size>=3,"The scenario must not produce identical result categories");
 assert.ok(negative>0&&negative<400,"The choices should create a real but not inevitable liquidity risk");
});
test("the same team cannot charge a decision twice or act out of sequence",()=>{
 const input=R.createTeam(0,"TEAM");
 const round1=R.applyTurn(input,0,1,0,[0,2],0,zero);
 assert.equal(input.cash,C.initialCash,"Pure engine must not mutate input");
 assert.throws(()=>R.applyTurn(round1,0,1,0,[0,2],0,zero),/Episode already committed/);
 assert.throws(()=>R.applyTurn(input,3,1,0,[0,2],0,zero),/out of order/);
 assert.throws(()=>R.applyTurn(input,0,1,0,[0,0],0,zero),/Exactly two different advisers/);
 assert.throws(()=>R.applyTurn(input,0,4,0,[0,2],0,zero),/Invalid strategic choice/);
});
test("the invitation contains a credible physical cap, and future sponsorship never enters the cash ledger",()=>{
 const e=C.episodes[0];
 assert.match(e.brief,/320/);
 assert.match(e.brief,/1,100/);
 assert.match(C.episodes[4].brief,/not.*cash/i);
 let team=R.createTeam(0,"A");
 for(let round=0;round<6;round++)team=R.applyTurn(team,round,0,0,[0,1],0,zero);
 assert.equal(team.cash,C.initialCash-team.ledger.reduce((sum,x)=>sum+x.amount,0));
 assert.ok(!team.ledger.some(x=>x.amount<0||/sponsor.*income|renewal.*income/i.test(x.label)));
});
