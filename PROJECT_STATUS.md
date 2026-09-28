# Project status

Updated September 28, 2026. The commercial portfolio replaces the earlier content direction. The commercial release is live and verified. Historical source cleanup is complete; two provider deletion actions await final browser confirmation. See VERIFICATION.json for recorded checks.

## Release and ownership

- Canonical website: https://michaelpgibb.com
- Portfolio source: https://github.com/mpgibb/michael-gibb-portfolio
- Hosting: https://vercel.com/mike-gibb/michael-gibb-portfolio ; existing Hobby plan, production main, Node 24, pnpm 11.19.0, Next.js 16.3.6.
- Flagship study: https://github.com/mpgibb/marketing-incrementality ; source/results revision 4ed728e (full revision and ZIP hash in public/downloads/manifest.json).
- Contact: mike@michaelpgibb.com ; https://www.linkedin.com/in/mp-gibb/ . No approved résumé has been supplied.

Current source is the `main` branch after the September 28 history reset. The portfolio and flagship study each start from one current-source snapshot; the obsolete portfolio feature branch was removed. The source download identifies the new study revision and archive hash. See the [current GitHub checks](https://github.com/mpgibb/michael-gibb-portfolio/actions?query=branch%3Amain) and [Vercel deployments](https://vercel.com/mike-gibb/michael-gibb-portfolio/deployments) for the exact deployment commit and build status. Page content, design, research code, data and evaluation results are unchanged by the reset.

## Commercial research and evidence

The homepage leads with commercial analytics/AI leadership, supplied professional background and one evaluated synthetic study. Marketing effectiveness, sales/revenue operations, customer value and internal operations are the four application areas. Three future studies are explicitly planned and have no invented repository, download or results.

The flagship implements a stratified randomized campaign with 6,000 synthetic customers and a separate 4,000-customer historical cohort. The adjusted estimate is $8.1555 per assigned customer (95% interval $6.3599–$9.9511), compared with an unadjusted $8.0695 ($5.5134–$10.6257); known effect $8.00. Adjustment narrows the primary interval by 29.8%. At an assumed fixed-campaign cost of $6, net contribution is $2.1555 ($0.3599–$3.9511). These are simulated outcomes, not client impact.

Across 400 base-scenario experiments, adjusted coverage is 94.5% (Monte Carlo SE 1.14 percentage points); null false positives are 5.5%. Under a weakened historical relationship, adjustment worsens RMSE to $2.20 versus $1.65 for the baseline. All results and limitations remain visible. Cost sensitivity holds treatment fixed and cannot justify arbitrary budget allocation.

Reproduction: clone the study repository, run `uv sync --frozen`, `uv run python -m unittest discover -s tests -v`, `uv run python study.py`, then `git diff --exit-code -- data results`. Python 3.11.16, fixed seeds/configuration, CSV/source hashes and a committed protocol are included. Seven correctness tests and research CI passed. Independent technical review remains pending.

## Verification and historical cleanup

Local lint, TypeScript and production build passed. HTTP smoke covers all five pages, section order, status labels, metadata/canonicals, contact links, the source ZIP/hash, saved result JSON, robots/sitemap and unavailable routes. Retired project/download paths return 404 without an unrelated redirect. Desktop and 390px/320px local browser review passed, with no horizontal page overflow. All routes loaded directly and after refresh. Public production and protected preview interactivity, keyboard controls and metadata passed with no material console messages. A fresh copy of the public ZIP passed all seven tests and reproduced all four generated data/result files exactly. Current source/downloads contain only the new direction; old screenshots and historical reports have been removed from the current tree.

Branches, tags, commits, associated research repositories, GitHub metadata and provider deployments were inventoried before cleanup. Only the owner is a collaborator; no other active editing session, fork, issue, pull request, release or Actions artifact was found for this portfolio. History cleanup preserved unrelated source and used expected-reference leases before remote changes. Obsolete branches and six Actions run records were removed. Known old SHA-addressed GitHub files remain publicly retrievable despite branch cleanup. See [REMOVAL_AUDIT.md](docs/REMOVAL_AUDIT.md) for completed actions, pending provider deletions and explicit limitations.

## Domain, email and costs

No DNS changes were made for this release. Authoritative before/after records match, including nameservers, MX, SPF, full DKIM, DMARC and both ACME TXT values. TLS validation passed for apex and www; HTTP/www redirect chains retain the project path and query parameters and terminate at the canonical HTTPS page without loops. Porkbun remains registrar, authoritative DNS and email provider. Preserve all four Porkbun nameservers, apex A 216.198.79.1 and www CNAME 6c1ebdf435fa4ed5.vercel-dns-017.com. (TTL 600), wildcard parking, MX, SPF, DKIM, DMARC and existing ACME TXT records. The www domain retains its 308 redirect to the apex. Local DNS snapshots are ignored and must not be published.

Michael previously confirmed actual send and receive delivery in both directions after the original domain connection. This release makes no email changes. No paid service, upgrade or monitoring job has been added; existing domain/mailbox renewals remain unchanged.

## Operations and rollback

Use README.md for local checks and deployment. Production main publishes through the existing scoped GitHub integration; other branches create protected noindex previews. Production uses the purchased-domain canonical URLs, public sitemap and index/follow. No custom secrets, live Python service or model API are needed.

Only clean releases under this content policy are eligible for rollback. Do not restore earlier exports, removed artifacts or obsolete deployments. After history cleanup, re-clone instead of merging an old clone. For a code defect, revert to a clean release and rebuild with VERCEL_ENV=production. Domain configuration and email records should remain untouched during code rollback.

Browser evidence: [desktop homepage](docs/verification/commercial/desktop-home.png), [interactive result](docs/verification/commercial/desktop-explorer.png), [mobile homepage](docs/verification/commercial/mobile-home.png). Mobile images were captured from the identical local production build.

## Public wording update

Public case-study copy, study documentation and the source download now focus on research and review status without development-tool credits. Methods, seeds, data and evaluation results are unchanged; the protocol documentation hash and download manifest were refreshed. The linked study repository contains the same reviewed documentation as the downloadable archive.

## Repository history reset

At Michael's request, earlier commits were removed from the portfolio and flagship study branch histories. Both now start with a current-source snapshot; the obsolete portfolio feature branch was deleted. Updates used exact expected-reference leases. The study README and provenance notes now describe the snapshot rather than claiming preserved commit ordering. The downloadable study archive and manifest point to the new study root. Re-clone before further work; old clones must not be merged or pushed back. Provider-retained objects and outside copies are a separate limitation, as recorded in docs/REMOVAL_AUDIT.md.
