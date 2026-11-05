# BUSINESS CRISIS 2.0 — ENTERTAINMENT-FIRST CREATIVE AUDIT (Phase A, v1)
**Date:** 5 November 2026  
**Review target:** redesign/cinematic-crisis-v2 @ f8a07cacdcec4936aff5529a9f0eef1cb8fb1d68  
**Safety:** This document is on exploration/entertainment-first-audit only; no implementation, staging deployment, merge, or production change is authorised.

## Executive decision

**Provisional verdict: preserve the core technology, rethink the flagship experience.** The incident simulation is structurally coherent and mechanically deeper than a quiz, but its *social entertainment* is still unproven. The current fixed six-episode arc asks players to repeat the same evidence → adviser → proposal → vote loop. An attractive screen or correct cash ledger does not fix that entertainment risk.

**Recommended portfolio direction:** Retain “The 09:17 Incident” as a candidate Strategy & Leadership edition. Prototype a lighter, higher-variety flagship around an unexpectedly chaotic product launch, then compare *real player enjoyment, willingness to recommend, replay interest and facilitation cost* before choosing the flagship. No story replacement is approved by this document.

### Evidence boundaries
- **Code inspected:** src/content.js, src/rules.js, multiplayer/room-core.mjs, tests/storyline.test.cjs, tests/multiplayer.test.mjs, current operator guide and prior design audits.
- **CI observed:** GitHub Actions “Cinematic v2 quality gates” and isolated staging deployment both completed successfully on 5 Nov 2026 for f8a07cac. Their success is not evidence of 30-device real-world reliability or audience enjoyment.
- **Live staging limitation:** web reader could not access the Cloudflare staging pages; no direct visual/browser evaluation of the deployed user journey was completed in this audit.
- **Document conflicts:** older release notes and operational reports describe superseded multiplayer/export states. Current source, recent tests and the latest V8 audit take precedence. Real device and public production behaviour remain separate evidence categories.
- **No real group studies were performed.** All ratings below are *expert hypotheses*, not measured user scores.

## 1. Strengths worth retaining
1. Coherent chronological six-episode incident, with three evidence exhibits, three competing strategic options, three public statement options and six adviser perspectives per episode.
2. Distinction between £260,000 response cash and £240,000 annual renewal value. Mandatory costs, deferred liabilities, risk indices and contract eligibility exist in code.
3. Server-authoritative room and scoped role views, 2–4 team support, per-player ballots, a team-private runoff, team-specific countdowns and host/projector role separation in the reviewed code.
4. A decision can produce a credible benefit and cost. The game can explain *why* one strategy won rather than merely marking answers right or wrong.
5. A separate staging/PR path exists, enabling creative experiments without risking the public experience.

## 2. The central game-design problem
The current encounter grammar is nearly identical six times: read the incident, inspect source notes, choose two advisers, pick strategy plus statement, vote, receive score/ledger fallout. Strategic variety is mostly *inside the text and numerical deltas*, while social interaction patterns stay predictable.

**Recommendation:** Keep a small number of structured votes, but interleave different encounters: timed team negotiation, limited-information trading, a public messaging challenge, evidence reconstruction, a competing investor offer and a consequential finale. Each must have server-safe rules, predictable fairness and an intentional group interaction outcome; do not add random minigames.

The narrative also needs a satisfying final *discovery*. The current culprit is expressly unconfirmed, which avoids invented attribution but undercuts the mystery expectation. For a leadership exercise, this is defensible. For a party-like flagship, give a reveal with fair planted clues, while ensuring the reveal does not trivialise earlier decisions.

## 3. Six-episode narrative audit: The 09:17 Incident
| Episode | What works | Entertainment / story weakness | Highest-leverage correction |
|---|---|---|---|
| 01 — The Send | Fast hook: 600 staff, three clients, unknown sender; good conflict of evidence vs action | Threat of redundancies and leaked memo immediately feels like more office stress; no playful entry | A 45-second teaser with interactive clue and a lighter invitation; retain sensitivity controls |
| 02 — The Floor | Realistic collision of rumours and shift continuity | A second workplace-anxiety chapter, with little change in game mechanic | Make players privately negotiate between competing departments, then state one agreed compromise |
| 03 — The Ultimatum | Client deadline and £240k/year distinction are credible | Another three-plan choice; a major deadline depends on later narration rather than a visible milestone result | Make the client response a short live *pitch* or structured evidence pack with scored credibility |
| 04 — The Headline | Strong press stakes; verified vs speculative claims matter | Predictable “communicate truthfully” bias; limited comedic or social payoff | Introduce a playful fictional public-response challenge where a previous promise constrains options |
| 05 — The Bottleneck | Strong return of earlier promises, real resource tension | Similar risk/cash optimisation; the sequence stays relentlessly serious | A meaningful cross-team offer/auction or trade, with same information and fair constraints |
| 06 — The Board Vote | Final budget discipline and eligibility gate prevent false winners | Last episode is yet another plan-and-statement ballot; no cathartic reveal | Reveal a causal chain, rival decisions and one earned twist before the scoreboard; end with shared recognition |

