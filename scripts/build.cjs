/* Build a single-file deployable index.html from modular sources.
   Run: node scripts/build.cjs
   The compiled HTML works without a CDN, bundler or third-party assets. */
"use strict";
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const css=read("src/style.css");
const js=["src/content.js","src/rules.js","src/art.js","src/app.js"].map(read).join("\n\n");
const html='<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="robots" content="noindex,nofollow,noarchive">\n<meta name="theme-color" content="#07111a">\n<meta name="description" content="THE 09:17 CHALLENGE. Six chapters, team decisions and a compelling business story with different outcomes.">\n<title>THE 09:17 CHALLENGE — TEAM DECISION GAME</title>\n<style>\n'+css+'\n</style>\n</head>\n<body>\n<div id="app"></div>\n<script>\n'+js+'\n</script>\n</body>\n</html>\n';
fs.writeFileSync(path.join(root,"index.html"),html);
console.log("Built index.html ("+Buffer.byteLength(html)+" bytes)");
