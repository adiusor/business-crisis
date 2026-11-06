"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const {execFileSync} = require("node:child_process");

// Exact-match public build marker. Never include environment secrets in a
// frontend bundle: this token is only replaced with the Git commit identity.
const TOKEN = "__09_17_RELEASE_SHA__";
const WORKER = "multiplayer/worker.mjs";
function stampSource(source, sha) {
  assert.match(sha || "", /^[a-f0-9]{40}$/, "Release identity must be a full public Git SHA");
  assert.equal(source.split(TOKEN).length - 1, 1,
    "Worker must contain exactly one replaceable release identity token");
  return source.replace(TOKEN, sha);
}

if (require.main === module) {
  const sha = process.env.GITHUB_SHA || "";
  const checkedOut = execFileSync("git", ["rev-parse", "HEAD"], {encoding:"utf8"}).trim();
  assert.equal(sha, checkedOut,
    "Refusing a release identity that does not match the exact checked-out commit");
  const source = fs.readFileSync(WORKER, "utf8");
  fs.writeFileSync(WORKER, stampSource(source, sha));
  console.log("PASS: 09:17 release identity stamped from checked-out SHA", sha.slice(0,12));
}

module.exports = {stampSource, TOKEN};
