# BUSINESS IN PLAY — Opening Night (Experimental product)

**Working parent brand:** Business in Play (not trademark/domain cleared).  
**Original story:** Opening Night, set at fictional FIELDWORK HOUSE.  
**Status:** source and self-contained browser preview, not an externally hosted public product.

## Hosted experimental preview (verified 5 November 2026)
These pages are served from a **separate Vercel staging deployment**, not Cloudflare production or the existing Business Crisis Worker.

- [Open the experimental marketing site](https://business-in-play-experimental-h3v2pb5ww-adiusor-6916.vercel.app/)
- [Play Opening Night directly — no login or room code](https://business-in-play-experimental-h3v2pb5ww-adiusor-6916.vercel.app/preview.html)
- [View the Romanian-market overview](https://business-in-play-experimental-h3v2pb5ww-adiusor-6916.vercel.app/ro.html)
- [External HTTP proof (all seven pages, noindex)](https://github.com/adiusor/business-crisis/actions/runs/42038286550)

The published deployment is a pinned version of the experimental website; future GitHub commits do not automatically update it. Run a new isolated deploy and HTTP probe to keep it current. This is **shared-device**, not the separate-phone multiplayer experience.

## Fastest way to play (no room code needed)
1. Open [the standalone Opening Night HTML file](./preview.html) in GitHub.
2. Use **Download raw file** (down-arrow) on GitHub. Save `preview.html` to your computer.
3. Double-click `preview.html` to open it in Chrome or Safari.
4. Select **Classroom**, **Leadership**, or **Team Building**, choose **2 teams**, and press **START THE EXPERIENCE**.
5. Pick THE SPARKS, read the evidence, discuss the two role cards, select two advisers, reveal their advice, then choose a plan and a communication/negotiation tactic. Lock the choice and pass the device to the next team.
6. When both teams have made a decision, review the consequences and advance. After six chapters, open the Boardroom-style final report and download the local .txt summary.

**Unlike the old Cloudflare multiplayer experiment, this preview is turn-based on one computer.** Do not try to enter a room code or log in; this mode does not use one. Do not distribute "join" URLs to 25 participants for this version.

## Files
- [Standalone playable demo](preview.html) — single HTML file; no external assets, server, account or CDN.
- [Experimental marketing website](index.html) — authored landing page with distinct sections for HR, agencies, trainers and universities. Not hosted commercially, noindex.
- [Original story](story.js) — six chapters, characters, evidence, plans, statements, delayed liabilities and explicit learning hooks.
- [Scene-specific challenges](experience.js) — six different role conflicts, debate instructions and facilitator cues.
- [Deterministic game controller](play.js) — selectable teams, two confidential advisers, plan and tactic voting, optional investments and outcomes.
- [Rules engine](../src/rules.js) — existing engine extracted into `BCCreateRules(scenario)` while keeping the legacy `BCRules` default.
- [Teaching/facilitator pack](TEACHER_GUIDE.md) — Unit 20 LO mapping, 60/90-minute lesson structures, discussion prompts and limitations.
- [Product and SEO strategy](PRODUCT_AND_GTM.md) — four buyer segments, positioning, responsible launch gates and keyword architecture.
- [Automated balance tests](tests/game.test.cjs), [full browser journey](tests/browser.mjs), and [GitHub Actions workflow](../.github/workflows/business-in-play.yml).

## Build and test
With Node.js 22 or later from repository root:

```bash
node learning/build.cjs
node --test learning/tests/game.test.cjs
npm install --no-audit --no-fund
npx playwright install chromium webkit
BIP_BROWSER=chromium BIP_WIDTH=320 node learning/tests/browser.mjs
BIP_BROWSER=chromium BIP_WIDTH=1280 node learning/tests/browser.mjs
BIP_BROWSER=webkit BIP_WIDTH=390 node learning/tests/browser.mjs
```

`preview.html` is reproducible from `src/content.js`, `src/rules.js`, `learning/story.js`, `learning/experience.js`, `learning/play.js` and `learning/play.css`. All test and build jobs are non-deploying.

## Design boundaries
- The original Business Crisis live/staging Workers, existing rooms, branch `main`, and production website are NOT changed by this feature.
- A successful unit/browser test is not proof of emotional enjoyment or guaranteed engagement. Real moderated groups must validate playtime, game clarity, fun, learning relevance and willingness to pay.
- Fictional economic figures are explicitly illustrative; £120k sponsorship is future **annual contract value**, not cash credited to the event fund.
- Peer-selected adviser details are private only when other teams cannot view the same device. Pass the device or use separate spaces to prevent accidental disclosure during this shared-screen trial.
- The scenario is original and not endorsed or licensed by Harvard, Pearson, or any university.
- Accessibility testing with screen readers, physical iPhones, low-end Android devices, and real classroom projectors remains to be completed.
- The new story has not been integrated into the Cloudflare Durable Object multiplayer protocol, so it cannot yet be sold as a 25-player phone game.

## What the next engineering milestone must deliver
Parameterize the server room engine by validated server-side `scenarioId` with separate scenario data and evaluator, preserve confidential per-player information and vote controls, build a genuine 25-device pilot, and verify host/projector/caption/accessibility and security before a paid event. **Do not silently rename or replace the tested legacy game.**
