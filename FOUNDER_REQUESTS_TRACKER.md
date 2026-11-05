# BUSINESS CRISIS — FOUNDER REQUESTS / DELIVERY TRACKER

Updated 2026-11-05. Source of truth for remaining requests. Status is not equivalent to customer-ready.
Repository: adiusor/business-crisis · draft PR #2 · branch redesign/cinematic-crisis-v2.
Production/main is not modified.

## Verified in automated staging / CI
- [x] Six linked incidents with server-owned decision rules, per-team clocks and real economic consequences.
- [x] Separate player, facilitator and public-projector experiences, with role-filtered private information.
- [x] Joining by QR or short code, default explicit team, 2–4 teams and mid-game joins without unfairly altering ballots.
- [x] Host command centre and all-ready transition prompt; private captain adviser selection and private individual votes.
- [x] Direct, locally generated Boardroom Verdict PDF with decision visuals and team comparison; not HTML or raw JSON.
- [x] Chromium, WebKit and Firefox game-journey CI plus local Worker and Durable Object tests. This is simulated browser coverage, not real-device certification.
- [x] Commercial SEO homepage and product pages, Romanian entry page, semantic headings, metadata, conditional sitemap and safe staging noindex.
- [x] Authentic interactive first-episode strategy sampler: the consequences and immediate spend come from canonical game data.
- [x] SEO tests are included in the quality and pre-deployment workflows.

## Product P0 — remaining before paid facilitation
- [ ] Moderate a real session with physical iPhone Safari, Android Chrome, laptop browsers and actual projector. Record defects.
- [ ] Stress-test simultaneous player entry, 30 physical phones, reconnections and venue Wi-Fi loss. A 30-player software cap is not evidence of capacity.
- [ ] Host identity/recovery and participant recovery across browser/session loss; protect sessions against abuse and room-code guessing.
- [ ] Review accessibility: keyboard, screen readers, 320px mobile, 4:3 projector and reduced motion with actual users.
- [ ] Review privacy, personal-data retention, access/deletion workflows and legal obligations across markets.

## Product P1 — experiential polish
- [x] Compact city-tower illustration and cinematic responsive styling exist on the landing.
- [ ] Evaluate a genuinely premium photographic skyscraper asset against the current illustration; retain legibility and fast loading.
- [ ] User-test visual hierarchy and pacing on real host, player and projector screens; avoid generic AI-dashboard aesthetics.
- [ ] Fully moderated remote event with teams in separate locations and real screen-sharing.
- [ ] Host-free game mode: intentionally deferred until facilitated play proves reliable. No commitment to ship this mode.

## Sales, international SEO and conversion
- [x] US/global English-first positioning and initial keyword hypotheses, not measured search volume.
- [x] Commercial homepage, corporate team-building, remote/hybrid, leadership and facilitator landing pages.
- [x] Server-rendered indexable markup is prepared and gated to the exact approved production HTTPS origin.
- [ ] Choose and verify international .com domain; independently approve deployment. Staging is never indexable.
- [ ] Connect an actual, approved demo booking/email contact; currently no public demo booking, lead form or payment.
- [ ] Decide event price, agency licence terms, deliverables and refund policies only after product/customer validation.
- [ ] Add truthful real-game screenshots, 45–75s walkthrough video and a supported 1200x630 PNG/JPEG share image.
- [ ] Verify keyword search volumes and ranking difficulty separately for USA, Canada, UK, Australia, NZ, Ireland and Romania.
- [ ] Google Search Console domain verification, XML sitemap submission, organic analytics and conversion tracking.
- [ ] International privacy and outreach legal review before AI lead enrichment or outbound emails.
- [ ] Run a small measured sales experiment with HR/L&D, facilitators and team-building agencies, tracking qualified demos and paid conversions.

## Release gates
1. Never claim SEO rankings, demo bookings, customers or sales before verified evidence.
2. Do not route the staging Worker to a public domain or merge this PR without founder review and separate production deployment approval.
3. Every code change requires newest-head staging and cross-browser CI; actual physical sessions remain mandatory.
4. Do not send game results by email. Results delivery remains downloadable PDF only.
5. Reconcile this tracker after every implementation batch so earlier requests are not silently dropped.
