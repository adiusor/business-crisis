"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const script=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)][0]?.[1];
assert.ok(script,"game script exists");
new Function(script); // Syntax check for the complete shipped HTML.
const a=script.slice(script.indexOf("function championshipEligible"),script.indexOf("function finaleStory"));
const b=script.slice(script.indexOf("function final(){"),script.indexOf("function reportText(){"));
assert.ok(a.startsWith("function championshipEligible")&&b.startsWith("function final()"),"test extracts actual production functions");
let rendered="";
function build(teams){
const S={teams,finalReveal:true,finalTab:"story",report:false};
const make=new Function("S","page","economics","X","award","finaleStamp","signedCash","finaleFlag","highlightLine","finaleReceipt","finaleEvidence","finaleStory","reportText",a+"\n"+b+"\nreturn {championshipResult,championshipEligible,final,finalePodium};");
return make(S,x=>rendered=x,t=>({remaining:t.m.cash}),x=>String(x),()=>"TEST AWARD",t=>t.commercial,x=>"£"+x+"k",t=>t.commercial,()=>"HEADLINE",()=>"",()=>"",()=>"",()=>"");
}
const t=(id,name,score,commercial,cash,service)=>({id,name,score,commercial,m:{cash,service}});
let checks=0;
function verify(teams,expectedChampion,expectedLabel){
const engine=build(teams),v=engine.championshipResult(teams);
assert.equal(v.champion?.name||null,expectedChampion);checks++;
assert.equal(v.leader.name,[...teams].sort((a,b)=>b.score-a.score)[0].name);checks++;
engine.final();
assert.ok(rendered.includes(expectedLabel),"final reveal contains correct championship label");checks++;
if(!expectedChampion){
assert.match(rendered,/0<\/b><span>TEAMS QUALIFIED/);checks++;
assert.match(rendered,/TOP PERFORMANCE SCORE/);checks++;
assert.doesNotMatch(rendered,/class="fa-podium-label">BOARDROOM CHAMPION/);checks++;
}else{
assert.match(rendered,/class="fa-podium-label">BOARDROOM CHAMPION/);checks++;
}
return rendered;
}
// User-reported outcome: both teams unsigned, neither may be crowned.
const forge=t(0,"TEAM FORGE",57,"at-risk",22,70),orbit=t(1,"TEAM ORBIT",52,"conditional",11,65);
const original=verify([forge,orbit],null,"NO BOARDROOM CHAMPION");
assert.match(original,/TEAM FORGE led the performance scores with 57\/100/);checks++;
assert.match(original,/THE RENEWAL REMAINS UNSECURED/);checks++;
// A signed but lower-scoring team wins the actual commercial championship.
const signed=t(2,"SIGNED TEAM",51,"renewed",30,70);
const higherUnsigned=t(3,"HIGHER UNSIGNED SCORE",85,"at-risk",60,70);
const mixed=verify([higherUnsigned,signed],"SIGNED TEAM","THE BOARDROOM CHAMPION");
assert.match(mixed,/HIGHER UNSIGNED SCORE scored more points, but did not meet/);checks++;
assert.match(mixed,/TOP PERFORMANCE SCORE/);checks++;
// A nominally signed contract does not override an insolvent recovery fund.
verify([t(0,"OVERSPENT",80,"renewed",-1,70),orbit],null,"NO BOARDROOM CHAMPION");
// Operations must remain viable as well.
verify([t(0,"SERVICE FAILED",80,"renewed",30,60),orbit],null,"NO BOARDROOM CHAMPION");
// No championship when the contract is lost, however high the points.
verify([t(0,"LOST",95,"lost",80,90),orbit],null,"NO BOARDROOM CHAMPION");
// Tied eligible teams are jointly acknowledged.
const tie=verify([t(0,"SIGNED A",75,"renewed",30,70),t(1,"SIGNED B",75,"renewed",28,70)],"SIGNED A","THE JOINT BOARDROOM CHAMPIONS");
assert.equal((tie.match(/class="fa-podium-label">BOARDROOM CHAMPION/g)||[]).length,2);checks++;
// Eligible winner with the highest score retains normal trophy presentation.
verify([t(0,"SIGNED A",90,"renewed",30,70),orbit],"SIGNED A","THE BOARDROOM CHAMPION");
console.log(JSON.stringify({passed:true,checks,scenarios:7,productionScriptSyntax:"valid"},null,2));
