# The 09:17 Challenge — Independent Product & Commercial Audit
**Date:** 5 November 2026  
**Status:** Proposal for founder review; NOT evidence of a finished, market-validated product.  
**Repository basis:** `feature/0917-corporate-challenge` and Issue #11.  
**Scope:** Buyer proposition, game enjoyment, differentiation, conversion, pilot acceptance. This document does NOT change game logic or deploy.

## Executive recommendation

Make The 09:17 Challenge a **45–60-minute facilitated team event**, not a difficult HR examination. Keep the existing six-episode, server-authoritative multiplayer engine and use it to deliver **fast decisions, human disagreement, genuine consequences and an exciting team-vs-team finale**.

Product promise (test, do not claim yet): **"At 09:17, every team faces the same challenge. What happens next is up to you."**  
Supporting explanation: *"Six connected challenges. Conflicting advice. Team decisions that change the story. Discover your result together."*  
Tagline already in the project, also worth A/B testing: *"Six decisions. One team. A different outcome every time."*

Positioning: **Entertainment-first, business-smart.** An enjoyable team activity that can lead to a thoughtful optional debrief, without claiming to certify leadership skills or assess personnel.

Primary buyer for first 10 sales: an HR/People lead, event organiser or team manager planning an **8–25-person** office social, away day, or cross-functional session. Do not target universities, licensing and full custom enterprise procurement simultaneously.

## Competitor evidence (official public pages, reviewed 5 Nov 2026)

| Competitor | Public offer/evidence | Implication |
|---|---|---|
| Wildgoose | Activities from £12/person; remote host +£250; onsite host +£750, with £1,500 onsite minimum on their published UK pricing page. Games can be booked online and tailored. https://wearewildgoose.com/uk/is-wildgoose-right-for-your-team/ | Buyer expects simple logistics, clear price, host and fun. Price is not the whole product. |
| Wildgoose Office Games | 45-minute team game, photo/video tasks, energetic host and wrap-up. https://wearewildgoose.com/uk/team-building-activities/the-office-challenge/ | Their competitive advantage is social energy, not narrative economics. |
| Green Hat Games, Online Office Challenge | 45/60-minute browser-based mini-challenge experience, £15/person on product detail page, optional facilitation/setup fee £150; shop may show a different live price, verify before quoting. https://www.greenhatgames.com/online-office-challenge/ | "No app install" is table stakes; fast onboarding and variety matter. |
| PAVNESS, Pressure Room | Eight connected decision weeks, ~55-minute group simulation, advisers, changing evidence, fictional KPIs and facilitated debrief. https://pavness.com/pressure-room/ | Do not call our mechanics unique. Differentiate through group experience, role-separated phone interaction, production quality and event facilitation. |
| Toyo Team | Shared screen + QR join on individual phones, no account/app, 5–50+ players claim, fast setup. https://toyo.games/teambuilding | QR join alone is not defensible; demonstrate excellent speed and stability. |

Market observation: incumbents communicate **fun, easy setup, confidence and what happens on event day**. Our site currently foregrounds corporate decision complexity. This mismatch should be addressed before further SEO page proliferation.

## Product-quality gates, ranked

### P0 — Live reliability and buyer trust
1. Preserve single official staging https://the-0917-challenge-staging.adiusor.workers.dev/; never deploy over an active room.
2. Confirm PR #9 and current merged state of PR #10, plus complete GREEN CI on final HEAD before staging promotion. A prior successful staging test is not proof all subsequent test workflows passed; recent workflows were also cancelled.
3. Run manual rehearsal on **real phones**, different networks and operating systems; cover host, join QR, reconnection, late arrival, private advisers, facilitator projector, voting and PDF. A 25-WebSocket simulation does not equal 25 physical devices.
4. Protect secret creation key and hidden adviser information; no fake testimonials or claims of production readiness.
5. Clearly explain facilitator-led vs self-managed capability; the game is not currently self-host-free.

