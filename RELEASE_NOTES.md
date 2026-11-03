# BUSINESS CRISIS — Director's Cut (v1.2)

## Changed

- Redesigned cinematic opening, team lobby, leaked-document briefing, six episode backdrops, intelligence room, strategic decision cards, crisis fallout and final case-file styling.
- Replaced six small 166 × 190 pixel portrait rasters with original resolution-independent SVG illustrations matched to the English-language character names.
- Reduced clutter by collapsing the detailed company metrics during decisions, while keeping cash, risk and contract exposure visible.
- Narrative fallout now leads with the consequences; metrics and episode financial receipt remain available.
- Preserved existing engine for cash ledger, risk, score, random seeded session twists, six-round choices, adviser consultation and final outcome.
- Single index.html contains all artwork; no third-party asset requests.

## Automated checks

- Completed full browser playthroughs with 2, 3 and 4 teams, and mobile at 390px, on Chromium.
- Verified no browser JavaScript errors in those runs and cash + net ledger spending = £260k.
- Layout checks on 320, 375, 390, 428, 768, 1024 and 1440 pixel widths showed no horizontal overflow.
- 1200 seeded strategy matches / 2400 individual team results; 0 ledger or state discrepancies, 0 differences among tested same-decision teams under same conditions.
- Scores 5–95 percentile: 28–68; median cash remaining £29k; median risk 44.

## Important limitations

- This is a shared-screen game; QR join, real phone-based multiplayer, secure per-player intelligence and payments are not implemented.
- Portaits are crisp stylised illustrations, not photorealistic artwork. Their final visual direction still needs founder approval.
- Automated tests do not replace moderated playtests with real groups or production security/load testing.
- Safari/iPhone compatibility was designed for but not directly tested on a real iPhone.
- The source remains a single HTML file; modularisation remains future engineering work.

## GitHub publish

Upload only index.html to the root of adiusor/business-crisis; ensure exact filename, commit to main, verify Cloudflare deployment is Ready. Keep an earlier revision for rollback.
