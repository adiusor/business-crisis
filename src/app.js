(function(g){
"use strict";
const C=g.BCContent,R=g.BCRules,A=g.BCArt,KEY="business-crisis-cinematic-v2";
const root=document.getElementById("app");
function fresh(){return {phase:"intro",teamCount:2,names:["TEAM ALPHA","TEAM BRAVO","TEAM CHARLIE","TEAM DELTA"],teams:[],round:0,teamIndex:0,viewed:[],opened:null,selected:[],plan:null,signal:null,allocation:{amount:0,route:null},timeline:[],timelineSolved:false,variant:0,seed:"",sound:false};}
let s=fresh();
let lastRenderedPhase=null;
try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved&&Array.isArray(saved.teams)&&typeof saved.phase==="string"&&saved.round>=0&&saved.round<=6&&saved.teams.length<=4&&saved.teamCount>=2&&saved.teamCount<=4){s=Object.assign(fresh(),saved);s.opened=null;}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}}
function esc(v){return String(v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function money(v){return (v<0?"−":"")+"£"+Math.abs(v).toLocaleString("en-GB");}
function ep(){return C.episodes[Math.min(s.round,5)];}
function currentTeam(){return s.teams[s.teamIndex];}
function last(){const t=currentTeam();return t.history[t.history.length-1];}
function sceneName(){return ["intro","lobby"].includes(s.phase)?"mail":ep().scene;}
function button(action,text,cls,disabled){return '<button type="button" class="btn '+(cls||"")+'" data-action="'+action+'"'+(disabled?' disabled':'')+'>'+text+'</button>';}
function trail(){let a='<div class="episode-trail" aria-label="Episode '+(s.round+1)+' of six">';for(let i=0;i<6;i++)a+='<i class="'+(i<s.round?"past":i===s.round?"now":"")+'"></i>';return a+'</div>';}
function intro(){
return '<section class="intro"><div class="eyebrow">MONDAY / 09:17 / CONFIDENTIAL</div><h1 class="display">THE <em>09:17</em><br>INCIDENT</h1><p class="lead">Someone sent the restructuring memo to everyone. Including the clients. Now the company has six hours to decide what kind of business it wants to be.</p><p class="copy">One crisis. Six escalating episodes. Two sources of intelligence per decision. The championship requires a signed annual renewal, funded response and viable client delivery.</p><div class="action-line">'+button("lobby","ENTER THE CRISIS →","")+'<span class="small">2–4 competing teams · one shared screen · about 35–45 minutes with discussion</span></div><div class="footline"><span>£260,000 response fund</span><span>£240,000 annual client renewal at stake</span><span>Strategy / evidence / consequences</span></div></section>'+
'<aside class="intro-signal" aria-hidden="true"><div class="eyebrow">UNSENT / INTERNAL</div><strong>RESTRUCTURING</strong><p class="to">TO: ALL STAFF + EXTERNAL CLIENTS</p><p>Strictly confidential. Do not distribute.</p><div class="stamp">SENT 09:17</div></aside><div class="clock-watermark" aria-hidden="true">09:17</div>';
}
function lobby(){
let rows="";for(let i=0;i<s.teamCount;i++)rows+='<div class="roster-row"><div class="roster-number">0'+(i+1)+'</div><label><span>TEAM CALLSIGN</span><input type="text" maxlength="32" data-team-name="'+i+'" value="'+esc(s.names[i])+'" aria-label="Team '+(i+1)+' name"></label></div>';
return '<section class="lobby-layout"><div><div class="eyebrow">THE WAR ROOM / TEAM FORMATION</div><h1 class="display-sm">CHOOSE<br>YOUR <em>SIDE.</em></h1><p class="lead">Every team faces the same facts. What changes is the advice you trust, the risks you accept and the promises you make.</p><p class="copy">Championship rule: secure the £240k annual renewal, keep the £260k response fund solvent and maintain viable operations. The highest score alone does not guarantee victory. This shared-screen prototype does not provide secure or phone-private adviser intelligence.</p>'+trail()+'</div><div class="roster-board"><div class="board-head"><strong>THE TEAMS</strong><div class="count-control"><button type="button" data-action="count-down" aria-label="Remove team">−</button><b>'+s.teamCount+'</b><button type="button" data-action="count-up" aria-label="Add team">+</button></div></div><div class="roster-list">'+rows+'</div><div class="small">Minimum 2 · Maximum 4 · No player accounts</div><div class="action-line">'+button("begin","OPEN THE INCIDENT →","")+'</div></div></section>';
}
function brief(){
const e=ep();return '<section class="brief-layout"><div class="brief-intro"><div class="eyebrow">EPISODE '+e.number+' / '+esc(e.time)+' / '+esc(e.kicker)+'</div><h1 class="display-sm">'+esc(e.title)+'</h1><p class="lead">'+esc(e.brief)+'</p>'+trail()+'<div class="action-line">'+button("evidence","INSPECT THE EVIDENCE →","")+'<span class="small">Three exhibits. Read the facts before you choose.</span></div></div><div class="memo"><div class="memo-meta"><span>BC / INCIDENT 0917</span><span>BOARD EYES ONLY</span></div><div class="eyebrow">SITUATION REPORT · '+esc(e.time)+'</div><h3>'+esc(e.headline)+'</h3><p>'+esc(e.brief)+'</p><p><strong>£260,000</strong> — original 90-day response fund<br><strong>£240,000 / YEAR</strong> — contract renewal value</p><div class="stamp">ACTION REQUIRED</div></div></section>';
}
function evidence(){
const e=ep();let objects=e.evidence.map(function(d,i){return '<button type="button" class="artifact" data-action="open-evidence" data-index="'+i+'"><span class="type">EXHIBIT 0'+(i+1)+' · '+esc(d.type)+'</span><span class="name">'+esc(d.title)+'</span><span class="time">'+esc(d.time)+'</span>'+(s.viewed.includes(i)?'<span class="reviewed">REVIEWED ✓</span>':'')+'</button>';}).join("");
let modal="";
if(s.opened!==null){const d=e.evidence[s.opened];modal='<div class="overlay" role="dialog" aria-modal="true" aria-label="'+esc(d.title)+'"><article class="overlay-sheet"><button class="close" type="button" data-action="close-evidence" aria-label="Close exhibit">×</button><div class="eyebrow">EVIDENCE / EXHIBIT 0'+(s.opened+1)+' / '+esc(d.time)+'</div><h2>'+esc(d.title)+'</h2><div class="mini">'+esc(d.type)+' · VERIFIED EXTRACT</div><p>'+esc(d.body)+'</p><div class="finding">KEY FINDING: '+esc(d.clue)+'</div><div class="action-line">'+button("close-evidence","RETURN TO THE DESK →","")+'</div></article></div>';}
return '<section><div class="evidence-top"><div class="eyebrow">EVIDENCE ROOM / EPISODE '+e.number+'</div><h1 class="display-sm">THE FACTS<br>ON THE <em>TABLE.</em></h1><p class="copy">Inspect each exhibit. Some details contradict what people think they know. None of them tells you what to do.</p></div><div class="evidence-table">'+objects+'</div><div class="evidence-progress"><div class="eyebrow">'+s.viewed.length+' / 3 EXHIBITS REVIEWED</div>'+button(s.round===0?"reconstruct":"handoff",s.round===0?"RECONSTRUCT THE TIMELINE →":"BRIEF THE TEAMS →","",s.viewed.length<3)+'</div></section>'+modal;
}
function reconstruct(){
const d=ep().evidence,order=[2,0,1],chosen=s.timeline||[],solved=s.timelineSolved;
let pieces=order.map(function(i){return '<button type="button" class="timeline-event" data-action="timeline-pick" data-index="'+i+'" '+(chosen.includes(i)?'disabled':'')+'><span class="eyebrow">EVIDENCE 0'+(i+1)+'</span><strong>'+esc(d[i].time)+'</strong><span>'+esc(d[i].title)+'</span></button>';}).join("");
let sequence=chosen.map(function(i,n){return '<div class="sequence-mark"><small>0'+(n+1)+'</small><b>'+esc(d[i].time)+'</b></div>';}).join("");
return '<section class="reconstruct"><div class="eyebrow">FORENSIC RECONSTRUCTION / INCIDENT 0917</div><h1 class="display-sm">PUT THE<br><em>MORNING BACK.</em></h1><p class="lead">The exhibits were recovered out of order. Select the three events in the sequence they actually happened. The timeline matters more than a suspect.</p><div class="timeline-grid">'+pieces+'</div><div class="timeline-sequence">'+sequence+'</div>'+(solved?'<div class="timeline-success">TIMELINE VERIFIED. Access preceded distribution; the client response followed. This establishes sequence, not guilt.</div>':chosen.length===3?'<div class="empty-note">That sequence does not match the evidence timestamps. Recheck the exhibits and try again.</div>':'<p class="small">Select earliest → latest. You can reset the reconstruction.</p>')+'<div class="action-line">'+button("timeline-reset","RESET TIMELINE","ghost")+button("handoff","BRIEF THE TEAMS →","",!solved)+'</div></section>';
}
function handoff(){
const t=currentTeam();return '<section class="turn-notice"><div class="turn-index">0'+(s.teamIndex+1)+'</div><div><div class="eyebrow">EPISODE '+ep().number+' / DECISION AUTHORITY</div><h1 class="turn-name">'+esc(t.name)+'</h1><p class="lead">Your team is on the clock. You can consult two specialists, choose a strategy and issue one public statement.</p><p class="turn-warning">Shared-screen prototype: other teams may see this information. Private phone-based multiplayer has not been implemented.</p><div class="action-line">'+button("advisers","ENTER THE INTELLIGENCE ROOM →","")+'</div></div></section>';
}
function advisers(){
let people=C.advisers.map(function(a,i){let yes=s.selected.includes(i);return '<button type="button" class="adviser" data-action="choose-adviser" data-index="'+i+'" aria-pressed="'+yes+'"><span class="portrait">'+A.portrait(i)+'</span><span class="bio"><strong>'+esc(a.name)+'</strong><small>'+esc(a.role)+'</small></span><span class="sealed">SEALED</span>'+(yes?'<span class="check">SELECTED</span>':'')+'</button>';}).join("");
return '<section><div class="adviser-intro"><div><div class="eyebrow">INTELLIGENCE ROOM / '+esc(currentTeam().name)+'</div><h1 class="display-sm">TWO VOICES.<br><em>ONE CALL.</em></h1></div><p class="copy">Six people know different parts of the truth. Select exactly two. You may change your choices until you confirm. The other four briefings remain sealed.</p></div><div class="adviser-wall">'+people+'</div><div class="consult-dock"><div class="consult-count">'+s.selected.length+' / 2 <span>SPECIALISTS SELECTED</span></div>'+button("intel","UNSEAL THE BRIEFINGS →","",s.selected.length!==2)+'</div></section>';
}
function intel(){
let files=s.selected.map(function(i){const a=C.advisers[i];return '<article class="intel-file"><div class="intel-head"><div class="portrait">'+A.portrait(i)+'</div><div><h3>'+esc(a.name)+'</h3><small>'+esc(a.role)+'</small></div></div><blockquote>“'+esc(ep().advice[i])+'”</blockquote><div class="signature">RELEASED TO '+esc(currentTeam().name)+'</div></article>';}).join("");
return '<section><div class="eyebrow">INTELLIGENCE UNSEALED / '+esc(currentTeam().name)+'</div><h1 class="display-sm">WHAT THEY <em>KNOW.</em></h1><p class="copy">This is the only specialist intelligence your team receives in this episode. Read carefully; the decision comes next.</p><div class="intel-layout">'+files+'</div><div class="action-line">'+button("decision","TAKE IT TO THE BOARD →","")+'</div></section>';
}
function decision(){
const e=ep(),t=currentTeam();let plans=e.plans.map(function(p,i){const yes=s.plan===i;return '<button type="button" class="plan" data-action="choose-plan" data-index="'+i+'" aria-pressed="'+yes+'"><span class="letter">'+String.fromCharCode(65+i)+'</span><span class="tag">'+esc(p.tag)+' / STRATEGIC RESPONSE</span><h3>'+esc(p.name)+'</h3><div class="desc">'+esc(p.desc)+'</div><div class="trade"><b>UPSIDE</b><br>'+esc(p.benefits.join(" · "))+'<br><br><b>THE PRICE</b><br>'+esc(p.cost)+'</div><div class="price">'+money(p.spend)+'</div>'+(yes?'<span class="chosen">SELECTED ✓</span>':'')+'</button>';}).join("");
return '<section><div class="decision-intro"><div class="eyebrow">THE BOARDROOM / '+esc(t.name)+' / '+esc(e.time)+'</div><h1 class="display-sm">THERE IS NO<br><em>PERFECT CALL.</em></h1><p class="lead">Choose a response. Every option solves something and puts something else at risk.</p></div><div class="plans">'+plans+'</div><div class="commit-strip"><div><div class="mini">REMAINING RESPONSE CASH</div><div class="money">'+money(t.cash)+'</div><div class="small">Mandatory operating costs of '+money(e.base)+' also apply this episode.</div></div>'+button("signal",[2,4].includes(s.round)?"ALLOCATE RECOVERY FUNDS →":"SET THE PUBLIC MESSAGE →","",s.plan===null)+'</div></section>';
}
function allocation(){
const a=s.allocation||{amount:0,route:null};
const options=R.allocations.map(function(x){return '<button type="button" class="allocation-route" data-action="choose-route" data-route="'+esc(x.id)+'" aria-pressed="'+(a.route===x.id)+'"><span class="eyebrow">RESPONSE CHANNEL</span><strong>'+esc(x.name)+'</strong><small>'+esc(x.id==="audit"?"Legal review and client assurance":x.id==="capacity"?"Delivery capacity and contingency":"Rest, training and staff recovery")+'</small></button>';}).join("");
return '<section><div class="eyebrow">RESOURCE ROOM / '+esc(currentTeam().name)+' / '+esc(ep().title)+'</div><h1 class="display-sm">EVERY POUND<br><em>HAS A JOB.</em></h1><p class="lead">Your strategy is already chosen. You may spend an additional £10k or £20k on one recovery channel—or hold the cash. Each allocation reduces a different exposure.</p><div class="allocation-board"><div><div class="eyebrow">01 / DISCRETIONARY AMOUNT</div><div class="allocation-amounts">'+[0,10000,20000].map(function(n){return '<button type="button" data-action="choose-amount" data-index="'+n+'" aria-pressed="'+(a.amount===n)+'">'+(n===0?"HOLD":money(n))+'</button>';}).join("")+'</div><p class="small">This is additional cash spending, not a transfer from the future client renewal.</p></div><div><div class="eyebrow">02 / WHERE THE MONEY GOES</div><div class="allocation-routes">'+options+'</div></div></div><div class="commit-strip"><div><div class="mini">ADDITIONAL CASH COMMITMENT</div><div class="money">'+money(a.amount)+'</div></div>'+button("confirm-allocation","APPROVE ALLOCATION →","",a.amount>0&&!a.route)+'</div></section>';
}
function signal(){
const e=ep(),p=e.plans[s.plan];let options=e.signals.map(function(q,i){return '<button type="button" class="signal-choice" data-action="choose-signal" data-index="'+i+'" aria-pressed="'+(s.signal===i)+'"><strong>0'+(i+1)+' / '+esc(q.name)+'</strong><span>“'+esc(q.line)+'”</span></button>';}).join("");
const preview=s.signal===null?"Select a statement to preview what your company will say.":e.signals[s.signal].line;
return '<section><div class="eyebrow">THE MICROPHONE IS LIVE / '+esc(currentTeam().name)+'</div><h1 class="display-sm">WORDS HAVE<br><em>CONSEQUENCES.</em></h1><div class="signal-layout"><div><p class="copy">Your strategy is <strong>'+esc(p.name)+'</strong>. Now choose what the company will say. A bold promise can help today and become a liability tomorrow.</p><div class="signal-options">'+options+'</div></div><aside class="teleprompter"><div class="eyebrow">OFFICIAL STATEMENT / PREVIEW</div><blockquote>“'+esc(preview)+'”</blockquote><div class="redline">BOARD AUTHORISED / NOT YET RELEASED</div></aside></div><div class="commit-strip"><div><div class="mini">STRATEGY COST + MANDATORY RESPONSE</div><div class="money">'+money(p.spend+e.base+(s.allocation?s.allocation.amount:0))+'</div><div class="small">Existing deferred obligations may also fall due.</div></div>'+button("commit","COMMIT THIS DECISION →","",s.signal===null)+'</div></section>';
}
function fallout(){
const t=currentTeam(),h=last(),e=ep(),pending=t.pending.reduce((x,y)=>x+y.cost,0),dueNote=h.paidDeferred.length?" Earlier promises now payable: "+h.paidDeferred.join("; ")+".":"";
return '<section class="fallout-layout"><article class="newspaper"><div class="mast"><span>THE CRISIS WIRE</span><span>'+esc(e.time)+' / EDITION 0'+(s.round+1)+'</span></div><h2>'+esc(h.plan)+'</h2><div class="subhead">'+esc(t.name)+' issues its response as the situation develops.</div><p class="body">'+esc(h.fallout+dueNote)+'</p><p class="body"><strong>THE PUBLIC RECORD:</strong> “'+esc(e.signals[h.signalIndex].line)+'”</p><div class="byline">DECISION FILED / EPISODE '+e.number+'</div></article><aside><div class="eyebrow">AFTERMATH / '+esc(t.name)+'</div><h2 class="display-sm" style="font-size:55px">THE<br><em>COST.</em></h2><div class="ledger-slip"><h3>RESPONSE RECEIPT</h3><div class="ledger-line"><span>Opening response fund</span><b>'+money(C.initialCash)+'</b></div><div class="ledger-line"><span>This episode’s spending</span><b>−'+money(h.roundSpent)+'</b></div><div class="ledger-line"><span>All spending to date</span><b>−'+money(C.initialCash-t.cash)+'</b></div><div class="ledger-line"><span>Unpaid future commitments</span><b>'+money(pending)+'</b></div><div class="mini" style="margin-top:20px">CASH STILL AVAILABLE</div><div class="ledger-total">'+money(t.cash)+'</div><p class="small">The annual client contract is not cash in the response fund. Pending commitments are disclosed separately.</p></div><div class="action-line">'+button("advance",s.teamIndex<s.teams.length-1?"PASS TO NEXT TEAM →":"REVEAL ROUND FALLOUT →","")+'</div></aside></section>';
}
function roundup(){
const e=ep();let rows=s.teams.map(function(t,i){const h=t.history[s.round];return '<div class="roundup-row"><div class="num">0'+(i+1)+'</div><div><h3>'+esc(t.name)+'</h3><p>'+esc(h.plan)+' · '+esc(h.signal)+'</p></div><div class="cash">'+money(t.cash)+'<small>CASH LEFT</small></div></div>';}).join("");
return '<section class="roundup-layout"><div class="eyebrow">EPISODE '+e.number+' / THE COMPANY REACTS</div><h1 class="display-sm">ONE CRISIS.<br><em>DIFFERENT CALLS.</em></h1><p class="lead">The same facts. Different strategies. Some costs have already landed; other commitments will come due later.</p><div class="roundup-list">'+rows+'</div><p class="small">Cash is not the final score. The board will also judge customer exposure, operational continuity, workforce strain, legal risk and unpaid commitments.</p><div class="action-line">'+button("next-round",s.round===5?"ENTER THE FINAL BOARDROOM →":"CONTINUE THE CRISIS →","")+'</div></section>';
}
function verdict(){
const result=R.championshipResult(s.teams),ranked=result.ranked,leader=result.leader,champion=result.champion,ties=result.joint.length>1;
const verdictLabel=champion?(ties?"JOINT BOARDROOM CHAMPIONS":"BOARDROOM CHAMPION"):"NO BOARDROOM CHAMPION";
const verdictName=champion?result.joint.map(x=>x.team.name).join(" & "):"THE RENEWAL REMAINS UNSECURED";
const verdictScore=champion?champion.outcome.score+" / 100 · RENEWED":"0 TEAMS QUALIFIED";
const verdictNote=champion?("The annual client renewal was secured, the response fund stayed solvent and operations remained viable. "+(leader.team.id!==champion.team.id?leader.team.name+" had the highest performance score, but did not meet the championship conditions.":"")):("No team met all three conditions: renewed annual contract, nonnegative response cash and viable delivery. "+leader.team.name+" led the performance score with "+leader.outcome.score+"/100, but that is not a business victory.");
let ranks=ranked.map(function(x,i){const isChampion=!!champion&&result.joint.some(y=>y.team.id===x.team.id);const label=isChampion?" · BOARDROOM CHAMPION":i===0?" · HIGHEST PERFORMANCE SCORE":"";return '<div class="rank"><div class="place">'+(i+1)+'</div><div><h3>'+esc(x.team.name)+'</h3><div class="outcome">CLIENT RENEWAL: '+esc(x.outcome.status)+esc(label)+'</div></div><div class="score">'+x.outcome.score+'</div></div>';}).join("");
let cases=ranked.map(function(x){const t=x.team,o=x.outcome;let events=t.history.map(function(h){return '<div class="ledger-line"><span>0'+h.round+' / '+esc(h.plan)+'<br><small>'+esc(h.signal)+'</small></span><b>'+money(h.roundSpent)+'</b></div>';}).join("");let reasons=o.reasons.map(function(z){return '<p>• '+esc(z)+'</p>';}).join("");
return '<details class="case-file"><summary>'+esc(t.name)+' / OPEN THE CASE FILE</summary><div class="case-body"><div class="ledger-line"><span>Cash remaining</span><b>'+money(t.cash)+'</b></div><div class="ledger-line"><span>Unpaid contingent commitments</span><b>'+money(o.unpaid)+'</b></div><div class="ledger-line"><span>Client confidence</span><b>'+t.trust+' / 100</b></div><div class="ledger-line"><span>Legal / operational / workforce / customer exposure</span><b>'+t.risks.legal+' / '+t.risks.ops+' / '+t.risks.workforce+' / '+t.risks.customer+'</b></div><h3>THE DECISION TRAIL</h3>'+events+'<h3>WHY THIS RESULT</h3>'+reasons+'</div></details>';}).join("");
return '<section><div class="verdict-hero"><div class="eyebrow">17:45 / FINAL BOARD VERDICT</div><h1 class="display-sm">THE ROOM<br>HAS <em>DECIDED.</em></h1><div class="eyebrow">'+esc(verdictLabel)+'</div><div class="winner-name">'+esc(verdictName)+'</div><div class="winner-score">'+esc(verdictScore)+'</div><p class="lead">'+esc(verdictNote)+'</p></div><div class="rank-list">'+ranks+'</div><h2 class="display-sm" style="font-size:55px;margin-top:70px">THE CASE <em>FILES.</em></h2>'+cases+'<p class="risk-note">Illustrative business simulation, not a validated accounting forecast. This version is shared-screen only; phone-based multiplayer, host controls and payments are not implemented.</p><div class="action-line">'+button("reset","START A NEW CRISIS →","")+'</div></section>';
}
function render(){
const p=s.phase;const view={intro:intro,lobby:lobby,brief:brief,evidence:evidence,reconstruct:reconstruct,handoff:handoff,advisers:advisers,intel:intel,decision:decision,allocation:allocation,signal:signal,fallout:fallout,roundup:roundup,verdict:verdict}[p]||intro;
const animate=p!==lastRenderedPhase;
root.innerHTML='<div class="scene-wrap">'+A.scene(sceneName())+'</div><div class="veil"></div><div class="grain"></div><div class="edge-light"></div><header class="hud"><div class="mark">'+A.insignia()+'<span>BUSINESS CRISIS<small>THE 09:17 INCIDENT</small></span></div><div class="hud-right"><span class="case-id">CASE 0917 / '+(s.teams.length?"EP "+ep().number+" / "+esc(p.toUpperCase()):"PROTOTYPE V2")+'</span><button type="button" class="icon-button" data-action="sound" aria-label="'+(s.sound?"Mute sound":"Enable sound")+'" title="'+(s.sound?"Mute sound":"Enable sound")+'">'+(s.sound?"♪":"♫")+'</button></div></header><main class="view '+(animate?"enter":"")+'" id="view">'+view()+'</main>';
lastRenderedPhase=p;
save();
}
function phase(p){
 s.phase=p;s.opened=null;render();window.scrollTo(0,0);
 const h=root.querySelector(".view h1");
 if(h){h.setAttribute("tabindex","-1");h.focus({preventScroll:true});}
}
function closeExhibit(){
 const index=s.opened;if(index===null)return;
 s.opened=null;render();
 const opener=root.querySelector('[data-action="open-evidence"][data-index="'+index+'"]');
 if(opener)opener.focus({preventScroll:true});
}
function playSound(){if(!s.sound)return;try{const AC=g.AudioContext||g.webkitAudioContext;if(!AC)return;const ctx=new AC(),o=ctx.createOscillator(),gain=ctx.createGain();o.type="sine";o.frequency.setValueAtTime(440,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(310,ctx.currentTime+.12);gain.gain.setValueAtTime(.022,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.15);o.connect(gain);gain.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.16);o.onended=function(){ctx.close();};}catch(e){}}
function act(action,index){
if(action==="sound"){s.sound=!s.sound;render();return;}
playSound();
if(action==="lobby"){phase("lobby");return;}
if(action==="count-up"||action==="count-down"){s.teamCount=R.clamp(s.teamCount+(action==="count-up"?1:-1),2,4);render();return;}
if(action==="begin"){const names=s.names.slice(0,s.teamCount).map(x=>String(x||"").trim());if(names.some(n=>!n||n.length>32)||new Set(names.map(n=>n.toLowerCase())).size!==names.length){alert("Enter a unique name for each team (1–32 characters).");return;}s.teams=names.map((n,i)=>R.createTeam(i,n));s.seed="BC-"+Date.now().toString(36);s.variant=R.seedVariant(s.seed);s.round=0;s.teamIndex=0;s.viewed=[];s.selected=[];s.plan=null;s.signal=null;s.allocation={amount:0,route:null};phase("brief");return;}
if(action==="evidence"){s.viewed=[];phase("evidence");return;}
if(action==="open-evidence"){if(!Number.isInteger(index)||index<0||index>2)return;s.opened=index;if(!s.viewed.includes(index))s.viewed.push(index);render();const close=root.querySelector('[data-action="close-evidence"]');if(close)close.focus();return;}
if(action==="close-evidence"){closeExhibit();return;}
if(action==="reconstruct"&&s.viewed.length===3&&s.round===0){s.timeline=[];s.timelineSolved=false;phase("reconstruct");return;}
if(action==="timeline-pick"&&s.phase==="reconstruct"){if(!s.timeline.includes(index)&&s.timeline.length<3){s.timeline.push(index);if(s.timeline.length===3)s.timelineSolved=s.timeline.join(",")==="1,0,2";render();}return;}
if(action==="timeline-reset"){s.timeline=[];s.timelineSolved=false;render();return;}
if(action==="handoff"&&s.viewed.length===3&&(s.round!==0||s.timelineSolved)){s.teamIndex=0;s.selected=[];s.plan=null;s.signal=null;s.allocation={amount:0,route:null};phase("handoff");return;}
if(action==="advisers"){s.selected=[];phase("advisers");return;}
if(action==="choose-adviser"){if(!Number.isInteger(index)||index<0||index>=6)return;const j=s.selected.indexOf(index);if(j>=0)s.selected.splice(j,1);else if(s.selected.length<2)s.selected.push(index);render();return;}
if(action==="intel"&&s.selected.length===2){phase("intel");return;}
if(action==="decision"){phase("decision");return;}
if(action==="choose-plan"){if(!Number.isInteger(index)||index<0||index>=3)return;s.plan=index;render();return;}
if(action==="signal"&&s.plan!==null){if([2,4].includes(s.round)){s.allocation={amount:0,route:null};phase("allocation");}else phase("signal");return;}
if(action==="choose-amount"){if(![0,10000,20000].includes(index))return;s.allocation.amount=index;render();return;}
if(action==="choose-route"){if(!R.allocations.some(x=>x.id===String(index)))return;s.allocation.route=String(index);render();return;}
if(action==="confirm-allocation"&&(s.allocation.amount===0||s.allocation.route)){phase("signal");return;}
if(action==="choose-signal"){if(!Number.isInteger(index)||index<0||index>=3)return;s.signal=index;render();return;}
if(action==="commit"&&s.plan!==null&&s.signal!==null){try{s.teams[s.teamIndex]=R.applyTurn(currentTeam(),s.round,s.plan,s.signal,s.selected,s.variant,s.allocation);phase("fallout");}catch(err){alert("The decision could not be committed: "+err.message);}return;}
if(action==="advance"){if(s.teamIndex<s.teams.length-1){s.teamIndex++;s.selected=[];s.plan=null;s.signal=null;phase("handoff");}else phase("roundup");return;}
if(action==="next-round"){if(s.round===5){phase("verdict");}else{s.round++;s.teamIndex=0;s.viewed=[];s.selected=[];s.plan=null;s.signal=null;phase("brief");}return;}
if(action==="reset"){if(!confirm("Start a new crisis? This will replace the current local session."))return;const sound=s.sound;s=fresh();s.sound=sound;phase("intro");return;}
}
root.addEventListener("click",function(e){
 const b=e.target.closest("button[data-action]");if(!b||b.disabled)return;
 const action=b.dataset.action,index=b.dataset.route!==undefined?b.dataset.route:b.dataset.index===undefined?null:Number(b.dataset.index);
 const before=s.phase;
 act(action,index);
 // A selected option redraws the view: keep keyboard focus on the same control.
 if(s.phase===before&&s.opened===null&&action!=="close-evidence"&&action!=="open-evidence"&&!root.contains(b)){
  const replacement=Array.from(root.querySelectorAll("button[data-action]")).find(x=>x.dataset.action===action&&
   (b.dataset.index===undefined||x.dataset.index===b.dataset.index)&&
   (b.dataset.route===undefined||x.dataset.route===b.dataset.route));
  if(replacement&&!replacement.disabled)replacement.focus({preventScroll:true});
 }
});
root.addEventListener("input",function(e){const i=e.target;if(i.matches("input[data-team-name]")){s.names[Number(i.dataset.teamName)]=i.value;save();}});
document.addEventListener("keydown",function(e){
 if(s.opened===null)return;
 if(e.key==="Escape"){e.preventDefault();closeExhibit();return;}
 if(e.key!=="Tab")return;
 const controls=Array.from(root.querySelectorAll(".overlay button:not([disabled])"));
 if(!controls.length)return;
 const first=controls[0],last=controls[controls.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});
render();
})(globalThis);
