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
  },
  {
    slug: "revenue-forecasting", number: "02", category: "SALES · REVENUE OPERATIONS",
    title: "Sales pipeline and revenue forecasting",
    short: "Estimate conversion, timing and revenue uncertainty using only information available at the forecast date.",
    question: "What revenue can the current pipeline support, and where is the uncertainty?",
    status: "Planned research",
    decision: "Set a realistic revenue outlook and identify where pipeline assumptions need review, using deal state as it was known on each forecast date.",
    implication: "Forecast ranges could help commercial leaders separate changes in pipeline quality from timing risk and avoid treating weighted pipeline as committed revenue. No forecast accuracy or commercial improvement has been demonstrated yet.",
    baseline: "Study design only. No dataset, fitted model, evaluated demonstration or repository has been published for this direction.",
    evaluation: ["Rolling-origin evaluation with point-in-time deal snapshots and untouched final time holdout.", "Compare stage-weighted pipeline and historical stage/cohort conversion with survival or discrete-time hazard models.", "Evaluate aggregate revenue error, conversion calibration, interval coverage and timing bias across forecast horizons."],
    data: "A documented synthetic deal-event process is planned. Any real CRM data would require permission, point-in-time snapshots and a clear policy for deleted or revised opportunities.",
    method: "Start with stage-level conversion and timing baselines. Evaluate separate deal-conversion and time-to-close components, then aggregate a predictive revenue distribution with explicit dependence assumptions. Split by forecast date rather than random deal rows.",
    assumptions: ["Features must have existed at the forecast cutoff; later stage changes and closing dates are not inputs.", "Open deals are censored, not automatically lost.", "Training, validation and test periods are separated; repeated snapshots of one deal must not create leakage."],
    limitations: "Unstable sales processes, correlated deals and reporting changes can defeat historical calibration. This page specifies a future study, not an implemented forecasting system.",
    next: "Define the event schema and cutoff rules, generate longitudinal fixtures, then preregister horizons, baselines and holdout periods.",
    steps: ["Freeze the forecast date", "Model conversion and timing", "Evaluate future periods"],
  },
  {
    slug: "customer-value", number: "03", category: "CUSTOMERS · RETENTION & VALUE",
    title: "Customer retention and lifetime value",
    short: "Separate attrition prediction from evidence that a retention action changes behavior or creates value.",
    question: "Which customers may leave—and which interventions are worth testing?",
    status: "Planned research",
    decision: "Prioritize retention experiments using attrition risk, expected contribution and intervention cost, while treating treatment benefit as a separate causal question.",
    implication: "A high-risk customer is not necessarily persuadable. The intended decision framework combines predictive risk with experimental evidence of incremental retention; it does not equate a churn score with treatment value.",
    baseline: "Study design only. No churn model, lifetime-value estimate, evaluated treatment policy or repository has been published for this direction.",
    evaluation: ["Temporal holdouts with a fully observed outcome window, calibration and a simple recency/frequency baseline.", "Evaluate discounted contribution forecasts at stated horizons and sensitivity to censoring and discount rates.", "Use randomized retention assignment to evaluate incremental treatment value separately from predictive churn performance."],
    data: "A documented synthetic customer-event history is planned. No real customer records or outcome claims are included.",
    method: "Define contractual or noncontractual attrition first. Establish a recency/frequency baseline, then compare calibrated risk or survival models. Express lifetime value as discounted expected contribution over a finite, explicit horizon. Evaluate treatment effects only under an appropriate experimental design.",
    assumptions: ["Prediction features precede the scoring date, and outcome windows are complete or censored appropriately.", "Contribution margin, retention definition and time horizon are declared before evaluation.", "Intervention assignment supports causal inference; predicted churn alone does not identify response."],
    limitations: "Long-run value is sensitive to unobserved future behavior and business changes. No individualized intervention recommendation is supported at this planned stage.",
    next: "Specify a customer lifecycle and attrition definition, then create a data generator that distinguishes baseline risk from treatment responsiveness.",
    steps: ["Define the customer horizon", "Calibrate risk and value", "Test incremental retention"],
  },
  {
    slug: "operational-planning", number: "04", category: "OPERATIONS · DEMAND & CAPACITY",
    title: "Operational planning under uncertainty",
    short: "Connect demand forecasts to staffing, inventory or service-capacity choices with explicit constraints and decision costs.",
    question: "What capacity balances service, cost and uncertainty?",
    status: "Planned research",
    decision: "Choose a feasible staffing or inventory plan under uncertain demand, with a declared cost for shortages, excess capacity and changes to the plan.",
    implication: "Forecast error matters through the decision it changes. This direction will compare service levels and realized costs against practical planning rules, rather than assuming the most accurate point forecast gives the best operational outcome.",
    baseline: "Study design only. No commercial planning model, evaluated policy or repository has been published for this direction.",
    evaluation: ["Rolling-origin demand forecasts against seasonal-naive and recent-average baselines.", "Quantile calibration and service-level coverage at the actual planning horizon.", "Compare a fixed-buffer rule with a constrained cost-based policy on held-out demand paths, including stress scenarios."],
    data: "A synthetic demand process with seasonality, shocks and known capacity constraints is planned. Staffing and inventory will not be conflated; one operational decision will be selected before implementation.",
    method: "Begin with a single-site capacity decision and known lead time. Generate demand distributions, specify feasible resources and shortage/excess costs, then evaluate decision outcomes on future periods. Forecasting and optimization will be tested together.",
    assumptions: ["Costs, lead times and feasible resources are stated and consistent with the decision horizon.", "Demand changes induced by capacity or stockouts must be modeled or excluded explicitly.", "Held-out demand paths are unavailable to the planner when decisions are made."],
    limitations: "Simulated policies cannot establish savings or service improvements for a business. Multi-site interactions, labor rules and operational constraints require separate evidence.",
    next: "Select one capacity setting, specify costs and constraints, and build a realistic baseline before adding model complexity.",
    steps: ["Forecast demand uncertainty", "Apply capacity constraints", "Evaluate service and cost"],
  },
];
