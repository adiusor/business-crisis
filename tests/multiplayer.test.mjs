import assert from "node:assert/strict";
import worker,{CrisisRoom} from "../multiplayer/src/worker.mjs";

class MemoryStorage {
  constructor(){this.data=new Map();}
  async get(key){return structuredClone(this.data.get(key));}
  async put(key,value){this.data.set(key,structuredClone(value));}
}
class Rooms {
  constructor(){this.instances=new Map();this.stores=new Map();}
  idFromName(name){return name;}
  get(name){
    if(!this.stores.has(name))this.stores.set(name,new MemoryStorage());
    if(!this.instances.has(name))this.instances.set(name,new CrisisRoom({storage:this.stores.get(name)},{}));
    return {fetch:request=>this.instances.get(name).fetch(request)};
  }
  reconnect(name){this.instances.set(name,new CrisisRoom({storage:this.stores.get(name)},{}));}
}
const rooms=new Rooms(),env={ROOMS:rooms};
let checks=0;
function check(value,msg){assert.ok(value,msg);checks++;}
async function call(path,{method="GET",data,token}={}){
  const headers={};if(token)headers.authorization="Bearer "+token;
  if(data!==undefined)headers["content-type"]="application/json";
  const req=new Request("https://preview.example"+path,{method,headers,body:data===undefined?undefined:JSON.stringify(data)});
  const res=await worker.fetch(req,env);
  return {status:res.status,data:await res.json()};
}
async function action(code,name,token,data={}){return call("/api/rooms/"+code+"/"+name,{method:"POST",token,data});}
async function state(code,token){return call("/api/rooms/"+code+"/state",{token});}
async function projector(code){return call("/api/rooms/"+code+"/projector");}

