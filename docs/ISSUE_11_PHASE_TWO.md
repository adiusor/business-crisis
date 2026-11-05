# Issue #11 · Stage 2 — Untimed team preparation before decisions

**Implementation branch:** `feature/0917-untimed-adviser-prep`  
**Stacked review target:** `fix/0917-gameplay-fairness-pacing-consequences` (PR #13)  
**Change type:** multiplayer mechanics and UI only — *no new product variant*.  
**Deployment:** none. Existing `the-0917-challenge-staging.adiusor.workers.dev` is unchanged.

## Why

The previous game started the 180-second normal clock while the captain still needed to select two advisers and the team had to read the chapter and evidence. This could discourage debate. PR #13's public preview reduced reading burden but did not move adviser selection outside the clock.

## New host-led experience

1. **Lobby:** players join and switch teams as before. Host reads the six short rules.
2. **OPEN UNTIMED TEAM PREPARATION** (`start_prep`): host starts a new *preparation* stage. All players see the chapter, three public exhibits, and any team-private prior consequence. Each captain selects two private advisers and can revise that pair. The host sees only per-team `advisersReady`, never the selection or sealed brief.
3. **START 3-MINUTE TEAM DECISION** (`start`): server permits this only when every team has a current captain and two advisers. All picks are now frozen for the round. Server starts one common 180s normal countdown and 60s reserve with the same penalties and per-team clock freeze. Participants debate strategy/statement/investment and lock their individual complete ballots; no voting was allowed in prep.
4. **Between rounds:** only after *all teams* have locked, a public next-episode preview appears, then host advances to the next **untimed preparation** phase. Six episodes follow exactly the same sequence, leading to the original truthful economic verdict.
5. **Late entry:** new players during preparation join the current episode's electorate, with no timer to reset. The existing join restrictions apply after the decision clock begins; a mid-round late arrival may only vote while their team has submitted no ballot and at least 60 seconds remain in normal time.

## Authority and safety

- All transitions and ballots remain inside the existing Cloudflare Durable Object room-core. `clockFor` returns null during preparation, so no economic timeout can be generated before a host starts the decision window.
- Both original and new mode use exactly the same source-of-truth economic rules, cash ledger, risk and scoring formulas. Older API clients may still start a legacy timed episode directly; the actual host UI uses the new preparation flow.
- The host/projector receive **readiness flags**, not private adviser indices, individual ballots or cash. A participant receives only their own team's intelligence. Host recovery actions (transfer captain, remove erroneous join) remain available in preparation.
- No change to secrets, room-creation key, session-storage credentials, report PDF, public SEO, Cloudflare routes or production.
- This branch has intentionally not touched Project Spark narrative work from independent PR #14. Integrate mechanics with a story only after founder approval.

## Automated acceptance

Unit tests cover: no clock in prep; vote rejected before timed start; two-adviser gate on all teams; private adviser visibility; frozen picks; late arrivals; six sequential rounds in 2-, 3- and 4-team rooms; cash-ledger reconciliation; same time penalties. Existing tests continue covering host/projector/QR, role tokens, 25 synthetic client load, and six-round reports. Browser E2E now exercises the actual new Host button, team adviser picks on phones, gated countdown, secret-adviser collapse and 720p projection.

**Release blockers:** physical-device facilitator pilot, feedback on perceived discussion time, 25 actual phones/network reconnect, Safari iPhone, accessibility and commercial willingness to pay. Do not treat simulated browser clients as real-room proof.

## QA focus

- Does the untimed stage feel like productive prep or an awkward idle screen? What is a sensible facilitator cue?
- Can a 320px phone read evidence and two private adviser briefs before voting?
- Can captains understand that their selections are frozen once the clock starts?
- Does the projector clearly communicate the stage without showing private advice?
- Do 5-7-person teams still fragment complete-package ballots excessively?
- Does a late join during preparation become eligible without invalidating teammates' intentions?

**Working output remains a draft PR, not staging.** Do not merge/deploy during a live session; review and reconcile with independent Game Director PR #14 first.
