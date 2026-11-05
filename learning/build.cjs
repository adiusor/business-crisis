"use strict";
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const css=read("learning/play.css");
const js=["src/content.js","src/rules.js","learning/story.js","learning/experience.js","learning/branching.js","learning/art.js","learning/play.js"].map(read).join("\n;\n");
const html='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#0b1619"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="description" content="Opening Night: an original six-scene interactive business education and team-building case, experimental single-device preview."><title>Opening Night — Business in Play | Experimental team learning game</title><style>\n'+css+'\n</style></head><body><a class="skip" href="#app">Skip to game</a><header class="mast"><div class="brand"><strong>B•</strong> BUSINESS IN PLAY</div><div class="eyebrow">EXPERIMENTAL / SHARED-DEVICE</div></header><main id="app" class="wrap" aria-live="off"></main><div class="wrap"><footer class="footer">ORIGINAL FICTION · NOT AFFILIATED WITH PEARSON OR HARVARD · NO PERSONAL DATA REQUIRED · NOT A LIVE MULTIPLAYER SERVER</footer></div>\n<script>\n'+js+'\n</script></body></html>\n';
fs.writeFileSync(path.join(root,"learning/preview.html"),html);
console.log("Built learning/preview.html ("+Buffer.byteLength(html)+" bytes)");
