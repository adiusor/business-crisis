# BUSINESS CRISIS — Product Execution Charter v1.0

**Working goal:** Build an original, commercially viable portfolio of competitive corporate team games that feels like entertainment rather than a corporate PDF or personality assessment. Every iteration must produce a playable, tested artefact, and no functionality may be described as operational before it is.

## Product promise

**One crisis. Six escalating episodes. Two pieces of intelligence. No perfect decisions.**

The paying customer is an organiser, facilitator, HR professional or team leader. Players must be able to join from phones with a nickname, without accounts, in the production version. Sessions should work in the same room and remotely. The host controls pacing from a separate dashboard, while a projector view shows story beats and team competition.

## Design constraints

1. Feel like a modern narrative strategy game with workplace satire and a live crisis, not a report, questionnaire or generic SaaS dashboard.
2. Dramatic moments deserve their own full-screen compositions. During decision making, prioritise action and consequence. During investigation, prioritise information. During results, prioritise rivalry and story.
3. No stock-photo collage, visual clutter, fake 3D effects, unreadable text, garish gradients or gratuitous badges. Motion should be restrained, meaningful and respect reduced-motion preferences.
4. Every recurring character has a source-of-truth character sheet: name, appearance, role, outfit, expressions and visual treatment. Preserve the character's identity across all scenes and screen sizes.
5. Responsive at 320px and above. Make scene briefs at least 18px on phones, interactive targets at least 44px, and keep contrast strong.
6. Distinguish player information from public/projector information so private advice cannot be accessed by other teams.

## Game-design constraints

1. Every major choice has **at least two plausible advantages and one credible cost**; none may be a disguised obviously wrong answer.
2. Mix voting decisions with resource allocation, intelligence selection, evidence reconstruction, public messaging and unexpected dilemmas.
3. Six advisers are available; teams may select two and change their picks until confirmation. The information remains sealed until confirmation. The four unselected sources are unavailable in that round. Adviser relevance changes across episodes and scenario variants.
4. Include simultaneous team objectives, conflicting departmental priorities, delayed consequences, scenario variants and meaningful trade-offs.
5. Ensure the winning strategy is not simply maximising every metric. Some resources compete. High client trust with an unfunded operation is not the same as successful delivery.
6. Same scenario variant and initial environment for competing teams. Random events must be seeded and common to teams, so outcomes compare strategy rather than luck.
7. Make failure interesting, not humiliating. Funny summaries critique fictional strategic outcomes, never players' personalities or competencies.

## Simulation and economic constraints

1. **Single source of truth:** a deterministic, server-authoritative state transition function with strict input validation.
2. Show cash as a real ledger, not a 0–100 meter. Distinguish cash balance, mandatory operating costs, voluntary spending, commitments, liabilities, contract value, profit or contribution margin, and opportunity costs.
3. Do not credit the full face value of future contracts to emergency cash.
4. Include unavoidable baseline costs, compounding labour/time costs, deferred penalties, contingent contractual liabilities and operating deterioration when staff is overstretched.
5. Model risk from independent exposure categories (legal/compliance, operational, workforce, customer/contractual and liquidity), with explicit controls and unresolved issues; never permit arbitrary additive risk to be optimized to zero.
6. Derive scoring from business outcomes and observed decisions, with sensible hard constraints and nonlinear penalties for insolvency, contractual failure or poor service.
7. The result report must explain the specific causal chain. Every sentence should be grounded in committed actions, state changes, pending liabilities or comparison metrics. Do not invent events to make a report entertaining.
8. The game uses plausible illustrative figures, not an accounting or risk forecast. Clearly distinguish simulation calibration from validated industry economics.

## Quality gates before commercial launch

- Run deterministic unit tests for every state transition; assert that a decision cannot be committed twice, risk indicators stay in range, costs are not double charged and teams cannot inspect one another's hidden information.
- Run **at least 1,000 seeded simulations** across diverse strategies: report median/5th/95th percentile cash, score and risk; ties, insolvency, impossible success paths, and overpowered choices.
- Run automated end-to-end tests with 2, 3 and 4 teams through all six rounds, including reconnection, late joiners and simultaneous votes once multiplayer is implemented.
- Test desktop and mobile from 320px upward. Test Chrome, Safari and iOS Safari on real devices.
- Observe at least five independent real-world groups, including experienced facilitators; record perceived choice difficulty, fairness, humour, clarity and willingness to pay.
- Do not claim 30-player support until measured under realistic load and reconnect conditions.

## Technical plan

- Convert the current standalone HTML to modular frontend components, game data, a pure rules engine and automated tests. Preserve a working preview branch while developing.
- Production: GitHub repository owned by the founder, Cloudflare hosting and Workers/Durable Objects or equivalent real-time room infrastructure, server-authoritative state, authenticated host, nickname-only players and privacy controls.
- Later: QR room links, per-player role information, individual votes, timer, projector mode, facilitator override, session receipts, PDF reports, licences and Stripe Checkout under founder-owned accounts.
- All secrets are stored server-side. Never expose payment, email or elevated database credentials to browser code.

## The differentiator

**BUSINESS CRISIS is a collection of interactive corporate disaster stories, not a quiz bank.** Players debate under pressure, choose limited intelligence, make costly trade-offs, then face a boardroom verdict that remembers their earlier promises. Expand into distinct genres (crisis strategy, negotiations, investigation, resource competition, ethics) using a shared multiplayer engine.

## Execution protocol for an AI development agent

1. Inspect current code and tests. Identify what is actually implemented versus simulated.
2. Prioritise the most severe player-experience issue, not cosmetic changes that hide poor mechanics.
3. Implement in a separate version or branch. Avoid overwriting the tested public game until approved.
4. Run automated functional, balance and responsive checks. Fix failed cases before claiming completion.
5. Provide exact deliverables, screenshots from the real build, measurable test results, limitations and migration instructions.
6. Do not substitute lengthy planning documents for a requested working application. Never claim deployment, multiplayer, payments or security readiness without evidence.

**Approval boundary:** the founder retains control of domain purchase, GitHub access, credentials, payments, financial commitments, legal sign-off and public release.