### P0 — Does the activity feel fun rather than like an HR exam?
- First five minutes should create curiosity and team identity, not require understanding all economic terminology.
- Each chapter should have **one hook, one dilemma, one visible trade-off, one team discussion and one reveal**.
- Keep the detailed evidence available but default to concise, readable phone cards.
- Reduce captive reading time; make room for genuine disagreement and laughter without requiring jokes in every scene.
- Do not ask players to download an app or create a personal account.

### P0 — Fair and clearly explained decisions
- Link to GitHub Issue #11 for voting-language/majority-vs-plurality defect and 63-combination fragmentation risk.
- Do not redesign voting while another chat is editing it. Require user-understandable rules and scripted 3-, 5- and 7-person cases.
- The captain should facilitate rather than silently override player votes. Every participant should have a reason to speak.

### P1 — Scene-to-scene payoff
The existing engine tracks cash, trust, legal/operational/staff/customer risks, promises and liabilities. The storytelling must react consistently.

Proposed reveal card after each scene:
1. **YOUR CALL** — selected strategy and statement in plain language.
2. **WHAT IMPROVED** — a grounded metric/benefit.
3. **WHAT IT COST** — exact spending / actual new obligations, not annual contract value.
4. **WHAT FOLLOWS YOU** — one specific verified next-scene dependency.

Never use optimistic "fully funded" language when cash is negative. Never portray an unsigned client renewal as signed. Check published result language against server-side calculations.

### P1 — A finale worth filming (but never fabricate evidence)
- Facilitator reveals the scoreboard on shared projector; display exactly what distinguishes teams.
- Each team gets a concise personalised 3-decision narrative recap.
- Recognise **client trust**, **cash protected**, **risk management**, and **timing**, based on recorded numbers.
- Only award strict boardroom champion when validated win criteria are met; display a highest-scoring response even if no team achieves champion status.
- Offer PDF takeaways and two concise discussion prompts, not invented psychological assessments.
- Accessibility: large screen readability, colour-independent ranking, readable contrast, reduced motion support.

## Scene-by-scene desired emotional arc (product hypothesis)

| Scene | Existing story | Desired social beat | Mandatory proof |
|---|---|---|---|
| 1 THE SEND | Unintended distribution of a sensitive draft | Curiosity: teams spot contradictory clues and choose what to prioritise | Players understand the situation in under 60 seconds |
| 2 THE FLOOR | Employee anxiety and shift cover | Constructive disagreement: protect people vs service | At least two routes actively discussed |
| 3 THE CLIENT MEETING | £240k annual renewal and service guarantee | Negotiation: commitments versus affordability | Annual future contract revenue NEVER shown as current cash |
| 4 THE PUBLIC CONVERSATION | Press story and employee screenshot | Twist: pressure tests communication consistency | Public message matches prior commitments |
| 5 THE DELIVERY TEST | Fatigued specialists and backup | Escalation: earlier resource choices have consequences | Show a credible cost and future effect |
| 6 THE NEXT MOVE | Boardroom choice | Payoff: shared reflection, consequence comparison, team awards | No fabricated signed renewal or ungrounded winner |

Avoid adding 6 different minigames to a coherent decision story; prefer one surprising, meaningful interaction per scene. Test proposed role cards, negotiation, or controlled information asymmetry with real people before making them core mechanics.

## Proposed 50–55-minute facilitated event script (not yet validated)

- Minutes 0–5: host welcomes, teams arrive, rules, a low-pressure practice decision.
- Minutes 5–41: six episodes averaging 6 minutes each, including briefing, genuine team discussion, vote and reveal. Consider **untimed adviser/evidence preview followed by a bounded debate/vote window** rather than forcing all reading inside three minutes. Exact clock and penalty changes require technical review.
- Minutes 41–47: projector reveal, awards and explanation of most consequential decisions.
- Minutes 47–55: fun, non-judgemental debrief and optional group photo if consented.

Never advertise the intended duration as a proven fact before recording pilots.

## Buyer journey — minimum acceptable conversion design

**First screen**
- Headline (candidate): "Your team. Six decisions. One story you create together."
- Subhead: "A hosted, story-driven team challenge. Debate surprising dilemmas, vote together and discover how your choices change the outcome."
- Primary CTA for visitors: **TRY A 90-SECOND SAMPLE** — no account, no host key, no personal data.
- Secondary CTA: **REQUEST A PILOT SESSION** — clear that this is an invitation request, not a paid checkout.
- Show **8–25 target participants under pilot testing** and proposed duration, not falsely certified capacity.

