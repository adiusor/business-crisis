"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
require("../src/content.js");
require("../src/rules.js");
const C=globalThis.BCContent, R=globalThis.BCRules;
const keys=["legal","ops","workforce","customer","liquidity"];
const zero={amount:0,route:null};
const play=(plans,signals,variant=0,allocations={})=>{
 let t=R.createTeam(0,"PROJECT SPARK");
 for(let i=0;i<6;i++)t=R.applyTurn(t,i,plans[i],signals[i],[0,1],variant,allocations[i]||zero);
 return t;
};

test("Project Spark replaces the restructuring story with a complete six-stage opportunity",()=>{
 assert.deepEqual(C.episodes.map(x=>x.id),["invitation","people","partner","spotlight","reality","final"]);
 assert.deepEqual(C.episodes.map(x=>x.time),["09:17","10:06","11:24","13:12","15:40","17:30"]);
 assert.deepEqual(C.episodes.map(x=>x.title),[
  "THE INVITATION","THE PEOPLE BEHIND THE PLAN","THE PARTNER DEAL",
  "THE SPOTLIGHT","THE REALITY CHECK","THE FINAL CALL"]);
 assert.equal(C.initialCash,260000);
 assert.equal(C.annualContractValue,240000);
 assert.equal(C.advisers.length,6);
 assert.equal(C.variants.length,3);
 assert.match(C.episodes[0].brief,/Project Spark/);
 assert.match(C.episodes[5].brief,/No pilot has been awarded/);
 assert.doesNotMatch(JSON.stringify(C),/restructur|redundan|layoffs|leaked memo|forensic|unknown sender/i);
});

test("each scene has the evidence, genuine options and communication required for group play",()=>{
 const names=[];
 for(const [i,e] of C.episodes.entries()){
  assert.equal(e.number,String(i+1).padStart(2,"0"));
  for(const field of ["title","kicker","brief","headline","question","pressure"])
   assert.ok(typeof e[field]==="string"&&e[field].length>=10,e.id+": "+field);
  assert.match(e.question,/\?/);
  assert.ok(e.pressure.length<=150);
  assert.equal(e.evidence.length,3);
  assert.equal(e.advice.length,6);
  assert.equal(e.plans.length,3);
  assert.equal(e.signals.length,3);
  for(const x of e.evidence)for(const key of ["type","time","title","body","clue"])
   assert.ok(typeof x[key]==="string"&&x[key].length>=4);
  for(const text of e.advice)assert.ok(text.length>=25);
  for(const p of e.plans){
   names.push(p.name);
   assert.ok(p.desc.length>=20&&p.cost.length>=10);
   assert.ok(p.benefits.length>=2);
   assert.ok(Number.isInteger(p.spend)&&p.spend>=0);
   assert.ok(Object.keys(p.delta).length>=2);
   assert.ok(Object.keys(p.delta).every(k=>keys.includes(k)));
  }
  for(const sig of e.signals){
   names.push(sig.name);
   assert.ok(sig.line.length>=15);
   assert.ok(Object.keys(sig.delta).length>0);
   assert.ok(Object.keys(sig.delta).every(k=>keys.includes(k)));
  }
 }
 assert.equal(new Set(names).size,names.length,"Names must distinguish responses");
});

test("the six emotional beats are narratively motivated",()=>{
 const e=C.episodes;
 assert.match(e[0].evidence[0].body,/shortlist|pilot|proposal/i);
 assert.match(e[1].question,/people/);
 assert.match(e[2].brief,/supplier/i);
 assert.match(e[3].brief,/teaser/i);
 assert.match(e[4].evidence[0].body,/network|connection/i);
 assert.match(e[5].question,/six weeks/i);
 assert.match(e[5].evidence[1].body,/No award decision/);
});

