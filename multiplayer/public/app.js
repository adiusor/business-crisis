(function(){
"use strict";
const app=document.getElementById("app"),notice=document.getElementById("notice");
const params=new URLSearchParams(location.search);
let mode=params.get("mode")||"home",code=(params.get("room")||"").toUpperCase().trim();
let names=["TEAM ALPHA","TEAM BRAVO"],snapshot=null,content=null,selection=[],plan=null,signal=null,amount=0,route="audit",advice=null,adviceRound=-1,localRound=-1,busy=false,lastSignature="";
const money=n=>(n<0?"−":"")+"£"+Math.abs(n).toLocaleString("en-GB");
const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const getStore=k=>{try{return localStorage.getItem(k)||"";}catch{return "";}};
const setStore=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
const hostToken=()=>getStore("bc:host:"+code),playerToken=()=>getStore("bc:player:"+code);
const link=(m)=>location.origin+"/?room="+encodeURIComponent(code)+"&mode="+m;
function nav(m,c){mode=m;code=c||code;history.replaceState(null,"","/?room="+encodeURIComponent(code)+"&mode="+m);}
function button(action,label,kind,disabled){return '<button class="btn '+(kind||"")+'" data-action="'+action+'"'+(disabled?" disabled":"")+'>'+label+'</button>';}
function title(kicker,heading,sub){return '<div class="eyebrow">'+kicker+'</div><h1>'+heading+'</h1>'+(sub?'<p class="lead">'+sub+'</p>':"");}
function progress(round){let s='<div class="progress" aria-label="Episode '+(round+1)+' of six">';for(let i=0;i<6;i++)s+='<i class="'+(i<=round?"done":"")+'"></i>';return s+"</div>";}
function flash(message,error){notice.textContent=message;notice.className="notice"+(error?" error":"");notice.hidden=false;clearTimeout(flash.timer);flash.timer=setTimeout(()=>{notice.hidden=true;},5000);}
async function api(path,method,body,token){
 const headers={};if(body!==undefined)headers["content-type"]="application/json";
 if(token)headers.authorization="Bearer "+token;
 const res=await fetch(path,{method:method||"GET",headers,body:body===undefined?undefined:JSON.stringify(body),cache:"no-store"});
 let data;try{data=await res.json();}catch{throw Error("Unexpected server response");}
 if(!res.ok)throw Error(data.error||"Request failed");
 return data;
}
function renderHome(){
 app.innerHTML='<section class="hero"><div class="hero-copy">'+title("CONFIDENTIAL / MONDAY 09:17","THE <em>09:17</em><br>INCIDENT","A restructuring memo has reached 600 employees and three clients. The board needs answers. Your teams have six escalating episodes to survive.")+'<p class="copy">Real-time team room · private adviser briefings · one host · separate projector view.</p><div class="actions">'+button("create-mode","HOST A NEW INCIDENT →")+button("join-mode","JOIN A TEAM","ghost")+'</div></div><div class="memo-art" aria-hidden="true"><div class="eyebrow">UNSENT / INTERNAL</div><strong>RESTRUCTURING</strong><div class="line"></div><div class="line"></div><div class="line short"></div><div class="stamp">SENT / 09:17</div></div></section>';
}
function renderCreate(){
 let fields=names.map((n,i)=>'<div class="field-group"><label class="field-label" for="team-'+i+'">TEAM 0'+(i+1)+'</label><input id="team-'+i+'" data-name="'+i+'" maxlength="32" value="'+esc(n)+'" autocomplete="off"></div>').join("");
 app.innerHTML='<section>'+title("WAR ROOM / SESSION SETUP","ASSEMBLE<br>THE <em>TEAMS.</em>","Each team needs at least one player. The host controls the incident; teams make private decisions on their own devices.")+'<div class="split"><div class="panel"><div class="eyebrow">01 / CALLSIGNS</div>'+fields+'<div class="actions">'+button("add-team","+ ADD TEAM","ghost",names.length>=4)+button("remove-team","− REMOVE TEAM","ghost",names.length<=2)+'</div></div><div class="panel"><div class="eyebrow">02 / RULES OF ENGAGEMENT</div><div class="dossier"><strong>£260,000</strong><p>Shared starting conditions; each team manages its own 90-day response fund.</p></div><div class="dossier"><strong>£240,000 / YEAR</strong><p>Client renewal value. It is not emergency cash.</p></div><div class="dossier"><strong>SIX EPISODES</strong><p>Choose two advisers, agree a response, issue a statement and live with the consequences.</p></div><div class="actions">'+button("create","CREATE SECURE ROOM →")+'</div></div></div></section>';
}
function renderJoin(){
 const room=snapshot;
 if(!room){app.innerHTML='<section>'+title("TEAM ACCESS / JOIN","ENTER THE<br><em>WAR ROOM.</em>","Enter the eight-character incident code from your facilitator.")+'<div class="panel"><label class="field-label" for="room-code">INCIDENT CODE</label><input id="room-code" maxlength="8" autocomplete="off" placeholder="XXXXXXXX"><div class="actions">'+button("lookup","FIND ROOM →")+'</div></div></section>';return;}
 const selectedTeam=Number(params.get("team")||0);
 const options=room.teams.map(t=>'<option value="'+t.id+'" '+(t.id===selectedTeam?"selected":"")+'>'+esc(t.name)+'</option>').join("");
 app.innerHTML='<section>'+title("PRIVATE ACCESS / "+esc(code),"PICK YOUR<br><em>SIDE.</em>","Join the incident with a nickname. No account is required.")+'<div class="split"><div class="panel"><div class="eyebrow">IDENTIFY YOUR TEAM</div><div class="field-group"><label class="field-label" for="join-team">TEAM</label><select id="join-team">'+options+'</select></div><div class="field-group"><label class="field-label" for="join-invite">PRIVATE TEAM INVITATION</label><input id="join-invite" maxlength="16" autocomplete="off" value="'+esc(params.get("invite")||"")+'" placeholder="Invite code from host"></div><div class="field-group"><label class="field-label" for="nickname">NICKNAME</label><input id="nickname" maxlength="24" autocomplete="nickname" placeholder="Your callsign"></div><div class="actions">'+button("join","ENTER THE WAR ROOM →")+'</div></div><div class="panel"><div class="eyebrow">SESSION STATUS</div><div class="phase"><strong>'+esc(room.phase.toUpperCase())+'</strong><span class="micro">EPISODE '+(room.round+1)+' / 06</span></div><p class="copy">Adviser briefings are released only to your team after your two selections are confirmed.</p></div></div></section>';
}
function roster(teams,phase,host){
 return '<div class="roster">'+teams.map(t=>{
 const ready=phase==="intel"?t.advisersReady:phase==="decision"?t.voteReady:phase==="lobby"?t.players.length>0:true;
 const label=phase==="lobby"?(host?t.players.length+" player(s) connected":t.players+" player(s) connected"):phase==="intel"?(ready?"ADVISERS CONFIRMED":"INTELLIGENCE PENDING"):phase==="decision"?(ready?"DECISION LOCKED":"DECISION PENDING"):phase==="reveal"||phase==="finished"?"RESULT REGISTERED":"AWAITING HOST";
 const result=t.result?'<div class="receipt"><span>RESPONSE FUND</span><b>'+money(t.result.cash)+'</b></div><div class="receipt"><span>BOARD SCORE</span><b>'+t.result.score+'</b></div>':"";
 return '<article class="team-card"><div class="eyebrow">TEAM 0'+(t.id+1)+'</div><h3>'+esc(t.name)+'</h3><div class="status '+(ready?"ready":"")+'">'+esc(label)+'</div>'+result+'</article>';
 }).join("")+'</div>';
}
function renderHost(){
 const s=snapshot,e=s.episode;
 let action="",allReady=false;
 if(s.phase==="lobby"){allReady=s.teams.every(t=>t.players.length>0);action=button("start","START THE INCIDENT →","",!allReady);}
 if(s.phase==="intel"){allReady=s.teams.every(t=>t.advisersReady);action=button("open-decisions","OPEN THE BOARDROOM →","",!allReady);}
 if(s.phase==="decision"){allReady=s.teams.every(t=>t.voteReady);action=button("resolve","REVEAL THE CONSEQUENCES →","",!allReady);}
 if(s.phase==="reveal")action=button("advance",s.round===5?"CONVENE THE FINAL BOARD →":"NEXT EPISODE →");
 const invites=s.teams.map(t=>'<details class="dossier"><summary><strong>'+esc(t.name)+'</strong> / PRIVATE QR + LINK</summary><div class="split"><div><img class="qr" src="/api/rooms/'+code+'/qr?team='+t.id+'&invite='+encodeURIComponent(t.invite)+'" width="180" height="180" alt="Private QR invitation for '+esc(t.name)+'"></div><div><p class="micro">Show this QR only to members of '+esc(t.name)+'.</p><button class="btn ghost" data-action="copy-team" data-team="'+t.id+'">COPY TEAM INVITE</button></div></div></details>').join("");
 const phaseLabel={lobby:"ASSEMBLING THE TEAMS",intel:"SEALED INTELLIGENCE",decision:"THE BOARDROOM DECIDES",reveal:"CONSEQUENCES UNSEALED",finished:"FINAL BOARDROOM VERDICT"}[s.phase];
 app.innerHTML='<section>'+title("FACILITATOR CONTROL / "+esc(code),s.phase==="finished"?"THE <em>VERDICT.</em>":"CONTROL<br>THE <em>CRISIS.</em>",'You set the pace. Team choices are locked on their devices and resolved by the server.')+progress(s.round)+'<div class="split"><div class="panel"><div class="eyebrow">ROOM CODE / SHARE WITH PLAYERS</div><div class="join-code">'+esc(code)+'</div><div class="actions"><a class="btn ghost" href="'+esc(link("projector"))+'" target="_blank" rel="noopener">OPEN PROJECTOR ↗</a></div><div class="eyebrow" style="margin-top:22px">PRIVATE TEAM LINKS / SHARE SEPARATELY</div>'+invites+'</div><div class="panel"><div class="eyebrow">EPISODE 0'+(s.round+1)+' / '+esc(e.time)+'</div><div class="phase"><strong>'+esc(phaseLabel)+'</strong><p class="copy">'+esc(e.title)+'</p></div><div class="actions">'+action+'</div><p class="micro">'+(allReady?"ALL TEAMS READY TO PROCEED":"Waiting for the teams to complete this stage.")+'</p></div></div>'+roster(s.teams,s.phase,true)+(s.finale?renderFinale(s.finale):"")+'</section>';
}
function renderFinale(f){
 return '<section class="panel paper"><div class="eyebrow">BOARDROOM / FINAL FINDINGS</div><h2>'+(f.champion?"CHAMPION: "+esc(f.champion):"NO BOARDROOM CHAMPION")+'</h2><p>Highest performance score: '+esc(f.leader||"—")+'. The championship requires a renewed contract, solvent response fund and viable operations.</p>'+f.ranked.map((r,i)=>'<div class="receipt"><span>0'+(i+1)+' / '+esc(r.name)+' / '+esc(r.status)+'</span><b>'+r.score+' PTS</b></div>').join("")+'</section>';
}
function renderProjector(){
 const s=snapshot,e=s.episode;
 const labels={lobby:"THE WAR ROOM OPENS",intel:"THE ADVISERS ARE BEING CHOSEN",decision:"DECISIONS ARE BEING SEALED",reveal:"THE COST OF YOUR CHOICES",finished:"THE BOARD HAS REACHED A VERDICT"};
 app.innerHTML='<section class="projector"><div class="clock" aria-hidden="true">'+esc(e.time)+'</div><div class="eyebrow">LIVE PROJECTOR / INCIDENT '+esc(code)+' / EPISODE 0'+(s.round+1)+'</div><h1>'+esc(labels[s.phase])+'</h1><p class="lead">'+esc(s.phase==="lobby"?"Players join using room code "+code:e.headline)+'</p>'+progress(s.round)+roster(s.teams,s.phase,false)+(s.finale?renderFinale(s.finale):"")+'</section>';
}
function evidence(e){return '<div class="panel"><div class="eyebrow">CASE EVIDENCE / VERIFIED EXTRACTS</div>'+e.evidence.map((d,i)=>'<details class="dossier"><summary><strong>EXHIBIT 0'+(i+1)+' / '+esc(d.title)+'</strong></summary><p>'+esc(d.body)+'</p><p><b>FINDING:</b> '+esc(d.clue)+'</p></details>').join("")+'</div>';}
function advisersUI(s){
 const picks=s.team.selected.length?s.team.selected:selection;
 const cards=content.advisers.map((a,i)=>'<button class="choice '+(picks.includes(i)?"selected":"")+'" data-action="pick" data-index="'+i+'" aria-pressed="'+picks.includes(i)+'"><span class="num">SOURCE 0'+(i+1)+' / SEALED</span><strong>'+esc(a.name)+'</strong><small>'+esc(a.role)+'</small></button>').join("");
 return '<div class="eyebrow">INTELLIGENCE ROOM / CHOOSE TWO</div><h2>TWO VOICES.<br>ONE CALL.</h2><p class="copy">Your team may change its selections until confirmation. The four unselected briefings remain unavailable.</p><div class="choice-grid">'+cards+'</div><div class="actions">'+button("confirm","CONFIRM TWO SOURCES →","",picks.length!==2)+'</div>';
}
function adviceUI(){
 if(!advice)return '<div class="panel"><div class="eyebrow">BRIEFINGS REQUESTED</div><p class="copy">Decrypting your team’s selected intelligence…</p></div>';
 return '<div class="eyebrow">PRIVATE / RELEASED TO YOUR TEAM</div>'+advice.map(a=>'<article class="file"><div class="eyebrow">SEALED SOURCE 0'+(a.adviser+1)+'</div><h3>'+esc(a.name)+'</h3><div class="micro">'+esc(a.role)+'</div><blockquote>“'+esc(a.text)+'”</blockquote></article>').join("");
}
function decisionUI(s){
 const e=s.episode;
 const plans=e.plans.map((p,i)=>'<button class="choice '+(plan===i?"selected":"")+'" data-action="plan" data-index="'+i+'" aria-pressed="'+(plan===i)+'"><span class="num">OPTION '+String.fromCharCode(65+i)+' / '+esc(p.tag)+'</span><strong>'+esc(p.name)+'</strong><small>'+esc(p.desc)+'</small><span class="cost">'+money(p.spend)+'</span><span class="trade"><b>UPSIDE</b> '+esc(p.benefits.join(" · "))+'<br><b>COST</b> '+esc(p.cost)+'</span></button>').join("");
 const signals=e.signals.map((p,i)=>'<button class="choice '+(signal===i?"selected":"")+'" data-action="signal" data-index="'+i+'" aria-pressed="'+(signal===i)+'"><span class="num">STATEMENT 0'+(i+1)+'</span><strong>'+esc(p.name)+'</strong><small>“'+esc(p.line)+'”</small></button>').join("");
 let allocation="";
 if([2,4].includes(s.round)){
 const opts=[0,10000,20000].map(v=>'<option value="'+v+'" '+(amount===v?"selected":"")+'>'+money(v)+'</option>').join("");
 const routes=content.allocations.map(r=>'<option value="'+esc(r.id)+'" '+(route===r.id?"selected":"")+'>'+esc(r.name)+'</option>').join("");
 allocation='<div class="panel"><div class="eyebrow">DISCRETIONARY RECOVERY FUND</div><p class="copy">Optional cash spend. You cannot reclaim this allocation.</p><div class="split"><div class="field-group"><label class="field-label" for="amount">COMMITMENT</label><select id="amount" data-select="amount">'+opts+'</select></div><div class="field-group"><label class="field-label" for="route">PRIORITY</label><select id="route" data-select="route" '+(amount===0?"disabled":"")+'>'+routes+'</select></div></div></div>';
 }
 return '<section><div class="eyebrow">THE BOARDROOM / ONE DECISION PER TEAM</div><h2>CHOOSE THE<br>LEAST BAD OPTION.</h2><p class="copy">Discuss with your team. The first member to submit locks the team decision for this episode.</p><div class="eyebrow">01 / RESPONSE STRATEGY</div><div class="choice-grid">'+plans+'</div><div class="eyebrow">02 / PUBLIC STATEMENT</div><div class="choice-grid">'+signals+'</div>'+allocation+'<div class="actions">'+button("vote","LOCK TEAM DECISION →","",plan===null||signal===null)+'</div></section>';
}
function renderPlayer(){
 const s=snapshot,e=s.episode,t=s.team;
 if(localRound!==s.round){localRound=s.round;selection=t.selected.slice();plan=null;signal=null;amount=0;route="audit";advice=null;adviceRound=-1;}
 let stage="";
 if(s.phase==="lobby")stage='<div class="panel"><div class="eyebrow">YOU ARE CONNECTED</div><h2>WAIT FOR THE HOST.</h2><p class="copy">Your facilitator will start the incident once all teams have joined.</p></div>';
 if(s.phase==="intel")stage=t.advisersLocked?adviceUI()+'<div class="phase"><strong>YOUR INTELLIGENCE IS LOCKED.</strong><p class="copy">Waiting for the host to open the boardroom.</p></div>':advisersUI(s);
 if(s.phase==="decision")stage=t.voteReady?'<div class="panel"><h2>DECISION SEALED.</h2><p class="lead">The board has received your team’s response. Await the consequences.</p></div>':adviceUI()+decisionUI(s);
 if(s.phase==="reveal"){
 const last=t.history.at(-1);
 stage='<div class="panel paper"><div class="eyebrow">AFTERMATH / EPISODE 0'+(s.round+1)+'</div><h2>'+esc(last.plan)+'</h2><p class="lead" style="color:#1c2830">'+esc(last.fallout)+'</p><div class="receipt"><span>RESPONSE FUND</span><b>'+money(t.cash)+'</b></div><div class="receipt"><span>EPISODE COST</span><b>'+money(last.roundSpent)+'</b></div><div class="receipt"><span>CLIENT CONFIDENCE</span><b>'+t.trust+'/100</b></div></div><p class="copy">The host will advance when the teams have discussed the consequences.</p>';
 }
 if(s.phase==="finished")stage=renderFinale(s.finale);
 app.innerHTML='<section><div class="eyebrow">TEAM ACCESS / '+esc(t.name)+' / '+esc(s.player.nickname)+'</div><h1>'+esc(e.title)+'</h1><p class="lead">'+esc(e.brief)+'</p>'+progress(s.round)+evidence(e)+stage+'</section>';
 if(t.advisersLocked && !advice && adviceRound!==s.round && (s.phase==="intel"||s.phase==="decision"))loadAdvice();
}
async function loadAdvice(){
 adviceRound=snapshot.round;
 try{const result=await api("/api/rooms/"+code+"/advice","GET",undefined,playerToken());advice=result.advice;if(snapshot&&snapshot.round===adviceRound)renderPlayer();}
 catch(err){flash(err.message,true);}
}
function render(){
 if(mode==="home")renderHome();
 else if(mode==="create")renderCreate();
 else if(mode==="join")renderJoin();
 else if(mode==="host")renderHost();
 else if(mode==="projector")renderProjector();
 else if(mode==="player")renderPlayer();
}
async function refresh(silent){
 if(busy)return;
 try{
  const token=mode==="host"?hostToken():mode==="player"?playerToken():null;
  if((mode==="host"||mode==="player")&&!token){mode="join";snapshot=null;render();if(!silent)flash("This device has no saved room credential.",true);return;}
  const path="/api/rooms/"+code+"/"+(mode==="projector"||mode==="join"?"projector":"state");
  const next=await api(path,"GET",undefined,token);
  const signature=JSON.stringify(next);
  if(signature!==lastSignature){
   snapshot=next;lastSignature=signature;
   if(!silent||!["INPUT","SELECT"].includes(document.activeElement?.tagName))render();
  }
 }catch(err){if(!silent)flash(err.message,true);if(mode==="join"){snapshot=null;render();}}
}
async function mutate(action,data,token){
 busy=true;
 try{const next=await api("/api/rooms/"+code+"/"+action,"POST",data||{},token);snapshot=next;lastSignature=JSON.stringify(next);render();}
 catch(err){flash(err.message,true);}
 finally{busy=false;}
}
app.addEventListener("input",e=>{
 const n=e.target.getAttribute("data-name");if(n!==null)names[Number(n)]=e.target.value;
});
app.addEventListener("change",e=>{
 if(e.target.id==="amount"){amount=Number(e.target.value);render();}
 if(e.target.id==="route"){route=e.target.value;}
});
app.addEventListener("click",async e=>{
 const target=e.target.closest("[data-action]");if(!target||busy)return;
 const action=target.dataset.action;
 try{
 if(action==="create-mode"){mode="create";render();return;}
 if(action==="join-mode"){mode="join";snapshot=null;render();return;}
 if(action==="add-team"&&names.length<4){names.push("TEAM "+String.fromCharCode(65+names.length));render();return;}
 if(action==="remove-team"&&names.length>2){names.pop();render();return;}
 if(action==="create"){
  busy=true;const created=await api("/api/rooms","POST",{names});
  code=created.code;setStore("bc:host:"+code,created.hostToken);nav("host");busy=false;await refresh(false);flash("Room created. Share the join link with players.");return;
 }
 if(action==="lookup"){
  const value=(document.getElementById("room-code").value||"").trim().toUpperCase();
  if(!/^[A-Z2-9]{8}$/.test(value))throw Error("Enter an eight-character room code");
  code=value;nav("join");await refresh(false);return;
 }
 if(action==="join"){
  busy=true;const nickname=document.getElementById("nickname").value;
  const teamId=Number(document.getElementById("join-team").value);
  const invite=document.getElementById("join-invite").value.trim().toLowerCase();
  const joined=await api("/api/rooms/"+code+"/join","POST",{nickname,teamId,invite});
  setStore("bc:player:"+code,joined.token);nav("player");busy=false;await refresh(false);return;
 }
 if(action==="copy-team"){const t=snapshot.teams[Number(target.dataset.team)];await navigator.clipboard.writeText(link("join")+"&team="+t.id+"&invite="+t.invite);flash("Private invitation copied for "+t.name+".");return;}
 if(["start","open-decisions","resolve","advance"].includes(action)){await mutate(action,{},hostToken());return;}
 if(action==="pick"){
  const i=Number(target.dataset.index);
  if(selection.includes(i))selection=selection.filter(x=>x!==i);
  else if(selection.length<2)selection.push(i);
  else selection=[selection[1],i];
  if(selection.length===2){
   busy=true;
   try{const next=await api("/api/rooms/"+code+"/advisers","POST",{picks:selection},playerToken());snapshot=next;lastSignature=JSON.stringify(next);}
   finally{busy=false;}
  }
  // Preserve a one-person local selection before it can be committed.
  if(snapshot?.team){const current=selection.slice();render();selection=current;const picks=app.querySelectorAll('[data-action="pick"]');picks.forEach(el=>{const yes=selection.includes(Number(el.dataset.index));el.classList.toggle("selected",yes);el.setAttribute("aria-pressed",String(yes));});const confirm=app.querySelector('[data-action="confirm"]');if(confirm)confirm.disabled=selection.length!==2;}
  return;
 }
 if(action==="confirm"){if(selection.length!==2)throw Error("Select two advisers");await mutate("confirm",{},playerToken());return;}
 if(action==="plan"){plan=Number(target.dataset.index);render();return;}
 if(action==="signal"){signal=Number(target.dataset.index);render();return;}
 if(action==="vote"){await mutate("vote",{plan,signal,allocation:{amount,route:amount?route:null}},playerToken());return;}
 }catch(err){busy=false;flash(err.message,true);}
});
async function start(){
 try{
  content=await api("/api/content");
  if(!code){mode="home";render();}
  else if(mode==="join"||mode==="host"||mode==="player"||mode==="projector")await refresh(false);
  else{mode="join";await refresh(false);}
 }catch(err){app.innerHTML='<section class="panel"><h2>CONNECTION UNAVAILABLE</h2><p class="copy">'+esc(err.message)+'</p></section>';}
 setInterval(()=>{if(code&&["join","host","player","projector"].includes(mode))refresh(true);},3000);
}
start();
})();
