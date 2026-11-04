# BUSINESS CRISIS — The 09:17 Incident

**Cinematic v2 development branch — not the public release.**

A competitive, shared-screen narrative strategy game. A confidential restructuring memo has reached 600 employees and three clients. Two to four teams must survive six escalating episodes, select two of six advisers in each episode, inspect evidence, choose a response and issue a public statement. The board remembers the costs and the promises.

## What's actually implemented

- Six complete playable episodes with different scene art, evidence, adviser intelligence, strategies and statements.
- Interactive evidence-timeline reconstruction in episode 1 and discretionary recovery-budget allocation in episodes 3 and 5.
- Original vector scene artwork and six consistent character portraits, embedded in the deployable HTML.
- Two to four teams in one browser, with a common scenario variant and independent team states.
- Two sealed adviser choices per team per episode. Choices can be changed before confirmation.
- Real cash ledger from an initial **£260,000 90-day response fund**. The **£240,000/year renewal** is tracked as contract value, never credited as cash.
- Baseline operating response costs, plan spending, delayed liabilities and contingent future obligations.
- Separate legal, operational, workforce, customer and liquidity exposures, client confidence and nonlinear outcome scoring.
- Local save/resume on the same device, with invalid/corrupted saves safely rejected; reduced-motion CSS, optional interface sound, 320px-responsive layouts.
- Final boardroom ranking, client renewal status and per-team causal case files.
- Explicit championship gate: only a team with a renewed annual client contract, solvent response fund and viable operations can be Boardroom Champion. If none qualifies, there is **no champion**; the highest numeric score is identified separately.

## Not yet implemented

The **standalone single-file game** remains shared-screen only. A separate experimental multiplayer Worker and mobile UI reuse its six-episode economic engine and maintain per-team private advice. Neither constitutes a deployed commercial multiplayer service, a final projector view, production authentication, Stripe or licensing. Adviser advice in the standalone game is visually sealed, not private from people using the same device. The economics are illustrative simulation rules, not an industry-validated financial forecast.

## Experimental multiplayer preview (Draft PR only; not deployed)

The original standalone `index.html` remains playable and unchanged in presentation, while its **same economic model** (`src/content.js` and `src/rules.js`) is now reused by the experimental server under `multiplayer/`. The preview is isolated from Cloudflare production.

- New rooms use **four-character short codes** from a 32-symbol, visually unambiguous alphabet (1,048,576 combinations). Codes are generated using cryptographically secure randomness with up to 20 collision retries. Existing 12-character room codes continue to resolve; expired short codes can be recycled after their 24-hour lifetime, and old room sockets are disconnected on reuse. A `/join` entry screen accepts a typed code, so a phone does not have to scan the QR. **A code is a locator, not an authentication secret**; before commercial release we need rate limits, room join approval/PIN and abuse controls to prevent guessing and room interference.
- The host creates a room for 2–4 teams; players join by QR/link or by typing the four-character code, choose a nickname and either accept automatic balancing (least populated team) or choose a specific team. Before the host starts, any participant can switch teams directly in the lobby; server updates team headcounts and reassigns captainship if the captain leaves. Captains may select an unused fictional team name. Room creation needs a separate founder-managed server-side `ROOM_CREATION_KEY`.
- **Independent projector:** the host can generate a read-only projector link. It shows public narrative, evidence, a camera-scannable join QR and room code **only in the lobby**, live per-team player counts, readiness status, individual team countdowns and the final verdict. Room codes, QR codes and join links are hidden from the UI after the host starts. It never displays player nicknames, private adviser intelligence, host controls or player actions. Regenerating the link revokes its predecessor and closes any active projector socket. The token lives in a URL fragment (removed from the address bar after opening) and is never the host token. Projector links are sensitive and should be shared only with the organiser.
- **All six episodes** are presented with their real narrative briefs, evidence, three strategic choices, public statements and optional £10k/£20k allocations in episodes 3 and 5. Teams select two advisers and receive **only their own** episode-specific confidential briefings.
- All teams share a **server-owned 3-minute response deadline**, with a 1-minute reserve window. **Each team freezes its own displayed countdown** as soon as every member locks a vote and a winning proposal is resolved; other teams keep counting. Finishing during reserve incurs −5 final score points; failing to resolve by four minutes incurs −12 points **and** an economic timeout (mandatory costs, worsening exposure and lower confidence). The host can advance only when all teams finish or time out.
- The Worker/Durable Object validates commands, processes spending and delayed liabilities, rejects duplicate/out-of-order submissions and broadcasts role-filtered updates by WebSocket. The **captain selects the two advisers**, but **every team member casts one complete ballot** (strategy, public statement, and optional investment). The most-voted full ballot is applied **once** to the economic engine. When leading ballots tie, only that team sees a debate screen offering the **two closest leading packages** and votes again while its deadline continues. Rival teams see only readiness notifications (e.g. TEAM IS READY), not their decisions or private ballots. The host sees all teams' voting progress and an ALL TEAMS READY message when able to advance.
- Final server-generated ranking applies accumulated time deductions to economic scores (floor at 0). A Boardroom Champion still requires renewed contract, solvent cash and viable operations. No qualified teams means **no champion**. At the end, participants can view a polished **Boardroom Verdict** with ranking cards, score decomposition, cash/trust, consequences and all six episode decisions. The report can be **printed / saved as PDF through the browser**, or downloaded as a self-contained, readable HTML document for sharing. The UI no longer offers raw JSON. Reports exclude credentials, room codes, adviser choices, private votes, nicknames and email addresses.
- `multiplayer/client.html` is the dedicated mobile-first preview UI for host and participants. The **original** shared-screen game has not been converted into a projector mode and is not yet a substitute for this preview.

