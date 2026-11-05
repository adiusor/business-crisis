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
  for(const field of ["title","kicker","brief","headline","question","pressure"]){
   assert.equal(typeof e[field],"string");
   assert.ok(e[field].trim().length>=(field==="title"?5:10),e.id+" "+field);
  }
  assert.match(e.question,/\?/,"A chapter must pose a real dilemma, not a generic KPI statement");
  assert.ok(e.pressure.length<=135,"Pressure copy must remain scannable during a timed round");
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

test("14:00 renewal deadline is acknowledged without fabricating a decision or contractor shutdown",()=>{
 const client=C.episodes[2],press=C.episodes[3],operations=C.episodes[4];
 assert.match(client.brief,/14:00/);
 assert.ok(Number(press.time.slice(0,2))<14);
 assert.ok(Number(operations.time.slice(0,2))>14);
 assert.match(operations.brief,/14:00/);
 assert.match(operations.brief,/did not confirm renewal/);
 assert.doesNotMatch(operations.brief,/contractor disputes the shutdown/i);
 assert.match(operations.evidence[1].body,/supervised access/);
 assert.doesNotMatch(operations.evidence[1].body,/reinstatement/i);
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
 const falseCertainty=first.signals.find(x=>x.name==="SERVICE ASSURANCE");
 assert.ok(falseCertainty.delta.legal>0&&falseCertainty.delay.cost>0);
 const floor=C.episodes[1];
 assert.ok(floor.signals.find(x=>x.name==="PAUSE ROLE CHANGES").delta.legal>0);
 const client=C.episodes[2];
 assert.ok(client.plans.find(x=>x.name==="COMMIT TO RECOVERY").delay.cost>0);
 const operation=C.episodes[4];
 assert.ok(operation.plans.find(x=>x.name==="REDEPLOY THE CREW").delta.ops<0 && operation.plans.find(x=>x.name==="REDEPLOY THE CREW").delta.customer>0);
 const close=C.episodes[5];
 assert.ok(close.signals.find(x=>x.name==="BUILD MOMENTUM").delay.cost>0);
});


test("The 09:17 Challenge presents three defensible strategic options per scene, not cartoon villains",()=>{
 const disallowed=/PULL THE PLUG|THREATEN ACTION|PROMISE EVERYTHING|SIGN THE GUARANTEE|NO IMPACT/;
 const names=C.episodes.flatMap(e=>[...e.plans.map(p=>p.name),...e.signals.map(x=>x.name)]);
 assert.ok(names.every(name=>!disallowed.test(name)));
 assert.equal(new Set(names).size,names.length,"Every decision and statement should be distinguishable");
 assert.match(C.episodes[0].question,/trust/i);
 assert.match(C.episodes[1].question,/engage/i);
 assert.match(C.episodes[2].question,/confidence/i);
 assert.match(C.episodes[4].question,/supporting/i);
 assert.match(C.episodes[5].question,/invest/i);
 const boundaries=C.episodes[3].plans[2];
 assert.equal(boundaries.name,"PROTECT CONFIDENTIALITY");
 assert.ok(boundaries.delta.legal<0 && boundaries.delta.customer>0,
  "Privacy protection improves legal exposure but has a credible communication trade-off");
 const assurance=C.episodes[0].signals[2];
 assert.equal(assurance.name,"SERVICE ASSURANCE");
 assert.ok(assurance.delay.cost>0 && assurance.delta.legal>0,
  "An optimistic assurance has a bounded contingent cost, not a free bonus");
});

test("story respects fatigued staff and makes recovery trade-offs coherent",()=>{ const work=C.episodes[4],p=work.plans.find(x=>x.name==="REDEPLOY THE CREW"); assert.match(work.evidence[2].body,/unsafe/);assert.match(p.desc,/rested/);assert.ok(p.delay.cost>0);assert.match(C.episodes[0].plans[1].delay.label,/Controlled access/);assert.match(C.episodes[2].brief,/service milestones/);});

test("every business choice has a genuine quantified trade-off, not a strictly dominated alternative",()=>{
 const levers=["legal","ops","workforce","customer","liquidity"];
 const cost=x=>x.spend||0,commitment=x=>x.delay?.cost||0,trust=x=>x.trust||0;
 const risks=(x,key)=>x.delta?.[key]||0;
 const weaklyBetter=(a,b)=>cost(a)<=cost(b)&&commitment(a)<=commitment(b)&&
  trust(a)>=trust(b)&&levers.every(key=>risks(a,key)<=risks(b,key));
 const strictlyBetter=(a,b)=>cost(a)<cost(b)||commitment(a)<commitment(b)||
  trust(a)>trust(b)||levers.some(key=>risks(a,key)<risks(b,key));
 for(const e of C.episodes)for(const type of ["plans","signals"]){
   for(const a of e[type])for(const b of e[type]){
     if(a===b)continue;
     assert.ok(!(weaklyBetter(a,b)&&strictlyBetter(a,b)),
       e.title+": "+a.name+" strictly dominates "+b.name+" in "+type);
   }
 }
});
test("every strategic or statement alternative changes model state on at least one representative trajectory",()=>{
 const baselines=[
  {plans:[0,0,0,0,0,0],signals:[0,0,0,0,0,0],variant:0},
  {plans:[1,1,1,1,1,1],signals:[1,1,1,1,1,1],variant:1},
  {plans:[2,2,2,2,2,2],signals:[2,2,2,2,2,2],variant:2},
  {plans:[0,1,2,0,1,2],signals:[2,1,0,2,1,0],variant:1},
  {plans:[2,1,0,2,1,0],signals:[0,1,2,0,1,2],variant:2}
 ];
 const run=(plans,signals,variant)=>{
  let team=R.createTeam(0,"AUDIT");
  for(let round=0;round<6;round++)
    team=R.applyTurn(team,round,plans[round],signals[round],[0,1],variant,{amount:0,route:null});
  assert.equal(team.cash,C.initialCash-team.ledger.reduce((sum,x)=>sum+x.amount,0));
  const o=R.evaluate(team);
  return JSON.stringify({cash:team.cash,trust:team.trust,risks:team.risks,
   pending:team.pending,score:o.score,status:o.status});
 };
 // Clamps are intentional: one response can have no marginal impact on an
 // already-clamped metric. A valid test needs different starting trajectories.
 for(let round=0;round<6;round++){
  for(const kind of ["plans","signals"]){
   for(let choice=0;choice<3;choice++){
    const changes=baselines.some(base=>{
      if(base[kind][round]===choice)return false;
      const plans=[...base.plans],signals=[...base.signals];
      const normal=run(plans,signals,base.variant);
      if(kind==="plans")plans[round]=choice;
      else signals[round]=choice;
      return normal!==run(plans,signals,base.variant);
    });
    assert.ok(changes,"No economic impact in any tested trajectory: "+
      C.episodes[round].title+" "+kind+" "+C.episodes[round][kind][choice].name);
   }
  }
 }
});
