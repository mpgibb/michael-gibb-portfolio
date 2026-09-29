import { useId } from "react";

const shortLabels: Record<string, string> = {
  "Core features · status/value excluded": "Core features",
  "Remove complaints and call failures": "No service-friction inputs",
  "Add Status · timing sensitivity": "Add Status",
  "Add calculated value · sensitivity": "Add calculated value",
  "Add Status and value · sensitivity": "Add Status and value",
  "Doubly robust learner · L2 10": "DR learner · L2 10",
  "Doubly robust learner · L2 100": "DR learner · L2 100",
  "Honest causal forest · leaf 100": "Causal forest · leaf 100",
  "Honest causal forest · leaf 500": "Causal forest · leaf 500",
  "Response-probability targeting": "Response targeting",
  "Expected random allocation": "Random allocation",
  "Boosting with richer attributes": "Boosting · richer inputs",
  "Boosting without missingness indicators": "Boosting · no missing flags",
  "Regularized hedonic regression": "Hedonic regression",
  "Local training-sale median": "Local sale median",
  "Spatial gradient boosting": "Spatial boosting",
  "Current stage and age baseline": "Stage/age baseline",
  "Age and current stage only": "Stage/age boosting",
  "Hurdle count–spend boosting": "Count–spend boosting",
  "Boosted frequency–severity": "Frequency–severity trees",
};
export function ModelSelect({ label, models, value, onChange, note }: { label: string; models: { id: string; label: string }[]; value: string; onChange: (value: string) => void; note?: string }) {
  const id = useId();
  return <div className="model-control"><label htmlFor={id}>{label}<select id={id} value={value} aria-describedby={`${id}-detail`} onChange={event => onChange(event.target.value)}>{models.map(model => <option key={model.id} value={model.id}>{shortLabels[model.label] ?? model.label}</option>)}</select></label><p id={`${id}-detail`} className="selection-detail">Selected: {models.find(model => model.id === value)?.label}{note ? ` · ${note}` : ""}.</p></div>;
}
