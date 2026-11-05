# The 09:17 Challenge — explicit staging release protocol

**One canonical game:** https://the-0917-challenge-staging.adiusor.workers.dev/  
**Deployment branch:** `feature/0917-corporate-challenge`  
**Original Business Crisis staging, production and `main`:** never deploy from this workflow.

## Problem this fixes

With two development/QA conversations contributing concurrently, a routine push to the canonical branch could previously deploy immediately because the repository variable `BC_STAGING_DEPLOY_ENABLED` remained `YES`. That is not a safe handoff: one session could overwrite the playable game while another was testing it.

## Release behavior after this change

- **Normal PR or ordinary push to the canonical branch:** the staging release-policy verifier runs, but **the deploy job SKIPS**. The live Worker remains unchanged.
- **Explicitly approved release push:** its **latest commit message** must include the literal marker `[release-0917-staging]`; the deploy job may then run if the staging variable is `YES` and every existing Worker isolation, credential, rules, story, privacy and smoke-test check passes.
- **Workflow manual dispatch:** retains an intentional manual path if GitHub supports dispatch for this workflow on the selected ref. GitHub may require a workflow to exist on the repository default branch for manual dispatch; in that case use the explicit marked release commit on the canonical branch instead. Do not merge a workflow into `main` solely to enable dispatch.
- The staging deploy job **depends on** the policy-verification job and uses the already-existing `isolated-0917-challenge-staging` non-cancelling concurrency group.
- The same rule is asserted by `scripts/check-0917-staging.cjs`, exercised by the existing automated staging/SEO test suite.

## One-chat-at-a-time release procedure

1. Record release intent, ownership and the target SHA in GitHub Issue #11. Ask the independent Game Director / QA conversation **not to deploy, merge or push** while the controlled staging publication is in progress.
2. Run a full green gameplay and browser CI against the **integrated exact commit**; compare source with canonical branch; use one coherent game rather than independently merging old stacked PRs.
3. Confirm no public/active team event will be interrupted by replacing the Worker. Old rooms may have incompatible episode content after a story rewrite; prefer a fresh room for testing.
4. Merge a single approved integration PR to the canonical branch. **Do not include the release marker in that commit** unless this merge is the consciously approved release. Otherwise tests can run without automatically overwriting the staging Worker.
5. When ready to publish a separately approved, fully tested canonical SHA, create an intentionally marked release commit on the canonical branch with `[release-0917-staging]` in the commit message (or deliberately dispatch the guarded workflow if available). Do **not** send arbitrary content changes as a release marker; verify the exact HEAD and production isolation first.
6. Verify the dedicated **The 09:17 Challenge — isolated multiplayer staging** GitHub Actions run is `SUCCESS` on the expected SHA, including live page/QR/room creation and 25 synthetic-client/150-vote tests.
7. Post the deployed SHA and test result in Issue #11 and hand control back to the independent gameplay QA conversation. Physical phones and real participants are still required before commercial release.

**Important:** A release marker is an *intent gate*, not an authentication boundary. Anyone with permission to push to the canonical branch can intentionally create such a commit. Use GitHub branch protection and required reviewer approvals for stronger separation; keep the staging creation key and Cloudflare token private. Never claim an in-progress Worker deployment is safe for live sessions solely because CI passed.
