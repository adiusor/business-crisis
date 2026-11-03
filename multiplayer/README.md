# BUSINESS CRISIS — Multiplayer preview (development only)

This is a **separate Cloudflare Worker** built on the cinematic v2 game rules. It is not connected to the existing public Worker or the production \`main\` branch.

## Implemented in this branch

- One persistent Cloudflare Durable Object per eight-character room code.
- Server-authoritative, deterministic six-episode economic transitions using the same \`src/content.js\` and \`src/rules.js\` as cinematic v2.
- Host-created rooms with 2–4 named teams. The host receives a 256-bit bearer credential stored locally in the browser.
- **Different private invitation links for each team.** Room code alone cannot grant access to a team; a 64-bit team invitation is required to join. Do not post private invitations publicly.
- Nickname-only players; local bearer token persists for reconnecting on the same device.
- Each team selects two advisers, may change them until confirmation, and sees **only its own two** adviser briefings. Other teams' private intelligence is never sent in player or projector API responses.
- One team-level vote per episode (the first member to submit locks the decision). The host cannot settle until all teams have locked their votes.
- Separate phone player UI, host controls and projector UI, with 3-second state polling.
- Revealed outcomes, final rankings and contract-dependent championship gates; server-side cash ledger and delayed liabilities.
- Tests covering invalid credentials, private intelligence, duplicate commits, concurrent host resolves, reconnecting the Durable Object, late joining and all six episodes.

## Develop locally

Requires Node.js 22+ and a modern browser.

\`\`\`bash
npm install
npm run test:multiplayer
npx wrangler dev --config multiplayer/wrangler.toml
\`\`\`

Open the local address printed by Wrangler. Choose **Host a new incident**, create two to four teams, and copy each team's **private invitation** to its players. Open the projector from the host screen in a second tab or display. Start the game after at least one player has joined each team.

The existing cinematic v2 shared-screen preview remains separate and can still be built with \`npm run build\`.

## Phase protocol

\`lobby\` → \`intel\` → \`decision\` → \`reveal\` → next episode (six times) → \`finished\`.

Host: create, start, open decisions once all adviser choices are confirmed, resolve once all team votes are locked, advance after discussion. Players: join using a team invitation, choose and confirm two advisers, read only their own briefings, then submit one shared team response. Projector: display public episode and readiness information, never private advice or pre-reveal consequences.

## Security and operational limits

**This is a foundation, not a production security certification.** The room host is authenticated by a bearer credential; players are authenticated by random bearer credentials tied to their team. Team invite URLs are capability secrets. Avoid exposing them in screenshots, analytics, third-party QR services, or public projector views.

Still required before public launch: rate limiting and abuse prevention for unauthenticated room creation/join, room expiration and deletion policies, host credential recovery/organiser accounts, load/reconnect testing, individual ballots and tie resolution, WebSocket/SSE push instead of polling, QR generation, Safari/iOS and accessibility testing, production monitoring, commercial payment and licensing, five independent facilitated playtests. Do not claim 30-player support until measured.

## Deployment boundary

The Wrangler config uses **\`business-crisis-multiplayer-preview\`**, a different Worker name from the public \`business-crisis\`. A deployment requires founder-controlled Cloudflare access and approval. **Do not merge this branch into \`main\`, deploy to the public Worker, or enter payment credentials without founder sign-off.**

To validate the bundle without publishing:

\`\`\`bash
npx wrangler deploy --dry-run --config multiplayer/wrangler.toml
\`\`\`
