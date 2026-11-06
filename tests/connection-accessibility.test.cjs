"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

test("room connection indicator announces live connectivity changes accessibly", () => {
  const html = fs.readFileSync(path.join(root, "multiplayer/client.html"), "utf8");
  const indicator = html.match(/<span\b[^>]*\bid="connection"[^>]*>CONNECTING<\/span>/);
  assert.ok(indicator, "room must expose the connection indicator");
  assert.match(indicator[0], /\brole="status"/);
  assert.match(indicator[0], /\baria-live="polite"/);
  assert.match(indicator[0], /\baria-atomic="true"/);
  const script = fs.readFileSync(path.join(root, "multiplayer/client-script.txt"), "utf8");
  assert.match(script, /\$\("connection"\)\.textContent\s*=\s*online\s*\?\s*"LIVE SYNC"/,
    "connection text must change when the client becomes live");
  assert.match(script, /"RECONNECTING"/, "reconnecting state must remain visible");
  assert.match(script, /"OFFLINE"/, "offline state must remain visible");
});
