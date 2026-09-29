"use client";

import { useState } from "react";
import revenue from "@/lib/revenue-forecasting-results.json";
import customer from "@/lib/customer-value-results.json";
import operations from "@/lib/operational-planning-results.json";

const pct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;
const dollars = (n: number, digits = 0) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits });
const names: Record<string, string> = { fixed_stage: "Fixed stage weights", pooled_stage: "Pooled stage model", multistate: "Detailed multistate", none: "No contact", all: "Contact everyone", high_risk: "Highest churn risk", high_value: "Highest customer value", incremental_value: "Learned incremental value", buffer_rule: "20% buffer rule", point_plan: "Point-forecast plan", stochastic_plan: "Stochastic plan", perfect_information: "Perfect-information bound" };
const scenarioLabels: Record<string, string> = { stable: "Stable process", slowdown: "Sales slowdown", shared_shocks: "Shared market shocks", no_effect: "No treatment effect", response_shift: "Treatment response changes", surge: "Sustained demand surge", volatile: "Higher demand volatility" };

function ScenarioSelect({ scenarios, value, onChange, id }: { scenarios: { scenario: string }[]; value: number; onChange: (value: number) => void; id: string }) {
  return <label className="evidence-control" htmlFor={id}>Scenario<select id={id} value={value} onChange={event => onChange(Number(event.target.value))}>{scenarios.map((scenario, index) => <option key={scenario.scenario} value={index}>{scenarioLabels[scenario.scenario]}</option>)}</select></label>;
}

function ComparisonBars({ rows, label, format }: { rows: { label: string; value: number }[]; label: string; format: (n: number) => string }) {
  const maximum = Math.max(...rows.map(row => row.value), 0.0001);
  return <figure className="comparison-chart"><figcaption>{label}</figcaption>{rows.map(row => <div className="comparison-row" key={row.label}><div><span>{row.label}</span><strong>{format(row.value)}</strong></div><div className="comparison-track" aria-hidden="true"><span style={{ width: `${100 * row.value / maximum}%` }} /></div></div>)}</figure>;
}

function RevenueEvidence() {
  const [scenario, setScenario] = useState(0);
  const [horizon, setHorizon] = useState<"4" | "8" | "12">("12");
  const selected = revenue.scenarios[scenario];
  const metrics = selected.metrics[horizon];
  const rows = Object.entries(metrics);
  return <div data-testid="commercial-evidence">
    <p className="evidence-disclosure">SYNTHETIC PIPELINE · 5,760 OPPORTUNITIES PER SCENARIO · 12 FORECAST DATES</p>
    <div className="evidence-controls"><ScenarioSelect scenarios={revenue.scenarios} value={scenario} onChange={setScenario} id="revenue-scenario" /><label className="evidence-control" htmlFor="revenue-horizon">Forecast horizon<select id="revenue-horizon" value={horizon} onChange={event => setHorizon(event.target.value as typeof horizon)}><option value="4">4 weeks</option><option value="8">8 weeks</option><option value="12">12 weeks</option></select></label></div>
    <div aria-live="polite" aria-atomic="true" className="result-context"><strong>{scenarioLabels[selected.scenario]} · {horizon} weeks</strong><p>{scenario === 0 ? "The detailed model improves on fixed weights, while the simpler timing model remains a strong comparator. Greater complexity is not a uniform advantage." : scenario === 1 ? "Win rates and progression slow from the first held-out date. The historical transition models overpredict revenue; their ranges fail to absorb the process change." : "Deals share unobserved weekly market conditions. Model parameter uncertainty alone does not capture these common shocks."}</p></div>
    <ComparisonBars rows={rows.map(([key, value]) => ({ label: names[key], value: value.wape }))} label="Aggregate revenue error · lower is better" format={pct} />
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Pipeline forecast metrics"><table className="evidence-table"><caption>{horizon}-week held-out forecast evaluation</caption><thead><tr><th scope="col">Method</th><th scope="col">Revenue error</th><th scope="col">Signed bias</th><th scope="col">95% range coverage</th><th scope="col">Probability error¹</th></tr></thead><tbody>{rows.map(([key, value]) => <tr key={key}><th scope="row">{names[key]}</th><td>{pct(value.wape)}</td><td>{pct(value.bias_fraction)}</td><td>{pct(value.coverage95)}</td><td>{value.brier.toFixed(3)}</td></tr>)}</tbody></table></div>
    <p className="caption">Revenue error is total absolute forecast error divided by total realized revenue (WAPE). Positive bias means overprediction. ¹Probability error is the Brier score; lower is better. Twelve overlapping origins are dependent, so coverage is a descriptive diagnostic with limited precision.</p>
    <details><summary>Probability calibration and interval width</summary><div className="table-scroll" tabIndex={0} role="region" aria-label="Detailed pipeline calibration"><table className="evidence-table"><caption>Detailed model · observed wins versus predicted probabilities</caption><thead><tr><th scope="col">Probability band</th><th scope="col">Snapshots</th><th scope="col">Predicted</th><th scope="col">Observed</th></tr></thead><tbody>{metrics.multistate.calibration.map(row => <tr key={row.lower}><th scope="row">{pct(row.lower, 0)}–{pct(row.upper, 0)}</th><td>{row.n}</td><td>{pct(row.predicted)}</td><td>{pct(row.observed)}</td></tr>)}</tbody></table></div><p>Mean 95% revenue-range width: {dollars(metrics.multistate.mean_width95)}. An opportunity may appear at multiple forecast dates; these are forecast snapshots, not independent customers.</p></details>
  </div>;
}