**Chronology check:** 09:17 → 10:06 → 11:24 → 13:12 → 15:40 → 17:30 is ordered. The 14:00 client deadline is now mentioned in chapter 5. The contractor access finding is not proof of who sent the document.

## 4. Finance and simulation — credible but not fully validated
**Verified in source:** initial cash 260k; annual contract value 240k is not credited to cash; baseline costs across episodes total **£71,000** (8k + 11k + 14k + 12k + 17k + 9k); each plan has spend and risk/trust effects; delayed obligations can survive the finale and penalise score; insolvency and service viability influence eligibility.

**Unverified economic assumptions:** fictional company annual turnover, workforce cost structure, why a single £240k/year client renewal drives the commercial stakes for a 600-employee enterprise, how baseline response costs relate to ordinary payroll, and whether the choice weights produce consistently engaging trade-offs. The £240k account might be strategically important because it represents a pilot, reference client or trigger for other contracts; this is not yet established clearly in the story. Avoid implying a 600-person company depends economically on one small contract without explanation.

**Engine-design limitation:** the contract classification is a deterministic function of final risk/trust/cash thresholds, not an independent customer simulation. This is acceptable as *game abstraction* if explained; avoid claims of predictive economic realism. Risk values are indices, not probability percentages.

**Balance questions for additional testing:** are there dominated choices (for example, an offensively aggressive press option with worse costs and almost all worse risk effects)? Does the same generally cautious route repeatedly dominate? Can teams recover from plausible early mistakes? Are negative cash paths frequent but still entertaining? Record win distribution and strategy entropy by episode and seed rather than only global score percentiles.

## 5. Participation, access and facilitation
- Current technical room ceiling is **30 participants total**, *not* 30 per team; real simultaneous 30-phone performance is unverified.
- 3-minute standard window + 1-minute reserve is an untested human pacing assumption. For groups with mixed language fluency, three exhibits, adviser secrets and combined ballots may exceed comfortable discussion time.
- The every-voter-lock rule protects voices but makes absent/disconnected participants a pacing risk. Host rescue exists, subject to restrictions, but it is not a replacement for identity recovery.
- The captain chooses advisers, but the team votes on a complete bundle. Observe whether this creates genuine dialogue or “captain reads, everyone taps”.
- A separate read-only projector is correct for information security and live-room staging. However, an animated score display without audience reaction is not a premium event by itself.
- **Proposed formats, unvalidated:** 45 min fast social, 60 min flagship, 90 min learning/debrief. The host should control a clear pacing ladder and get a rehearsal/test-mode option.
- One host for the room is operationally attractive, but evaluate whether one facilitator per small team materially raises participation; do not promise fully hosted delivery at competitor service levels without staffing economics.

## 6. Story direction comparison (creative hypotheses, /5)
| Dimension | A. The Launch Disaster | B. The Impossible Bid | C. The Great Company Swap |
|---|---:|---:|---:|
| Broad fun potential | 5 | 3 | 5 |
| Immediate comprehensibility | 5 | 3 | 4 |
| Social interaction opportunities | 5 | 5 | 4 |
| Business decision relevance | 4 | 5 | 3 |
| Emotional accessibility | 5 | 4 | 5 |
| Replay potential | 4 | 4 | 4 |
| Prototype effort (higher = easier) | 4 | 3 | 3 |
| **Hypothesis total /35** | **32** | **27** | **28** |

**A — The Launch Disaster:** Four competing response teams run alternate versions of a fictional brand’s highly public product launch. A promise goes viral for the wrong reason; logistics, marketing, customers and an unexpected partner offer collide. Strong comedy, visual spectacle and varied tasks. Drawback: needs careful causal writing to avoid cheap, random twists.

**B — The Impossible Bid:** Rival teams must submit an emergency bid for a once-in-a-decade contract. Each receives asymmetric supplier and customer intelligence, trades information and negotiates commitments. Strong strategic depth and learning relevance. Drawback: more niche and risk of becoming a spreadsheet.

**C — The Great Company Swap:** A giant fictional conglomerate accidentally merges two wildly incompatible businesses. Teams negotiate brands, staff, pricing and impossible board demands. Great satire and creative improvisation. Drawback: harder to explain and balance fairly.

**Provisional recommendation:** Prototype A first as entertainment flagship. Keep the existing incident as a more serious leadership option; do not rename or replace the canonical offering until player tests justify it.

