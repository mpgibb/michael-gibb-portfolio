# Michael P. Gibb, Ph.D. — Commercial analytics and AI leadership

Live: https://michaelpgibb.com · Source: https://github.com/mpgibb/michael-gibb-portfolio

The professional portfolio focuses on marketing effectiveness, sales and revenue forecasting, customer retention/lifetime value, and operational planning. Its audience is executives and hiring teams evaluating Director/VP analytics, AI, data science and technical leadership. Career background is limited to Michael's supplied information; research results are not client accomplishments.

## Local development

Use Node.js 24 and pnpm 11.19.0. Run `pnpm install --frozen-lockfile`, then `pnpm dev`.

```bash
pnpm check
pnpm test:smoke --start
TEST_BASE_URL=https://michaelpgibb.com EXPECT_INDEXABLE=true pnpm test:smoke
```

`lib/projects.ts` and `lib/completed-studies.json` control the four case studies and executive summaries. `lib/*-results.json` are generated copies of evaluated study results. `components/incrementality-explorer.tsx` and `components/commercial-evidence.tsx` provide accessible client-side sensitivity/scenario comparisons. `/research` groups the commercial studies and identifies future industry collections; the Research dropdown supports keyboard, pointer and mobile use. No database or live model API is required.

## Study reproduction

Study repository: https://github.com/mpgibb/marketing-incrementality

Use its Python 3.11.16 environment and frozen uv lockfile. Run `uv sync --frozen`, `uv run python -m unittest discover -s tests -v`, then `uv run python study.py`. The protocol, seeded data generator, CSVs, known ground truth, estimator, evaluation configuration and result/source hashes are included. No external data or runtime dependencies are needed.

All four commercial projects have completed synthetic evaluations. The three additional repositories are:

- https://github.com/mpgibb/revenue-forecasting — competing-risk pipeline forecasting, twelve held-out origins, three horizons and three scenarios.
- https://github.com/mpgibb/customer-value — matured temporal cohorts, survival/value prediction and honest randomized retention-policy evaluation.
- https://github.com/mpgibb/operational-planning — rolling demand forecasts and exact constrained staffing optimization over 52 held-out weeks.

For each, run the same `uv sync --frozen`, test and reproduction commands. They use NumPy 2.2.6 and SciPy 1.17.1, pinned in each lockfile. Their README, PROTOCOL.md, DATA.md and REPORT.md document assumptions, complete results and adverse findings. Revenue and customer value include nine correctness tests each; operations includes ten. Independent technical review remains pending. Sports analytics and Other industries are future collections, with no completed-study claims.

When updating a study, run its pipeline and require `git diff --exit-code -- data results` after committing the intended outputs. Copy `results/summary.json` to the matching `lib/` and `public/downloads/` files. Build its source ZIP with `git archive` from the published commit; update the exact commit and SHA-256 in `public/downloads/manifest.json`. Review archive members for excluded local files before publishing. Never change displayed research findings without corresponding source, evaluation and provenance updates.

## Deployment and domain

Vercel project: https://vercel.com/mike-gibb/michael-gibb-portfolio . GitHub `main` deploys to production; feature branches produce protected previews. Use the Next.js preset, repository root, Node 24, `pnpm install --frozen-lockfile`, and `pnpm build` (vercel.json). No custom environment variables or credentials are required. Public canonicals default to https://michaelpgibb.com; SITE_URL is an optional trusted override. VERCEL_ENV controls indexing. Local/preview builds use noindex, disallow-all robots and empty sitemaps; production allows public indexing. Rebuild before promoting between environments.

Porkbun remains registrar, DNS provider and email provider. Website records: apex A `216.198.79.1`, explicit www CNAME `6c1ebdf435fa4ed5.vercel-dns-017.com.`; both TTL 600, verified against project settings at domain launch. www redirects to apex with HTTP 308. Preserve all nameservers, MX, SPF, DKIM, DMARC, mail hosts and unrelated records. The working email is mike@michaelpgibb.com; LinkedIn is https://www.linkedin.com/in/mp-gibb/.

## Content direction and rollback

Read AGENTS.md and PROJECT_STATUS.md before editing. The commercial direction supersedes older source exports, prompts, branches and deployment histories. Removed work must not be restored. Restore only a release verified under the current content policy. The portfolio and flagship study histories were reset to current-source snapshots on September 28, 2026. Re-clone after this history rewrite; never merge an old clone back into current history. Current source downloads contain reviewed tracked files only, with SHA-256 recorded in the manifest. Never publish .env files, private career records, local backups or virtual environments.

Vercel Hobby remains the existing plan for this personal professional portfolio, with no service sales or payments. Reassess its personal/non-commercial eligibility before adding commercial services. No paid services or recurring monitoring are authorized. Existing Porkbun domain/mailbox renewals are unchanged.

Research and independent review status are disclosed. No reuse license for authored source has been selected. Third-party notices remain intact. See PROJECT_STATUS.md and docs/REMOVAL_AUDIT.md for completion, evidence and unresolved historical-copy limitations.
