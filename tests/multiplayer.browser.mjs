import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";

const base="http://127.0.0.1:8787";
const server=spawn(process.execPath,["node_modules/wrangler/bin/wrangler.js","dev","--config","multiplayer/wrangler.toml","--port","8787","--local"],{stdio:["ignore","pipe","pipe"]});
let output="";
server.stdout.on("data",d=>{output+=d.toString();});
server.stderr.on("data",d=>{output+=d.toString();});
let browser;
async function ready(){
  for(let i=0;i<80;i++){
    if(server.exitCode!==null)throw Error("Wrangler exited early: "+output.slice(-2000));
    try{const r=await fetch(base+"/api/content");if(r.ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  throw Error("Wrangler did not start: "+output.slice(-3000));
}
async function enabled(locator){
  await locator.waitFor({state:"visible",timeout:18000});
  for(let i=0;i<90;i++){if(await locator.isEnabled())return;await new Promise(r=>setTimeout(r,250));}
  throw Error("Button never enabled");
}
async function noOverflow(page,label){
  const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:innerWidth}));
  assert.ok(sizes.scroll<=sizes.view+1,label+" overflow: "+JSON.stringify(sizes));
}
async function run(){
 await ready();
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const hostContext=await browser.newContext({viewport:{width:1440,height:900}});
 const host=await hostContext.newPage();
 await host.goto(base+"/");
 await host.locator('[data-action="create-mode"]').click();
 await host.locator('[data-action="create"]').click();
 await host.locator(".join-code").waitFor({timeout:18000});
 const code=(await host.locator(".join-code").innerText()).trim();
 assert.match(code,/^[A-Z2-9]{8}$/);
 const hostToken=await host.evaluate(c=>localStorage.getItem("bc:host:"+c),code);
 assert.ok(hostToken,"host credential persisted");
 const hostState=await fetch(base+"/api/rooms/"+code+"/state",{headers:{authorization:"Bearer "+hostToken}}).then(r=>r.json());
 const inviteA=hostState.teams[0].invite,inviteB=hostState.teams[1].invite;
 assert.ok(inviteA&&inviteB,"host sees team invitations");
 const playerContextA=await browser.newContext({viewport:{width:320,height:700}});
 const playerContextB=await browser.newContext({viewport:{width:390,height:844}});
 const a=await playerContextA.newPage(),b=await playerContextB.newPage();
 const joinUrl=(team,invite)=>base+"/?room="+code+"&mode=join&team="+team+"&invite="+invite;
 await a.goto(joinUrl(0,inviteA));
 await a.locator("#nickname").fill("MAYA");
 await a.locator('[data-action="join"]').click();
 await a.locator(".eyebrow").first().waitFor();
 await a.locator("text=WAIT FOR THE HOST.").waitFor({timeout:12000});
 await b.goto(joinUrl(1,inviteB));
 await b.locator("#nickname").fill("LEO");
 await b.locator('[data-action="join"]').click();
 await b.locator("text=WAIT FOR THE HOST.").waitFor({timeout:12000});
 await noOverflow(a,"320px join/lobby");
 await noOverflow(b,"390px join/lobby");
 const projectorContext=await browser.newContext({viewport:{width:1440,height:900}});
 const projector=await projectorContext.newPage();
 await projector.goto(base+"/?room="+code+"&mode=projector");
 await projector.locator(".projector").waitFor();
 assert.ok(!(await projector.content()).includes(inviteA),"projector does not contain team A invitation");
 await enabled(host.locator('[data-action="start"]'));
 await host.locator('[data-action="start"]').click();
 await a.locator('[data-action="pick"]').first().waitFor({timeout:18000});
 await a.locator('[data-action="pick"][data-index="0"]').click();
 await a.locator('[data-action="pick"][data-index="1"]').click();
 await enabled(a.locator('[data-action="confirm"]'));
 await a.locator('[data-action="confirm"]').click();
 await a.locator(".file").first().waitFor({timeout:15000});
 assert.equal(await a.locator(".file").count(),2,"exactly two private adviser files");
 assert.ok(!(await a.content()).includes("LEO"),"other team's player identity is private");
 await mkdir("screenshots",{recursive:true});
 await a.screenshot({path:"screenshots/multiplayer-player-intelligence-320.png",fullPage:true});
 await noOverflow(a,"320px adviser intelligence");
 await b.locator('[data-action="pick"]').first().waitFor({timeout:18000});
 await b.locator('[data-action="pick"][data-index="2"]').click();
 await b.locator('[data-action="pick"][data-index="3"]').click();
 await enabled(b.locator('[data-action="confirm"]'));
 await b.locator('[data-action="confirm"]').click();
 await enabled(host.locator('[data-action="open-decisions"]'));
 await host.locator('[data-action="open-decisions"]').click();
 await a.locator('[data-action="plan"]').first().waitFor({timeout:18000});
 await a.locator('[data-action="plan"][data-index="0"]').click();
 await a.locator('[data-action="signal"][data-index="0"]').click();
 await enabled(a.locator('[data-action="vote"]'));
 await a.screenshot({path:"screenshots/multiplayer-player-decision-320.png",fullPage:true});
 await noOverflow(a,"320px decision");
 await a.locator('[data-action="vote"]').click();
 await b.locator('[data-action="plan"]').first().waitFor({timeout:18000});
 await b.locator('[data-action="plan"][data-index="1"]').click();
 await b.locator('[data-action="signal"][data-index="1"]').click();
 await enabled(b.locator('[data-action="vote"]'));
 await b.locator('[data-action="vote"]').click();
 await enabled(host.locator('[data-action="resolve"]'));
 await host.locator('[data-action="resolve"]').click();
 await host.locator("text=CONSEQUENCES UNSEALED").waitFor({timeout:15000});
 await projector.locator("text=THE COST OF YOUR CHOICES").waitFor({timeout:15000});
 assert.ok((await projector.locator(".team-card .receipt").count())>=4,"projector displays revealed scores and cash");
 await host.screenshot({path:"screenshots/multiplayer-host-reveal-1440.png",fullPage:true});
 await projector.screenshot({path:"screenshots/multiplayer-projector-reveal-1440.png",fullPage:true});
 await noOverflow(projector,"1440px projector");
 await enabled(host.locator('[data-action="advance"]'));
 await host.locator('[data-action="advance"]').click();
 await a.locator("text=THE FLOOR").first().waitFor({timeout:15000});
 await noOverflow(a,"320px next episode");
 console.log("Multiplayer Chromium E2E PASS: host + 2 phones + projector, private advice, votes, reveal, next episode, 320/390/1440px.");
}
try{await run();}
finally{if(browser)await browser.close();server.kill("SIGTERM");}
