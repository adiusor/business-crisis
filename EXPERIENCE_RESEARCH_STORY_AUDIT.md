# THE 09:17 INCIDENT — Experience research and narrative QA

**Scope:** experimental six-episode multiplayer staging. This note is an evidence-informed design review, not a claim of formal usability or business-simulation validation. Production remains unchanged.

## What the research suggests

- **Less on-screen, not less substance.** Nielsen Norman Group recommends reducing extraneous cognitive load and using progressive disclosure: give players the current decision and a short evidence summary first, with detailed source information one click away. Source: https://www.nngroup.com/articles/minimize-cognitive-load/ and https://www.nngroup.com/articles/progressive-disclosure/
- **Make the next action obvious.** GOV.UK's interface writing guidance supports short, scannable instructions and predictable control names. Source: https://www.gov.uk/service-manual/design/writing-for-user-interfaces
- **Visuals must convey game state.** A readable incident illustration, six-step timeline, private team exposure bars, public vote progress and stopped/active clocks are more useful than decorative charts with invented data. Keep economic bars private to the team; projectors can show narrative and publicly visible readiness only.
- **Corporate thriller without visual fatigue.** Use restrained midnight navy and deep petrol for the workspace, warm amber for calls to action, teal for resolved progress and coral sparingly for actual urgency. A 2025 systematic review found associations between colour and emotion, but explicitly cautions that such associations do *not* prove viewers will experience particular emotions. Source: https://pubmed.ncbi.nlm.nih.gov/39806242/
- **Accessible by default.** No meaning through colour alone. Visible labels and a clear numeric clock accompany all risk and voting visuals; no flashing. Respect `prefers-reduced-motion`. WCAG: https://www.w3.org/TR/WCAG22/ and https://www.w3.org/WAI/WCAG22/Techniques/css/C39

## Applied in staging

- Episode-first cinematic hero with distinct vector artwork for all six situations, dramatic but readable typography and a six-step timeline.
- Three *immediately readable* evidence findings per episode. The full source paragraphs remain behind clearly labelled, keyboard-operable disclosures. The complete narrative brief remains accessible.
- Strategy cards show name and proposal at first glance; benefits, price and tradeoffs remain accessible behind “Reveal trade-offs.” No strategy, public statement, adviser, or economic consequence has been deleted.
- The two private adviser briefings are grouped into one collapsible dossier.
- A compact, team-private risk/cash visual shows actual server-authoritative trust, cash, outstanding commitments and legal/ops/people/client risk indices.
- The end report includes an actual seven-point cash trajectory (starting fund plus six episodes), not decorative invented figures, while the facilitator receives three optional post-game reflection prompts. **These are model indices, not real probabilities.**
- Projector has bigger illustrated episodes and readable public countdown/status; no private financial exposure or player ballots.
- Scannable chapter/evidence presentation, stable disclosure on WebSocket updates, responsive mobile layouts, and reduced-motion support.
- Narrative hook: **“ONE INCIDENT. SIX CALLS. EVERY VOICE COUNTS.”** Supporting copy is functional: “Talk before you tap,” “Open source,” “Reveal trade-offs,” “Team is ready.”

## Full storyline review — chronological and causal check

| Episode | Story beat and causal driver | What the choices test | Review |
|---|---|---|---|
| 1 · 09:17 · THE SEND | Restructuring memo reaches 600 employees and three clients; contractor session is suspicious but not proof of authorship | Containment vs continuity vs reassurance; speaking without evidence creates liability | Sound initial hook. Never identify the sender without proof |
| 2 · 10:06 · THE FLOOR | Unapproved draft becomes a staff rumour; shift coverage is already fragile | Consultation vs operational continuity vs costly retention | Follows the leak logically. “No decision approved” is grounded in unsigned memo |
| 3 · 11:24 · THE ULTIMATUM | Renewal client demands verifiable remediation by 14:00; annual contract value is not cash | Independent assurance vs sweeping guarantees vs specialist delivery | Good management dilemma. Preserve £240k revenue vs £260k response cash distinction |
| 4 · 13:12 · THE HEADLINE | Reporter and contradictory online claims raise reputational pressure | Verified timeline vs holding statement vs aggression | Fits the client deadline. Public correction is possible without denying the leaked document |
| 5 · 15:40 · THE BOTTLENECK | Unresolved contractor access and staff fatigue threaten the overnight service | Buy backup vs push overtime vs renegotiate scope | Consequences reflect earlier blanket shutdown, operational constraints and promises |
| 6 · 17:30 · THE BOARD VOTE | Board sees ledger, client questions and outstanding commitments | Fund oversight vs promise accelerated recovery vs protect cash | Closes on governance and trade-offs. Economic eligibility prevents score-only “wins” |

