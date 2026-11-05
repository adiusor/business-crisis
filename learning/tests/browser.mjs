import {strict as assert} from "node:assert";
import {fileURLToPath,pathToFileURL} from "node:url";
import path from "node:path";
import fs from "node:fs";
import {chromium,webkit} from "playwright";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const publicPreview=pathToFileURL(path.join(root,"learning/preview.html")).href;
const publicLanding=pathToFileURL(path.join(root,"learning/index.html")).href;
const shots=path.join(root,"screenshots","learning");
fs.mkdirSync(shots,{recursive:true});
const browserName=process.env.BIP_BROWSER==="webkit"?"webkit":"chromium";
const browser=await ({webkit,chromium})[browserName].launch({headless:true});
const browserErrors=[];
const viewportWidth=Number(process.env.BIP_WIDTH||390);
const page=await browser.newPage({viewport:{width:viewportWidth,height:820},acceptDownloads:true});
page.on("pageerror",e=>browserErrors.push(e.message));
const tap=selector=>page.locator(selector).click({timeout:10000});
const isVisible=selector=>page.locator(selector).isVisible();
try{
 await page.goto(publicLanding);
 assert.match(await page.title(),/Business in Play/);
 await page.screenshot({path:path.join(shots,`${browserName}-${viewportWidth}-landing.png`),fullPage:true});
 const previewLink=await page.locator('a[href="./preview.html"]').count();
 assert.ok(previewLink>=1,"Commercial review website must link directly to the experience");
 await page.goto(publicPreview);
 assert.match(await page.title(),/Opening Night/);
 await tap('[data-action="start"]');
 assert.ok(await isVisible('[data-action="team"][data-index="0"]'),"First team immediately selectable");
 const labels=["THE INVITATION","THE PEOPLE","THE SUPPLIER","THE CULTURE","THE PARTNER","OPENING NIGHT"];
 for(let round=0;round<6;round++){
   for(let i=0;i<2;i++){
     await tap('[data-action="team"][data-index="'+i+'"]');
     const heading=await page.locator("h1.title").textContent();
     assert.equal(heading.trim(),labels[round]);
     assert.ok(await page.locator('[aria-label="Team collaboration challenge"]').count());
     assert.equal(await page.locator(".scene-illustration").count(),1,"Every scene needs an original illustration");
     assert.ok(await page.locator("#case-file summary").isVisible(),"Evidence must be accessible without forcing reading");
     if(round===0&&i===0&&viewportWidth<=390){
       const y=await page.locator('.scene-jump a[href="#consult"]').evaluate(el=>el.getBoundingClientRect().top);
       assert.ok(y<820,"The primary adviser action must be visible in the first mobile viewport: "+y);
       const overflowScene=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
       assert.ok(overflowScene<=2,"The first scene must not scroll horizontally");
     }
     if(round===0&&i===0)await page.screenshot({path:path.join(shots,`${browserName}-${viewportWidth}-first-scene.png`),fullPage:true});
     assert.equal(await page.locator('[data-action="adviser"]').count(),6);
     await tap('[data-action="adviser"][data-index="0"]');
     await tap('[data-action="adviser"][data-index="1"]');
     await tap('[data-action="reveal"]');
     await tap('[data-action="plan"][data-index="'+(i===0?0:1)+'"]');
     await tap('[data-action="signal"][data-index="'+(i===0?0:1)+'"]');
     if([2,4].includes(round) && i===0){
       assert.ok(await page.locator('[data-action="amount"]').count()===3);
       await tap('[data-action="amount"][data-index="10000"]');
       await tap('[data-action="route"][data-route="capacity"]');
     }
     assert.equal(await page.locator('[data-action="lock"]').isDisabled(),false,"Committed choice should be enabled");
     await tap('[data-action="lock"]');
   }
   assert.ok(await isVisible('[data-action="next"]'),"Recap must be visible once both teams commit");
   const recap=await page.locator("#app").innerText();
   assert.match(recap,/Different decisions/);
   assert.match(recap,/Pending liabilities/);
   // Local restore should not lose committed decisions or reset the round.
   if(round===2){
     await page.reload();
     assert.ok(await isVisible('[data-action="next"]'),"Saved recap should survive reload");
   }
   await tap('[data-action="next"]');
 }
 assert.ok(await isVisible('[data-action="download"]'),"Six scenes must reach the final report");
 const finalText=await page.locator("#app").innerText();
 assert.match(finalText,/HIGHEST SIMULATED PERFORMANCE/);
 const downloadEvent=page.waitForEvent("download");
 await tap('[data-action="download"]');
 const file=await downloadEvent;
 assert.match(file.suggestedFilename(),/opening-night-summary\.txt/);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 assert.ok(overflow<=2,"No sideways overflow in final report: "+overflow);
 assert.deepEqual(browserErrors,[],"No browser runtime exceptions");
 await page.screenshot({path:path.join(shots,`${browserName}-${viewportWidth}-finale.png`),fullPage:true});
 console.log(JSON.stringify({status:"PASS",browser:browserName,width:viewportWidth,episodes:6,teamTurns:12,download:file.suggestedFilename(),overflow,errors:browserErrors.length}));
}catch(error){
 console.error("Learning game browser journey FAILED",error);
 process.exitCode=1;
}finally{await browser.close();}
