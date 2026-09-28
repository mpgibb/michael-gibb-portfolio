"use client";
import { useState } from "react";
import results from "@/lib/marketing-results.json";

const money = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(n).toFixed(2)}`;
export function IncrementalityExplorer() {
  const [method, setMethod] = useState<"adjusted" | "unadjusted">("adjusted");
  const [cost, setCost] = useState(6);
  const selected = results.estimates[method];
  const net = selected.estimate - cost;
  const low = selected.ci_low - cost;
  const high = selected.ci_high - cost;
  const position = (value: number) => 30 + ((value + 8) / 20) * 540;
  const decision = low > 0 ? "The entire interval is above break-even." : high < 0 ? "The entire interval is below break-even." : "The interval crosses break-even; the sign remains uncertain.";
  return <div className="explorer" data-testid="incrementality-explorer">
    <p className="eyebrow">EXPLORE THE DECISION · SYNTHETIC RESULTS</p>
    <h3>How much room is there for campaign cost?</h3>
    <p>Keep the tested campaign fixed. Change the analytical method and the assumed cost to see how the conclusion depends on uncertainty.</p>
    <fieldset className="method-control"><legend>Effect estimator</legend>
      <label><input type="radio" name="estimator" value="adjusted" checked={method === "adjusted"} onChange={() => setMethod("adjusted")} /> Pre-period adjusted</label>
      <label><input type="radio" name="estimator" value="unadjusted" checked={method === "unadjusted"} onChange={() => setMethod("unadjusted")} /> Unadjusted baseline</label>
    </fieldset>
    <label className="cost-label" htmlFor="campaign-cost">Assumed campaign cost per assigned customer <strong>{money(cost)}</strong></label>
    <input id="campaign-cost" type="range" min="0" max="12" step="0.5" value={cost} onChange={event => setCost(Number(event.target.value))} aria-describedby="cost-scope" aria-valuetext={`${money(cost)} per assigned customer`} />
    <div className="range-limits" aria-hidden="true"><span>$0</span><span>$12</span></div>
    <div className="net-result" aria-live="polite" aria-atomic="true"><strong data-testid="net-estimate">{money(net)}</strong><span>Estimated net contribution per customer</span><p data-testid="net-interval">95% interval: {money(low)} to {money(high)}</p><p>{decision}</p></div>
    <figure className="effect-chart">
      <svg viewBox="0 0 600 95" role="img" aria-labelledby="effect-chart-title effect-chart-desc">
        <title id="effect-chart-title">Net contribution and 95 percent confidence interval</title>
        <desc id="effect-chart-desc">{method === "adjusted" ? "Pre-period adjusted" : "Unadjusted"} estimate {money(net)}, interval {money(low)} to {money(high)} per assigned customer. Vertical dashed line marks zero, or break-even.</desc>
        <line x1="30" y1="65" x2="570" y2="65" stroke="#94a3b8" />
        <line x1={position(0)} y1="5" x2={position(0)} y2="80" stroke="#334155" strokeDasharray="5 5" />
        <line x1={position(low)} y1="35" x2={position(high)} y2="35" stroke="#925322" strokeWidth="5" />
        <line x1={position(low)} y1="23" x2={position(low)} y2="47" stroke="#925322" strokeWidth="3" />
        <line x1={position(high)} y1="23" x2={position(high)} y2="47" stroke="#925322" strokeWidth="3" />
        <circle cx={position(net)} cy="35" r="8" fill="#0a192f" />
      </svg>
      <div className="chart-labels" aria-hidden="true"><span>−$8</span><span>$0 · break-even</span><span>$12</span></div>
      <figcaption>Point: estimate. Line: 95% confidence interval. All values are simulated USD per assigned customer.</figcaption>
    </figure>
    <p id="cost-scope" className="caption">The $0–$12 range is an accounting sensitivity, not a tested range of campaign spend. Treatment intensity and its estimated effect are held fixed. Changing an incentive, channel or audience requires new response evidence. This is not a budget-allocation tool.</p>
    <noscript>The default adjusted estimate at $6 cost is $2.16, with a 95% interval of $0.36–$3.95. Interactive controls require JavaScript; all evidence remains readable below.</noscript>
  </div>;
}