The six timestamps are sequential. Each episode has three evidence exhibits, three distinct strategies, three public statements and intelligence from each of six advisers; automated tests now check this, together with materially different economic outcomes.

### Economic and narrative logic

- The real initial response fund is **£260,000**, while the renewal is **£240,000/year in contract value** and is never credited as liquid cash.
- Every episode incurs baseline operating costs; strategic responses and optional investments use cash; unverified guarantees can create deferred liabilities.
- A late answer deducts 5 points; a missed deadline deducts 12 and invokes an adverse economic no-response outcome. An early finished team freezes its clock; no other team's delay can retroactively change its penalty.
- The same real economic engine processes the team's winning *complete* ballot (strategy + Public Statement + optional allocation) once, not once per player.
- An initial tied full-package ballot creates an in-team runoff between the two closest leading proposals. If the *runoff* still ties, the **captain's runoff ballot is the announced casting vote**; this prevents indefinite repeating ties and retains a short real-world discussion.
- The “Boardroom Champion” requires more than a high score: renewed contract, solvent fund, and operational viability. There may deliberately be no champion.

### Unresolved narrative/product risks and sensible next improvements

1. **No canonical attribution:** the initial sender remains unconfirmed through the board vote. This is defensible (don't falsely blame the contractor) but the finale could use a factual epilogue acknowledging the investigation status. Avoid making the perpetrator up.
2. **Pacing versus depth:** 3+1 minutes is tight for 10–20 players per team when everyone must read and vote. Test real mixed-experience groups before changing it. Candidate: host-controlled 20–30-second *briefing period* followed by the existing decision clock; do not unilaterally alter the agreed clock now.
3. **An early majority still waits for every team member's lock:** that is intentional to make each voice count, but disconnected participants could force a timeout. Future release needs reconnection recovery, optional host removal of absent players, or explicit majority/abstention policy.
4. **Maximum concurrent participants remains 30 total.** Four teams of twenty (80 players) are **not supported or load-tested**. Avoid selling this format before 80-device stress, latency and websocket resilience tests.
5. **Room security:** memorable four-character codes improve joining but increase guessing risk. Stage with fake names only. Production needs joining PIN/host approval, rate limits, abuse protections and appropriate retention/data subject support.
6. **Accessibility validation:** check actual colour contrast (WCAG text 4.5:1 and non-text 3:1 where applicable), keyboard-only controls, VoiceOver/TalkBack, 200% zoom, low-end mobile GPUs and real projector distances. CSS improvements are not proof of WCAG conformance.
7. **Learning value:** a collapsed three-question facilitator debrief is now available after the Boardroom Verdict. Test its quality with real participants; a structured 5-minute post-game discussion is more appropriate than extra live text during each 3-minute call.
8. **Commercial polish:** refine short cinematic inter-episode transitions, facilitator tools, export-to-email infrastructure with opt-in and privacy notices, and commercial player limits. No autoplay sound or flashing prompts.

## Release gate

A feature is not accepted because it looks good in one screenshot. Require CI for economic and narrative invariants, two-player and multi-player voting, tie-breaks, 320px mobile, host/projector separation and private information, printable HTML report, network return, no console errors, no overflow, and Cloudflare staging smoke tests. No merge or production deployment as part of this research pass.