Security and operational limitations: this preview has not been deployed or tested on real iPhone/Safari, remote unstable networks or 30 devices. Local Chromium integration tests now simulate a phone losing and recovering network access and validate projector role separation; these do not replace real-device or real-network tests. Room admission currently depends on room-code knowledge, nickname uniqueness and an input cap; it is **not production-grade authentication or abuse protection**. Production requires validated host identity, rate limits, reconnect/rejoin and captain handover, deletion/access request process, real load tests, network-failure tests and security review. Nicknames are visible to other participants in the room, and Durable Object room data expires after 24 hours. Tokens are issued once, never added to QR links, and only SHA-256 hashes are stored on the server; the browser uses per-tab `sessionStorage`.

Cloudflare staging uses a dedicated deployment credential and a separate Workers.dev Worker; the prior Cloudflare read-only token is not used to publish. CI-gated staging deployments run from this branch with owner-enabled settings. There is **no main/production merge**, no payment and no automated email sending.

**Local verification:** `npm install`, `node --test tests/multiplayer.test.mjs`, `npm run check:room-bundle`, `node tests/room-runtime.test.mjs` (Wrangler local Worker + Durable Object + multi-device Chromium integration), and `node tests/browser.mjs` for the existing standalone game. GitHub Actions runs these in a draft PR and archives actual browser screenshots. They now check projector access rotation, forbidden writes, snapshot privacy, the projector page and simulated network restoration. The draft Worker is named `business-crisis-rooms-preview`, not the production Worker, with `workers_dev: false` and no deploy job.

## Cloudflare staging — separately deployed preview

A **separate staging Worker** can now be provisioned without touching `main` or the production Worker. Its strictly validated config is `multiplayer/wrangler.staging.jsonc` (name `business-crisis-rooms-staging`, `workers_dev: true`, no custom domains/routes). The opt-in GitHub Actions workflow is `.github/workflows/business-crisis-staging.yml`; `scripts/check-staging.cjs` enforces isolation and `scripts/smoke-staging.sh` checks HTTPS, creation authorization, Durable Object persistence and the QR route after a deployment.

**Staging deployment is opt-in and was activated after owner setup.** If the repository variable `BC_STAGING_DEPLOY_ENABLED` is explicitly set to `YES` and dedicated secrets `BC_STAGING_DEPLOY_TOKEN` and `BC_STAGING_ROOM_CREATION_KEY` are missing, the staging job is skipped or fails safely. The existing Cloudflare read-only token is *not* used to deploy. Staging branch pushes with code changes now deploy after passing all gate checks. The staging Worker was successfully deployed on 4 November 2026; full real-device QA is still in progress.

See **[STAGING_RUNBOOK.md](STAGING_RUNBOOK.md)** for the setup, access boundaries, one-time account permissions, costs and the physical-device test plan. For independent dry-run checks:

```bash
npm install --no-audit --no-fund
npm run check:staging-isolation
npm run check:staging-bundle
bash -n scripts/smoke-staging.sh
```

## Second-pass code and fairness audit

See **[SECOND_PASS_AUDIT.md](SECOND_PASS_AUDIT.md)** for the verified fixes: stable player keyboard focus during live WebSocket updates; monotonic room revision rendering; safer host Next/Start retries; public recap data minimisation; cash-aware championship tie-breaking; truthful no-champion wording; a private provisional strategy vote pulse; and an enforced cap of eight unauthenticated WebSocket slots so anonymous connections cannot consume the whole room budget. The audit lists remaining recovery, room-code guessing, load-test and commercial privacy blockers without treating them as solved.

## Cinematic information design and storyline audit

**The game keeps its economic and narrative depth while reducing simultaneous reading.** The six episodes now use custom, lightweight vector scene illustrations; a six-step visual progress strip; a one-line evidence finding on each of three exhibits (full source revealed on click); and a collapsed full briefing for players who want more context. Strategy choices show their core action and description first, with benefits, cost and trade-offs available behind **Reveal trade-offs**. Confidential adviser briefs are retained and grouped as a private expandable dossier.

The active player screen now shows a **team-private live exposure strip**: response cash, client trust, commitments and four named risk-index bars (lower is better). The projector never receives that sensitive team data. Actual playtime remains governed by the server, with individual-team clock freezes after the winning full ballot is resolved. When an in-team revote ties again, the captain's revote ballot is the casting vote, preventing an endless loop; this is announced before the runoff.

