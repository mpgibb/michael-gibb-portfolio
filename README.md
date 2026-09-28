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

`lib/projects.ts` controls the four case studies. `lib/marketing-results.json` is a generated copy of the evaluated study results. `components/incrementality-explorer.tsx` implements the accessible, client-side cost-sensitivity visualization. No database or live model API is required.

## Flagship reproduction

Study repository: https://github.com/mpgibb/marketing-incrementality

Use its Python 3.11.16 environment and frozen uv lockfile. Run `uv sync --frozen`, `uv run python -m unittest discover -s tests -v`, then `uv run python study.py`. The protocol, seeded data generator, CSVs, known ground truth, estimator, evaluation configuration and result/source hashes are included. No external data or runtime dependencies are needed.

Only this project has implemented and evaluated synthetic research. The other three are labeled planned research and have no repository or download link. Do not present planned methods as delivered work.

## Deployment and domain

Vercel project: https://vercel.com/mike-gibb/michael-gibb-portfolio . GitHub `main` deploys to production; feature branches produce protected previews. Use the Next.js preset, repository root, Node 24, `pnpm install --frozen-lockfile`, and `pnpm build` (vercel.json). No custom environment variables or credentials are required. Public canonicals default to https://michaelpgibb.com; SITE_URL is an optional trusted override. VERCEL_ENV controls indexing. Local/preview builds use noindex, disallow-all robots and empty sitemaps; production allows public indexing. Rebuild before promoting between environments.

Porkbun remains registrar, DNS provider and email provider. Website records: apex A `216.198.79.1`, explicit www CNAME `6c1ebdf435fa4ed5.vercel-dns-017.com.`; both TTL 600, verified against project settings at domain launch. www redirects to apex with HTTP 308. Preserve all nameservers, MX, SPF, DKIM, DMARC, mail hosts and unrelated records. The working email is mike@michaelpgibb.com; LinkedIn is https://www.linkedin.com/in/mp-gibb/.

## Content direction and rollback

Read AGENTS.md and PROJECT_STATUS.md before editing. The commercial direction supersedes older source exports, prompts, branches and deployment histories. Removed work must not be restored. Restore only a release verified under the current content policy. The portfolio and flagship study histories were reset to current-source snapshots on September 28, 2026. Re-clone after this history rewrite; never merge an old clone back into current history. Current source downloads contain reviewed tracked files only, with SHA-256 recorded in the manifest. Never publish .env files, private career records, local backups or virtual environments.

Vercel Hobby remains the existing plan for this personal professional portfolio, with no service sales or payments. Reassess its personal/non-commercial eligibility before adding commercial services. No paid services or recurring monitoring are authorized. Existing Porkbun domain/mailbox renewals are unchanged.

Research and independent review status are disclosed. No reuse license for authored source has been selected. Third-party notices remain intact. See PROJECT_STATUS.md and docs/REMOVAL_AUDIT.md for completion, evidence and unresolved historical-copy limitations.
