# 09:17 Challenge — independent scoring and story-coherence check

**Scope:** Game content, deterministic economic rules, public messaging, choice balance, six-episode cash accounting, final renewal thresholds. Reviewed against draft PR #9, 5 November 2026. **Not a claim of commercial success or user-study validation.**

## What is demonstrably real

- Each round has one of three strategic actions, one of three public statements, two adviser briefings chosen by the captain, and (in rounds 3 and 5) optional £10k/£20k allocation. Strategy, statement and funding enter the authoritative `R.applyTurn` financial/risk model. Advisers affect information, **not points directly**.
- Each response pays the episode's baseline operating cost; plan spending is deducted; liabilities are paid when due or remain as future commitments and reduce the final liquidity/ranking calculation. Cash accounting reconciled in **4,000 modelled six-episode trials (zero ledger errors)**.
- Overall economic score starts at 100, subtracts a risk exposure index with weights **24% legal / 27% operations / 18% workforce / 31% customers**, scaled by 0.62, adds 0.25 × (trust−50), subtracts liquidity risk excess over 40 × 0.16, pending obligations (up to 18 points), and specified risk/insolvency penalties. It is rounded and bounded to 0–100. Individual late or missed-deadline penalties further reduce ranked scores. The `RENEWED` status is a **simulated renewal-readiness threshold**, not evidence of any real signed contract.
- For 350 deterministic random baselines **after the targeted fixes**, changing one strategic response in each of six rounds changed the final economic score in 1,980 of 2,100 comparisons (**94.3%**), and changing one public statement did so in 1,914 of 2,100 (**91.1%**). All 4,200 comparisons changed at least one model state variable. Unchanged scores can occur because of rounding, hard score/risk caps and compensating effects.
- Existing GitHub Actions CI passed with local Worker, Durable Object, HTTP, WebSocket, WebKit, Firefox and Chromium end-to-end flows on commit 6979c2da; this does not establish 25-device field performance or participant enjoyment.

## Material findings and the changes in this audit branch

1. **Three strictly dominated public responses:** Episode 4 `STAFF FIRST` was worse than `CORRECT THE RECORD` on every modelled dimension; Episode 5 `CONFIDENT UPDATE` was worse than `MILESTONE ALERT` (and carried a contingent cost); Episode 6 `SHARE THE NEXT STEPS` was worse than `OWN THE TRADE-OFFS`. These are game-design defects because participants could choose a plausible option and get punished without any compensating upside.
2. **Targeted, narrative-grounded correction:** `STAFF FIRST` now reduces workforce exposure more (colleagues get direct answers, while customers wait). `CONFIDENT UPDATE` protects customer confidence more but still has legal, operational and contingent financial costs. `SHARE THE NEXT STEPS` now promises a verified next-shift handover, improving operations rather than acting as empty reassurance. No other prices, thresholds, roles, UI routes or algorithms were altered.
3. Added tests that automatically reject a strictly dominated choice based on cash, deferred costs, trust and each risk dimension; and verify every strategic and public response has a meaningful impact on final economic state. Original chronological, security and browser tests remain required.

## Remaining limitations / not yet optimised

A seeded sample of **4,000 randomly selected choice sets after the fixes** (including message choices, three scenario variants and occasional optional allocations) yielded 178 `RENEWED` (4.45%), 2,260 `CONDITIONAL`, 710 `AT RISK` and 852 `LOST`. This is **not an empirical player success rate**. It suggests the strict championship may be uncommon for uninformed/random teams; a facilitated group may behave very differently. Of these trials, trust reached the 100 cap in 1,633 (40.8%). Saturation reduces discrimination between some high-trust decisions. These are **calibration questions**, not proven bugs; changing trust scales or win conditions without usability data could make the experience less credible.

Some trade-offs are illustrative rather than empirically validated. The six chapter structure is coherent at a high level, but a human facilitator must still test whether the confidential-email premise, two exhausted specialists, contractual renewal timing, and repeated choices feel natural, exciting and understandable. An experiment has not established enjoyment, clarity, learning outcomes or host-led 25-phone capacity.

## Additional technical and narrative limitations

- **Liquidity modifier overwritten:** `R.recalcLiquidity` recalculates `team.risks.liquidity` from `cash - pending` after applying episode, plan and delayed risk deltas. Thus the last episode's configured `ESCALATION[5].liquidity: +5` does **not** survive, nor would any direct liquidity penalty on a due commitment. Actual cash spent and unpaid commitments still affect liquidity through coverage. Decide deliberately whether liquidity is solely a derived metric (remove misleading direct modifiers) or also supports a separate, persistent stress premium (change engine and retune), rather than silently assuming configured deltas all count.
- **Narrative consequences are primarily fixed text:** `R.applyTurn` stores the selected plan's fixed `fallout` text. Cash, trust, risk and final renewal status depend on past choices, but the immediate story prose is not branched on insolvency, prior decisions or stakeholder history. It may, for example, describe the board funding an improvement after the team's simulated budget has gone negative. This is not proof that the underlying economics are wrong; it is a genuine narrative continuity / immersion risk. Add bounded, explainable state-sensitive fallouts before claiming dynamically coherent stories.
- **Information is not a hidden score bonus:** choosing two advisers changes the evidence available, not the numeric scoring directly. Make this clear to participants so they do not expect character bonuses.
- **No real-player difficulty calibration:** the weighted formula and championship thresholds are invented game rules, not scientifically validated business outcomes or academic assessment measures. Test how often real first-time teams qualify and whether losing feels constructive.

## Review and release

This review is intentionally on `audit/0917-scoring-coherence`, **not the live 09:17 staging Worker**, because people may be inside existing rooms. The old Business Crisis staging, 09:17 staging and Cloudflare production are not modified by this audit. Merge only after the new tests are green, the current live game ends, and the organiser elects to publish the updated story.

**Readiness: NEEDS FURTHER PLAYTESTING** before a 25-person commercial pilot. Technical game rules are inspectable and deterministic; the three dominated choices are fixed here; calibration and real-user validation remain open.
