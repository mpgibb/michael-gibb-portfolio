# Michael P. Gibb, Ph.D. — Research portfolio

[Live website](https://michaelpgibb.com) · [Research catalog](https://michaelpgibb.com/research) · [Research source](https://github.com/mpgibb/michael-gibb-research)

The portfolio connects commercial analytics, statistics, machine learning and decision science to practical leadership decisions. The research catalog accounts for 60 studies across 20 industries. S28, S02, S04, S58, S43, S13, S31, S03 and S47 have evaluated public-data case studies; 51 studies remain in the research agenda, including S60 with a completed publisher-trajectory baseline. Four earlier evaluated synthetic demonstrations remain separately labeled and do not count toward the 60-study program.

## Development and checks

Next.js 16.3.6 App Router, Node 24, pnpm 11.19.0. Run `pnpm install --frozen-lockfile`, then `pnpm dev`.

```sh
pnpm check
pnpm test:refinements
pnpm test:smoke --start
TEST_BASE_URL=https://michaelpgibb.com EXPECT_INDEXABLE=true pnpm test:smoke
```

`lib/program-catalog.json` is a visitor-facing projection validated by `lib/program-registry.ts`. Execution and publication states are separate. Only evaluated, published entries with result artifacts and source links generate case-study routes or sitemap entries. Unpublished routes return 404. `components/research-catalog.tsx` provides shareable query, business-area, industry, method, decision and status filters. Published public-data studies and synthetic demonstrations have separate dynamic counts; the agenda is a separate view. `lib/research-discovery.ts` contains the explicit descriptive keywords and business-area mappings. The homepage curates six evaluated cases.

`lib/program-results/` and `public/downloads/research/` contain matching small aggregate artifacts. The S28 interaction reads saved capacity tables; its financial controls use explicitly assumed economics. S02 reads saved forecast bands and 36 constrained inventory scenarios, with model, aggregation, lead-time, storage and cost controls. No training, raw contact records, database or paid inference API is in the request path. S04 adds independent uplift/response policy frontiers with budget and assumed-economics controls. S58 adds application-stage filtering, late-case capture, a workflow map and explicit capacity scenarios. S43 adds township/model/property-profile comparisons, measured interval coverage and a keyboard-accessible cohort map. S13 adds historical inspection budgets, probability calibration and sensor-selection stability. S31 adds frequency–severity and calibration comparisons with expense scenarios. S03 adds customer-return distributions, inactivity/frequency cohorts and assumed campaign break-even thresholds. S47 adds telecom service capacity, feature sensitivities, calibration, association stability and an explicit prospective experiment planner. The research repository contains frozen protocols, ingestion, comparisons, reports, dependencies and source/data provenance.

The original demonstrations remain in `lib/projects.ts`, `lib/completed-studies.json` and their independent source repositories. Their source ZIPs are exact tracked-file archives with commit and SHA-256 in `public/downloads/manifest.json`. Keep source, generated results, copied JSON and downloads synchronized when changing findings. All findings retain limitations and pending independent-review status.

## Design and motion

The persistent header is rendered once in `app/layout.tsx`. `components/persistent-header.tsx` measures its actual height with ResizeObserver, updates the shared scroll offset and reveals focused controls below the banner. Mobile name text is 16–20px; the complete name and credentials remain on one line above the 12px tagline, including at 320px. The navigation has a 44px toggle, closes on selection and supports nested Escape behavior. Its open menu scrolls within the available viewport.

The static Chicago mark lives in `components/skyline-mark.tsx`, with four six-point stars and a copper curve around a uniformly scaled silhouette. It follows a dated lake view over Monroe Harbor: Sea Cow’s July 2, 2022 photograph, with crop/exposure adjustment by Nkon21. This viewpoint was selected to keep Willis and Hancock visible. It is a simplified view, not an exact reproduction of every building or a 2026 survey. See [reference and CC BY-SA 4.0 artwork credit](public/brand/skyline-credit.txt). The approved favicon files and their metadata are independent and unchanged.

`components/signal-field.tsx` renders a full-width decorative SVG behind the hero copy. `lib/signal-motion.ts` contains the 24-second cycle, moving spline geometry, phases, amplitude, density, opacity, drift, marker size and drawing cadence. Every spline extends 16% beyond both visible edges with continuous joined slopes. Curves, selected points and markers share the same current geometry. A ResizeObserver uses the actual hero dimensions so circles are not stretched. One animation loop updates SVG attributes without React frame renders or per-frame layout reads. Explicit pause freezes the clock; intersection and visibility observers suspend it. Reduced motion, including preference changes, uses a static composition. Ordinary mobile/tablet viewports, including 320px, use two moving curves and fewer points; desktop uses three. Mobile-only profiles keep both sweeps in a tall hero, with lighter contrast masking, 1.8px strokes and 4.2px markers. Desktop geometry, cadence and opacity remain unchanged. Contrast gradients in `app/globals.css` protect text. The homepage uses one H1 with the complete phrase “growth and better business decisions.” in the `--light-copper` token.

`components/case-contents.tsx` tracks sections by scroll position and stable anchors. Its sticky position follows the measured header; mobile anchor offsets also account for the actual contents-bar height. The narrow-screen overlay supports Escape and moves focus to selected sections. Every summary links to `#interactive-results`. `components/capacity-slider.tsx` exposes actual percentages while keyboard arrows step through the saved capacities, including uneven gaps. `components/model-select.tsx` keeps short choices and full selected labels together; `lib/format.ts` centralizes currency/percentage formatting. Headline findings remain fixed when explorer controls change; assumed economics are labeled separately.

The homepage uses the approved hero copy, two existing anchor destinations and four linked commercial application areas, followed by the current leadership, research, approach and contact content. Reference images and recordings are review artifacts outside the public repository/build.

## Deployment

Existing project: [michael-gibb-portfolio](https://vercel.com/mike-gibb/michael-gibb-portfolio). GitHub `main` deploys production; feature branches deploy previews. Use the Next.js preset, repository root, Node 24, frozen pnpm install and `pnpm build` from `vercel.json`. No custom secrets are required. The canonical origin is https://michaelpgibb.com. `VERCEL_ENV=production` enables public indexing; local/preview builds use noindex headers/metadata, disallow-all robots and an empty sitemap. Rebuild before promoting across environments.

After deployment, run the public smoke suite and inspect desktop/mobile filtering, dropdown keyboard behavior, the S28, S02, S04, S58, S43, S13, S31, S03 and S47 explorers, download/source links and console errors. The smoke suite checks emitted stylesheets as well as HTML because a previous cached build served stale CSS. If that recurs, redeploy the reviewed commit with **Use existing Build Cache** unchecked and verify again.

## Rollback and ownership

Use an ordinary revert of the faulty release or restore a previously verified Vercel production deployment. Before promoting a rollback, compare its public content, result versions and indexing settings. The pre-header-refinement verified milestone is portfolio commit `9c4e5f3feefb71db6eb9bcce62eb1aa286b66d55`, deployment `https://michael-gibb-portfolio-ow9gfrfcv-mike-gibb.vercel.app`; it retains all nine published program studies and the approved favicon. Never combine model output from one source version with claims from another.

Porkbun remains registrar, authoritative DNS and email provider. No DNS/email change is part of this release. Preserve existing nameservers, MX/SPF/DKIM/DMARC/mail records and www redirect. Confirmed contact: mike@michaelpgibb.com; [LinkedIn](https://www.linkedin.com/in/mp-gibb/). The existing Vercel Hobby plan and domain/mailbox renewal commitments remain unchanged. No new paid service or recurring job is configured.

Data licenses and citations remain study-specific; no broad authored-source reuse license has been selected. See `PROJECT_STATUS.md` for release verification and limitations.

Résumé downloads and new career accomplishments are deferred at the owner’s request. No résumé or unverified career claims are part of this refinement.
