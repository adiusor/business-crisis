"use strict";
// Hard deployment boundary for the isolated phone-testing Worker.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const load = path => JSON.parse(fs.readFileSync(path, "utf8"));
const staging = load("multiplayer/wrangler.staging.jsonc");
const original = load("multiplayer/wrangler.jsonc");
assert.equal(staging.name, "business-crisis-rooms-staging");
assert.equal(original.name, "business-crisis-rooms-preview");
assert.notEqual(staging.name, original.name);
assert.equal(staging.main, "./worker.mjs");
assert.equal(staging.workers_dev, true, "The staged preview needs a separate workers.dev URL");
assert.equal(original.workers_dev, false, "Do not change the existing dry-run Worker config");
assert.equal(staging.compatibility_date, original.compatibility_date);
for (const config of [staging, original]) {
  for (const prop of ["route", "routes", "custom_domains", "env", "vars", "triggers", "unsafe"]) {
    assert.equal(Object.hasOwn(config, prop), false, "Do not attach production routes or bindings: " + prop);
  }
  assert.deepEqual(config.durable_objects?.bindings,
    [{name: "CRISIS_ROOMS", class_name: "CrisisRoom"}]);
  assert.deepEqual(config.migrations, [{tag: "room-v1", new_sqlite_classes: ["CrisisRoom"]}]);
  assert.deepEqual(config.rules, [{type: "Text", globs: ["**/*.html", "**/*.txt"]}]);
}
const pkg = load("package.json");
assert.equal(pkg.private, true);
assert.ok(pkg.scripts["check:staging-bundle"]?.includes("multiplayer/wrangler.staging.jsonc"));
assert.ok(pkg.scripts["check:room-bundle"]?.includes("multiplayer/wrangler.jsonc"));
const deployment = fs.readFileSync(".github/workflows/business-crisis-staging.yml", "utf8");
assert.ok(deployment.includes('branches: ["redesign/cinematic-crisis-v2"]'), "Staging trigger must never include main");
assert.ok(deployment.includes("github.ref == 'refs/heads/redesign/cinematic-crisis-v2'"), "Staging branch guard required");
assert.ok(deployment.includes("vars.BC_STAGING_DEPLOY_ENABLED == 'YES'"), "Explicit opt-in switch required");
assert.ok(deployment.includes("secrets.BC_STAGING_DEPLOY_TOKEN"), "Dedicated staging deployment token required");
assert.ok(deployment.includes("secrets.BC_STAGING_ROOM_CREATION_KEY"), "Independent staging room creation secret required");
assert.ok(!deployment.includes("secrets.CLOUDFARE_API_TOKEN") && !deployment.includes("secrets.CLOUDFLARE_API_TOKEN"), "Read-only credential must not be reused for deployment");
assert.ok(deployment.includes("npx wrangler deploy --config multiplayer/wrangler.staging.jsonc"), "Deploy may only target staging config");
assert.ok(deployment.includes("npx wrangler secret put ROOM_CREATION_KEY --config multiplayer/wrangler.staging.jsonc"), "Room secret may only target staging config");
assert.ok(deployment.includes("environment: business-crisis-staging"), "Dedicated staging environment required");
console.log("Staging isolation confirmed: named Workers.dev-only Worker, guarded branch, dedicated secrets, no production routes.");
