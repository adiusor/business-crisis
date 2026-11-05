(function(g){
"use strict";
// The preview deliberately uses the exact same deterministic BCCreateRules engine
// that powers the original incident. It is NOT a real-time multi-device room.
const C=g.BCLearningContent;
const R=g.BCCreateRules(C);
const X=g.BCLearningExperience;
const KEY="bip-opening-night-preview-v1";
const TEAMS=["THE SPARKS","TEAM HORIZON","THE MAKERS","THE WILD CARDS"];
const MODES={
 social:{label:"Team Building",focus:"A playful shared challenge. Learning prompts are optional.",debrief:"What made your team laugh, listen or change direction?"},
 classroom:{label:"Classroom",focus:"An experiential case linked to Pearson HND Business Unit 20. Not an official assessment.",debrief:"Which theory supports your choice? What evidence would challenge your interpretation?"},
 learning:{label:"Leadership",focus:"Team decisions, motivation, communication and negotiation with a facilitated debrief.",debrief:"How did authority, employee voice and evidence shape your result?"}
};
const $=id=>document.getElementById(id);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>"£"+Number(n).toLocaleString("en-GB");
let session=null;
let screen="intro";
let active=-1;
let notice="";
let draft={advisers:[],revealed:false,plan:-1,signal:-1,allocation:{amount:0,route:null}};
function freshDraft(){draft={advisers:[],revealed:false,plan:-1,signal:-1,allocation:{amount:0,route:null}};}
function save(){try{sessionStorage.setItem(KEY,JSON.stringify({session,screen,active,draft}));}catch(_){}}
function clearSaved(){try{sessionStorage.removeItem(KEY)}catch(_){}}
function restore(){
 try{const v=JSON.parse(sessionStorage.getItem(KEY)||"null");
  if(!v?.session||!Array.isArray(v.session.teams)||v.session.teams.length<2||v.session.teams.length>4)return;
  if(!MODES[v.session.mode]||!Number.isInteger(v.session.round)||v.session.round<0||v.session.round>5)return;
  if(!v.session.teams.every((t,i)=>t?.economic?.history?.length<=6&&t?.name===TEAMS[i]))return;
  session=v.session;screen=["team","play","recap","final"].includes(v.screen)?v.screen:"team";
  active=Number.isInteger(v.active)?v.active:-1;
  if(v.draft&&Array.isArray(v.draft.advisers))draft={...draft,...v.draft,allocation:v.draft.allocation||{amount:0,route:null}}; 
 }catch(_){}
}
function setScreen(s){screen=s;save();render();}
function h2(s){return '<h2 id="current-heading" tabindex="-1">'+s+'</h2>';}
function top(){
 if(!session)return "";
 return '<div class="steps" aria-label="Six episodes">'+C.episodes.map((e,i)=>
  '<span class="'+(i===session.round?"on":"")+'">'+String(i+1).padStart(2,"0")+' / '+esc(e.title)+'</span>').join("")+'</div>';
}
function begin(){
 const n=Math.max(2,Math.min(4,Number($("team-count")?.value)||2));
 const mode=Object.prototype.hasOwnProperty.call(MODES,$("mode")?.value)?$("mode").value:"classroom";
 session={mode,round:0,teams:TEAMS.slice(0,n).map((name,i)=>({name,economic:R.createTeam(i,name),locked:false,advisers:[]}))};
 freshDraft();active=-1;notice="Your room is ready. Choose the first team.";setScreen("team");
}
function intro(){
 return '<section class="hero"><p class="eyebrow">BUSINESS IN PLAY / ORIGINAL EDUCATIONAL CASE / EXPERIMENTAL</p>'+
 '<h1 class="title">Business is better<br><em>when it is played.</em></h1>'+
 '<p class="lead">One opening night. Six connected decisions. Different teams, different outcomes. Experience leadership, motivation, marketing and negotiation through an original fictional story.</p>'+
 '<div class="hero-art" role="img" aria-label="Stylised poster for the Fieldwork House opening night"><span class="shape">FIELD</span><div class="disk">OPEN<br>NIGHT</div><span class="shape">WORK</span></div>'+
 '<div class="row gap"><span class="chip">No login</span><span class="chip">2–4 teams</span><span class="chip">One shared screen</span><span class="chip">Six original scenes</span></div>'+
 '<div class="panel"><p class="eyebrow">START A LOCAL DEMO IN SECONDS</p>'+
 '<label for="mode">Session purpose</label><select id="mode"><option value="social">Team-building / entertainment</option><option value="classroom" selected>Business class / seminar</option><option value="learning">Leadership development</option></select>'+
 '<label for="team-count">Number of teams</label><select id="team-count"><option value="2">2 teams</option><option value="3">3 teams</option><option value="4">4 teams</option></select>'+
 '<p class="small subtle">Every team takes a turn on this device. This is not the Cloudflare multiplayer room. No room code or secret is necessary.</p>'+
 '<div class="row gap"><button type="button" class="primary" data-action="start">START THE EXPERIENCE</button></div></div>'+
 '<p class="small subtle">This original prototype shares the deterministic cash/risk/consequence engine with the 09:17 Incident. Its economics are illustrative; its learning design has not been academically validated.</p></section>';
}
function teamPicker(){
 const ep=C.episodes[session.round];
 let cards=session.teams.map((t,i)=>{
  const h=t.economic.history;
  return '<button type="button" class="choice" data-action="team" data-index="'+i+'" '+(t.locked?"disabled":"")+'><span class="eyebrow">TEAM '+(i+1)+' · '+(t.locked?"RESPONSE LOCKED":"READY TO PLAY")+'</span><strong>'+esc(t.name)+'</strong>'+
    '<small>'+ (t.locked?"Waiting for the others":h.length?"Cash "+money(t.economic.cash)+" · "+h.length+" scene(s) completed":"Tap to choose this team and begin")+'</small></button>';
 }).join("");
 const how=session.mode==="classroom"?"After each scene, use the teacher's reflection question.":session.mode==="learning"?"The facilitator can pause to discuss why teams disagreed.":"Play the episode, discuss with friends and own the outcome.";
 return top()+'<section class="section"><span class="eyebrow">SCENE '+(session.round+1)+' / SIX · '+esc(ep.time)+'</span>'+h2("Who is making the next move?")+
 '<p class="lead">'+esc(ep.headline)+'</p><p class="subtle">'+esc(how)+'</p><div class="grid2">'+cards+'</div>'+
 (notice?'<p class="status" role="status">'+esc(notice)+'</p>':"")+
 '<p class="small subtle">Choose a team above. Only that team sees its two selected advisers. No account creation, no team password and no invitation link.</p>'+
 '<div class="row gap"><button class="secondary" data-action="restart">RESTART SESSION</button></div></section>';
}
function itemExhibits(ep){
 return '<div class="exhibits">'+ep.evidence.map((x,i)=>'<details class="exhibit"><summary><span class="label">SOURCE '+(i+1)+' · '+esc(x.type)+' · '+esc(x.time)+'</span><br><strong>'+esc(x.title)+'</strong></summary><p>'+esc(x.body)+'</p><p><b>What it tells you:</b> '+esc(x.clue)+'</p></details>').join("")+'</div>';
}
function collaboration(ep){
 const b=X[ep.id];
 return '<section class="panel" aria-label="Team collaboration challenge"><div class="row"><p class="eyebrow">'+esc(b.act)+'</p><span class="chip">GROUP DISCUSSION / 60 SECONDS</span></div>'+
 '<h3>'+esc(b.intro)+'</h3><div class="grid2">'+b.roles.map((r,i)=>
 '<blockquote class="exhibit"><p class="eyebrow">'+esc(r[0])+'</p><p>'+esc(r[1])+'</p></blockquote>').join("")+'</div>'+
 '<p class="hint"><b>Before voting:</b> '+esc(b.challenge)+'</p>'+
 '<p class="small subtle">Different arguments are encouraged. There is no bonus for guessing a predetermined textbook answer.</p></section>';
}
function investmentMarkup(){
 if(![2,4].includes(session.round))return "";
 const a=draft.allocation||{amount:0,route:null};
 const amount=[0,10000,20000].map(n=>'<button type="button" class="secondary" data-action="amount" data-index="'+n+'" aria-pressed="'+(a.amount===n)+'">'+(n===0?"KEEP CASH":money(n))+'</button>').join("");
 const routes=a.amount===0?"":'<div class="grid3">'+R.allocations.map(r=>
   '<button type="button" class="choice" data-action="route" data-route="'+esc(r.id)+'" aria-pressed="'+(a.route===r.id)+'"><span class="eyebrow">EXTRA RESOURCE</span><strong>'+esc(r.name)+'</strong><small>Fund a real extra commitment; it changes the game engine&#39;s risk and trust indices.</small></button>').join("")+'</div>';
 return '<section class="panel"><p class="eyebrow">TACTICAL RESOURCE ALLOCATION / OPTIONAL</p>'+
 '<h3>Would you invest part of your remaining response fund?</h3>'+
 '<p class="subtle">This expense is applied exactly once by the same economic engine used in the original game. Spending more does not automatically mean winning.</p>'+
 '<div class="row gap">'+amount+'</div>'+routes+'</section>';
}
function play(){
 if(active<0||active>=session.teams.length){screen="team";return teamPicker();}
 const t=session.teams[active],ep=C.episodes[session.round],beat=X[ep.id];
 const previous=t.economic.history.at(-1);
 const echo=previous?'<div class="notes"><p class="eyebrow">PREVIOUSLY, YOUR TEAM CHOSE '+esc(previous.plan)+'</p><p>'+esc(previous.fallout)+'</p><p class="small subtle">The economic consequences of that choice are already in your cash, risk and commitments.</p></div>':"";
 const cards=C.advisers.map((a,i)=>'<button class="choice" type="button" data-action="adviser" data-index="'+i+'" aria-pressed="'+draft.advisers.includes(i)+'" '+(draft.revealed?"disabled":"")+'><span class="eyebrow">'+esc(a.role)+'</span><strong>'+esc(a.name)+'</strong><small>'+esc(a.line)+'</small></button>').join("");
 const selections=draft.advisers.length;
 const dossier=draft.revealed?'<div class="notes" aria-label="Confidential adviser notes"><p class="eyebrow">TWO PRIVATE TEAM PERSPECTIVES</p>'+draft.advisers.map(i=>'<p><b>'+esc(C.advisers[i].name)+':</b> '+esc(ep.advice[i])+'</p>').join("")+'</div>':"";
 const decisions=draft.revealed?'<h3>Choose one strategy</h3><div class="grid3">'+ep.plans.map((x,i)=>
  '<button type="button" class="choice" data-action="plan" data-index="'+i+'" aria-pressed="'+(i===draft.plan)+'"><span class="eyebrow">ROUTE 0'+(i+1)+'</span><strong>'+esc(x.name)+'</strong><small>'+esc(x.desc)+'</small><small>'+x.benefits.map(esc).join(" · ")+'</small><small class="cost">'+money(x.spend)+' · '+esc(x.cost)+'</small></button>').join("")+'</div>'+
 '<h3>'+esc(beat.label)+'</h3><p class="subtle">'+esc(beat.spotlight)+'</p><div class="grid3">'+ep.signals.map((x,i)=>
  '<button type="button" class="choice" data-action="signal" data-index="'+i+'" aria-pressed="'+(i===draft.signal)+'"><span class="eyebrow">STATEMENT 0'+(i+1)+'</span><strong>'+esc(x.name)+'</strong><small>'+esc(x.line)+'</small></button>').join("")+'</div>'+
 investmentMarkup()+
 '<div class="row gap"><button type="button" class="primary" data-action="lock" '+(draft.plan<0||draft.signal<0||(draft.allocation?.amount>0&&!draft.allocation?.route)?"disabled":"")+'>LOCK '+esc(t.name)+' RESPONSE</button><button type="button" class="secondary" data-action="change-advisers">CHANGE ADVISERS</button></div>':"";
 return top()+'<section class="section"><div class="row"><span class="eyebrow">TEAM '+(active+1)+': '+esc(t.name)+'</span><span class="time">'+esc(ep.time)+'</span><span class="chip">'+money(t.economic.cash)+' REMAINING</span></div>'+
 '<h1 class="title">'+esc(ep.title)+'</h1><p class="lead">'+esc(ep.brief)+'</p>'+
 '<div class="two"><div><p class="eyebrow">THE EVIDENCE / OPEN ANY SOURCE</p>'+itemExhibits(ep)+'</div>'+
 '<div class="panel"><p class="eyebrow">YOUR DECISION</p><h3>'+esc(ep.question)+'</h3><p>'+esc(ep.pressure)+'</p>'+
 '<div class="metric"><span>Available event fund</span><strong>'+money(t.economic.cash)+'</strong></div>'+
 '<div class="metric"><span>Annual sponsorship</span><strong>NOT CASH</strong></div>'+
 (session.mode!=="social"?'<p class="hint"><b>Learning focus:</b> '+esc(ep.learning.topic)+'. '+esc(ep.learning.pearsonLO)+'</p>':"")+
 '</div></div>'+echo+collaboration(ep)+'<h3>Consult exactly two perspectives</h3><p class="subtle">Select the advice you believe will change your decision. You cannot open every briefing.</p>'+
 '<div class="grid3">'+cards+'</div><p class="status">'+selections+' of 2 selected. '+(draft.revealed?"Briefings revealed.":"Change your selection before revealing.")+'</p>'+
 (!draft.revealed?'<div class="row gap"><button class="primary" data-action="reveal" '+(selections!==2?"disabled":"")+'>REVEAL TWO BRIEFINGS</button><button class="secondary" data-action="back-teams">BACK TO TEAMS</button></div>':"")+
 dossier+decisions+'</section>';
}
function recap(){
 const ep=C.episodes[session.round];
 const result=session.teams.map(t=>{
  const last=t.economic.history[session.round],prior=t.economic.history[session.round-1];
  const delta=t.economic.cash-(prior?prior.cash:C.initialCash);
  return '<article class="panel"><p class="eyebrow">'+esc(t.name)+'</p><h3>'+esc(last.plan)+'</h3><p>'+esc(last.fallout)+'</p>'+
  '<div class="metric"><span>Event cash</span><strong>'+money(t.economic.cash)+'</strong></div>'+
  '<div class="metric"><span>Cost this scene</span><strong>'+money(-delta)+'</strong></div>'+
  '<div class="metric"><span>Trust index</span><strong>'+t.economic.trust+'/100</strong></div>'+
  '<p class="small subtle">Response or negotiation tactic: '+esc(last.signal)+'</p>'+
  (last.allocation?'<p class="small"><b>Extra resource:</b> '+money(last.allocation.amount)+' · '+esc(last.allocation.route)+'</p>':"")+
  (last.paidDeferred?.length?'<p class="small"><b>Earlier commitments paid:</b> '+esc(last.paidDeferred.join("; "))+'</p>':"")+
  '<p class="small subtle">Pending liabilities: '+money(last.pendingLiability)+'</p></article>';
 }).join("");
 const previousCondition=session.round===1&&session.teams.some(t=>t.economic.history[0]?.plan==="KEEP THE HYPE")?
  '<p class="hint">Delayed story consequence: teams that kept the ambiguous invitation alive entered the staff discussion with an avoidable trust problem. Their earlier response remains in the ledger.</p>':
  session.round===4&&session.teams.some(t=>t.economic.history[3]?.plan==="PUT THE SPONSOR FIRST")?
   '<p class="hint">Earlier sponsor-control decisions shaped the negotiation context. The final finance and risk states still come from the shared engine.</p>':"";
 return top()+'<section class="section"><p class="eyebrow">THE AFTERMATH / SCENE '+(session.round+1)+'</p>'+
 h2("Different decisions. Different consequences.")+'<p class="lead">'+esc(ep.headline)+'</p><div class="grid2">'+result+'</div>'+
 previousCondition+'<p class="hint"><b>Next in the story:</b> '+esc(X[ep.id].next)+'</p>'+
 '<div class="debrief"><p class="eyebrow">REFLECTION / '+esc(session.mode.toUpperCase())+'</p>'+
 '<h3>One question worth discussing</h3><p>'+esc(session.mode==="social"?MODES.social.debrief:ep.learning.facilitatorPrompt)+'</p>'+
 '<p class="small subtle">A fictional team score does not measure individual leadership competence.</p></div>'+
 '<div class="row gap"><button class="primary" data-action="next">'+(session.round===5?"VIEW THE FINAL VERDICT":"START NEXT SCENE")+'</button></div></section>';
}
function final(){
 const ranked=R.rankTeams(session.teams.map(t=>t.economic)),leader=ranked[0];
 const every=ranked.map((x,i)=>'<article class="panel"><span class="eyebrow">RANK '+(i+1)+' · '+esc(x.team.name)+'</span>'+
 '<h3>'+x.outcome.score+' / 100</h3>'+
 '<div class="metric"><span>Available cash</span><b>'+money(x.team.cash)+'</b></div>'+
 '<div class="metric"><span>Trust index</span><b>'+x.team.trust+'/100</b></div>'+
 '<div class="metric"><span>Outstanding commitments</span><b>'+money(x.outcome.unpaid)+'</b></div>'+
 '<p>'+esc(x.outcome.reasons.join(" "))+'</p></article>').join("");
 return '<section class="section"><p class="eyebrow">FIELDWORK HOUSE / THE FINAL CHAPTER</p>'+
 '<h1 class="title">What your team <em>made possible.</em></h1>'+
 '<p class="lead">The doors opened. The mystery behind the unclear invitation has a mundane but useful explanation: the wrong draft was published from the scheduler. It was a missed handover, not a villain. The real story is what happened when people had to work together.</p>'+
 '<div class="leader"><p class="eyebrow">HIGHEST SIMULATED PERFORMANCE</p><div class="winner">'+esc(leader.team.name)+'</div>'+
 '<p>'+leader.outcome.score+' / 100 · An illustrative comparison, not a diagnosis of real leadership skill.</p></div>'+
 '<div class="report">'+every+'</div>'+
 '<div class="debrief"><p class="eyebrow">DEBRIEF / '+esc(MODES[session.mode].label)+'</p>'+
 '<h3>Move from play to insight</h3><p>'+esc(MODES[session.mode].debrief)+'</p>'+
 '<p>Which evidence changed your mind? Which trade-off did you underestimate? How would you act differently next time?</p>'+
 '<p class="small subtle">Mapping: Pearson HND Business Unit 20 learning outcomes, plus conceptual links to negotiation, marketing and operations. Not Pearson or Harvard endorsed; not a formal academic assessment.</p></div>'+
 '<div class="row gap"><button class="primary" data-action="download">DOWNLOAD SESSION SUMMARY</button><button class="secondary" data-action="restart">PLAY AGAIN</button></div></section>';
}
function render(){
 const html=screen==="intro"?intro():screen==="team"?teamPicker():screen==="play"?play():screen==="recap"?recap():final();
 $("app").innerHTML=html;save();
 const h=$("app").querySelector("#current-heading,h1,h2");
 if(h){h.setAttribute("tabindex","-1");h.focus({preventScroll:true});}
}
function reset(){
 // No named user records or cookies: only a local fictional team-state snapshot.
 clearSaved();session=null;screen="intro";active=-1;freshDraft();notice="";render();
}
function lock(){
 const t=session.teams[active];
 if(draft.advisers.length!==2||!draft.revealed||draft.plan<0||draft.signal<0)return;
 if(draft.allocation?.amount>0&&!draft.allocation?.route)return;
 if(t.locked)return;
 try{t.economic=R.applyTurn(t.economic,session.round,draft.plan,draft.signal,draft.advisers,R.seedVariant("OPENING-NIGHT"),draft.allocation||{amount:0,route:null});
  t.locked=true;t.advisers=draft.advisers.slice();active=-1;freshDraft();notice=t.name+" has locked its decision.";
  if(session.teams.every(x=>x.locked)){setScreen("recap");}
  else setScreen("team");
 }catch(error){notice="Could not commit the decision: "+error.message;render();}
}
function next(){
 if(!session.teams.every(t=>t.locked))return;
 if(session.round===5){setScreen("final");return;}
 session.round++;
 session.teams.forEach(t=>{t.locked=false;t.advisers=[]});
 active=-1;freshDraft();notice="A new episode is ready.";setScreen("team");
}
function download(){
 const ranked=R.rankTeams(session.teams.map(t=>t.economic));
 const lines=["BUSINESS IN PLAY — OPENING NIGHT","Experimental teaching-case session; fictional business simulation","Mode: "+MODES[session.mode].label,"",...ranked.flatMap((x,i)=>
  ["#"+(i+1)+" "+x.team.name+" — Score "+x.outcome.score+"/100",
   "Cash "+money(x.team.cash)+"; Trust "+x.team.trust+"; Pending "+money(x.outcome.unpaid),
   ...x.team.history.map(h=>"Scene "+h.round+": "+h.plan+" | "+h.signal+" | "+h.fallout),""]) ,
  "Discussion only. Not a Pearson assessment, Harvard case, psychometric score, or proof of learning gains."];
 const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"});
 const url=URL.createObjectURL(blob);const link=document.createElement("a");
 link.href=url;link.download="business-in-play-opening-night-summary.txt";
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.addEventListener("click",event=>{
 const target=event.target.closest("[data-action]");if(!target||target.disabled)return;
 const a=target.dataset.action,i=Number(target.dataset.index);
 if(a==="start"){begin();return;}
 if(a==="restart"){if(!session||g.confirm("Restart the whole fictional session?"))reset();return;}
 if(!session)return;
 if(a==="team"){if(i<0||i>=session.teams.length||session.teams[i].locked)return;active=i;freshDraft();setScreen("play");return;}
 if(a==="back-teams"){active=-1;freshDraft();setScreen("team");return;}
 if(a==="adviser" && !draft.revealed){if(draft.advisers.includes(i))draft.advisers=draft.advisers.filter(x=>x!==i);
  else if(draft.advisers.length<2&&i>=0&&i<C.advisers.length)draft.advisers.push(i);
  render();return;}
 if(a==="reveal"){if(draft.advisers.length===2){draft.revealed=true;render();}return;}
 if(a==="change-advisers"){draft.revealed=false;draft.plan=-1;draft.signal=-1;render();return;}
 if(a==="plan"){if(i>=0&&i<3)draft.plan=i;render();return;}
 if(a==="signal"){if(i>=0&&i<3)draft.signal=i;render();return;}
 if(a==="amount"&&[2,4].includes(session.round)){if([0,10000,20000].includes(i)){draft.allocation={amount:i,route:null};render();}return;}
 if(a==="route"&&[2,4].includes(session.round)&&draft.allocation?.amount>0){const route=target.dataset.route;if(R.allocations.some(x=>x.id===route)){draft.allocation.route=route;render();}return;}
 if(a==="lock"){lock();return;}
 if(a==="next"){next();return;}
 if(a==="download"){download();return;}
});
restore();render();
})(globalThis);