function CustomerEvidence() {
  const [scenario, setScenario] = useState(0);
  const selected = customer.scenarios[scenario];
  const rows = Object.entries(selected.policies);
  const low = Math.min(0, ...rows.map(([, value]) => value.lower95));
  const high = Math.max(0, ...rows.map(([, value]) => value.upper95));
  const span = Math.max(high - low, 1);
  const position = (n: number) => 100 * (n - low) / span;
  return <div data-testid="commercial-evidence">
    <p className="evidence-disclosure">SYNTHETIC RANDOMIZED RETENTION · 2,160 FINAL CUSTOMERS · 12 MATURED COHORTS</p>
    <div className="evidence-controls"><ScenarioSelect scenarios={customer.scenarios} value={scenario} onChange={setScenario} id="customer-scenario" /></div>
    <div className="result-context" aria-live="polite" aria-atomic="true"><strong>{scenarioLabels[selected.scenario]} · $35 intervention cost</strong><p>{scenario === 0 ? "The learned targeting policy has no clear positive net effect. Higher prediction accuracy does not by itself justify contacting customers." : scenario === 1 ? "The intervention changes no customer outcomes. Its contact cost still reduces value; even a cautious learned policy can select some unprofitable contacts." : "The intervention-response relationship reverses after training. A previously promising targeting pattern becomes harmful on the final cohorts."}</p></div>
    <figure className="policy-intervals"><figcaption>Incremental net contribution per eligible customer · 95% intervals</figcaption>{rows.map(([key, value]) => <div key={key} className="interval-row"><div><span>{names[key]}</span><strong>{dollars(value.incremental_net_per_customer, 2)}</strong></div><div className="policy-track" aria-hidden="true"><i className="zero-marker" style={{ left: `${position(0)}%` }} /><span className="policy-range" style={{ left: `${position(value.lower95)}%`, width: `${100 * (value.upper95 - value.lower95) / span}%` }} /><b className="policy-point" style={{ left: `${position(value.incremental_net_per_customer)}%` }} /></div><p className="caption">{dollars(value.lower95, 2)} to {dollars(value.upper95, 2)} · {pct(value.target_rate)} contacted</p></div>)}<p className="caption">Dashed line marks zero net value. Amounts average over everyone eligible, including those not contacted. Intervals use twelve cohort clusters and a t approximation.</p></figure>
    <h3>Predictive performance on untreated final customers</h3>
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Churn and value prediction"><table className="evidence-table"><caption>1,051 control customers · lower errors are better</caption><thead><tr><th scope="col">Model</th><th scope="col">Churn probability error¹</th><th scope="col">12-month value error²</th><th scope="col">Value bias</th></tr></thead><tbody>{Object.entries(selected.prediction).map(([key, value]) => <tr key={key}><th scope="row">{key === "survival" ? "Survival model" : "Segment mean baseline"}</th><td>{value.brier.toFixed(3)}</td><td>{dollars(value.value_mae, 2)}</td><td>{dollars(value.value_bias, 2)}</td></tr>)}</tbody></table></div><p className="caption">¹Brier score for cancellation within six months. ²Mean absolute error of realized, discounted twelve-month contribution. These metrics evaluate prediction; the randomized policy comparison evaluates intervention value.</p>
    <details><summary>Known-truth check and fixed-policy cost sensitivity</summary><p>Oracle expected values come from the data generator and are used only to assess the result. They are unavailable to a real decision maker. The best eligible 20% oracle policy yields {dollars(selected.budget_oracle_net, 2)} per eligible customer in this scenario.</p><div className="table-scroll" tabIndex={0} role="region" aria-label="Policy oracle and cost sensitivity"><table className="evidence-table"><caption>Hold the selected customers and intervention fixed; change only accounting cost</caption><thead><tr><th scope="col">Policy</th><th scope="col">Oracle expected net</th><th scope="col">$15 contact</th><th scope="col">$35 contact</th><th scope="col">$55 contact</th></tr></thead><tbody>{rows.map(([key, value]) => <tr key={key}><th scope="row">{names[key]}</th><td>{dollars(value.oracle_expected_net, 2)}</td>{(["15", "35", "55"] as const).map(cost => <td key={cost}>{dollars(value.accounting_cost_sensitivity[cost], 2)}</td>)}</tr>)}</tbody></table></div><p className="caption">This is accounting sensitivity, not evidence about a larger incentive or a different intervention. Contacting everyone exceeds the targeted policies’ 20% budget and is shown only as an additional comparator.</p></details>
  </div>;
}

