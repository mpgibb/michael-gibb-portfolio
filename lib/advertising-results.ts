import { z } from "zod";
import saved from "./program-results/S04.json";
const n=z.number().finite();const ci=z.object({estimate:n,lower:n,upper:n,confidence:z.literal(.95)});
const frontier=ci.extend({model:z.string(),capacity:n.min(0).max(1),selected:n.nonnegative(),selected_fraction:n.min(0).max(1),kind:z.string(),selected_treated:n,selected_control:n,observed_conversions_in_selection:n});
const calibration=ci.extend({model:z.string(),decile:n,n:n,events:n,treated:n,predicted_effect_per_10000:n});
const sensitivity=ci.extend({model:z.string(),analysis:z.string(),capacity:n,n:n,selected_fraction:n});
const result=z.object({study_id:z.literal("S04"),run_id:z.string(),code_version:z.string().regex(/^[a-f0-9]{40}$/),evaluated_on:z.string(),data:z.object({source_url:z.string().url(),release:z.string(),license:z.string(),citation:z.string()}),samples:z.object({total:n,train:n,validation:n,test:n,test_profiles:n,events:z.object({train:n,validation:n,test:n})}),models:z.array(z.object({id:z.string(),label:z.string()})),metrics:z.array(ci.extend({name:z.string(),model:z.string(),unit:z.string()})),uncertainty:z.string(),limitations:z.array(z.string()),tables:z.object({selected_model:z.string(),primary_difference:ci.extend({comparison:z.string(),capacity:n}),capacity_frontier:z.array(frontier).length(54),effect_calibration:z.array(calibration),sensitivity:z.array(sensitivity),all_vs_none:ci,feature_balance:z.array(z.object({feature:z.string(),standardized_treatment_difference:n})),propensity:z.object({min:n,max:n,assignment_auroc:n,clipped_fraction:n,development_treatment_prevalence:n}),tuning:z.array(z.object({model:z.string(),validation_contrast_per_10000:n}))})});
export const advertisingResult=result.parse(saved);
export type AdvertisingFrontier=z.infer<typeof frontier>;
export type AdvertisingCalibration=z.infer<typeof calibration>;
for(const row of advertisingResult.tables.capacity_frontier){
 if(Math.abs(row.selected-row.selected_control-row.selected_treated)>.001||row.lower>row.upper)throw new Error("Advertising result accounting failed");
 if(row.capacity===0&&row.estimate!==0)throw new Error("No-targeting endpoint failed");
}
if([...advertisingResult.tables.tuning].sort((a,b)=>b.validation_contrast_per_10000-a.validation_contrast_per_10000)[0].model!==advertisingResult.tables.selected_model)throw new Error("Advertising selection provenance failed");
