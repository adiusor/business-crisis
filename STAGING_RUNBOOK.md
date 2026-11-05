# BUSINESS CRISIS — staging launch and real-phone QA

**Status: PREPARED, NOT DEPLOYED.** All work is restricted to `redesign/cinematic-crisis-v2` and Draft PR #2. The public `main` game must remain unchanged.

## Stage boundary

- Worker name: **`business-crisis-rooms-staging`**, configured solely in `multiplayer/wrangler.staging.jsonc`.
- Intended address: `https://business-crisis-rooms-staging.<account-subdomain>.workers.dev` (actual subdomain is discovered at deployment).
- `workers_dev: true` on staging **only**. The existing `multiplayer/wrangler.jsonc` retains `workers_dev: false`.
- No routes, custom domains, production Worker script names, merge operation or production data bindings.
- Separate SQLite Durable Object namespace through the separately named Worker; new rooms expire after 24 hours.
- The staging Worker URL is public on the internet once enabled. Room creation is separately gated by a non-public founder key. Never advertise this URL to clients as a finished commercial service.

## One-time secure GitHub setup (owner only)

Use the repository's **Settings → Secrets and variables → Actions** page.

Under **Repository secrets**, create:

1. **`BC_STAGING_DEPLOY_TOKEN`** — new Cloudflare API token, scoped to the correct Cloudflare account for Workers deployment. Do **not** reuse or increase privileges on the current Cloudflare read-only token. Cloudflare currently requires Workers product-level **Admin** to create a Worker that does not exist; after initial provisioning, replace this with a token scoped to **Editor** on this one staging Worker if your Cloudflare account supports that scope. Do not grant access to production zones/routes.
2. **`BC_STAGING_ROOM_CREATION_KEY`** — independent random secret, minimum 32 characters; ideally 64 hexadecimal characters generated locally using `openssl rand -hex 32` on macOS. This is the password the organiser will enter to create a staging room. Never share it in chat or commit it to GitHub files.
3. Account ID is already stored in `CLOUDFLARE_ACCOUNT_ID` or the earlier misspelt `CLOUDFARE_ACCOUNT_ID`. The workflow accepts either. Do not put the account ID in the token field.

Under **Repository variables**, create **`BC_STAGING_DEPLOY_ENABLED`** with value **`YES`** (exact uppercase) only **after** the two new secrets are available. Without this value, the deployment job is skipped.

The workflow job also uses a GitHub environment named `business-crisis-staging`. Consider configuring a required reviewer for this environment in repository Settings → Environments before enabling deployments. Creating an environment by itself does **not** enforce reviewer approval.

## How a staging deployment starts

The workflow `.github/workflows/business-crisis-staging.yml` listens to commits on exactly `redesign/cinematic-crisis-v2` and deploys only when **`BC_STAGING_DEPLOY_ENABLED=YES`**. Updating secrets or variables does not automatically start a workflow: push a new change to the draft branch after secure setup. This is intentional because GitHub's `workflow_dispatch` event for a brand-new workflow cannot run until its file exists on the default branch; we are **not merging to main** merely to activate staging.

Every enabled staging run verifies the exact Worker name and routing policy, tests the business rules, bundles the Worker, deploys only staging, provisions `ROOM_CREATION_KEY`, and runs live HTTPS smoke tests (health, blocked unauthenticated room creation, real room creation, Durable Object state, QR SVG). The output includes the verified staging URL. The smoke test creates one empty room which expires after 24 hours. Automated CI cannot verify physical iPhone or Wi-Fi conditions.

## Real-device playtest protocol

Use synthetic player names and no real customer information.

1. On a host laptop, open the staging URL. Enter the staging room-creation key **on the host only**, choose 2 teams and create a room. Do not send the room-creation key to players.
2. On one iPhone Safari and one Android Chrome device, scan the host QR or open the provided link. Also test typing the short **4-character code** at `/join` (case-insensitive). Choose different nicknames and teams. Rename at least one team through its captain. Previously created **12-character** links remain valid until they expire.
3. Open the dedicated projector link from the host on a separate screen. Confirm it shows the public episode and clock, **not** players' names, confidential adviser advice, room-creation key or host controls.
4. Start episode one. Have each captain select two advisers, read private intelligence, make a strategic choice and select a public statement. Confirm the projector and host see team completion without the private advice.
5. Test one on-time submission (within 3:00), one submission in the reserve minute (−5 score), and one unanswered 4:00 deadline (−12 and actual economic deterioration). Do this in separate episodes if needed.
6. During another episode, put one phone in airplane mode and restore service. The device should recover current room state; a submitted decision must never be charged twice.
7. Generate a new projector link from the host. The old projector screen should lose access, while a new link should work.
8. Finish all six episodes. Compare final score with economic score minus timing penalties and confirm Boardroom Champion requires a renewed contract, solvency and viable operations. Export the JSON case file.
9. Check readability on 320px screens, large text, landscape/portrait changes, and that all buttons remain accessible. Take screenshots **without secret keys or player identifiers**.

**Stop criteria:** any private-advice disclosure, duplicate economic charge, incorrect timing penalty, ability to enter without permission, room desynchronization that does not recover, or broken host projector control. Keep such staging rooms private and report the failing episode and action, **not any credentials**.

## Known limits and costs

The four-character room code is easy to share, but **not private or secure** by itself. Use test nicknames only; production must add join-rate limiting, an optional room PIN or host-approved admission, and protection from room enumeration. Staging remains an internet-accessible test environment; the app has not passed formal security, accessibility, GDPR, commercial load or real-device audits. The currently implemented nickname and room-code admission model needs rate limiting, stronger host identity and abuse handling before public sales. Cloudflare usage is billed according to the account's applicable plan and usage; small tests may fit in included quotas but **zero incremental cost is not guaranteed**.

Payments are not enabled. Results delivery is permanently download-only; no email address is requested and no sending feature is planned. Room nicknames are personal data in some circumstances: use a privacy notice and retention/deletion process before gathering real participant information.
