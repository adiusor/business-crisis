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
- Local save/resume on the same device, reduced-motion CSS, optional interface sound, 320px-responsive layouts.
- Final boardroom ranking, client renewal status and per-team causal case files.

## Not yet implemented

This is **not** real multiplayer: no QR joining, no private phone screens, no host/projector separation, no backend authority, no authentication, no Stripe or licences. Adviser advice is only visually sealed until selection, not secure against other users on a shared device. The economics are illustrative simulation rules, not an industry-validated financial forecast.

## Play and review

The repository root \`index.html\` on **this branch** is a standalone, self-contained game. Download the file and open it in a modern browser. Do **not** merge into \`main\` or replace the Cloudflare production Worker until founder approval.

The previous public game remains available on \`main\` and is unaffected by this branch.

## Develop and test

\`\`\`bash
node scripts/build.cjs
node tests/rules.test.cjs
npm install
npx playwright install chromium
node tests/browser.mjs
\`\`\`

GitHub Actions runs 1,200 seeded engine simulations, deterministic ledger invariants and full Chromium playthroughs for 2, 3 and 4 teams, including 320px mobile. Actual browser screenshots are uploaded as a workflow artifact when the run succeeds. These automated tests do not substitute for Safari/iPhone device tests or independent group playtesting.

## Source structure

- \`src/content.js\` — episode writing, adviser intelligence, trade-offs and costs.
- \`src/rules.js\` — pure deterministic cash/risk state transitions and scoring.
- \`src/art.js\` — original scalable illustrated environments and characters.
- \`src/style.css\` — cinematic responsive visual system.
- \`src/app.js\` — scene navigation, interaction, session persistence and view rendering.
- \`scripts/build.cjs\` — creates the self-contained root \`index.html\`.
- \`tests/\` — simulation and real-browser end-to-end tests.

**Design rule:** If a screen reads like a questionnaire or a KPI dashboard, it needs another pass. The player should feel inside the incident, not inside a report.