**Sample**
- One genuine, understandable decision, response and consequence. Existing `openingDemo()` currently uses expandable cards with static plan fallout: do not misrepresent this as a full six-round live game or dynamic multiplayer result.
- Let the visitor make an actual decision (within safe preview scope), see its trade-off and understand what a team would debate.
- Demonstrate either screenshot/video footage of real host-projector-player flows once verified, or a clearly labelled mockup; do not invent participant reactions.

**Request**
- Minimal inquiry: email/contact, approximate participant count, format, desired date. Only implement collecting personal data with appropriate security and privacy policy.
- Explain hosting requirements and what is included, without making a binding promise of availability or price.
- After the first successful pilots, publish credible, consented testimonials and a case study.

Avoid a forest of keyword-targeted pages with near-identical copy as a substitute for a clear buyer journey.

## Pricing hypotheses to TEST (not published tariffs)

- Invite-only founder-run pilot: free or £149–249 per group, depending on recruitment friction and cost; obtain participant feedback and permission before any marketing use.
- Self-managed digital access **only after self-service is real and reliable**: explore £249 per 25 participants.
- Remote facilitated 8–25-person event: explore £449 per event.
- Onsite facilitated: explore £699+ travel and expenses; check actual cost of facilitator time, travel, venue and taxes.
- Compare buyer willingness-to-pay with competing quotes, not just competitor list prices. Do not set a public rate before live testing and cost modelling.
- Do not present £249/£449/£699 as current sales offers.

## Validation protocol

Record trial version/commit, actual participants, network/device mix, room setup time, 6/6 completion, per-scene elapsed time, distinct proposals, number of runoffs, host interventions, PDF and projector defects. Collect **voluntary anonymous group-level feedback**:
- "I understood the story" 1–5
- "I enjoyed the experience" 1–5
- "Everybody had space to contribute" 1–5
- "I understood why my decisions affected the outcome" 1–5
- "I would recommend it for a team event" yes/no
- "What was the slowest or least interesting moment?" open response

**Provisional release hypotheses**, subject to revision after first cohort:
- no private-data leak, security regression, unrecoverable crash or accounting fault;
- >=90% session completion, median clarity & enjoyment >=4/5, >=70% recommend/replay;
- majority of teams have at least two alternatives discussed in most rounds;
- successful host/projector/PDF on 25 physical devices across real networks before marketing 25-player reliability;
- at least five independent buyer conversations and at least one clear willingness-to-pay signal before paid launch.

Tests must cover quiet participants and novices, not just founder-operated expert sessions. Underlying game scoring is an authored model, NOT a validated employee/leadership assessment.

## Scope ownership & implementation handoff

**This document's branch changes DOCS ONLY.** No editing of active game code or Cloudflare deployment. The other conversation owns implementation based on Issue #11. Proposed product backlog:

1. P0 — complete tests of live 09:17 + fair voting labels + no regression to privacy (Issue #11).
2. P0 — shorten on-phone reading; separate information from discussion; pilot total runtime.
3. P1 — state-sensitive recap with truthful economic consequences and projector-friendly finale.
4. P1 — clear, genuinely interactive first-choice demo and trustworthy request-pilot funnel.
5. P2 — commercial packaging, pricing and facilitator script *after* real group tests.
6. P3 — seasonal packs, role diversity, licensing, further scenarios *after* v1 works.

**Do not auto-merge.** Founder to decide marketing claim, price, scenario tone and publish timing. Not a design certification, a scientific learning validation or a claim of superiority over competitors.

## Independent-audit evidence boundary
- Read-only GitHub source inspection + public provider websites; NO browser-playthrough, website screenshot audit or actual customer interviews were performed as part of this report.
- Public staging URL was not reachable through the web retrieval tool in this review. GitHub CI indicates previous staging deployment success, but this review cannot certify the currently rendered live experience.