test("no plan or public statement strictly dominates an alternative on every simulated dimension",()=>{
 const cost=x=>x.spend||0,commit=x=>x.delay?.cost||0,trust=x=>x.trust||0;
 const risks=(x,k)=>x.delta?.[k]||0;
 const better=(a,b)=>cost(a)<=cost(b)&&commit(a)<=commit(b)&&trust(a)>=trust(b)&&keys.every(k=>risks(a,k)<=risks(b,k));
 const strict=(a,b)=>cost(a)<cost(b)||commit(a)<commit(b)||trust(a)>trust(b)||keys.some(k=>risks(a,k)<risks(b,k));
 for(const ep of C.episodes)for(const kind of ["plans","signals"])
  for(const a of ep[kind])for(const b of ep[kind])
   if(a!==b)assert.ok(!(better(a,b)&&strict(a,b)),ep.title+" "+a.name+" dominates "+b.name);
});

test("all plan and message alternatives affect the model on at least one realistic trajectory",()=>{
 const baselines=[
  {p:[0,0,0,0,0,0],s:[0,0,0,0,0,0],v:0},
  {p:[1,1,1,1,1,1],s:[1,1,1,1,1,1],v:1},
  {p:[2,2,2,2,2,2],s:[2,2,2,2,2,2],v:2},
  {p:[0,1,2,0,1,2],s:[2,1,0,2,1,0],v:1},
  {p:[2,1,0,2,1,0],s:[0,1,2,0,1,2],v:2}
 ];
 const state=t=>JSON.stringify({cash:t.cash,trust:t.trust,risks:t.risks,pending:t.pending});
 for(let round=0;round<6;round++)for(const kind of ["plans","signals"])for(let option=0;option<3;option++){
  const changes=baselines.some(b=>{
   const pp=b.p.slice(),ss=b.s.slice(),baseline=state(play(pp,ss,b.v));
   if(kind==="plans")pp[round]=option;else ss[round]=option;
   return baseline!==state(play(pp,ss,b.v));
  });
  assert.ok(changes,C.episodes[round].title+" "+kind+" "+option+" should affect a feasible trajectory");
 }
});

test("cash and deferred-commitment ledger remain authoritative across 1200 seeded games",()=>{
 let negative=0,ready=0;
 for(let n=0;n<1200;n++){
  let t=R.createTeam(n%4,"TEAM "+n);
  let seed=(n+1)>>>0;
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%3;};
  for(let round=0;round<6;round++){
   const p=n%7===0?1:n%7===1?0:rand(),s=n%7===0?1:n%7===1?0:rand();
   const a=[2,4].includes(round)&&n%4!==0?
    {amount:(n%2+1)*10000,route:["audit","capacity","people"][n%3]}:zero;
   t=R.applyTurn(t,round,p,s,[0,5],n%3,a);
   assert.equal(t.cash,C.initialCash-t.ledger.reduce((sum,x)=>sum+x.amount,0));
   assert.equal(t.history.length,round+1);
   assert.equal(t.nextRound,round+1);
   assert.ok(t.pending.every(x=>x.due>round+1&&x.due<=7));
   assert.ok(Object.values(t.risks).every(x=>x>=10&&x<=95));
  }
  const outcome=R.evaluate(t);
  assert.ok(outcome.score>=0&&outcome.score<=100);
  assert.ok(["BOARD_READY","CONDITIONAL","AT RISK","LOST"].includes(outcome.status));
  negative+=+(t.cash<0);ready+=+(outcome.status==="BOARD_READY");
 }
 assert.ok(negative>0&&ready>0,"Calibration samples must explore both hard and strong outcomes");
});

test("consequence bridges reflect actual prior decisions, including timeouts and financial pressure",()=>{
 const start=R.createTeam(0,"TEAM");
 assert.equal(R.storyContext(start,0),null);
 const a=R.applyTurn(start,0,0,0,[0,1],0,zero);
 const b=R.applyTurn(start,0,1,1,[0,1],0,zero);
 assert.match(R.storyContext(a,1).lead,/evidence-first/);
 assert.match(R.storyContext(b,1).lead,/three-site vision/);
 assert.notEqual(R.storyContext(a,1).lead,R.storyContext(b,1).lead);
 assert.match(b.history[0].fallout,/three-location/);
 const c=R.applyTimeout(start,0,0);
 assert.match(R.storyContext(c,1).lead,/did not file a response/);
 let broke=R.createTeam(1,"BROKE");
 broke.cash=5000;
 broke=R.applyTurn(broke,0,0,1,[0,1],0,zero);
 assert.ok(broke.cash<0);
 assert.match(broke.history[0].fallout,/cannot authorise the unfunded portion/);
 assert.doesNotMatch(broke.history[0].fallout,/partner welcomes a clear/i);
});

