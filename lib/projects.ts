import completedStudies from "./completed-studies.json";

export type Project = {
  slug: string;
  number: string;
  category: string;
  title: string;
  short: string;
  question: string;
  status: "Evaluated synthetic demonstration" | "Planned research";
  decision: string;
  implication: string;
  baseline: string;
  evaluation: string[];
  data: string;
  method: string;
  assumptions: string[];
  limitations: string;
  next: string;
  steps: string[];
  repository?: string;
  resultFile?: string;
  references?: { title: string; url: string }[];
  executive: { headline: string; finding: string; decision: string; caution: string; stats: { value: string; label: string }[] };
};
export const projects: Project[] = [
  {
    slug: "marketing-incrementality", number: "01", category: "MARKETING · EXPERIMENTATION",
    title: "Marketing effectiveness and incrementality",
    short: "A randomized campaign study connects incremental contribution, uncertainty and the cost of a decision. Evaluated on synthetic customers with known ground truth.",
    question: "Did the campaign create enough incremental value to justify its cost?",
    status: "Evaluated synthetic demonstration",
    decision: "Decide whether a fixed reactivation campaign warrants a further controlled rollout to the same eligible customer population. Compare incremental 28-day contribution per assigned customer with campaign cost, rather than treating attributed revenue as causal lift.",
    implication: "At an assumed $6 cost per assigned customer, the adjusted estimate implies $2.16 in incremental net contribution, with a 95% interval of $0.36–$3.95. This supports another controlled rollout within the simulated setting. It is not evidence of client impact, a budget optimizer, or a recommendation to scale spending without testing the response.",
    baseline: "A 6,000-customer, stratified randomized experiment and an independent 4,000-customer historical cohort are generated reproducibly. Both an unadjusted difference in means and a pre-period-adjusted estimator are implemented and evaluated against known effects.",
    evaluation: ["Known-ground-truth recovery and 95% confidence intervals.", "Pre-period placebo and exact assignment balance within two segments.", "400 repeated experiments per scenario: base, zero effect, weakened historical relationship and skewed outcomes."],
    data: "Entirely synthetic data, version synthetic-campaign-v1. No client records or external dataset. The population comprises eligible existing customers with 28-day pre-period contribution available; it does not represent new-customer acquisition. Outcomes include all assigned customers over a fixed 28-day window, including nonresponders.",
    method: "Randomize half of each of two equally weighted customer segments to campaign assignment. Estimate the intention-to-treat effect using stratum-weighted treatment–control differences. For CUPED-style adjustment, freeze segment-specific slopes from a separate historical cohort and subtract the predictable pre-period contribution. Use a stratified Neyman standard error and a large-sample 95% interval.",
    assumptions: ["Random assignment is implemented correctly; the analysis follows assignment, not message opening or conversion.", "No spillovers between customers, missing outcomes, selective follow-up or post-treatment covariates.", "The pre-period relationship must remain useful for adjustment to improve precision; independent historical fitting does not guarantee transportability.", "The fixed campaign, target population and outcome window stay the same when varying the hypothetical accounting cost."],
    limitations: "Synthetic success verifies behavior under stated assumptions, not marketing effectiveness in a real organization. A single campaign effect does not estimate a spending response curve, competing-channel effects, long-run customer value or generalization to acquisition audiences. Normal intervals are approximate; no robustness exercise can establish the assumptions for an actual campaign.",
    next: "Translate this design into a real experiment specification: eligibility, assignment unit, contamination controls, contribution definition, measurement window and a decision threshold set before outcomes are examined.",
    steps: ["Randomize assignment", "Estimate incrementality", "Test decision sensitivity"],
    repository: "https://github.com/mpgibb/marketing-incrementality",
    resultFile: "marketing-results.json",
    executive: {
      headline: "The campaign clears its assumed cost in this experiment.",
      finding: "The simulated campaign added an estimated $8.16 per assigned customer before campaign cost. At a $6 cost, that leaves $2.16 in incremental net contribution, with a 95% interval of $0.36–$3.95.",
      decision: "Use this design for another controlled test in the same eligible population, with a contribution threshold agreed before results are known.",
      caution: "These are synthetic customers and a fixed campaign. The result does not show what extra spending, a different offer or a new audience would produce. Adjustment also becomes less precise when the historical relationship weakens.",
      stats: [{ value: "$2.16", label: "Net contribution at $6 assumed cost" }, { value: "$0.36–$3.95", label: "95% interval for net contribution" }, { value: "6,000", label: "Randomized synthetic customers" }],
    },
  },
  ...completedStudies.map(p => ({ ...p, status: "Evaluated synthetic demonstration" as const })),
];
