# INTERNATIONAL SEO IMPLEMENTATION — BUSINESS CRISIS
SEO staging preview; not a published commercial launch. Updated November 5, 2026.

Implemented:
- Server-rendered unique pages for homepage, corporate game, remote teams, leadership, facilitators, about, Romanian entry, pricing status and demo status.
- Dedicated room experience at /play, /join and /projector. Old /?room=CODE links remain valid.
- Static semantic HTML, descriptions, one H1 per page, canonical gated by verified domain, Open Graph, JSON-LD, and an own SVG share preview.
- Site CSS is self hosted. The staging host always returns noindex headers and HTML directives. No staging XML sitemap exists. Robots allow crawling the public HTML so Google can read noindex; only /api/ is disallowed. This is not password-based privacy.
- /pricing and /demo remain noindex because no confirmed checkout, price or booking channel exists.
- Unit and real Cloudflare Worker integration tests.

Activation tasks:
1. Purchase and verify the .com business domain; configure a separate approved production route and PUBLIC_SITE_ORIGIN with its precise HTTPS origin.
2. Never attach the isolated staging worker to a custom domain or production route.
3. Decide business email/booking integration, final offers and accurate pricing. The website currently cannot collect leads.
4. Configure Google Search Console on the commercial domain and submit its sitemap.xml. Verify indexation and indexing coverage.
5. Replace the illustrated share-preview.svg with a real 1200x630 PNG/JPEG and real game screenshots; many social previews do not accept SVG.
6. Confirm real-world capacity, accessibility, delivery durations and remote facilitation before public commitments.
7. Configure compliant analytics and conversion tracking, respecting applicable consent and privacy obligations.
8. Validate keyword volumes and search intent separately for USA, UK, Canada, Australia, Ireland, New Zealand and Romania.
9. Add genuinely differentiated locale-specific pages only after local offer and market evidence; do not clone dozens of city pages.
10. Review final deployment separately before touching production.

Priority keywords to validate, not measured search volume:
business simulation team building; corporate team building games; leadership decision making game; virtual team building games for work; crisis management team building; jocuri team building corporate; simulare de business pentru echipe.
