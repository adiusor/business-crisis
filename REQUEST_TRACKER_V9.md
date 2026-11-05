# BUSINESS CRISIS — FOUNDER REQUEST TRACKER V9
Date: 5 November 2026
Staging branch: redesign/cinematic-crisis-v2 / PR #2. NEVER treat a commit as a deployed/verified feature until same-head staging and CI pass.

## Rule: one request, one source change, one verification
Statuses mean: **IN BRANCH** = code has been committed, not necessarily verified; **TESTED** = matching feature has passing automated tests at the same head; **MANUAL** = still requires physical devices/participants; **DEFERRED** = intentionally not built.

| # | Founder request | Status | Source and acceptance criteria |
|---|---|---|---|
| 01 | Safari Mac sees advisers, strategies and statements, not stuck host/projector interface | IN BRANCH / MANUAL | `/join` refuses inherited host token; host uses separate **PLAY AS TEAM MEMBER** tab; test with actual Mac Safari. |
| 02 | After Lock Vote, hide Save/Lock button and other form choices, show only two chosen advisers and status | IN BRANCH | `renderPlayerActions()`, complete-vote WebKit/Chromium journey. |
| 03 | Host visibly alerted when both/all teams are done | IN BRANCH | focus-trapped ready overlay with start-next-episode action, host command centre. |
| 04 | Player returns to top when host advances to next episode | IN BRANCH | round/phase-scoped scroll and browser test. |
| 05 | Join by room code from first page | IN BRANCH | quick join + `/join?room=` forms. |
| 06 | Mid-episode join and clear eligibility, no hostage voting | IN BRANCH | active round only if no votes filed and >=60s penalty-free time; else next round; authoritative electorate. |
| 07 | Notify join, leave, transfer and host removal with name/team | IN BRANCH | queued presence toasts; voluntary leave is explicit, disconnection is not falsely announced. |
| 08 | Two chosen advisers' data directly below selection | IN BRANCH | six-card picker collapses after selection; change adviser control. |
| 09 | Rules visible before first game then collapsed at bottom | IN BRANCH | brief opens in lobby; moved beneath decision during live phase. |
| 10 | Boardroom is fun, visually designed, fewer useless KPIs | IN BRANCH / MANUAL | cinematic boardroom illustration, champions, rankings, factual awards, two labelled donut charts, priciest episode fact. Usability must be tested with actual participants. |
| 11 | Compare two–four teams over all six decision trails | IN BRANCH | expandable per-episode comparisons, no private individual ballots. |
| 12 | No email collection, sending, result emails, or future feature roadmap | IN BRANCH | no email endpoint; no HTML export; one-click PDF report independent of email. |
| 13 | A proper **PDF** directly downloaded, not an HTML file or print dialog | IN BRANCH / MANUAL | `client-pdf.txt`, `/room-pdf.js`, button **DOWNLOAD RESULTS · PDF**; browser download asserts PDF bytes; real iPhone Files/Share sheet still needs testing. |
| 14 | Share projector via complete copied link | IN BRANCH | revocable read-only capability `/projector?room=...#access=...`, clean browser test; normal room URL not a projector credential. |
| 15 | Projector no scroll at 1280×720, 1024×768, 1920×1080 | IN BRANCH / MANUAL | dedicated lobby/live/finale layout, evidence modal; real hardware still needs testing. |
| 16 | Mobile not endlessly scrolling, information readable | IN BRANCH / MANUAL | compact cinematic scene, evidence disclosure, live decision dock, collapse adviser picker, 320px/390px checks. |
| 17 | Team chosen as default must actually join without changing dropdown | IN BRANCH | real named team is selected by default, AUTO is explicit optional; untouched default join regression. |
| 18 | Premium office towers / photography-like first page | IN BRANCH | original local SVG nocturnal corporate skyline; visually coherent but **not a photograph**. |
| 19 | More interesting dedicated host interface | IN BRANCH | public team attendance/progress/clock control room; only host can advance; no private votes shown. |
| 20 | Office and fully remote formats | IN BRANCH / MANUAL | same code and host; on-site projector or video-call screen share + team breakouts. Must do real remote rehearsal. |
| 21 | Hostless mode | DEFERRED | Not appropriate pre-launch; separate product/state/recovery design. |
| 22 | Chromium, Safari/WebKit, Firefox testing | IN BRANCH | quality gate runs 3 browsers on live Worker+Playwright; Edge shares Chromium engine but physical Edge check still recommended. |
| 23 | Security and unexpected connected issues | IN BRANCH / PARTIAL | source/role privacy tests; capped active participants; temporary rooms; socket authentication deadline; need real distributed load and rate limiting. |
| 24 | Psychological impact, tension, curiosity, strong design, easier reads | IN BRANCH / MANUAL | source-led dilemmas, chapter cues, unique original locations, focused form, verdict charts; human testing and narrative editing remain. |
| 25 | UK and Romanian commercial markets, offers and how to present the game | DOCUMENTED | `GO_TO_MARKET_V1.md` with competitors, pilot-price hypotheses, buyer segments and first 90 days. Not validated revenue. |
| 26 | AI lead prospecting, outreach drafts, marketing assets and campaigns | DOCUMENTED / NOT LAUNCHED | AI-assisted human-reviewed CRM/research/outreach plan, compliant opt-out and clear separation from game data; no outbound campaign launched. |
| 27 | Double/triple verification of all above | ACTIVE RELEASE GATE | Same-head test suite, staging smoke, 2–4 teams, phone, projector, 3 browser engines, PDF structure, real-device and pilot group follow. |

## P0 release blockers (highest importance)
1. Run the **latest commit's** full CI and staging workflow; do not confuse old green run with new head.
2. Test actual iPhone Safari: enter by default team, vote, leave, reopen, download .pdf to Files, inspect PDF in Preview/Files.
3. Test actual MacBook Safari: join as player from a duplicated host tab, all adviser cards and statement choices, role separation and next chapter scroll.
4. Projector at venue: 1024×768/1280×720/1920×1080 and shared link in a fresh browser.
5. Run 2–4 teams with a facilitator; try 30 phones **only after** repeatable small-group tests and network resilience work.
6. Exercise a late entrant before and after first vote, captain departure, runoff ties, client network disconnect, and host page refresh.
7. Test PDF opens in at least two actual viewers, page titles/graphics intact and no code, token or personal ballots leaked.
8. Marketing assets, public pricing and outreach should not promise performance that has not been demonstrated.

## Commercial priority
A profitable live **facilitated session** is the first product, not self-service software. Run realistic free/low-price pilots, record costs and buyer objections, then test prices and agency resale. Commercial email outreach may be lawful only after recipient-category checks, applicable jurisdiction rules and opt-out compliance; **no result emails from the game, ever**.

## References
- Source and QA: `WORLD_CLASS_AUDIT_V8.md`, `tests/room-runtime.test.mjs`, `tests/multiplayer.test.mjs`.
- Commercial market and 90-day go-to-market: `GO_TO_MARKET_V1.md`.
- Host and room operations: `multiplayer/OPERATOR_GUIDE.md`.
