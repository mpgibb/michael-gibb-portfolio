# Project status

Updated September 29, 2026. All four commercial studies now have completed synthetic evaluations, dedicated case-study pages, executive summaries, reproducible source and downloads. Independent technical review remains pending. Sports analytics and Other industries are future collections.

## Release and ownership

- Canonical website: https://michaelpgibb.com
- Research collection: https://michaelpgibb.com/research
- Portfolio source: https://github.com/mpgibb/michael-gibb-portfolio
- Vercel project: https://vercel.com/mike-gibb/michael-gibb-portfolio
- Current build/deployed commit: inspect the project’s Deployments page and GitHub checks on main.
- Hosting remains the existing Hobby plan, standard Next.js 16.3.6, Node 24 and pnpm 11.19.0.
- Contact: mike@michaelpgibb.com ; https://www.linkedin.com/in/mp-gibb/ . No approved résumé has been supplied.

## Completed commercial research

| Source | Published study revision | Correctness tests |
|---|---|---:|
| [marketing-incrementality](https://github.com/mpgibb/marketing-incrementality) | `4ed728e` | 7 |
| [revenue-forecasting](https://github.com/mpgibb/revenue-forecasting) | `076e305` | 9 |
| [customer-value](https://github.com/mpgibb/customer-value) | `5d9400b` | 9 |
| [operational-planning](https://github.com/mpgibb/operational-planning) | `c0fd557` | 10 |

The source ZIPs are exact tracked-file archives of these commits. Full revisions and SHA-256 hashes are recorded in public/downloads/manifest.json. Results JSON copies in lib and public/downloads match each study’s generated summary.

- **Marketing:** original 6,000-customer randomized synthetic study remains unchanged. Added an executive summary explaining the $2.16 estimated net contribution at a $6 assumed cost, with a $0.36–$3.95 interval and fixed-treatment limitations.
- **Revenue:** generated 5,760 opportunities per scenario; evaluated twelve held-out forecast origins, three horizons and three scenarios. Stable 12-week WAPE is 6.5% for the detailed model, 6.0% for the pooled model and 19.6% for fixed weights. All detailed-model 95% ranges miss after the abrupt slowdown. Baselines, probability calibration and negative results are visible.
- **Customers:** generated 9,720 customers in 54 cohorts, with a maturity gap before 2,160 final randomized customers. Survival/value prediction improves over segment means, but the learned policy’s estimated net effect at $35/contact is −$0.04 per eligible customer (95% interval −$7.06 to $6.98). No profitable rollout is claimed. No-effect and response-shift scenarios remain visible.
- **Operations:** completed a constrained weekly staffing study over 52 held-out weeks. The stochastic policy costs $59,028 less than the buffer rule in the stable simulation, serving 99.38% versus 99.83% of demand. Surge savings have an interval including zero. A cross-platform reproduction check exposed floating-point tie sensitivity; integer micro-dollar comparisons and a regression test now make schedule selection deterministic. No seed, holdout or business-cost tuning was performed after outcomes.

Each new repository includes a protocol recorded before evaluation, fixed seeds/configuration, original data generator, data dictionary, full report, model/evaluator, tests, CI and source/data hashes. Predictions and decisions use only information available at their declared cutoffs. Oracle results are evaluator-only benchmarks.

## Website and verification

The Research dropdown provides Commercial, Sports analytics and Other industries. The latter two explicitly contain no completed studies yet. The industry collection page is public and included in the production sitemap. Every commercial case study begins with an executive summary, followed by decision, implication, evidence, data, methodology, limitations and source.

Local lint, TypeScript, production build and HTTP smoke checks passed. The smoke suite covers six public pages, metadata/canonicals, contact links, section order, four ZIP checksums, four result downloads, robots/sitemap and unavailable routes. Fresh extracted copies of all four archives passed 35 total correctness tests and reproduced every stored data/result file exactly. The new study repositories passed their independent GitHub reproduction checks, including the corrected operations release.

Browser checks cover the industry dropdown, pointer and keyboard operation, Escape dismissal, industry navigation, all four executive summaries, scenario and horizon controls, and mobile layouts at 320px and 390px. No horizontal page overflow or material console warnings/errors was found. Local builds remain noindex; production uses the purchased-domain canonical and public indexing. Run the public smoke command below after each deployment; CI and deployment status identify the deployed revision.

The first extension deployment served an older stylesheet alongside the new pages. A fresh production redeployment with “Use existing Build Cache” unchecked restored the correct styling. The smoke suite now fetches the published stylesheet and checks its research-menu, collection and executive-summary rules; this check reproduced the failure and passed after the clean rebuild. Public page/download/indexing checks, valid HTTPS and path/query-preserving HTTP/www redirects also passed. If this cache mismatch recurs, redeploy the current reviewed source without the existing build cache and rerun both HTTP and visual checks.

```bash
pnpm check
pnpm test:smoke --start
TEST_BASE_URL=https://michaelpgibb.com EXPECT_INDEXABLE=true pnpm test:smoke
```

## Domain, email and costs

No DNS, nameserver, email, plan or payment changes were made for this research release. Porkbun remains registrar, authoritative DNS and email provider. Preserve apex A 216.198.79.1 and www CNAME 6c1ebdf435fa4ed5.vercel-dns-017.com. (TTL 600), nameservers, wildcard parking, MX, SPF, DKIM, DMARC and ACME TXT records. The www domain retains its 308 redirect to the apex.

Michael previously confirmed actual send and receive delivery in both directions. No paid services, upgrades or recurring monitoring were added. Existing domain/mailbox renewals are unchanged.

## Operations, editorial policy and rollback

Read AGENTS.md and README.md before changes. Keep all synthetic labels, limitations and pending independent-review statements accurate. The standing public editorial policy remains in force. Do not restore superseded content or publish private records, credentials, local environments or audit artifacts.

Production main publishes through the existing scoped GitHub integration; other branches create protected noindex previews. No custom secrets, live Python service or model API are required. Rebuild in the production environment before promoting a preview, because indexing is environment-dependent.

The clean pre-extension release is portfolio commit 7d94eea7753b42b95a7b92ed75946aae39fad8a2. If necessary, revert the extension commit and deploy a fresh production build; this returns the additional studies to their prior planned status. Reverting the website need not delete the independent study repositories. Do not reset DNS or email to roll back code. Never roll back to the older removed-content releases. Re-clone if working from a clone predating the history reset.

Historical-copy limitations and earlier provider-deletion requests are tracked separately in docs/REMOVAL_AUDIT.md. This release makes no universal-erasure claim about old provider-retained commits or deployments.
