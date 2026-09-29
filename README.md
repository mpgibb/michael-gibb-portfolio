# Michael P. Gibb, Ph.D. — Research portfolio

[Live website](https://michaelpgibb.com) · [Research catalog](https://michaelpgibb.com/research) · [Research source](https://github.com/mpgibb/michael-gibb-research)

The portfolio connects commercial analytics, statistics, machine learning and decision science to practical leadership decisions. The research catalog accounts for 60 studies across 20 industries. S28, S02, S04, S58, S43, S13, S31 and S03 have evaluated public-data case studies; 52 studies remain in the research agenda, including S60 with a completed publisher-trajectory baseline. Four earlier evaluated synthetic demonstrations remain separately labeled and do not count toward the 60-study program.

## Development and checks

Next.js 16.3.6 App Router, Node 24, pnpm 11.19.0. Run `pnpm install --frozen-lockfile`, then `pnpm dev`.

```sh
pnpm check
pnpm test:smoke --start
TEST_BASE_URL=https://michaelpgibb.com EXPECT_INDEXABLE=true pnpm test:smoke
```

`lib/program-catalog.json` is a visitor-facing projection validated by `lib/program-registry.ts`. Execution and publication states are separate. Only evaluated, published entries with result artifacts and source links generate case-study routes or sitemap entries. Unpublished routes return 404. `components/research-catalog.tsx` provides search, industry, method, decision and status filters. The homepage curates six evaluated cases.

`lib/program-results/` and `public/downloads/research/` contain matching small aggregate artifacts. The S28 interaction reads saved capacity tables; its financial controls use explicitly assumed economics. S02 reads saved forecast bands and 36 constrained inventory scenarios, with model, aggregation, lead-time, storage and cost controls. No training, raw contact records, database or paid inference API is in the request path. S04 adds independent uplift/response policy frontiers with budget and assumed-economics controls. S58 adds application-stage filtering, late-case capture, a workflow map and explicit capacity scenarios. S43 adds township/model/property-profile comparisons, measured interval coverage and a keyboard-accessible cohort map. S13 adds historical inspection budgets, probability calibration and sensor-selection stability. S31 adds frequency–severity and calibration comparisons with expense scenarios. S03 adds customer-return distributions, inactivity/frequency cohorts and assumed campaign break-even thresholds. The research repository contains frozen protocols, ingestion, comparisons, reports, dependencies and source/data provenance.

The original demonstrations remain in `lib/projects.ts`, `lib/completed-studies.json` and their independent source repositories. Their source ZIPs are exact tracked-file archives with commit and SHA-256 in `public/downloads/manifest.json`. Keep source, generated results, copied JSON and downloads synchronized when changing findings. All findings retain limitations and pending independent-review status.

## Deployment

Existing project: [michael-gibb-portfolio](https://vercel.com/mike-gibb/michael-gibb-portfolio). GitHub `main` deploys production; feature branches deploy previews. Use the Next.js preset, repository root, Node 24, frozen pnpm install and `pnpm build` from `vercel.json`. No custom secrets are required. The canonical origin is https://michaelpgibb.com. `VERCEL_ENV=production` enables public indexing; local/preview builds use noindex headers/metadata, disallow-all robots and an empty sitemap. Rebuild before promoting across environments.

After deployment, run the public smoke suite and inspect desktop/mobile filtering, dropdown keyboard behavior, the S28, S02, S04, S58, S43, S13, S31 and S03 explorers, download/source links and console errors. The smoke suite checks emitted stylesheets as well as HTML because a previous cached build served stale CSS. If that recurs, redeploy the reviewed commit with **Use existing Build Cache** unchecked and verify again.

## Rollback and ownership

Use an ordinary revert of the faulty release or restore a previously verified Vercel production deployment. Before promoting a rollback, compare its public content, result versions and indexing settings. The previous verified milestone is portfolio commit `81c281349a7512e9c37a855f5f2c669b39f2d128`; a rollback to it retains the 60-study catalog and seven evaluated studies while removing S03. Never combine model output from one source version with claims from another.

Porkbun remains registrar, authoritative DNS and email provider. No DNS/email change is part of this release. Preserve existing nameservers, MX/SPF/DKIM/DMARC/mail records and www redirect. Confirmed contact: mike@michaelpgibb.com; [LinkedIn](https://www.linkedin.com/in/mp-gibb/). The existing Vercel Hobby plan and domain/mailbox renewal commitments remain unchanged. No new paid service or recurring job is configured.

Data licenses and citations remain study-specific; no broad authored-source reuse license has been selected. See `PROJECT_STATUS.md` for release verification and limitations.
