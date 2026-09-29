import { z } from "zod";
import saved from "./program-results/S58.json";
const n=z.number().finite();
const interval=z.object({lower:n,upper:n,confidence:z.literal(.95)});
const diagnostic=z.object({model:z.string(),prefix:n,stage:z.string(),prefixes:n,applications:n,mean_observed_restricted_days:n,mean_predicted_restricted_days:n,mean_lower_days:n,mean_upper_days:n,mae_days:n,brier_14:n,late_rate:n,coverage_80:n});
const frontier=z.object({model:z.string(),prefix:n,capacity:n,applications:n,selected:n,late_applications:n,late_selected:n,capture:n,capture_interval:interval});
const transition=z.object({from:z.string(),to:z.string(),observations:n,median_elapsed_days:n,p90_elapsed_days:n});
const schema=z.object({study_id:z.literal("S58"),run_id:z.string(),code_version:z.string().regex(/^[a-f0-9]{40}$/),evaluated_on:z.string(),data:z.object({source_url:z.string().url(),citation:z.string(),license:z.string()}),samples:z.object({test:n,test_prefixes:n,train:n,validation:n}),models:z.array(z.object({id:z.string(),label:z.string()})),metrics:z.array(z.object({name:z.string(),model:z.string(),estimate:n}).merge(interval)),uncertainty:z.string(),limitations:z.array(z.string()),tables:z.object({primary_difference:z.object({estimate:n}).merge(interval),diagnostics:z.array(diagnostic),calibration:z.array(z.object({model:z.string(),bin:n,prefixes:n,prediction:n,observed:n})),late_frontier:z.array(frontier).length(60),workflow_transitions:z.array(transition),transition_scope:z.string()})});
export const workflowResult=schema.parse(saved);
export type WorkflowDiagnostic=z.infer<typeof diagnostic>;
export type WorkflowFrontier=z.infer<typeof frontier>;
export type WorkflowTransition=z.infer<typeof transition>;
for(const x of workflowResult.tables.late_frontier){if(x.late_selected>x.selected||Math.abs(x.capture-x.late_selected/x.late_applications)>1e-7)throw new Error("Workflow capture accounting failed");}
if(workflowResult.samples.test!==2365||workflowResult.samples.test_prefixes!==6247)throw new Error("Workflow cohort mismatch");
