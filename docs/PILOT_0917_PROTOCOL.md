# THE 09:17 CHALLENGE — Facilitated pilot validation protocol (v0.1)
**Purpose:** Turn a technically functioning multiplayer game into evidence of understandable, enjoyable, educational team-building sessions. This is a protocol, NOT proof of real-world validation.

## Two-stage test (avoid treating simulations as people)
**Stage A — Internal technical rehearsal (two trials):** On at least two different Wi-Fi/mobile networks, test the host, QR, team selection and auto-assignment, two to four teams, 25 physical browser sessions, confidential advisers, timed individual votes, late arrivals, projector, reconnects and final PDF. Record the devices/network used and any instability. A simulated 25-user server test cannot replace this.
**Stage B — Moderated user pilots (three independent sessions):** Recruit three groups unfamiliar with the game: one corporate group (8–12 employees), one facilitated social group (8–12), and one larger corporate/class-like group (18–25), after Stage A passes. Rotate facilitators when possible. Users must know this is a fictional prototype and that no employment/personality assessment takes place.

## Consistent briefing — read before every pilot
"You are a team of leaders responding to an unexpectedly shared company proposal. Six chapters will ask you to select two advisers, debate three plausible strategies, and vote independently. Spending, trust, risk and future obligations carry through. There is no perfect answer and a high score does not certify leadership ability. Join your assigned team or use auto-assign if told. Your discussion matters more than finishing first."

## Observe without recording personal data
One facilitator runs the game; a second observer notes process events with a session identifier only (e.g. pilot-01). Do not store participant names, email addresses, devices' identifiers, IPs, health information or individual performance in the review spreadsheet. Do not publish photos or quotes without explicit permission.

At each session, record:
- **Setup:** Minutes from opening /play to all members visible; number of people confused about join link, team selection or room code.
- **Technical:** Device counts, browser families, number of disconnects, failures/retries, unreachable screens, duplicate votes, projector overflow, PDF generation and recovery time.
- **Gameplay:** Completion rate across six scenes; minutes per scene and total; times host had to explain a rule; number of decisions where at least two alternatives were meaningfully discussed; whether employees could identify an *actual* trade-off afterward.
- **Narrative:** Could players explain who sent the memo? (Correct: unexplained attribution, not predetermined villain.) Can they connect a previous decision with an ongoing cost or staff/customer consequence? Which fact felt implausible? Did the team understand that £240k annual contract value was not £240k available cash?
- **Scoring:** Individual team final economic score, timing penalties, trust ceiling, available cash, unpaid liabilities, and final status; calculated from the private session report **only with participant consent to aggregate team outcomes**. Monitor the share of random-looking or high-trust-score ceiling outcomes; never call a session's ranking a validated behavioural assessment.
- **Engagement:** After finishing, invite voluntary anonymous 1–5 responses to "I understood what I was deciding", "I enjoyed the story", "Everyone had room to contribute", "I understood why the result happened", and "I would choose this as a team activity". One open question: "Which part would you remove or improve?"

## Practical release gates (proposed hypotheses, not claimed achievements)
- **P0 safety/technology:** Zero wrong-team credential leaks, secret exposure, double-billed commitments or unrecoverable room crashes; all devices can reach a working join screen.
- **P1 usability:** At least 90% complete all six episodes in a moderated session; median clarity score at least 4/5; fewer than two host rescues per scene on average. The pilot should guide whether these thresholds are appropriate.
- **P1 fun and pacing:** Median enjoyment at least 4/5, at least 70% willing to replay or recommend, and clear evidence that participants debate more than one strategy. No claim of "guaranteed fun" can follow from only three groups.
- **P2 learning/transfer:** Participants can cite one trade-off and one earlier choice that influenced a later scene. This is a teaching discussion cue, not an accredited assessment.

## How to calibrate the scoring model after real play
1. Export **group-level only** results with consent. Preserve each trial's current engine version/commit; do not merge data across incompatible scoring releases without labelling.
2. Compare the observed distribution of RENEWED/CONDITIONAL/AT RISK/LOST and score spread with players' reported feeling of fair feedback.
3. If no team ever qualifies, test a slightly more forgiving championship threshold on historical group decision paths **offline**. Conversely, if every team qualifies, increase difficulty before commercialization. Do not modify rules during a live competition.
4. Test trust saturation: in seeded random simulations ~41% of runs hit 100. If real groups frequently cap trust, compare a diminishing-return trust rule or alternative weight offline, preserving original histories. Select the better version based on explanation clarity and distinctiveness, not on making everyone score higher.
5. After a design decision, check no dominated choices, zero ledger errors, unchanged room privacy, all browser tests and PDF output. Run another pilot in a fresh group before making efficacy claims.

## Pilot capture template (anonymous aggregates)
`session_id,game_commit,format,teams,participants,devices,network,join_setup_min,complete_scenes,total_min,host_rescues,reconnects,projector_issues,score_median,renewal_ready_teams,trust_capped_teams,enjoyment_median,clarity_median,recommend_pct,one_major_issue`

**Warning:** A blank row is not data. This pilot has not yet been run with a verified real-world cohort.

## Developer handoff
Code path: `src/rules.js` carries the deterministic story context and economic evaluator, `multiplayer/room-core.mjs` exposes private story context to its own team, `multiplayer/client-script.txt` displays adaptive context and numeric scoring, and `multiplayer/client-pdf.txt` produces facilitator debrief pages. All changes remain on the audit branch until the active testing room is complete and deployment is explicitly approved.
