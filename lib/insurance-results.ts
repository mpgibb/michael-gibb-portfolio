import { z } from "zod";
import saved from "./program-results/S31.json";
const n = z.number().finite();
const count = n.int().nonnegative();
const metric = z.object({model:z.string(),name:z.string(),estimate:n,lower:n,upper:n});
const difference = z.object({estimate:n,lower:n,upper:n});
const aggregate = z.object({model:z.string(),policies:count,claims:count,exposure_years:n.positive(),observed_loss_eur:n.nonnegative(),predicted_loss_eur:n.positive(),observed_pure_premium:n.nonnegative(),predicted_pure_premium:n.positive(),observed_frequency:n.nonnegative(),predicted_frequency:n.positive().nullable(),observed_severity:n.positive().nullable(),predicted_severity:n.positive().nullable(),predicted_observed_loss_ratio:n.positive().nullable()});
const segment = aggregate.extend({grouping:z.string(),group:z.string(),ratio_lower:n,ratio_upper:n,observed_premium_lower:n,observed_premium_upper:n});
const scenario = z.object({claim_cap_eur:n.nullable(),metrics:z.array(metric),primary_difference:difference,segments:z.array(segment),calibration:z.array(aggregate.extend({bin:count})),count_dispersion:z.array(z.object({model:z.string(),mean_pearson_count_residual_squared:n}))});
const schema = z.object({study_id:z.literal("S31"),run_id:z.string(),code_version:z.string().regex(/^[a-f0-9]{40}$/),evaluated_on:z.string(),samples:z.object({total:count,total_claims:count,test:count,test_claims:count,test_claiming_policies:count,development:count,validation:count,final_fit:count}),models:z.array(z.object({id:z.string(),label:z.string()})),metrics:z.array(metric),uncertainty:z.string(),limitations:z.array(z.string()),tables:z.object({audit:z.object({exposure_years:n,total_loss_eur:n,maximum_claim_eur:n,repeated_severity_rows_retained:count,exposures_over_one_year:count,claims_above_cap:count,top_one_percent_claim_loss_share:n,largest_claim_share_of_loss:n}),selected_settings:z.record(n),scenarios:z.object({uncapped:scenario,capped:scenario}),geographic_stress:z.object({region:z.string(),policies:count,claims:count,final_fit_policies:count,metrics:z.array(metric),primary_difference:difference,aggregate:z.array(aggregate)})})});
export const insuranceResult = schema.parse(saved);
export type InsuranceScenario = z.infer<typeof scenario>;
export type InsuranceSegment = z.infer<typeof segment>;
for (const scenario of Object.values(insuranceResult.tables.scenarios)) {
  for (const row of scenario.segments) {
    if(Math.abs(row.predicted_pure_premium*row.exposure_years-row.predicted_loss_eur)>0.01||Math.abs(row.observed_pure_premium*row.exposure_years-row.observed_loss_eur)>0.01)throw new Error("Invalid premium accounting");
    if(row.predicted_frequency!==null&&row.predicted_severity!==null&&Math.abs(row.predicted_frequency*row.predicted_severity-row.predicted_pure_premium)>0.01)throw new Error("Invalid frequency-severity decomposition");
    if(row.ratio_lower>row.ratio_upper)throw new Error("Invalid calibration interval");
  }
}
