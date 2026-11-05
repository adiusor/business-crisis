# THE 09:17 CHALLENGE — Corporate-friendly refinement of the original multiplayer game
**Status:** draft concept on `feature/0917-corporate-challenge`. Working name pending trademark, domain and audience checks. **Not deployed** to Cloudflare staging or production by this branch.

## Product promise
**Six decisions. One team. A different outcome every time.**

At 09:17 a preliminary company transformation document reaches 600 employees and three clients. A £240,000 annual contract renewal is approaching, and a £260,000 response fund must be managed carefully. The point is not that a crisis is fun; the point is that a team can **make something better together** when the answer is incomplete.

The audience experience is a corporate decision game for facilitated team-building: human disagreements, funny or surprising conversations, challenging priorities, and recognitions for well-managed trust, cash, timing and risk. It must not feel like a school test, compliance simulation, or stressful HR investigation.

## What we preserve
- Original six time-ordered episodes (09:17 to 17:30), original factual evidence, same six advisers, same 90-day response budget and annual renewal.
- Two-to-four teams, authenticated facilitator, individual voting, server-authoritative time and decision state, private adviser intelligence, shared projector, downloadable report.
- Exactly three strategic options and three public messages for each scene, with varying cash costs and trust/workforce/legal/operations/customer consequences.
- Deterministic seeded scenario variation, delayed liabilities, company outcomes, championship criteria and honest handling of unsolved sender attribution.

## Narrative arc
| Scene | New heading | The team's constructive task | Trade-off |
| --- | --- | --- | --- |
| 1 | The Send | Verify facts, protect trust and keep delivering | Control costs vs customer continuity |
| 2 | The Floor | Give employees a voice and protect the shift | Dialogue vs immediate coverage vs staff investment |
| 3 | The Client Meeting | Earn renewal confidence with evidence | Independent review vs accountable milestones vs delivery proof |
| 4 | The Public Conversation | Correct misinformation and respect confidentiality | Immediate public clarity vs fact-checking vs legal privacy |
| 5 | The Delivery Test | Deliver sustainably with fatigued specialists | Backup capacity vs staff-led execution vs agreed priority changes |
| 6 | The Next Move | Invest in a better future, not just a reassuring announcement | Durable oversight vs acceleration vs focused commitments |

Every plan has at least one plausible operational/commercial benefit and a meaningful opportunity cost. Unrealistic answers such as "PROMISE EVERYTHING" and "THREATEN ACTION" were retired. Some promises still create future expenditure. Financial results are illustrative, **not forecasts**.

## Positive outcomes, without making up winners
- The scoreboard always identifies the highest-scoring **team response**.
- A strict *boardroom champion* still requires renewal readiness, nonnegative cash and viable operations. A high score alone is not a signed renewal.
- Recognition is given for **strongest client trust**, **most cash protected**, **lowest measured average risk**, and **fewest time penalty points**. These awards are based on recorded team figures; no unsupported claim about individual personality or leadership competence.
- Even unsuccessful economic outcomes should prompt a constructive question: "What did we protect, what did we trade away, and what would we do differently?"

## Buyer positioning
**HR and People teams:** "An original story-based challenge that brings colleagues together around decisions worth debating." 
**Event organisers:** "A repeatable hosted team decision game with a real projector, role separation and six episodes." 
**Leadership trainers:** "Evidence-led disagreement and reflective team decisions rather than multiple-choice leadership stereotypes."
**Education:** A potential later case supplement, but Opening Night remains the education-led product; no attempt to brand this older game as accredited training.

## Critical release gates
1. `node scripts/build.cjs` must produce the committed `index.html` exactly.
2. Tests must cover 1,200 seeded sessions, six-episode chronology, all alternatives, live multiplayer privacy, three-browser room journeys (Chromium, Safari-like WebKit and Firefox) and PDF content.
3. Host vs Join must be obvious, with room creation **still requiring** the current private access key. Do not bypass room access controls for convenience.
4. Play with at least three independent real-world groups, including a corporate-style team. Measure setup friction, dialogue energy, session length, ability to explain the rules and the proportion who would voluntarily play again.
5. Validate the name legally and commercially before changing domains, canonical URLs or announcing external availability. No fake reviews, credential claims or guaranteed results.
6. Keep production and old staging unchanged until approval; do not merge draft PRs automatically.

## How to inspect
- The revised old game is on `feature/0917-corporate-challenge`, based on the separate host/join accessibility improvements in `fix/clear-room-entry-paths`.
- The separate *Opening Night* educational game and Vercel experiment remain untouched in `feature/business-in-play-learning-v1`.
- The standalone `index.html` can be opened as a local HTML file after download. It is **not** the live 25-player room product.
- A clean staging / preview and CI review must happen before directing prospective clients to the new version.
