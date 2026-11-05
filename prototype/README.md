# Launch Disaster — experimental vertical slice

**Review status:** interactive single-device concept prototype; not integrated into Cloudflare multiplayer, not a canonical storyline, and not production-ready.

## Run it
1. Download **launch-disaster-vertical-slice.html** from GitHub (use **Raw** or download the file).
2. Open the HTML locally in a modern browser.
3. Follow the full flow: cinematic intro → select exactly 2 of 4 intelligence sources → reveal dossier → select 1 of 3 operational strategies and 1 of 3 public statements → see an explicit cash/inventory/trust/risk consequence → replay with different choices.

The page is self-contained (HTML/CSS/JavaScript, original inline vector product art, no remote script/font/assets), and does not request or store participant information. All outputs are fictional demo rules, not a business forecast.

## What it intentionally proves
- A faster, less oppressive **entertainment-first** opening.
- A *choice* about which intelligence to consult, not merely scrolling through six adviser cards.
- A clear narrative aftershock and a return invitation rather than a raw score.
- Explicit, inspectable trade-offs: initial £120,000 response fund, mandatory £5,000 cost, 40,000 preorders, 9,000 initial ready units; a backup-supplier route can make 14,000 extra units available in the fictional model.
- Responsive layout and keyboard-addressable native buttons have been designed. Real-device accessibility requires independent verification.

## Mechanical smoke test already performed
- The inline JavaScript compiles (syntax).
- All script-referenced HTML ids exist.
- A lightweight simulated-DOM event run completed selection (0 → 1 → 2), dossier unlock, decision selection, commitment and replay.
- For **Buy More Capacity** + **Own It**, prototype outputs: £69,000 remaining; 23,000 ready units; 17,000 unfulfilled preorders; trust 51; exposure 44.

**Not yet tested:** rendering in an actual browser, screen reader, physical mobile devices, venue projector, real-time multiplayer, live Cloudflare staging, network recovery or a real group. The simulated DOM test is a basic logic smoke test, **not** a substitute for browser testing.

## What the prototype deliberately does not claim
It has no rooms, WebSockets, real-time team synchronisation, host, voting, authentication, variable scenario seed, calibrated economy, legally assessed product claims, six complete episodes, sound or customer purchase path. It must not be marketed as a fully built game.

## Founder review prompts
1. Is this scenario more immediately appealing to a mixed corporate social group than the restructuring leak?
2. Is the balance of playful humour and strategic substance right?
3. Which moment felt most memorable: the intro, limited intel choice, decision or aftershock?
4. Would a public negotiation or creative live pitching round improve the next episode?
5. What felt too much like reading or a disguised quiz?

## Phase B next gate
Build one real multiplayer interaction for this *new* story, on this isolated branch or a clean successor, after agreeing a documented scenario content contract. Reuse the existing tested room-voting engine where possible. Before any staging deploy, test server authority, privacy, 2–4 team sessions, WebKit and Chromium, mobile readability, host/projector roles and a consistent 45–60-minute facilitated format. Do not merge to main or silently replace the original incident.
