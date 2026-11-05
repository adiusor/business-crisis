import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {createRoom,joinRoom,viewFor,applyRoomAction,finalVerdict,MAX_PLAYERS,authorize} from "./room-core.mjs";

const hash=s=>createHash("sha256").update(s).digest("hex");
const createdAt=Date.now();
const makeRoom=()=>createRoom({code:"A1B2C3D4E5F6",hostHash:hash("host"),
  teamCount:4,nameSeed:7,createdAtMs:createdAt});
const host={role:"host"};
const act=(room,actor,type,payload={},nowMs=createdAt+1000)=>applyRoomAction(room,actor,{
  type,expectedRevision:room.revision,...payload
},nowMs);

test("Opening Night shares a protected 4-team room with capacity of 30 total participants",()=>{
 const room=makeRoom();
 assert.equal(room.teams.length,4);
 assert.equal(MAX_PLAYERS,30);
 assert.equal(room.teams[0].economic.cash,210000);
 assert.equal(room.teams[0].economic.nextRound,0);
 assert.ok(room.teams.every(x=>/CRISIS|PANIC|DAMAGE|SHUTDOWN/i.test(x.name)===false));
 assert.deepEqual(authorize(room,hash("host")),host);
 assert.throws(()=>authorize(room,hash("stranger")),/Unauthorized/);
});
test("25 simulated participants independently vote through all six event scenes; no private briefings leak",()=>{
 let room=makeRoom();
 const actors=[];
 for(let i=0;i<25;i++){
  const id="member-"+String(i).padStart(4,"0"),actor={role:"player",playerId:id};
  actors.push(actor);
  room=joinRoom(room,{nickname:"Student "+i,teamIndex:i%4,
   credentialHash:hash("student-token-"+i),playerId:id},createdAt+50);
 }
 assert.equal(room.players.length,25);
 const otherView=viewFor(room,actors[1]);
 assert.equal(otherView.viewer.role,"player");
 assert.equal(otherView.privateTeam.economic.cash,210000);
 assert.equal(viewFor(room,host).viewer.role,"host");
 room=act(room,host,"start",{},createdAt+1000);
 for(let round=0;round<6;round++){
  const at=createdAt+1100+round*40000;
  const captainByTeam=[];
  for(let i=0;i<4;i++){
   const captain=actors[i];
   captainByTeam.push(captain);
   room=act(room,captain,"select_advisers",{advisers:[i%6,(i+1)%6]},at);
   const privateState=viewFor(room,captain);
   assert.equal(privateState.privateTeam.intelligence.length,2);
   assert.match(privateState.episode.title,/THE|OPENING/);
   const hostView=viewFor(room,host);
   const enemyView=viewFor(room,actors[(i+1)%4]);
   assert.equal(Object.hasOwn(hostView,"privateTeam"),false);
   assert.equal(JSON.stringify(enemyView).includes(privateState.privateTeam.intelligence[0].brief),false);
  }
  const snapshot=room.revision;
  for(let k=0;k<25;k++){
    const member=actors[k],teamIndex=k%4;
    room=applyRoomAction(room,member,{type:"lock_vote",expectedRevision:snapshot,
     expectedRound:round,expectedRunoffOrdinal:0,
     planIndex:teamIndex%3,signalIndex:teamIndex%3,allocation:{amount:0,route:null}},at+100);
  }
  assert.equal(room.teams.every(t=>t.locked),true,"all four teams must finish round "+round);
  assert.equal(room.teams.every(t=>t.economic.nextRound===round+1),true);
  assert.ok(room.teams.every(t=>t.economic.cash===210000-t.economic.ledger.reduce((sum,e)=>sum+e.amount,0)));
  for(const t of room.teams){
    assert.equal(t.economic.history.length,round+1);
    assert.equal(t.economic.history[round].round,round+1);
    assert.equal(t.economic.history[round].planIndex>=0,true);
  }
  const rival=viewFor(room,actors[1]);
  assert.equal(Object.hasOwn(rival,"hostRoster"),false);
  assert.equal(rival.privateTeam.intelligence.length,2);
  room=act(room,host,"advance",{},at+300);
 }
 assert.equal(room.phase,"complete");
 const result=finalVerdict(room);
 assert.equal(result.ranked.length,4);
 assert.doesNotMatch(result.scoringNote,/renewal/i,"A venue opening is not a contract-renewal case");
 assert.ok(result.ranked.every(x=>["STRONG OPENING","VIABLE WITH WORK","AT RISK","UNVIABLE"].includes(x.status)));
 assert.equal(result.ranked.every(x=>x.decisions.length===6),true);
 const spectator=viewFor(room,{role:"projector"});
 assert.equal(spectator.verdict.ranked.length,4);
 assert.doesNotMatch(JSON.stringify(spectator),/credentialHash|hostHash|privateTeam|secret/i);
});
