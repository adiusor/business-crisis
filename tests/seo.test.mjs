import "../src/content.js";
import test from "node:test";
import assert from "node:assert/strict";
import {PUBLIC_PATHS,PAGES,renderPublicPage,isPublishedOrigin,robotsText,sitemapXml} from "../multiplayer/site.mjs";
const preview=new URL("https://business-crisis-rooms-staging.example.workers.dev/");
const live=new URL("https://example.com/");
const cfg={PUBLIC_SITE_ORIGIN:"https://example.com"};
test("distinct useful public pages are rendered but not indexed on staging",()=>{
 const titles=new Set();
 for(const path of PUBLIC_PATHS){
  const page=renderPublicPage(path,preview,{});
  assert.ok(page&&page.html.includes("<h1>"));
  assert.match(page.html,/meta name="description"/);
  assert.match(page.html,/noindex,nofollow,noarchive/);
  assert.doesNotMatch(page.html,/rel="canonical"/);
  assert.match(page.html,/href="\/play"/);
  titles.add(PAGES[path].title);
 }
 assert.equal(titles.size,PUBLIC_PATHS.length);
 assert.ok(PUBLIC_PATHS.length>=9);
});
test("only a configured HTTPS custom domain indexes validated content",()=>{
 assert.equal(isPublishedOrigin(live,cfg),true);
 assert.equal(isPublishedOrigin(preview,{PUBLIC_SITE_ORIGIN:preview.origin}),false);
 assert.equal(isPublishedOrigin(new URL("https://example.com.bad.net/"),cfg),false);
 const home=renderPublicPage("/",live,cfg);
 assert.equal(home.indexable,true);
 assert.match(home.html,/rel="canonical" href="https:\/\/example.com\/"/);
 assert.match(home.html,/hreflang="ro"/);
 assert.match(home.html,/application\/ld\+json/);
 assert.match(renderPublicPage("/ro",live,cfg).html,/lang="ro"/);
 assert.match(renderPublicPage("/ro",live,cfg).html,/hreflang="en"/);
 assert.equal(renderPublicPage("/pricing",live,cfg).indexable,false);
 assert.equal(renderPublicPage("/demo",live,cfg).indexable,false);
});
test("sitemap excludes all private game paths and staging publishes none",()=>{
 assert.equal(sitemapXml(preview.origin,{}),null);
 assert.match(robotsText(preview.origin,{}),/Allow: \//);
 const xml=sitemapXml(live.origin,cfg);
 assert.match(xml,/corporate-team-building-game/);
 assert.match(xml,/virtual-team-building/);
 assert.match(xml,/\/ro<\/loc>/);
 assert.doesNotMatch(xml,/projector|\/play|\/join|\/demo|\/pricing/);
 assert.doesNotMatch(robotsText(live.origin,cfg),/Disallow: \/join/);
 assert.match(robotsText(live.origin,cfg),/Disallow: \/api\//);
 assert.equal((xml.match(/<loc>/g)||[]).length,PUBLIC_PATHS.length-2);
});

test("commercial incident choices originate in canonical opening story",()=>{
 const first=globalThis.BCContent.episodes[0];
 const page=renderPublicPage("/",live,cfg).html;
 assert.match(page,/id="try-a-decision"/);
 assert.equal((page.match(/class="demo-choice"/g)||[]).length,3);
 for(const option of first.plans){
   assert.ok(page.includes(option.name));
   assert.ok(page.includes(option.fallout));
   assert.ok(page.includes("£"+(first.base+option.spend).toLocaleString("en-GB")));
 }
 assert.match(renderPublicPage("/corporate-team-building-game",live,cfg).html,/id="try-a-decision"/);
 assert.doesNotMatch(renderPublicPage("/ro",live,cfg).html,/id="try-a-decision"/);
});