## 7. Draft six-scene flagship arc — The Launch Disaster (NOT canonical)
1. **The Big Reveal:** Launch day. A wrong promotional claim spreads; teams choose whether to embrace, correct or delay, using evidence-based budgets.
2. **The Viral Curveball:** A harmless but absurd customer interpretation generates demand the company did not predict; teams negotiate a truthful public message.
3. **The Supplier Dilemma:** Inventory can support only two of three opportunities; groups allocate limited stock and negotiate conditions.
4. **The Unexpected Offer:** A partner presents a time-limited exclusive deal; teams receive asymmetric but fair intelligence and decide whether to cooperate or compete.
5. **The Live Showcase:** Players stage a 30-second campaign/board pitch from their constrained earlier promises; spectators react through a transparent scoring mechanic.
6. **The Reveal & Reckoning:** Previously planted clues explain the original promotional error. Consequences cascade into a final balanced result, with awards beyond first place and a clear narrative epilogue.

**Narrative invariants:** no unfair character assassination, humiliation or compulsory roleplay; player creativity must never override contractual/stock arithmetic; losing teams still get satisfying endings; jokes target the fictional situation.

## 8. Premium experience blueprint
**Booking:** 15-second demonstration, genuine screenshots, clear format/price/participant limits, realistic facilitator promise.  
**Lobby:** live-looking but unhurried theatrical welcome; nickname/QR joining in seconds; inclusive 60-second rules.  
**Opening:** one unmistakable visual incident and first *action*, not a paragraph.  
**Mid-game:** visible chapter transition, private evidence, 90-second discussion blocks where appropriate, one event per scene that changes the group dynamic.  
**Choice:** no more than one primary decision surface on mobile; reveal costs without forcing jargon.  
**Consequence:** show why a result happened in public (without disclosing private info), then celebrate team ingenuity.  
**Finale:** a genuine earned reveal, suspenseful ranking, fair eligibility rules, three amusing evidence-grounded awards, local private PDF.  
**Afterwards:** facilitator debrief optional; no personality ranking or invented educational certification.

**Visual principles:** distinct scenario art direction, display typography that works at venue distance, high contrast, controlled motion, scene-specific motifs and editorial hierarchy. Avoid constant warning/red-screen energy. No player must read dense case files from the projector.

## 9. Educational claims
**Credible now as designed:** discussion prompts around evidence, risk trade-offs, group decision-making and communicating uncertainty.  
**Needs pilot evidence:** the claim that participants *learn* or improve those skills.  
**Not justified:** psychometric leadership scoring, competency certification, proven behaviour change or academically validated corporate training outcomes.

Learning edition: define specific objectives, mapping to observed moments, facilitator debrief questions and a reflective worksheet. Do not infer individual managerial talent from fictional team points.

## 10. Current market benchmark, verified publicly on 5 Nov 2026
- VSE AI Team Building publicly offers £12 per participant + VAT, minimum £150; **30 people = £360 + VAT**, with **three hosts**, 45–60 min. Sources: https://vseai.co.uk/pricing and https://vseai.co.uk/how-it-works
- AVVA lists an in-person hosted icebreaker from **£1,200 + VAT for 10–50 participants**, with potential additional travel/setup: https://avvaexperience.com/experience/the-ultimate-icebreaker-team-building-game/
- Hivemind Theatre lists a **90-min online game at £600 for up to 20**, plus **£200 per additional 20**: https://hivemindtheatre.com/live-games

These products are not equivalent packages. Competing on game code alone ignores host reliability, booking convenience, customer confidence and memorable delivery.

**Positioning hypothesis:** “A live, cinematic team challenge where the story changes because of your team’s decisions.” The experience must substantiate this sentence; today the fixed spine only partially does. Avoid claims of fully branching narratives.

## 11. Priorities and acceptance criteria
**P0 before any paid public event:** independent admission/rate-limit review, reliable host recovery, tested room reset and incident procedure, physical 30-device venue rehearsal, real iOS/Android browser and PDF downloads, accessibility/contrast and 720p/4:3 projector checks.  
**P1 prototype entertainment uplift:** one playable new scenario episode with a non-vote interaction, memorable consequence reveal, reliable host/projector separation concept and no superficial AI chat. Run 5 moderated groups.  
**P2 playtest-driven redesign:** alternative game loops, evidence-derived awards, replay variations, 45/60/90-minute facilitation pacing, consistent original art.  
**P3 launch readiness:** commercial content, demo, package/pricing experiment, facilitator training, privacy and terms, agency distribution pilot, actual testimonials only with permission.

**Measurable proof gates (proposals, not measured outcomes):**
- 5 groups including novices and mixed-confidence speakers, at least 2 facilitators.
- ≥80% of post-game respondents rate enjoyment 4/5 or 5/5; ≥70% say they would recommend it; record exact question wording and sample size.
- ≥90% participants complete their live interaction without staff rescue; measure time-to-understand and dropouts per scene.
- Zero private-data leakage, duplicate charges, cross-room access or unrecoverable state errors in scripted tests; no claim of security certification from these tests.
- Run baseline and new prototype through identical scoring rubrics and compare results; founder chooses based on evidence rather than screen aesthetics.

## Decision boundaries
No production merge, Cloudflare production change, payments, outreach, canonical story replacement or invented user research. Proceed with an isolated Phase B vertical slice, then review with the founder and actual participants.