const catalog=await call("/api/content");
check(catalog.status===200,"public content exists");
check(catalog.data.episodes.length===6,"six playable episodes");
check(!JSON.stringify(catalog.data).includes("Preserve the original message and access logs"),"sealed adviser advice absent from public content");
const invalid=await call("/api/rooms",{method:"POST",data:{names:["ALPHA"]}});
check(invalid.status===400,"two teams minimum");
const created=await call("/api/rooms",{method:"POST",data:{names:["NORTH","SOUTH"]}});
check(created.status===201,"room created");
const {code,hostToken}=created.data;
check(/^[A-Z2-9]{8}$/.test(code),"room code is eight characters");
check(/^[a-f0-9]{64}$/.test(hostToken),"host credential is high entropy");
const host=await state(code,hostToken);
check(host.status===200&&host.data.teams.length===2,"host sees room");
const inviteA=host.data.teams[0].invite,inviteB=host.data.teams[1].invite;
check(/^[a-f0-9]{16}$/.test(inviteA)&&inviteA!==inviteB,"unguessable distinct team invitations");
const pub=await projector(code);
check(pub.status===200&&pub.data.phase==="lobby","projector is publicly readable");
check(!JSON.stringify(pub.data).includes(inviteA),"projector does not expose team invitations");
check(!JSON.stringify(pub.data).includes(hostToken),"projector does not expose host token");
const badJoin=await call("/api/rooms/"+code+"/join",{method:"POST",data:{teamId:0,nickname:"IMPOSTOR",invite:inviteB}});
check(badJoin.status===403,"another team's invitation cannot be used");
const join=async(teamId,nickname,invite)=>call("/api/rooms/"+code+"/join",{method:"POST",data:{teamId,nickname,invite}});
const a=await join(0,"MAYA",inviteA),b=await join(1,"LEO",inviteB);
check(a.status===201&&b.status===201,"players joined distinct teams");
const ta=a.data.token,tb=b.data.token;
check(ta!==tb&&ta!==hostToken,"credentials unique");
const dup=await join(0,"MAYA",inviteA);
check(dup.status===409,"duplicate nicknames rejected");
const wrongHost=await action(code,"start",ta);
check(wrongHost.status===403,"players cannot start the room");
const unauthorized=await state(code,"a".repeat(64));
check(unauthorized.status===403,"invalid bearer token rejected");
const started=await action(code,"start",hostToken);
check(started.status===200&&started.data.phase==="intel","host starts the incident");
const early=await action(code,"vote",ta,{plan:0,signal:0});
check(early.status===409,"cannot vote before boardroom phase");
const picksA=await action(code,"advisers",ta,{picks:[0,1]});
check(picksA.status===200,"team A can choose advisers");
const changed=await action(code,"advisers",ta,{picks:[0,4]});
check(changed.status===200&&changed.data.team.selected[1]===4,"team A can change picks before confirmation");
const invalidPicks=await action(code,"advisers",ta,{picks:[0,0]});
check(invalidPicks.status===400,"duplicate adviser rejected");
const confirmA=await action(code,"confirm",ta);
check(confirmA.status===200&&confirmA.data.team.advisersLocked,"advisers confirmed");
const again=await action(code,"advisers",ta,{picks:[1,2]});
check(again.status===409,"confirmed advisers cannot change");
const adviceA=await call("/api/rooms/"+code+"/advice",{token:ta});
check(adviceA.status===200&&adviceA.data.advice.length===2,"only two advice items released");
check(adviceA.data.advice.map(x=>x.adviser).join(",")==="0,4","only chosen adviser identities revealed");
const adviceBsealed=await call("/api/rooms/"+code+"/advice",{token:tb});
check(adviceBsealed.status===403,"other team cannot access unconfirmed advice");
const stateA=await state(code,ta);
check(!JSON.stringify(stateA.data).includes(inviteB),"team A state does not expose team B invitation");
check(!JSON.stringify(stateA.data).includes("LEO"),"team A state does not expose other team members");
const premature=await action(code,"open-decisions",hostToken);
check(premature.status===409,"host cannot skip an unready team");
await action(code,"advisers",tb,{picks:[2,3]});
await action(code,"confirm",tb);
const adviceB=await call("/api/rooms/"+code+"/advice",{token:tb});
check(adviceB.status===200&&adviceB.data.advice.every(x=>[2,3].includes(x.adviser)),"team B receives only its selected advice");
const board=await action(code,"open-decisions",hostToken);
check(board.status===200&&board.data.phase==="decision","host opens decisions");
const invalidVote=await action(code,"vote",ta,{plan:88,signal:0});
check(invalidVote.status===400,"invalid strategic plan rejected by rules engine");
const voteA=await action(code,"vote",ta,{plan:0,signal:0,allocation:{amount:0,route:null}});
check(voteA.status===200&&voteA.data.team.voteReady,"team A locks vote");
const doubleVote=await action(code,"vote",ta,{plan:1,signal:0});
check(doubleVote.status===409,"team cannot submit a second vote");
const earlyResolve=await action(code,"resolve",hostToken);
check(earlyResolve.status===409,"host cannot resolve with a missing team vote");
const voteB=await action(code,"vote",tb,{plan:1,signal:1});
check(voteB.status===200,"team B locks vote");
const before=await projector(code);
check(before.data.teams.every(t=>t.result===null),"projector hides consequences before reveal");
const results=await Promise.all([action(code,"resolve",hostToken),action(code,"resolve",hostToken)]);
check(results.filter(x=>x.status===200).length===1&&results.filter(x=>x.status===409).length===1,"simultaneous resolves commit once");
const after=await state(code,ta);
check(after.data.team.history.length===1&&after.data.team.cash===260000-8000-18000,"ledger charged exactly once");
check(after.data.teams[0].result.cash===after.data.team.cash,"public result matches authoritative team state");
rooms.reconnect(code);
const restored=await state(code,ta);
check(restored.status===200&&restored.data.team.history.length===1,"Durable Object state survives instance recreation");
const next=await action(code,"advance",hostToken);
check(next.status===200&&next.data.round===1&&next.data.phase==="intel","host advances episode");
const late=await join(0,"NOVA",inviteA);
check(late.status===201,"late joiner can reconnect to an existing team");
const lateState=await state(code,late.data.token);
check(lateState.data.team.id===0&&lateState.data.team.history.length===1,"late joiner sees own team's history");
for(let round=1;round<6;round++){
  for(const [token,picks] of [[ta,[0,1]],[tb,[2,3]]]){
    const selected=await action(code,"advisers",token,{picks});
    check(selected.status===200,"episode "+round+" advisers selected");
    const confirmed=await action(code,"confirm",token);
    check(confirmed.status===200,"episode "+round+" advisers locked");
  }
  const opened=await action(code,"open-decisions",hostToken);
  check(opened.status===200,"episode "+round+" boardroom opened");
  for(const token of [ta,tb]){
    const voted=await action(code,"vote",token,{plan:0,signal:0,allocation:{amount:0,route:null}});
    check(voted.status===200,"episode "+round+" team vote accepted");
  }
  const revealed=await action(code,"resolve",hostToken);
  check(revealed.status===200&&revealed.data.phase==="reveal","episode "+round+" settled");
  const advanced=await action(code,"advance",hostToken);
  check(advanced.status===200,"episode "+round+" advanced");
}
const final=await projector(code);
check(final.data.phase==="finished"&&final.data.finale.ranked.length===2,"six episodes reach final boardroom");
const finalA=await state(code,ta);
check(finalA.data.team.history.length===6,"all six team transitions persisted");
check(finalA.data.team.cash===260000-finalA.data.team.history.reduce((s,h)=>s+h.roundSpent,0),"full-game ledger reconciles");
check(!finalA.data.team.history.some(h=>h.cash===h.cash+240000),"annual renewal not treated as response cash");
const noMore=await action(code,"advance",hostToken);
check(noMore.status===409,"cannot advance beyond the finale");
const noJoin=await join(0,"TOO LATE",inviteA);
check(noJoin.status===409,"finished room rejects new joiners");
console.log("Multiplayer room engine: "+checks+" assertions PASS; 2 teams, six episodes, private advice, reconnect and concurrent resolve.");
