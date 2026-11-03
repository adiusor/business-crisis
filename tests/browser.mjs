import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const root=path.resolve(import.meta.dirname,"..");
const server=http.createServer((req,res)=>{res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store"});res.end(fs.readFileSync(path.join(root,"index.html")));});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const url="http://127.0.0.1:"+server.address().port;
fs.mkdirSync(path.join(root,"screenshots"),{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
let assertions=0;
async function play(teams,width){
const page=await browser.newPage({viewport:{width,height:850},reducedMotion:"reduce"});
const errors=[];page.on("pageerror",e=>errors.push(e.message));
page.on("console",msg=>{if(msg.type()==="error")errors.push(msg.text());});
await page.goto(url,{waitUntil:"load"});
const click=async(action,index)=>page.locator('[data-action="'+action+'"]'+(index===undefined?'':'[data-index="'+index+'"]')).click();
const shot=async(name)=>page.screenshot({path:path.join(root,"screenshots",name+".png"),fullPage:true});
if(teams===2&&width===1440)await shot("01-opening-desktop");
if(width===320)await shot("01-opening-mobile-320");
await click("lobby");
for(let i=2;i<teams;i++)await click("count-up");
await click("begin");
for(let round=0;round<6;round++){
await click("evidence");
for(let j=0;j<3;j++){await click("open-evidence",j);assert.match(await page.locator(".finding").innerText(),/KEY FINDING/);assertions++;await page.locator('.overlay-sheet .btn[data-action="close-evidence"]').click();}
await click("handoff");
for(let team=0;team<teams;team++){
await click("advisers");
if(round===0&&team===0&&teams===2&&width===1440)await shot("02-advisers-desktop");
if(round===0&&team===0&&width===320)await shot("02-advisers-mobile-320");
await click("choose-adviser",(team+round)%6);
await click("choose-adviser",(team+round+2)%6);
assert.equal(await page.locator('.adviser[aria-pressed="true"]').count(),2);assertions++;
await click("intel");
assert.equal(await page.locator(".intel-file").count(),2);assertions++;
await click("decision");
if(round===0&&team===0&&teams===2&&width===1440)await shot("03-strategy-desktop");
await click("choose-plan",(team+round)%3);
await click("signal");
await click("choose-signal",(team+round+1)%3);
await click("commit");
assert.match(await page.locator(".newspaper h2").innerText(),/.+/);assertions++;
if(round===0&&team===0&&teams===2&&width===1440)await shot("04-fallout-desktop");
await click("advance");
}
assert.equal(await page.locator(".roundup-row").count(),teams);assertions++;
await click("next-round");
}
assert.equal(await page.locator(".rank").count(),teams);assertions++;
assert.equal(await page.locator("details.case-file").count(),teams);assertions++;
if(teams===2&&width===1440)await shot("05-verdict-desktop");
if(width===320)await shot("05-verdict-mobile-320");
const state=await page.evaluate(()=>JSON.parse(localStorage.getItem("business-crisis-cinematic-v2")));
assert.equal(state.teams.length,teams);assertions++;
for(const t of state.teams){assert.equal(t.history.length,6);assert.equal(t.nextRound,6);assert.equal(t.cash,260000-t.ledger.reduce((sum,x)=>sum+x.amount,0));assertions+=3;}
const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
assert.ok(overflow<=1,"Horizontal overflow at "+width+": "+overflow);assertions++;
assert.deepEqual(errors,[],"Browser errors");assertions++;
await page.close();
}
try{
await play(2,1440);
await play(3,390);
await play(4,320);
console.log(JSON.stringify({passed:true,fullGames:3,teamCounts:[2,3,4],widths:[1440,390,320],assertions},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