test("three credible final strategic approaches can reach board readiness in the fictional model",()=>{
 const results=[0,1,2].map(()=>({ready:0,max:0}));
 for(let n=0;n<729;n++){
  let m=n,t=R.createTeam(0,"TEAM"),last=0;
  for(let r=0;r<6;r++){const p=m%3;m=Math.floor(m/3);if(r===5)last=p;t=R.applyTurn(t,r,p,0,[0,1],0,zero);}
  const o=R.evaluate(t);
  results[last].ready+=+(o.status==="BOARD_READY");
  results[last].max=Math.max(results[last].max,o.score);
 }
 for(const [i,x] of results.entries()){
  assert.ok(x.ready>=10,"Board-ready route needed for final option "+i);
  assert.ok(x.max>=75,"High score possible for final option "+i);
 }
});

test("score components reconcile with visible reserve and delayed obligations",()=>{
 for(let variant=0;variant<3;variant++){
  const t=play([0,1,2,0,1,2],[2,0,1,2,0,1],variant,{
   2:{amount:10000,route:"audit"},4:{amount:20000,route:"capacity"}
  });
  const o=R.evaluate(t),b=o.scoreBreakdown;
  const expected=b.base-b.riskPenalty+b.trustEffect-b.liquidityPenalty-b.commitmentPenalty-
   b.cashPenalty-b.customerPenalty-b.operationsPenalty-b.reservePenalty;
  assert.ok(Math.abs(expected-b.unrounded)<0.06);
  assert.equal(o.score,b.economicScore);
  assert.equal(t.cash,C.initialCash-t.ledger.reduce((sum,x)=>sum+x.amount,0));
  const unpaid=t.pending.reduce((sum,x)=>sum+x.cost,0),coverage=t.cash-unpaid;
  const liquidity=R.clamp(Math.round(22+Math.max(0,C.initialCash-coverage)/C.initialCash*65+(t.cash<0?10:0)),18,95);
  assert.equal(t.risks.liquidity,liquidity);
 }
});

test("the boardroom never invents a signed Project Spark award",()=>{
 const t=play([0,0,0,0,0,0],[0,0,0,0,0,0]);
 const o=R.evaluate(t);
 assert.ok(o.status);
 assert.doesNotMatch(JSON.stringify({history:t.history,outcome:o}),/has signed|was awarded|contract signed|guaranteed income/i);
 assert.equal(R.championshipResult([t,{...t,id:1,name:"OTHER"}]).leader.team.name,"PROJECT SPARK");
});
test("all six Project Spark chapters supply a purposeful public collaboration prompt",()=>{
 const prompts=C.episodes.map(ep=>ep.teamPrompt);
 assert.equal(prompts.length,6);
 assert.equal(new Set(prompts).size,6);
 for(const [i,p] of prompts.entries()){
  assert.equal(typeof p,"string",C.episodes[i].title+" prompt missing");
  assert.ok(p.length>=65&&p.length<=190,C.episodes[i].title+" prompt length");
  assert.doesNotMatch(p,/correct answer|highest scoring|choose plan [0-9]|private ballot/i,
    "A discussion prompt must not instruct or reveal the secret winning plan");
 }
});


