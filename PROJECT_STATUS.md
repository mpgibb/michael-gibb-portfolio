# Project status

Updated September 29, 2026. Research-program milestone: three evaluated public-data studies (S28, S02 and S04), 57 agenda studies across the full 60-study catalog, and four separately labeled synthetic demonstrations. Independent technical review is pending.

## Published content and research

- Canonical site: https://michaelpgibb.com
- Research catalog: https://michaelpgibb.com/research
- S28 case: https://michaelpgibb.com/research/s28-sales-contact-prioritization-before-the-call-begins
- Website source: https://github.com/mpgibb/michael-gibb-portfolio
- Program source: https://github.com/mpgibb/michael-gibb-research
- Vercel project: https://vercel.com/mike-gibb/michael-gibb-portfolio

S28 evaluates 41,188 UCI Bank Marketing records with a chronological 70% development / 10% calibration / 20% final split. At 20% final contact capacity the history rule identifies 934 subscriptions versus 843 for the development-selected logistic model. The primary log-loss difference is +0.0822 (95% interval 0.0470–0.1177), favoring the simpler rule. This is historical response prediction among observed contacts, not a causal effect or realized profit.

Executed analysis revision: `da76dd823b1b242cd90fc0280f93926d2bd575ba`; research release with reports and checks: `5cb444d`. Run: `S28-da76dd82-74adfc57`. The result JSON contains source/data hashes and all prespecified comparisons. No future study is claimed evaluated. The catalog separates execution/publication status; S28, S02 and S04 receive full program case-study routes.

Original demonstration revisions remain marketing `4ed728e`, revenue `076e305`, customer value `5d9400b`, operations `c0fd557`; full revisions and archive hashes are in the download manifest. These synthetic evaluations remain separate from the 60-study program.

S02 uses 210 M5 product/store series and four final 28-day windows. Quantile boosting reduces primary cycle forecast error from 0.9746 to 0.8049 (17.4%); paired 95% difference interval −0.2554 to −0.0885. The default inventory replay costs $7,775.46 versus $7,962.33 for the conventional target, but loses 4,190 versus 4,149 scenario units. Total-assortment forecast bands cover only two of four final windows. Recorded sales are not unconstrained demand; all inventory economics are assumptions. Run `S02-5145fea6-e598f30c`, analysis commit `5145fea621938bb3455655a685897dfa69a2cd83`.

## S04 release checks

Run `S04-36e06a94-2716e1bf` uses corrected Criteo v2.1. On 398,506 independent final records, the validation-selected honest forest estimates 9.78 benchmark conversions per 10,000 at 20% capacity versus 9.86 for response targeting. The paired difference −0.08 (95% interval −0.89 to +0.73) does not establish an uplift advantage. Privacy subsampling prevents original advertiser ROI claims.

37 research checks and 110 independent score/accounting comparisons pass. Website lint, TypeScript, optimized build and local smoke checks pass across nine public routes, three exact result exports, four archives and 57 unpublished-route exclusions. Browser checks pass at desktop, 390px and 320px: budget endpoints, policy changes, economic extremes, keyboard reset and no document overflow. A fresh local tab has no warning/error entries. Source/generated-output publication review passes. Production verification is pending for S04.

## S02 release checks

25 research checks and 1,593 independent arithmetic comparisons pass. Website lint, TypeScript, optimized build and local smoke checks pass across eight routes, both matching result downloads, four source archives and 58 unpublished-route exclusions. Desktop and 390px browser checks verify model/aggregation/economic controls and keyboard reset; a fresh tab has no warning/error console entries. Production release `ba75f81194dcf70ac8c804ccf60107ef567a880a` is live; Vercel deployment `https://michael-gibb-portfolio-o59zj4im3-mike-gibb.vercel.app` succeeded. The full public smoke suite passes all eight pages, both result downloads, four source archives and 58 unpublished-route exclusions. A fresh production browser confirms the executive summary and exact default scenario table with no warning/error console entries.

## Previous milestone verification

- Research: 15 focused checks pass with warnings treated as errors. Independent recomputation from private held-out predictions agrees with all 24 published model metrics. Data partitions, response counts, frontier accounting, calibration bins and selection provenance pass.
- Website: lint, TypeScript and optimized build pass. Seven public routes, 59 unavailable unpublished routes, canonical/contact metadata, all four existing source ZIP checksums, matching S28 aggregate export, emitted CSS, robots and sitemap pass locally.
- Browser: desktop plus 390px and 320px checks; catalog industry/method/decision/search filters, empty state, reset, query navigation and keyboard menu pass. Model/capacity controls change saved counts; assumed economic extremes and reset produce correct arithmetic. No horizontal document overflow at tested widths.
- Production: release `7b4ade0ec74fa27bea4d0ef060609f62f951eeb2` is live. GitHub Actions and Vercel succeeded. The full public smoke suite passed on michaelpgibb.com, including all seven routes, result/download hashes, CSS and 59 unpublished-route exclusions. Fresh production browser checks found no console warnings/errors; all-study (64 including demonstrations), sports (3) and default (5) counts, interactive comparisons, reset and mobile layout passed.
- Deployment URL: https://michael-gibb-portfolio-uz7yswbzh-mike-gibb.vercel.app ; dashboard: https://vercel.com/mike-gibb/michael-gibb-portfolio/GP8M9oQW6TGETNts2GAhEpFoiT1x . HTTP and www redirects reached the canonical HTTPS catalog with query strings preserved.

A local browser tab opened during a rebuild briefly encountered an obsolete chunk; restarting the local server and reloading resolved it. Production verification must use a fresh tab and check actual deployed CSS as well as HTML.

## Remaining work and boundaries

57 program studies have no executed result yet. Continue the specified initial sequence (S58, S60, S43), then every remaining ready design. Source inspection must establish access, license, feature timing, grain and a valid evaluation. Some designs require reviewed labels or bounded inference resources; no unavailable prerequisite is represented as completed evidence.

The catalog uses server rendering so initial HTML includes the published work; case studies and results are static. Training and raw data remain outside deployment. No unrestricted model API, paid infrastructure or scheduled job is configured.

## Deployment and rollback

GitHub main remains the production branch; feature branches produce previews. Existing Next.js/Vercel settings, Hobby plan, contact, domain and Porkbun email remain unchanged. No DNS edits or new recurring costs were introduced. Preview/local indexing is disabled; production public pages are indexable.

Use an ordinary Git revert or restore a previously verified production deployment. The prior verified baseline is `fa788a35541563c2c7354d2e7cc43d24f07f8dcb`. Verify content, artifact versions and indexing after rollback. If cached CSS is stale, redeploy the reviewed commit without the existing build cache, then rerun the public smoke suite. Preserve domain/email configuration.