function OperationsEvidence() {
  const [scenario, setScenario] = useState(0);
  const selected = operations.scenarios[scenario];
  const rows = Object.entries(selected.policies);
  return <div data-testid="commercial-evidence">
    <p className="evidence-disclosure">SYNTHETIC SERVICE SITE · 52 HELD-OUT WEEKS · IDENTICAL RESOURCE CONSTRAINTS</p>
    <div className="evidence-controls"><ScenarioSelect scenarios={operations.scenarios} value={scenario} onChange={setScenario} id="operations-scenario" /></div>
    <div className="result-context" aria-live="polite" aria-atomic="true"><strong>{scenarioLabels[selected.scenario]} · cost and service together</strong><p>{scenario === 0 ? "The stochastic plan lowers cost against the buffer rule, with a small reduction in demand served. The perfect-information result is an unattainable lower bound." : scenario === 1 ? "Demand jumps 20% at the first held-out week. Savings against the buffer rule shrink and their interval includes zero; capacity constraints become more binding." : "Weekly shocks and daily noise double during evaluation. Forecasts adapt over time, but uncertainty and the cost of imperfect information increase."}</p></div>
    <ComparisonBars rows={rows.map(([key, value]) => ({ label: names[key], value: value.mean_weekly_cost }))} label="Mean weekly realized cost · service levels differ" format={dollars} />
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Staffing policy comparison"><table className="evidence-table"><caption>Same held-out weeks, staffing limits and overtime options</caption><thead><tr><th scope="col">Policy</th><th scope="col">52-week cost</th><th scope="col">Demand served</th><th scope="col">Weekly savings vs buffer</th><th scope="col">95% savings interval</th></tr></thead><tbody>{rows.map(([key, value]) => <tr key={key}><th scope="row">{names[key]}</th><td>{dollars(value.total_cost)}</td><td>{pct(value.service_rate, 2)}</td><td>{dollars(value.weekly_savings_vs_buffer)}</td><td>{dollars(value.savings_lower95)} to {dollars(value.savings_upper95)}</td></tr>)}</tbody></table></div>
    <p className="caption">Savings intervals use a paired four-week moving-block bootstrap over one 52-week synthetic history. The perfect-information planner sees future demand and cannot be deployed. No actual business savings are claimed.</p>
    <h3>Forecasts and service economics</h3><p>The demand model’s aggregate error is {pct(selected.forecast.model_wape)}, versus {pct(selected.forecast.naive_wape)} for the seasonal-naive forecast. Its nominal 80% daily ranges cover {pct(selected.forecast.coverage80)} of held-out demand, showing that uncertainty calibration still needs attention.</p>
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Shortage cost sensitivity"><table className="evidence-table"><caption>Re-optimize the stochastic plan at each unserved-unit penalty</caption><thead><tr><th scope="col">Penalty per unit</th><th scope="col">52-week cost¹</th><th scope="col">Demand served</th><th scope="col">Regular worker-days</th><th scope="col">Overtime worker-days</th></tr></thead><tbody>{selected.cost_sensitivity.map(row => <tr key={row.shortage_penalty}><th scope="row">{dollars(row.shortage_penalty)}</th><td>{dollars(row.total_cost)}</td><td>{pct(row.service_rate, 2)}</td><td>{row.regular_worker_days.toLocaleString("en-US")}</td><td>{row.overtime_worker_days.toLocaleString("en-US")}</td></tr>)}</tbody></table></div><p className="caption">¹Each row uses a different cost definition; compare service/resource choices rather than interpreting cross-row cost differences as savings.</p>
  </div>;
}

export function CommercialEvidence({ slug }: { slug: string }) {
  if (slug === "revenue-forecasting") return <RevenueEvidence />;
  if (slug === "customer-value") return <CustomerEvidence />;
  if (slug === "operational-planning") return <OperationsEvidence />;
  return null;
}
