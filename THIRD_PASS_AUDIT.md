# BUSINESS CRISIS — Third-pass operational and narrative audit
**4 November 2026 · Isolated Draft PR / staging only**

## Defects fixed in this audit

1. **Different championship tie rules.** Standalone economic championship and multiplayer used different tie-breaking rules. Both now give a shared title only when final score AND remaining cash are tied. A same-score team with more cash wins the tie.
2. **Unexplained client deadline.** Episode 3 set a 14:00 deadline, but the story skipped to 15:40 with no account of it. Episode 5 now explains that procurement recorded the team's recovery submission, or lack of one, without guaranteeing renewal. This holds even for a timed-out team.
3. **Falsely assumed contractor shutdown.** Episode 5 previously assumed the contractor had been shut down irrespective of episode 1 decisions. The vendor now seeks supervised continued access or a paid transition, coherent under all player choices.
4. **Opaque host interventions.** Transfer of captainship and facilitator removal of participants now produce a minimal public action trail (last 12 events). No player identifiers, actual ballots, private advice or removal reasons are exposed. Projector displays a recent update briefly; players/host can inspect a collapsed log.
5. **Missing closure about leak attribution.** The final Boardroom Verdict now acknowledges that access logs do not prove who sent the memo. Performance is judged by the management response, not a fabricated culprit.

## Rechecked invariants

The six linked economic episodes retain three strategies and three public statements each; optional investments remain in their existing rounds. The £260,000 cash fund remains distinct from £240,000 in annual contract value. Server-controlled expenses, contingent obligations, risks, and client trust flow to the final score. Each participant votes on the complete proposal, resolved once for the team. A tied ballot goes to a team-private runoff, then the captain's casting ballot if tied again. Each team freezes its own clock when confirmed; the reserve minute costs 5 points and missing the four-minute deadline costs 12 points plus a real economic timeout.

Host-only recovery tools cannot delete an already cast episode ballot, including one that was temporarily cleared from the active vote map for a runoff. The six-rule host briefing remains open in the lobby and collapses after play starts. The final report is a self-contained, styled HTML file, printable/savable as PDF using the browser, not a backend-generated PDF.

## Outstanding risks before commercial release

- **Load and devices:** The 30-player cap is a program limit, not a 30-phone field test. 40–80 concurrent users remain unverified and unsupported.
- **Recovery:** Losing browser sessionStorage means the participant cannot restore their original identity on another device. Host emergency actions are not full account recovery.
- **Abuse protection:** Four-character codes are locators, not secure passwords. No robust room admission, join rate limits or anonymous WebSocket quota protection is deployed; prior attempted mitigations failed local runtime tests and were correctly reverted. An edge protection and security review are required.
- **Host fairness:** A host can still transfer captainship during a tie; intervention is logged publicly but this is not a guarantee against biased facilitation. Formal facilitator instructions and possibly a locked casting-vote rule should be playtested.
- **Pacing:** The next episode clock starts immediately on host advance. Optional explicit intermission may help teams understand the aftershock, but alters the game's cadence and should be agreed after playtesting.
- **Accessibility:** Chromium checks cannot replace actual iOS/Android, large projector, keyboard-only and assistive-technology trials.
- **Commercial scope:** Payments, host accounts, opt-in email delivery, retention and legal notices are not launched.

**Gate:** Changes remain in the separate staging Worker and Draft PR #2; never merge or publish to main without founder approval. Record actual CI outcomes before claiming a feature is verified.