The multiplayer room now also reuses the **six original illustrated adviser portraits and illustrated corporate environments**, not just the newer scene diagrams. They are served from a **visual-only** file (`multiplayer/client-art.txt`) without importing `BCContent`, so no unrevealed story advice is sent to players. The proiector has an always-visible public team-readiness ticker above the scene; individual players have a quick jump to the decision panel and see their voting controls ahead of long team rosters.

The stage uses restrained navy/petrol tones with meaningful amber/teal/coral accents, illustrated incident scenes, high visibility labels and nonessential animation disabled by `prefers-reduced-motion`. Design is informed by progressive disclosure and accessibility guidance, not unverified claims that one colour will make players behave a certain way.

See **[EXPERIENCE_RESEARCH_STORY_AUDIT.md](EXPERIENCE_RESEARCH_STORY_AUDIT.md)** for public UX research sources, six-episode causal and timeline review, scoring logic, deferred obligations, recommended facilitator prompts, unanswered questions and testing limitations. `tests/storyline.test.cjs` guards structural and economic consistency; these checks do **not** substitute for a real facilitated group playtest.

## Play and review

The repository root `index.html` on **this branch** is a standalone, self-contained game. Download the file and open it in a modern browser. Do **not** merge into `main` or replace the Cloudflare production Worker until founder approval.

The previous public game remains available on `main` and is unaffected by this branch.

## Develop and test

```bash
node scripts/build.cjs
node tests/rules.test.cjs
npm install
npx playwright install chromium
node tests/browser.mjs
```

GitHub Actions reports cash, score and risk percentiles from 1,200 seeded simulations, checks deterministic ledger invariants, rejects corrupt local saves and runs full Chromium playthroughs for 2, 3 and 4 teams, including 320px mobile. Actual browser screenshots are uploaded as a workflow artifact when the run succeeds. These automated tests do not substitute for Safari/iPhone device tests or independent group playtesting.

## Source structure

- `src/content.js` — episode writing, adviser intelligence, trade-offs and costs.
- `src/rules.js` — pure deterministic cash/risk state transitions and scoring.
- `src/art.js` — original scalable illustrated environments and characters.
- `src/style.css` — cinematic responsive visual system.
- `src/app.js` — scene navigation, interaction, session persistence and view rendering.
- `scripts/build.cjs` — creates the self-contained root `index.html`.
- `multiplayer/` — isolated server-authoritative six-episode room preview and mobile browser UI; not deployed.
- `tests/` — simulation and real-browser end-to-end tests.

**Design rule:** If a screen reads like a questionnaire or a KPI dashboard, it needs another pass. The player should feel inside the incident, not inside a report.

## Typography and keyboard improvements (v2.1 preview)

- Replaced the platform-dependent Impact headline font with an editorial system-font stack and robust fallbacks. No third-party font requests; the single-file game still runs offline.
- Increased small-label and adviser-role legibility, repaired mobile heading line heights, long-name wrapping and narrow-screen receipts.
- Selection controls now retain keyboard focus. Evidence dialogs restore focus on close/Escape and trap Tab navigation. Animations play on scene transitions, not every selection.
- Browser tests inspect typography and overflow on six scenes and exercise keyboard interactions.

## Email results decision

**No email collection or sending in this prototype.** The finished Boardroom Verdict is available on-screen, printable as PDF and downloadable as a self-contained readable HTML report without giving us an email address. Although some providers offer free transactional-email quotas, sending results to a personal address would still require a lawful basis, a clear privacy notice, defined retention/deletion rules, abuse limits, verified sending domain, and an operational support path for access/deletion requests. Add optional results email only after these obligations, verified sending infrastructure and cost controls are properly addressed.

## Outstanding charter requirements — not yet delivered

- **Partly prototyped, not released:** QR/link room joining, nickname/team selection, proposed team callsigns, host controls, authenticated per-role WebSocket snapshots, timed private adviser selection, reconnection attempts and 24-hour room expiry. Not yet verified in the deployed Cloudflare runtime or on real phones.
- **Now built in local preview:** all six economic episodes and final score integration, individual voting with team-only tie-breaking, independent team timer freezes, time penalties, per-team private adviser intelligence, server-authoritative commits and a designed, printable/exportable Boardroom Verdict.
- **Now locally prototyped:** separate projector mode with revocable, read-only credentials, and automatic refresh on reconnection or tab visibility.
- **Still missing:** polished cinematic projector transitions, verified real-device reconnect, commercial host login, robust rate limits, captain handover, payment/licensing, automatic email delivery and direct server-generated PDF export. The current PDF path is **Print → Save as PDF in a browser**.
- **Not independently verified:** real iPhone/Safari, assistive-technology screen readers, five moderated customer groups, 30-player load and reconnect, commercial willingness-to-pay and validated economic forecasts.
- **Partially delivered:** recurring SVG characters, six episodes, shared-screen team competition, local save/resume and seeded scenario variants. Character art direction still requires founder approval.
- **Release boundary:** this is a draft development PR. Production main/Cloudflare stays unchanged until deliberate approval.