test("Episode 04's teaser tests recorded promises, not an arbitrary shared script",()=>{
 const setup=(plans,signals)=>{
  let t=R.createTeam(0,"TEAM");
  for(let i=0;i<3;i++)t=R.applyTurn(t,i,plans[i],signals[i],[0,1],0,zero);
  return t;
 };
 const paths=[
  {plans:[1,1,1],signals:[1,0,0],id:"ambition-fast"},
  {plans:[1,1,0],signals:[0,0,0],id:"ambition"},
  {plans:[2,1,0],signals:[2,0,0],id:"focused"},
  {plans:[0,0,0],signals:[0,0,0],id:"co-designed"},
  {plans:[0,1,2],signals:[0,0,0],id:"unverified"}
 ];
 const variants=[];
 for(const path of paths){
  const before=setup(path.plans,path.signals);
  const baseline=JSON.stringify(before);
  const surprise=R.spotlightTwist(before,3);
  assert.equal(surprise.id,path.id);
  assert.match(surprise.text,/teaser|public|visitor|partner/i);
  assert.ok(Object.keys(surprise.delta).length>=1);
  assert.equal(JSON.stringify(before),baseline,"Inspecting a callback must not mutate the team's state");
  assert.equal(R.spotlightTwist(before,2),null,"The surprise must not arrive in episode three");
  assert.equal(R.spotlightTwist(before,4),null,"Episode five cannot charge the same event twice");
  const after=R.applyTurn(before,3,0,0,[0,1],0,zero);
  assert.equal(after.history[3].spotlight.id,path.id);
  assert.match(after.history[3].fallout,/EARLIER PROMISES UNDER THE SPOTLIGHT/);
  assert.ok(after.history[3].fallout.includes(surprise.result));
  assert.equal(after.cash,C.initialCash-after.ledger.reduce((sum,x)=>sum+x.amount,0));
  assert.equal(after.nextRound,4);
  variants.push(surprise.text);
 }
 assert.equal(new Set(variants).size,5,"Each path has a distinct narrative pressure");
});

test("Episode 04 has real model consequences but never invents a cash expense or contract award",()=>{
 const make=(plans,signals)=>{
  let t=R.createTeam(0,"TEAM");
  for(let i=0;i<3;i++)t=R.applyTurn(t,i,plans[i],signals[i],[0,1],0,zero);
  return t;
 };
 const ambitious=make([1,1,1],[1,0,0]);
 // Compare counterfactual histories against the *same* economic state so the
 // observed difference is the spotlight callback alone, not earlier spending.
 const focused=JSON.parse(JSON.stringify(ambitious));
 focused.history[0].planIndex=2;
 focused.history[0].signalIndex=2;
 assert.equal(R.spotlightTwist(ambitious,3).id,"ambition-fast");
 assert.equal(R.spotlightTwist(focused,3).id,"focused");
 const a=R.applyTurn(ambitious,3,0,0,[0,1],0,zero);
 const b=R.applyTurn(focused,3,0,0,[0,1],0,zero);
 assert.equal(a.cash,b.cash,"The spotlight adds risk, not fictitious spend");
 assert.equal(a.ledger.length,b.ledger.length);
 assert.notEqual(a.risks.legal,b.risks.legal);
 assert.notEqual(a.trust,b.trust);
 assert.equal(a.pending.reduce((sum,x)=>sum+x.cost,0),b.pending.reduce((sum,x)=>sum+x.cost,0));
 assert.doesNotMatch(a.history[3].fallout,/has been awarded|contract signed/i);
});

test("Missed earlier response creates a distinct spotlight risk even on an episode-four timeout",()=>{
 let t=R.createTeam(0,"TEAM");
 t=R.applyTurn(t,0,0,0,[0,1],0,zero);
 t=R.applyTimeout(t,1,0);
 t=R.applyTurn(t,2,0,0,[0,1],0,zero);
 const surprise=R.spotlightTwist(t,3);
 assert.equal(surprise.id,"unanswered");
 assert.equal(surprise.trust,-2);
 const after=R.applyTimeout(t,3,0);
 assert.equal(after.history[3].spotlight.id,"unanswered");
 assert.equal(after.history[3].timedOut,true);
 assert.match(after.history[3].fallout,/EARLIER PROMISES UNDER THE SPOTLIGHT/);
 assert.equal(after.cash,C.initialCash-after.ledger.reduce((sum,x)=>sum+x.amount,0));
});


