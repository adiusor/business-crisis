# Deploy the multiplayer preview (separate Cloudflare Worker)

**Status:** The code, 100+ backend checks, Chromium multiplayer test, and Wrangler dry-run have passed. A GitHub Actions deploy attempt on 2026-11-04 was **blocked because both Cloudflare credentials were absent from the repository**. No deployment was made.

## One-time setup — repository owner only

1. Open Cloudflare [API Tokens](https://dash.cloudflare.com/profile/api-tokens). Create a **scoped API token** using the **Edit Cloudflare Workers** template or equivalent least-privilege Workers deployment permissions. Restrict the token to the Cloudflare account hosting your existing business-crisis Worker. Do **not** send the token in chat or commit it to GitHub.
2. Find the **Cloudflare Account ID** in the Cloudflare dashboard for that account. This is not your workers.dev hostname or Worker name.
3. Open [GitHub repository Actions secrets](https://github.com/adiusor/business-crisis/settings/secrets/actions) and add repository secret `CLOUDFLARE_API_TOKEN` with the token value. Add `CLOUDFLARE_ACCOUNT_ID` as a repository secret or an Actions variable with the account ID.
4. Open [Deploy isolated multiplayer preview workflow](https://github.com/adiusor/business-crisis/actions/runs/41744804024) and choose **Re-run all jobs**. The workflow validates the six-episode backend, bundles the Worker, deploys only `business-crisis-multiplayer-preview`, extracts the actual Cloudflare workers.dev URL and smoke-tests `/api/content`. Alternatively, push a new commit to the `feature/real-multiplayer-foundation` branch touching `multiplayer/**` to trigger deployment.

## Isolation and limits

- Deployment uses `multiplayer/wrangler.toml`, with Worker name `business-crisis-multiplayer-preview`. It does not deploy or modify the existing `business-crisis` Worker.
- Cloudflare Durable Objects persist test room state; room creation is limited to six new rooms per source IP per 24 hours, and rooms expire after seven days.
- Player team invitations are private bearer capabilities. Never post the host token, team invitations or QR codes publicly. The projector view does not reveal them.
- This is a **preview**, not a production-ready paid game. Do not distribute broadly until real-device testing, abuse controls and privacy policy have been reviewed.

## Troubleshooting

If the deployment step reports missing credentials, check the exact secret and variable names above. If Wrangler reports missing permissions, ensure the token grants Workers script deployment and the necessary Durable Object migration permissions in the **correct account**. If the Workers subdomain is not enabled, enable it in Cloudflare.

If the workflow deploys successfully but the smoke test fails, inspect the Actions job log before distributing the link. A green dry-run does not prove a public deployment.

## Verified runs

- [Passing multiplayer browser/engine checks](https://github.com/adiusor/business-crisis/actions/runs/41743839480).
- [First deployment attempt — credentials absent](https://github.com/adiusor/business-crisis/actions/runs/41744804024).
- [Draft PR #4](https://github.com/adiusor/business-crisis/pull/4).
