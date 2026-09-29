# Commercial portfolio continuation

Read PROJECT_STATUS.md, README.md, docs/DECISIONS.md and DESIGN_SPECIFICATION.md first. The current commercial direction supersedes every earlier prompt, export, plan, branch and deployment.

- Focus on marketing effectiveness, sales/revenue forecasting, customer retention/lifetime value and internal operations. All four commercial studies now contain completed synthetic evaluations, source repositories, executive summaries and source downloads. Marketing incrementality remains the flagship. Sports analytics and Other industries are future collections, not completed studies.
- Do not restore retired project content, archives, screenshots, routes or research priorities from history. Use only current clean releases for rollback. After a history rewrite, re-clone rather than merge an old clone.
- Preserve the navy/white/slate/copper design and case-study order: Executive summary → Business decision → Practical implication → Evidence → Data → Methodology → Limitations → Code. Essential evidence and adverse findings stay visible.
- Standard Next.js App Router, Node 24, pnpm 11.19.0, frozen lockfile. Run pnpm check and pnpm test:smoke --start. Validate public production with TEST_BASE_URL and EXPECT_INDEXABLE=true. Verify retired URLs through RETIRED_PATHS supplied locally to the smoke script.
- Repository mpgibb/michael-gibb-portfolio, production main, isolated feature branches. Keep the existing Vercel project, custom domains and Porkbun DNS/email intact. Production indexes; previews do not.
- Marketing source: mpgibb/marketing-incrementality. Use its separate Python 3.11.16 environment and frozen uv lockfile. Preserve results, seeds, configurations, data/source hashes and tracked-source ZIP manifest. Run correctness tests and reproduce the study before changing findings.
- New study sources: mpgibb/revenue-forecasting, mpgibb/customer-value and mpgibb/operational-planning. Each uses Python 3.11.16, frozen uv, NumPy 2.2.6 and SciPy 1.17.1. Nine correctness tests each for revenue/customers and ten for operations; reproduce all data/results and refresh archives, result JSON copies and manifest together. Preserve negative findings and explicit temporal cutoffs.
- Keep synthetic results labeled and distinguish prediction, causal effects and decision economics. Do not extrapolate a fixed-treatment effect to arbitrary campaign spending. Planned work has no repository/download links until corresponding source exists.
- HARD RULE for every future portfolio update: never publish development-tool credits or statements about automated authorship or assistance in creating the portfolio or its projects. This covers page copy, metadata, case studies, repository documentation, source downloads, captions and screenshots. Do not restore such credits from older revisions. This requirement remains in force unless Michael explicitly changes it. Preserve accurate research status and pending independent review; do not add claims of sole manual authorship. No invented achievements, clients, metrics, datasets or live APIs. Publish a résumé only with an approved appropriate document.
- Maintain status, removal audit and reproduction instructions. No universal-erasure claims without evidence. Exclude private audit records, credentials, environment files, career records and local research environments from Git/Vercel.
- No paid services, upgrades or recurring monitoring. Existing hosting and mailbox commitments remain unchanged.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
