"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const challenge=read("multiplayer/wrangler.0917.staging.jsonc");
const legacy=read("multiplayer/wrangler.staging.jsonc");
const original=read("multiplayer/wrangler.jsonc");
assert.equal(challenge.name,"the-0917-challenge-staging");
assert.notEqual(challenge.name,legacy.name);
assert.notEqual(challenge.name,original.name);
assert.equal(challenge.main,"./worker.mjs");
assert.equal(challenge.workers_dev,true);
assert.deepEqual(challenge.durable_objects.bindings,[{name:"CRISIS_ROOMS",class_name:"CrisisRoom"}]);
assert.deepEqual(challenge.migrations,[{tag:"room-v1",new_sqlite_classes:["CrisisRoom"]}]);
for(const cfg of [challenge,legacy,original]){
 for(const property of ["route","routes","custom_domains","env","vars","triggers","unsafe","account_id","zone_id"]){
   assert.equal(Object.hasOwn(cfg,property),false,"Unsafe Worker configuration property: "+property);
 }
}
const workflow=fs.readFileSync(".github/workflows/0917-full-staging.yml","utf8");
for(const token of [
'branches: ["feature/0917-corporate-challenge"]',
"vars.BC_STAGING_DEPLOY_ENABLED == 'YES'",
"secrets.BC_STAGING_DEPLOY_TOKEN",
"secrets.BC_STAGING_ROOM_CREATION_KEY",
"multiplayer/wrangler.0917.staging.jsonc",
"environment: business-crisis-staging"]){
 assert.ok(workflow.includes(token),"Missing staging deployment guard: "+token);
}
assert.ok(!workflow.includes("--config multiplayer/wrangler.staging.jsonc"),"Legacy staging may not be redeployed");
assert.ok(!workflow.includes("--config multiplayer/wrangler.jsonc"),"Original preview may not be deployed");
assert.ok(!workflow.includes("secrets.CLOUDFLARE_API_TOKEN"),"Never substitute unrelated credential");
console.log("PASS: Distinct Workers.dev-only 09:17 deployment, opt-in gate, no production routes or legacy Worker writes.");