test("Episode 05 reacts to earlier supplier, staff, scope and reserve decisions",()=>{
 const setup=(plans,signals=[0,0,0,0])=>{
  let t=R.createTeam(0,"PROJECT SPARK");
  for(let i=0;i<4;i++)t=R.applyTurn(t,i,plans[i],signals[i],[0,1],0,zero);
  return t;
 };
 const routes=[
  {plans:[1,0,1,0],id:"fast-track"},
  {plans:[0,2,0,0],id:"supported-backup"},
  {plans:[0,0,2,0],id:"staff-offline"},
  {plans:[0,0,0,0],id:"verified-route"},
  {plans:[2,0,1,0],id:"focused-route"},
  {plans:[0,0,1,0],id:"single-point"},
  {plans:[1,2,0,0],signals:[2,0,0,0],id:"reserve-squeeze"}
 ];
 const observed=[];
 for(const entry of routes){
  const initial=setup(entry.plans,entry.signals);
  const snapshot=JSON.stringify(initial);
  const event=R.deliveryTest(initial,4);
  assert.equal(event.id,entry.id);
  assert.ok(event.text.length>70);
  assert.ok(event.result.length>70);
  assert.ok(["strong","managed","tight"].includes(event.reserveBand));
  assert.deepEqual(R.deliveryTest(initial,4),event,"Preview is deterministic");
  assert.equal(JSON.stringify(initial),snapshot,"Preview is pure");
  assert.equal(R.deliveryTest(initial,3),null,"Never charge at episode 04");
  assert.equal(R.deliveryTest(initial,5),null,"Never charge again at episode 06");
  const after=R.applyTurn(initial,4,0,0,[0,1],0,zero);
  assert.equal(after.history[4].delivery.id,event.id);
  assert.match(after.history[4].fallout,/THE REALITY CHECK REVISITS YOUR EARLIER DECISIONS/);
  assert.ok(after.history[4].fallout.includes(event.result));
  assert.equal(after.cash,C.initialCash-after.ledger.reduce((sum,x)=>sum+x.amount,0));
  assert.equal(after.nextRound,5);
  observed.push(event.id);
 }
 assert.equal(new Set(observed).size,7);
});

test("The delivery test changes risk/trust but never invents an expense or an awarded contract",()=>{
 let initial=R.createTeam(0,"PROJECT SPARK");
 for(const p of [1,0,1,0])initial=R.applyTurn(initial,initial.nextRound,p,0,[0,1],0,zero);
 const alternative=JSON.parse(JSON.stringify(initial));
 alternative.history[0].planIndex=2;
 alternative.history[2].planIndex=0;
 const aEvent=R.deliveryTest(initial,4),bEvent=R.deliveryTest(alternative,4);
 assert.notEqual(aEvent.id,bEvent.id);
 const a=R.applyTurn(initial,4,0,0,[0,1],0,zero);
 const b=R.applyTurn(alternative,4,0,0,[0,1],0,zero);
 assert.equal(a.cash,b.cash);
 assert.equal(a.ledger.length,b.ledger.length);
 assert.notDeepEqual(a.risks,b.risks);
 assert.notEqual(a.trust,b.trust);
 assert.equal(a.pending.reduce((t,x)=>t+x.cost,0),b.pending.reduce((t,x)=>t+x.cost,0));
 assert.doesNotMatch(a.history[4].fallout,/has been awarded|contract signed|guaranteed cash/i);
});

test("A missed response still triggers the episode-five delivery test only once",()=>{
 let t=R.createTeam(0,"PROJECT SPARK");
 for(let i=0;i<4;i++)t=i===1?R.applyTimeout(t,i,0):R.applyTurn(t,i,0,0,[0,1],0,zero);
 const event=R.deliveryTest(t,4);
 assert.equal(event.id,"missing-owner");
 assert.equal(event.trust,-2);
 const timeout=R.applyTimeout(t,4,0);
 assert.equal(timeout.history[4].delivery.id,event.id);
 assert.equal(timeout.history[4].timedOut,true);
 assert.match(timeout.history[4].fallout,/THE REALITY CHECK REVISITS YOUR EARLIER DECISIONS/);
 assert.equal(timeout.cash,C.initialCash-timeout.ledger.reduce((sum,x)=>sum+x.amount,0));
});
