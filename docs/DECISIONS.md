# Architecture decisions

The public portfolio uses Next.js App Router with static research artifacts. Expensive analyses run in the separate research repository; requests never train a model. Interactive controls filter evaluated tables or perform explicit scenario arithmetic.

The catalog contains 60 stable IDs across 20 industries. Execution status measures actual research progress; publication status controls availability. A planned topic has a substantive agenda entry, no full case-study route and no sitemap entry. Public case studies require evaluated artifacts, source links and readable limitations. The original four synthetic demonstrations are counted separately.

Data provenance includes publisher release, checksums, code revision, timing, sampling unit, outcomes and uncertainty. The website imports only a selected visitor-facing registry and permitted aggregate result tables. Model-selection and holdout boundaries are defined per study.

Production uses a fixed canonical domain and permits indexing. Previews and local builds exclude indexing. No request header selects the canonical origin. Hosting, DNS and email stay with their existing providers.
