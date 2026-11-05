# Issue #11 — safe gameplay improvements (review branch)

**Base:** `feature/0917-corporate-challenge` at `f63d7137827834d07b2f6674c50164643f22573a`. This base already includes merged PR #10. **This branch is not the deployed game.** No Workers/production/release configuration or secret changed.

## Implemented

1. **Voting integrity and transparency.** Server retains one complete ballot per player and one economic commit per team. Result now records whether it was unanimous, majority, plurality, runoff, captain's tied runoff ballot or timeout. The outcome is shown **only to that team** after it locks; host/projector/rivals still do not see personal choices. The pre-game briefing accurately says the highest-tally complete package wins, even below 50%. Multi-way tie finalist selection is disclosed rather than hidden, and the original protected algorithm remains unchanged.
2. **Untimed public pre-brief.** Episode 1 public context/evidence is available in the lobby; later chapters unlock **only after every team completes its current chapter** and before the host presses START NEXT EPISODE. These previews have no decision timer, vote, private advice, strategy costs or financial state. Three public evidence exhibits remain expandable. No change to the 180s normal + 60s reserve deadlines. Only **public reading** has moved out of the clock; adviser selection, discussion and voting still occur during the window. Evaluate a true two-phase timer with actual participants before touching the room protocol.
3. **Grounded consequence payoff.** Each team's last action now carries the economic ledger's exact post-episode cash/trust/risk snapshot and changes versus the last round, with warnings for negative funds, high workforce risk or weak trust. The UI distinguishes automatic episode escalation/old obligations from choice-only effects. No scoring change, speculative claims or new marketing promises.
4. **Mobile polish.** Lightweight disclosure styles, touch-friendly evidence and measured outcome text; no extra dependencies.

## Regression tests added

- 3/5/7 individual complete ballots: explicit majority/plurality, one economic transition
- 3-way equal support -> two nearest proposals in private runoff -> exactly one commit
- Preview not visible while **any** team is deciding; public preview never includes private adviser advice or vote details; available for first and next chapters
- Timeout classification and ledger-derived consequence snapshots
- Existing captain casting vote, authentication, late join, room clock and all six episodes remain covered by the prior suites

## No arbitrary scoring calibration

Keep the existing renewal criteria and score/trust formula. The cited 4.45% ready and 40.8% trust-ceiling frequencies are **random model samples**, not evidence of actual players' difficulty, enjoyment or conversion.

## Boundaries to verify before merging

- Unit and cross-browser CI pass, including Worker HTTP/WebSocket, 2–4 team sessions, late entry, timers, projector, privacy and final PDF.
- Manual UX proof at 320/390px and real mobile devices: pre-brief open/close survives room updates; no scroll/focus jumps.
- Facilitator observes real players: is the untimed public preview enough discussion space, or should adviser selection move to a separate prep phase?
- Still unresolved: 3+ tied packages are reduced to the two closest; grouping full strategy × statement × investment ballots may cause fragmentation. **Do not label this majority or claim an improved voting system without a pilot.**
- Physical 25-phone load, network reconnection, iPhone Safari, accessibility and commercial licensing are separate launch gates.

**Authorised (unchanged) live staging:** https://the-0917-challenge-staging.adiusor.workers.dev/

**QA handoff:** Inspect this branch and PR without merging. Run representative 3/5/7-player ballots, multi-way ties, untimed preview release, 2–4 team full six-round journeys and latest CI; compare player comprehension. The other conversation owns independent gameplay QA.
