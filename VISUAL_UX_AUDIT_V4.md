# BUSINESS CRISIS — Visual & UX audit, pass four
**4 November 2026 · Draft PR #2 · Staging only**

## Product direction
**Executive incident dossier / cinematic boardroom briefing.** This is a strategic, facilitated team experience: the host and projector communicate the developing incident; phones are a private voting and evidence tool. The design should look like an intentional interactive case file, not generic AI dashboard furniture.

## Verified implementation decisions
1. **Deterministic typography:** the multiplayer UI no longer promises `Inter` without actually shipping it. Local display uses an Avenir Next / Segoe UI / system stack, with a restrained editorial serif for headings and a monospaced face only for precise clocks and numbers. No external font CDN, font binaries or user tracking. Printed/HTML verdict follows the same local font principles.
2. **Visual emphasis on the real incident:** the six original, distinct authored SVG backgrounds remain the only art. They are shown at greater contrast rather than being almost invisible behind decorative overlays. The original SVG symbol remains a readable fallback, keeping the scene fast-loading and offline-tolerant. This is a clarity/colour-grading pass, **not** an unsupported claim of photographic or fully new illustrations.
3. **Three public facts at a glance:** each episode headline has three grounded, brief markers drawn from the known story evidence. Examples: **600 staff / 3 clients / unknown sender**, **40 roles in draft / 2 depots / shift at risk**, **14:00 deadline / £240k annual contract / verifiable plan required**. These are not private team indicators, financial outcomes or predicted results. Detailed source documents remain available by expanding the evidence.
4. **Readable evidence and decisions:** enlarged narrative/evidence text, reduced decorative letter-spacing, more useful line height and clearer contrast between selected and unselected strategy cards. The illustrated advisers remain selectable with names/roles alongside portraits. Actions and consequences are unchanged.
5. **Projection prioritisation:** projectors use clear local sans-serif text, larger case facts/evidence headings and team-readiness information. On compact 1280 × 720 screens the facts are tightened to prevent an excessively tall hero.
6. **Responsive and print consistency:** rules, dossiers and strategy selection remain accessible on a 320px phone, with the case-file hero tested for horizontal overflow. Self-contained exported HTML report carries the same readable local typography and no web fonts.

## Research grounding
This pass uses established UX/accessibility principles, not unverified claims of which colour universally makes people engage:

- W3C, **WCAG 2.2**, Success Criterion 1.4.3: conventional text contrast target at least **4.5:1** and large text **3:1**; also do not convey essential status through colour alone. https://www.w3.org/TR/WCAG22/
- US/UK government accessibility guidance: responsive, plain typography, short paragraphs, left alignment and avoidance of large all-cap text blocks. https://design.homeoffice.gov.uk/accessibility/page-structure/layout-typography
- Microsoft, effective presentations: simple sans-serif fonts legible at a distance, concise text and fewer competing details on shared displays. https://support.microsoft.com/en-us/powerpoint/tips-for-creating-and-delivering-an-effective-presentation
- Nielsen Norman Group, **progressive disclosure**: keep necessary choices readily accessible while deferring optional dense source details until a person asks for them. https://www.nngroup.com/articles/progressive-disclosure/

## Tests and evidence
- Six source scenes with an additional visual evidence/clarity layer; no external image/font URLs.
- All six at-a-glance fact sets use verified story facts and never imply that the leaked email's sender was identified.
- Native-browser CSS assertions for 320px mobile numerical legibility, visible art, no sideways scrolling, and larger 1280px projection figures. Screenshot artifacts generated for both.
- Full 2/3/4-team simulated games, economic engine and role-scoped WebSocket tests remain mandatory CI gates.
- Exported HTML report asserted not to include missing Inter font, scripts, room credentials, IDs or private session tokens.
- Colour contrast spot checks for the new key text/background pairs exceed 4.5:1. These spot checks are **not** a WCAG certification.

## Important limits
Artwork is still stylistically illustrated SVG, not licensed cinema stills or photography. Replacing it with new high-quality scene imagery should be done as a deliberate art-direction exercise across **all six** episodes, not by using six unrelated stock images. Any future raster art should be self-hosted, responsive, compressed, and licensed with clear rights.

Usability perception has **not** been validated with physical teams, varied devices or actual 720p projectors. Client-side visual regression screenshots and synthetic game tests cannot show whether 20 people in a room can read every caption from the back row. Mobile Safari, colour-blindness/assistive technology, connections under packet loss and genuine 30-device concurrency remain outside the verified scope. Host-account recovery, payments, commercial anti-abuse controls and participant consent are separate release blockers.

## Additional correctness finding — simultaneous team ballots

The pre-existing room protocol rejected an individual vote whenever **any other player in any team** incremented the room-wide revision. The browser retried twice, but a large audience could still see failed ballot submissions during a burst.

The server now accepts a modern independent `lock_vote` whose `expectedRound` and `expectedRunoffOrdinal` exactly match the authoritative episode and private runoff stage, even if unrelated votes have increased the global room revision. It still rejects future revisions, duplicate votes, already completed teams, invalid selections, votes after the 4-minute deadline, and ballots from an earlier episode or earlier runoff. Non-vote changes, including host roster administration and stage advancement, retain strict revision guards. Existing legacy clients still use the original strict revision protocol.

**Regression checks:** 30 simulated participants distributed across four teams all lock ballots from the same outdated revision; each team incurs its winning economic package **once**, not once per vote. A separate real local Cloudflare Durable Object test dispatches six HTTP ballots concurrently and verifies success, exactly-once team cost and rejection of an old-episode ballot after advance. These tests are meaningful contention checks, **not** evidence that 30–80 physical phones or unstable venue networks have been validated.

## Evidence from inspecting real Chromium screenshots — 720p projection fix

Actual full-page Chromium screenshots for the first v4 pass showed a material blind spot: at a **1280×720** viewport, the story art looked good, but the three public evidence cards started **below the physical viewport**. A complete screenshot was therefore misleading; viewers in the room would need the host to scroll just to see the exhibits.

A 720p-specific density layout moves the nonessential live-connection badge into the header, reduces duplicate vertical chrome, tightens the ticker and hero without removing facts, and keeps all three evidence-card summaries on the same visible slide. Text on the evidence cards remains readable, and a new browser assertion checks the **actual evidence-list bottom edge** against the viewport height. A non-full-page `12-projection-actual-720p.png` screenshot is now included alongside the full-page captures.

This is an intentional trade-off between 720p information density and distance-legibility. The test validates fit, not visibility from the back row of a large physical venue.
