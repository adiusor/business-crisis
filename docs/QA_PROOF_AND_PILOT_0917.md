# The 09:17 Challenge — QA proof and human pilot handoff
**Updated:** 5 November 2026. **SINGLE full-game development URL:** https://the-0917-challenge-staging.adiusor.workers.dev/

The 09:17 Challenge is an experimental B2B team decision game. The existence of working simulations does **not** demonstrate commercial success, user satisfaction or accredited learning outcomes.

## Independently inspectable automated evidence

| Test | Evidence | Grounded result |
| --- | --- | --- |
| Published Workers.dev deployment + independent HTTP reachability | https://github.com/adiusor/business-crisis/actions/runs/42066710815 | PASS: published staging Worker, all original B2B pages, Host/Join, lobby and QR; unauthorized room creation denied |
| **25 virtual participants on the published Worker** | https://github.com/adiusor/business-crisis/actions/runs/42066710815 | PASS: 25 authenticated WebSockets, 25 virtual players, four teams, 150 individual votes over six episodes, exactly one response outcome per team/round; private information stays role-scoped; final score accounting checks |
| Browser end-to-end baseline | https://github.com/adiusor/business-crisis/actions/runs/42063960054 | PASS: Chromium, WebKit and Firefox; local Worker, role separation, join, voting, projector and PDF; this was the same game code before adding the synthetic capacity test |
| Latest combined local + browser + 25-client QA | https://github.com/adiusor/business-crisis/actions/runs/42066723284 | Check final run status: it is a separate CI run for the latest test harness; do not assume success before it completes |
| Economic and narrative model | `src/rules.js`, `src/content.js`, `tests/storyline.test.cjs`, `scripts/calibrate-0917.cjs` | Decisions move cash/trust/risk; current funding, liabilities and earlier decisions inform private consequences. Six episodes have response options with distinct quantified trade-offs. The final chapter has three viable paths in synthetic comparisons. These are test rules, **not externally validated financial or leadership forecasts**. |

### What the 25-player test does NOT prove
The 25 sockets all originate from an automated test runner. They are not 25 physical phones, mobile carriers, varying browsers, congested venue Wi-Fi, people struggling to follow rules, or independent player choices under live event pressure. Server or client performance under other conditions may differ. There is no documented real-world cohort of 25 people or user satisfaction result yet.

## One-game testing links (direct)
- **Website / complete game:** https://the-0917-challenge-staging.adiusor.workers.dev/
- **Facilitator creates a fresh room:** https://the-0917-challenge-staging.adiusor.workers.dev/play
- **Participants join with the room code or QR:** https://the-0917-challenge-staging.adiusor.workers.dev/join
- **Facilitator role and feature explanation:** https://the-0917-challenge-staging.adiusor.workers.dev/for-facilitators
- **Leadership application:** https://the-0917-challenge-staging.adiusor.workers.dev/leadership-team-building

Do not reuse a mid-game pre-update room for story/scoring validation. Use a new room and a fresh team report. Do not publish the private room creation key, host token or player tokens.

## Human pilot — reproducible run of show
1. Recruit **at least 8–12 participants** for an initial facilitated pilot, then a **25-person venue test** after problems are fixed. Have a host and a separate observer. Introduce this as a fictional business challenge, not personnel assessment.
2. Host opens the direct `/play` link, enters the existing staging-only key, creates 2–4 teams and shares the new room link/QR. Participants use `/join`, choose a nickname and a team (or AUTO-ASSIGN). Check that names and team counts match the people in the room.
3. Run all six scenes. Let people discuss at least two genuinely plausible alternatives. Observe the three-minute normal timer and one-minute grace; note any missed decisions, off-screen content, incorrect role visibility or unexplained outcomes.
4. Keep the projector on a separate screen, verify that it receives only public information, and download the boardroom report after all six rounds. Have the team explain *why* a strategy affected cash, trust, staff capacity or risk. Check whether the PDF breakdown reconciles to the visible scores.
5. Collect anonymous, voluntary 1–5 ratings for: **clarity**, **enjoyment**, **fairness of results**, **everyone was involved**, **would recommend to colleagues**. Also ask: "Which choice felt unrealistic?" and "Where did you lose interest?". Note setup time, total run time, technical incidents, % completing, and whether participants voluntarily debate choices.
6. Do not edit scoring formulas mid-session. Make a versioned change, rerun regression tests and compare subsequent sessions separately.

### Proposed pilot acceptance thresholds (hypotheses, not already achieved)
- No cross-team disclosure of hidden advisers, no duplicate vote charging, no unrecoverable room failure.
- At least 90% of participants finish the six chapters in the intended facilitated time.
- Median clarity and enjoyment >= 4/5; at least 70% of respondents say they would play again or recommend it.
- Participants can explain at least one meaningful decision trade-off and connect an earlier choice to a later consequence.
- Follow-up full venue test with **25 physical devices** and a genuine event network; investigate every connection or projector issue before selling.

## Remaining product decisions
- Validate difficulty and replay value with people, not random-walk simulations. In particular, trust frequently saturates at 100 in synthetic games; assess whether it masks meaningful differentiation.
- Assess narrative believability (leaked *draft* versus finalized board decision, the £240k **annual** contract versus £260k **response cash**, delayed bills, fatigued specialists and public messaging).
- Watch for reading load and excitement: the game should be a memorable collaborative activity, not an HR compliance exam.
- User testing will decide whether the next version needs different timers, clearer adviser activities, shorter source briefs or rebalanced champion conditions.

**Release boundary:** Only the `feature/0917-corporate-challenge` Worker is the experimental public-facing development environment. No need for separate Vercel game demo or a new Workers.dev deployment. Production release and paid sales are separate decisions.
