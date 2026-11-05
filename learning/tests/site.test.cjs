"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const files=["index.html","corporate-team-building.html","agency-partners.html","leadership-training.html","business-universities.html","preview.html"];
const links=[...files.filter(f=>f!=="preview.html")];
test("each audience page is distinct, complete and isolated from search indexing during research",()=>{
 const titles=new Set(),descs=new Set();
 for(const f of links){
  const html=read(f);
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title?.length>24,f+" needs useful title");
  assert.ok(description?.length>70,f+" needs useful description");
  assert.match(html,/<meta name="robots" content="noindex,nofollow,noarchive"/,f+" must not be indexed during experiment");
  assert.match(html,/<h1[^>]*>/,f+" needs a primary headline");
  assert.match(html,/href="\.\/preview\.html"/,f+" needs a real try-game route");
  assert.doesNotMatch(html,/<form|stripe|payment processor|checkout/i,f+" must not collect data or enable payments");
  titles.add(title);descs.add(description);
 }
 assert.equal(titles.size,links.length,"Titles must be segment-specific");
 assert.equal(descs.size,links.length,"Meta descriptions must not repeat");
});
test("the website links to four distinct buyers and all local destinations exist",()=>{
 const h=read("index.html");
 const unique=["corporate-team-building.html","agency-partners.html","leadership-training.html","business-universities.html"];
 for(const f of unique)assert.match(h,new RegExp(f.replace(".","\\.")),"Landing needs link to "+f);
 for(const f of links){
  const html=read(f);
  for(const [,target] of html.matchAll(/href="\.\/([^"#?]+)"/g)){
   assert.ok(fs.existsSync(path.join(root,target)),f+" points to missing local path "+target);
  }
 }
});
test("classroom claims and all four buyer pages describe prototype limitations",()=>{
 for(const f of links.filter(f=>f!=="index.html")){
  const h=read(f);
  assert.match(h,/concept-stage|prototype|experimental|not yet/i);
  assert.match(h,/Opening Night/);
 }
 const edu=read("business-universities.html");
 assert.match(edu,/Unit 20/);
 assert.match(edu,/not.*Pearson|Pearson.*not/i);
 assert.match(edu,/Harvard.*not|not.*Harvard/i);
});
