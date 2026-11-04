# BUSINESS CRISIS — second-pass code, game and privacy audit
**Audit date:** 4 November 2026. **Scope:** `redesign/cinematic-crisis-v2` only, Draft PR #2. The Cloudflare Worker deployed by the staging workflow is strictly separate from the public game.

## Confirmed findings and repairs

| Area | Finding | Corrective action | Verification |
|---|---|---|---|
| Player interaction | Every WebSocket snapshot rebuilt the entire strategy/voting form, stealing focus and collapsing a player's interaction when another team submitted a choice | Cache rendering by the player's meaningful decision state; update live vote progress and the private strategy pulse in place | Chromium with a remote team action while a strategy button has keyboard focus; DOM disclosure remains expanded |
| Network ordering | Older HTTP/WebSocket snapshots could overwrite a newer room revision, briefly reopening previously locked controls | Reject snapshots whose room revision is older than the currently rendered room | Monotonic revision guard and existing stale-command tests |
| Host transitions | Host's valid Next/Start action sometimes failed with a stale global revision when another team changed the state in the same moment | Refresh and retry safely once, only if the server still permits the requested stage transition | Chromium host flow, optimistic concurrency unit tests |
| Mid-game economic privacy | Shared recap contained every team's cash and client trust, despite the intended team-private exposure dashboard | Public recaps show only declared action, public statement, response spending and time penalty. A team's balance/trust remain team-private until the final verdict | Node privacy assertions for host, rival and projector plus browser aftershock test |
| Championship ranking | Ranking used cash as score tie-break but the champion title could be shared with a lower-cash team | Use remaining cash to break equal scores; only identical score **and** cash share the title | Deterministic synthetic finalist tests |
| Score clarity | Printed `economic − penalty = score` without stating the zero floor | Print `floor 0` in the score decomposition and explain `max(0, score − penalties)` | Unit test with penalties exceeding economic score |
| Ending accuracy | When no team met all renewal requirements, the report incorrectly announced that the contract was lost, even for conditional cases | Recognise the best crisis response and separately mark that no confirmed renewal was secured. Never equate `CONDITIONAL` with `LOST` | Report browser checks and score eligibility rules |
| Team engagement | A complete ballot combines strategy, public statement and optional investment. With larger teams preferences can be spread across many alternatives | Keep complex decisions, but add a **team-private provisional strategy pulse** based on the real locked ballots. It encourages discussion without publishing votes to opponents or inventing a result | Underlying immutable vote tally; browser and role-filtered data tests |
| Room WebSockets | Up to 64 unverified socket handshakes could occupy all room slots | Keep at most eight still-unauthenticated sockets: new connections displace the oldest anonymous pending socket, so a legitimate host is not locked out by a full pending quota. Keep first-message SHA-256 credential verification and rotated projector token revocation | Local Cloudflare Durable Object test opening eight pending sockets, displacing the oldest on the ninth and confirming host access remains possible |
| Narrative audit | Contradiction in source naming would be easy when public episode labels are also duplicated client-side | Remove stale unused client episode-name constant; retain the six canonical chapters in `src/content.js` | Six-episode storyline structural tests |
| Real-device recovery | Players reconnect through their saved in-tab credential, but lost browser storage cannot recover their identity | **Not solved**; commercial version needs host-controlled recovery/revocation and fail-safe quorum policy | Explicit release blocker |

## Economic logic that was retained

- 6 episodes, 3 strategic paths + 3 distinct public statements every round; optional allocation rounds 3 and 5.
- Private adviser picks, real mandatory costs, delayed liabilities and liability-sensitive scoring. The £240k annual renewal is not credited as liquid cash to the separate £260k response fund.
- Every player locks a **complete proposal**. One team-level winning proposal is applied exactly once to the ledger and score. In a tie, the team's two closest leading proposals go to a private revote. A second tie is resolved by the captain's announced casting vote.
- Each team freezes its own countdown on confirmed resolution. Other teams continue counting. A decision in the final grace minute incurs 5 points; no confirmed decision by four minutes incurs 12 points and a real economic no-response consequence.
- A champion still must meet financial, client-contract and operational eligibility. When there is no champion, the leading team's contribution is recognised without pretending all contracts were lost.

## Remaining commercial release blockers

**Security:** four-character room codes are locators, not access-control secrets. They can be guessed; public lobby/join still requires application- or edge-level abuse controls, rate limiting and ideally a host-approved admission/PIN. A quota of eight pending connections with oldest-first displacement mitigates total room-slot exhaustion while allowing legitimate clients to connect; an attacker can still churn pending connections or disrupt other handshakes. This is **not** full anti-abuse protection. Automatic expiry based on Worker alarms and handshake-only authentication were attempted but failed the Cloudflare local runtime/rotation tests and were **not shipped**. Production needs platform rate limiting and, ideally, short-lived socket tickets or more robust connection quotas. External rate limiting, payment security and real host accounts have not been implemented.

**Availability and scale:** the current input ceiling is **30 participants total**, and 30 concurrent physical devices have **not** been load-tested. Four teams of 10–20 participants each are not a verified supported scenario. Reconnection after storage loss, participant removal and a fair absent-voter policy remain open questions.

**User research:** automated browser tests and qualitative screenshot review cannot establish whether groups prefer the colour palette, understand the dilemmas, or finish within 3+1 minutes. Test with real mixed-skill teams, projector, iOS Safari/Android Chrome, assistive technology and low-end phones.

**Facilitator and records:** print-to-PDF is browser print, **not** server-generated PDF. Email collection/sending, opt-in consent, retention, account protections and GDPR support are not present.

**Product judgment:** the storyline is causally coherent and economic options are differentiated, but the small overall probability of formally renewed outcomes under random decisions can produce sessions with no champion. This is a deliberate eligibility gate; the best-response recognition is meant to reward performance without falsifying the contract result. Test whether facilitators prefer that distinction.

## QA gate before every staging publish

- Economic tests: 1,200 seeded simulations with a reconciled cash ledger, repeatable outcome state and liability accounting.
- Storyline tests: six ordered timestamps, three evidence exhibits, independent adviser intelligence and consequential alternatives.
- Multiplayer: authorization, individual votes, tie/revote/captain-casting, own-team clock freeze, deadlines, 4-character and legacy room codes, role privacy and scoring.
- Cloudflare local: HTTP/QR, WebSocket broadcast and reconnection, pending connection cap, projector revocation and post-round public recap.
- Browser: 320px mobile, 1280px projector, 2/3/4-team standalone playthroughs, printable report, opened evidence preserved, role-filtered data, keyboard focus and client console errors.
- Isolated Cloudflare staging only; **no** merge, `main` write, production Worker change, email sending or payment activation.

See also `EXPERIENCE_RESEARCH_STORY_AUDIT.md` for the research sources, visual-design choices and six-scene analysis.
