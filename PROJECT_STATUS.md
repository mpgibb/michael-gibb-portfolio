# Project status

Updated September 29, 2026. Research-program milestone: one evaluated public-data study (S28), 59 planned studies across the full 60-study catalog, and four separately labeled synthetic demonstrations. Independent technical review is pending.

## Published content and research

- Canonical site: https://michaelpgibb.com
- Research catalog: https://michaelpgibb.com/research
- S28 case: https://michaelpgibb.com/research/s28-sales-contact-prioritization-before-the-call-begins
- Website source: https://github.com/mpgibb/michael-gibb-portfolio
- Program source: https://github.com/mpgibb/michael-gibb-research
- Vercel project: https://vercel.com/mike-gibb/michael-gibb-portfolio

S28 evaluates 41,188 UCI Bank Marketing records with a chronological 70% development / 10% calibration / 20% final split. At 20% final contact capacity the history rule identifies 934 subscriptions versus 843 for the development-selected logistic model. The primary log-loss difference is +0.0822 (95% interval 0.0470–0.1177), favoring the simpler rule. This is historical response prediction among observed contacts, not a causal effect or realized profit.

Executed analysis revision: `da76dd823b1b242cd90fc0280f93926d2bd575ba`; research release with reports and checks: `5cb444d`. Run: `S28-da76dd82-74adfc57`. The result JSON contains source/data hashes and all prespecified comparisons. No future study is claimed evaluated. The catalog separates execution/publication status; only S28 receives a full program case-study route.

Original demonstration revisions remain marketing `4ed728e`, revenue `076e305`, customer value `5d9400b`, operations `c0fd557`; full revisions and archive hashes are in the download manifest. These synthetic evaluations remain separate from the 60-study program.

## Verification

- Research: 15 focused checks pass with warnings treated as errors. Independent recomputation from private held-out predictions agrees with all 24 published model metrics. Data partitions, response counts, frontier accounting, calibration bins and selection provenance pass.
- Website: lint, TypeScript and optimized build pass. Seven public routes, 59 unavailable unpublished routes, canonical/contact metadata, all four existing source ZIP checksums, matching S28 aggregate export, emitted CSS, robots and sitemap pass locally.
- Browser: desktop plus 390px and 320px checks; catalog industry/method/decision/search filters, empty state, reset, query navigation and keyboard menu pass. Model/capacity controls change saved counts; assumed economic extremes and reset produce correct arithmetic. No horizontal document overflow at tested widths.
- Deployment: verify this release's GitHub checks and Vercel production status before treating the milestone as live. The domain's deployed revision is available in the Vercel Deployments view. Public smoke verification is recorded after promotion.

A local browser tab opened during a rebuild briefly encountered an obsolete chunk; restarting the local server and reloading resolved it. Production verification must use a fresh tab and check actual deployed CSS as well as HTML.

## Remaining work and boundaries

59 program studies have no executed result yet. Continue the specified initial sequence (S02, S04, S58, S60, S43), then every remaining ready design. Source inspection must establish access, license, feature timing, grain and a valid evaluation. Some designs require reviewed labels or bounded inference resources; no unavailable prerequisite is represented as completed evidence.

The catalog uses server rendering so initial HTML includes the published work; case studies and results are static. Training and raw data remain outside deployment. No unrestricted model API, paid infrastructure or scheduled job is configured.

## Deployment and rollback

GitHub main remains the production branch; feature branches produce previews. Existing Next.js/Vercel settings, Hobby plan, contact, domain and Porkbun email remain unchanged. No DNS edits or new recurring costs were introduced. Preview/local indexing is disabled; production public pages are indexable.

Use an ordinary Git revert or restore a previously verified production deployment. The prior verified baseline is `fa788a35541563c2c7354d2e7cc43d24f07f8dcb`. Verify content, artifact versions and indexing after rollback. If cached CSS is stale, redeploy the reviewed commit without the existing build cache, then rerun the public smoke suite. Preserve domain/email configuration.
