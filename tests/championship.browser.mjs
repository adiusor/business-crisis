import {chromium} from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const root=path.resolve(import.meta.dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"));
const server=http.createServer((req,res)=>{res.writeHead(200,{"content-type":"text/html; charset=utf-8"});res.end(html);});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const url="http://127.0.0.1:"+server.address().port;
fs.mkdirSync(path.join(root,"screenshots"),{recursive:true});
let assertions=0;
async function scenario(width,mode){
const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
const errors=[];page.on("pageerror",e=>errors.push(e.message));
await page.goto(url,{waitUntil:"load"});
await page.evaluate((mode)=>{
  // Test only the actual final-rendering function, with representative committed
  // team outcome states. The rest of the game remains untouched.
  window.finaleStory=()=>'<div class="fa-story">CASE FILE TEST FIXTURE</div>';
  window.highlightLine=()=>"THE BOARD IS REVIEWING THE RENEWAL";
  const team=(id,name,score,commercial,cash,service)=>({
    id,name,score,commercial,ledger:[],log:[],intel:0,
    m:{cash,service,staff:60,client:60,evidence:70,risk:45},
    exposure:{legal:40,operational:40,staff:40,contract:40,financial:40},
    flags:{},events:[],allocation:{}
  });
  S.teams=mode==="unsigned"?
    [team(0,"TEAM FORGE",57,"at-risk",22,70),team(1,"TEAM ORBIT",52,"conditional",11,65)]:
    [team(0,"HIGHER SCORE",85,"at-risk",22,70),team(1,"SIGNED CONTRACT",51,"renewed",30,70)];
  S.phase="final";S.finalReveal=true;S.finalTab="story";S.finalTeam=null;S.report=false;
  final();
},mode);
const label=await page.locator(".fa-win-label").innerText();
const name=await page.locator(".fa-win-name").innerText();
const podium=await page.locator(".fa-podium-label").allInnerTexts();
if(mode==="unsigned"){
assert.equal(label,"NO BOARDROOM CHAMPION");assertions++;
assert.equal(name,"THE RENEWAL REMAINS UNSECURED");assertions++;
assert.ok(podium.includes("TOP PERFORMANCE SCORE"));assertions++;
assert.ok(!podium.includes("BOARDROOM CHAMPION"));assertions++;
assert.match(await page.locator(".fa-win-metric").innerText(),/0\s+TEAMS QUALIFIED/);assertions++;
}else{
assert.equal(label,"THE BOARDROOM CHAMPION");assertions++;
assert.equal(name,"SIGNED CONTRACT");assertions++;
assert.ok(podium.includes("BOARDROOM CHAMPION"));assertions++;
assert.ok(podium.includes("TOP PERFORMANCE SCORE"));assertions++;
}
assert.deepEqual(errors,[]);assertions++;
await page.screenshot({path:path.join(root,"screenshots","renewal-"+mode+"-"+width+".png"),fullPage:true});
await page.close();
}
try{
for(const width of [1440,390])for(const mode of ["unsigned","signed"])await scenario(width,mode);
console.log(JSON.stringify({passed:true,scenarios:4,widths:[1440,390],assertions},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
