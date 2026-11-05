# BUSINESS CRISIS — V8 founder requirements audit and release gates

**Date:** 5 November 2026  
**Scope:** `redesign/cinematic-crisis-v2` (staging only). No changes to `main`.  
**Goal:** An engaging, legible, safe, host-facilitated, six-episode multiplayer strategy experience, not a dense AI-generated dashboard.

## Founder-requested flows, checked against source and tests

| Requirement | State | Where checked / limitations |
|---|---|---|
| Safari/MacBook player sees advisers, plans and statements | Implemented role separation and a `/join` route that refuses inherited host role; WebKit flow tested in CI | **Real MacBook Safari / real iPhone still unverified.** Host and projector intentionally cannot vote. |
| Lock Vote button and plan controls disappear after submission | Implemented: `renderPlayerActions` immediately switches to saved-vote status and exactly two selected adviser briefings | WebKit and Chromium room journey |
| Two selected advisers' briefs directly below their selection, not up the page | Implemented. Six adviser picker collapses after a saved pair, with an explicit edit control before voting | Phone regression |
| Host clearly alerted when all teams ready | Implemented focus-managed host dialog with Advance or Review First; only host can advance | WebKit/Chromium and access-control tests |
| New episode automatically sends all players to its top | Implemented on round/phase transitions without re-scrolling on unrelated snapshots | Browser scroll regression |
| A short code can be entered directly | Implemented on home and `/join` page | Browser code entry |
| Late player joins a live room with chosen name/team | Implemented; joins this episode only if no ballots yet and at least 60s normal time remains; otherwise votes next episode | Server current electorate unchanged, join eligibility tests |
| All viewers notified of join, voluntary departure, team transfer and host removal | Implemented named, team-labelled notices, queued so consecutive events don't overwrite each other | **Closing a tab is not an explicit departure.** A reconnecting browser must not be falsely announced as having left. |
| Rules of Engagement shown on first entry, collapsed and moved below action during live play | Implemented in player/host; projector rules optional overlay only in lobby | Browser position checks, responsive CSS |
| Boardroom exciting, readable, designed, few irrelevant KPIs | Original boardroom SVG art; team rankings, short outcome narrative and 3 evidence-based awards; deeper financial data optional | Browser screenshot tests. **Qualitative review by real players still needed.** |
| Comparison across all teams for all six rounds | Implemented as one expandable, round-by-round comparative trail | Two–four-team verdict and download tests |
| No email results, no email form, no mail sending or mail feature roadmap | Permanent **DOWNLOAD-ONLY** product decision; `DOWNLOAD RESULTS · PDF` generates and downloads a standalone vector PDF directly | Source and no-email regression |
| Projector link copied into new browser still works | Read-only revocable `/projector?room=CODE#access=TOKEN`; host copy, projector copy and selectable fallback | Fresh-session browser verification. Do not share publicly. |
| No need to scroll the physical projector screen | Dedicated 1280×720 lobby / incident / finale; detailed evidence opens in on-screen overlays | 4:3 1024×768 and Full HD 1920×1080 checks added, final outcome depends on green CI |
| Mobile legible and less scrolling | Shorter incident, collapsible evidence and finances, persistent decision dock, collapsed adviser picker | 320px and 390px browser checks. Real iPhone needed. |
| Confidential advice, ballots and cash are team-private during rounds | Server-authoritative role-based views and revocable projector token; no individual ballots in exported report | Server privacy and end-to-end room tests |
| Team changes, exits and new joins cannot unfairly change a running vote | Fixed electorate, team cap, cutoff for live join, locked ballots persist, revoked player access | Unit and integration tests |
| Idle unauthenticated WebSockets cannot remain usable indefinitely | Added 12s active-instance watchdog and hibernation-alarm fallback | Local regression checks 1008 close or peer CLOSING; **actual server slot reclamation requires staging/load verification** |

## Additional what-if review

1. **One device disconnects while voting:** never infer a genuine departure solely from a socket closure; preserve session and pending individual decision. Visible disconnect/reconnect indicator remains essential.
2. **A browser duplicates an organiser's tab:** `/join` must still show player registration, not host controls. Covered by a cloned-credential test.
3. **A late arrival changes a majority in the final seconds:** prevent joining the active electorate if it already has a ballot, is in runoff, or has less than one minute of normal time left.
4. **A captain leaves:** transfer captaincy to the next active team member; keep previously committed team economics intact.
5. **Four teams finish before the host notices:** host confirmation dialog, no automatic advancement; organiser controls pacing.
6. **Ties:** one revote, then a declared captain tie-break, not an infinite repeat.
7. **No team satisfies championship conditions:** explicitly declare no boardroom champion instead of pretending the highest score renewed the contract.
8. **Shared report leaks a credential/name:** local export contains no room code, auth bearer, participant list or private individual choices.
9. **Projector link is forwarded:** it permits read-only shared-room access, not host or player access; rotating revokes past links.
10. **Repeated anonymous socket opens exhaust capacity:** unauthenticated sockets should close quickly; separate production-grade rate limits are still required.
11. **A participant uses a copied host tab or joins from a new Safari window:** routing and host/player separation must be tested in WebKit, not inferred from Chromium alone.
12. **Downloads are attempted offline or on iOS:** the PDF is generated locally without a print dialog; real iOS download behavior is not yet device-tested.

## Still NOT complete / must be treated honestly

- Physical MacBook Safari, iPhone Safari and real 4:3 / 16:9 projector sessions with a facilitator have **not** been verified.
- Automated local tests are **not** evidence that 30 simultaneous real phones, high packet loss and venue Wi-Fi are reliable.
- Production-ready abuse/rate limiting, room-creation management, host recovery, privacy retention rights and a human-tested accessibility pass are pending.
- Commercial willingness-to-pay, replayability and actual team learning outcomes are unmeasured.
- Current story branches share a fixed six-episode spine; alternative story arcs or deeper cumulative branching are a product phase, not delivered now.
- Room nicknames are pseudonymous but may still be personal data: the prototype notice and 24h retention are not a substitute for a full privacy review.
- The Boardroom report now offers a one-click **locally generated PDF** with actual decision charts. No HTML results export or email submission remains. Real-world iOS downloads and customer readability are still unverified.

## Product opportunities — prioritised, not falsely labelled as done

**P0 / reliability before any commercial session**: live 30-device rehearsal; real Safari/Android reconnection and background/resume tests; host recovery; abuse protection; keyboard/VoiceOver and projection readability; clean pause/resume policy after venue Wi-Fi failure.

**P1 / distinctive experiential leap**: deliberate "evidence reveal → team vote → consequence reveal" presentation rhythm; one strong visual beat per episode, projector-first typography, no forced data reading; integrated facilitator rehearsal mode; optional one-screen legend for decision terminology.

**P2 / better debrief and replay value**: anonymised team-consensus indicator revealed only after voting ends; incident variants with genuinely different facts and consequences; a comparison of **why** strategies diverged, not just how much money they spent; an offline printable event kit. Any new data must be server-derived, not decorative invention.

**P3 / commercial readiness**: tested event packaging, permissions, terms, accessibility conformance, organiser recovery, session export and business metrics. No email collection or sending even at this stage.

## Release decision

Keep the draft PR and staging Worker separate from production. Require successful **latest-head** CI (Chromium + WebKit + Worker security + projector layouts), user-approved Mac/iPhone playthrough, and a moderated group before considering a production merge. `main` is not the staging branch.
