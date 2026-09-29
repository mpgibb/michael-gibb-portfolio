import { z } from "zod";
import saved from "./program-results/S03.json";
const n=z.number().finite();const count=n.int().nonnegative();const probability=n.min(0).max(1);
const metric=z.object({model:z.string(),name:z.string(),estimate:n,lower:n,upper:n});
const difference=z.object({estimate:n,lower:n,upper:n});
const profile=z.object({model:z.string(),horizon_days:z.union([z.literal(30),z.literal(60),z.literal(90)]),inactivity:z.string(),frequency:z.string(),observations:count.min(50),unique_customers:count.positive(),observed_count:n.nonnegative(),predicted_count:n.nonnegative(),observed_purchase_probability:probability,predicted_purchase_probability:probability,latent_alive_probability:probability.nullable(),observed_spend_gbp:n.nonnegative(),predicted_spend_gbp:n.nonnegative(),predicted_spend_per_purchase:n.positive().nullable(),predicted_count_distribution:z.array(probability).length(6).nullable(),observed_count_distribution:z.array(probability).length(6),count_coverage_90:probability.nullable(),count_interval_width:n.nonnegative().nullable(),spend_coverage_90:probability.nullable(),spend_interval_width:n.nonnegative().nullable()});
const schema=z.object({study_id:z.literal("S03"),run_id:z.string(),code_version:z.string().regex(/^[a-f0-9]{40}$/),evaluated_on:z.string(),samples:z.object({total:count,test:count,test_unique_customers:count,test_purchase_days:count,test_customer_windows_with_purchase:count}),models:z.array(z.object({id:z.string(),label:z.string()})),metrics:z.array(metric),uncertainty:z.string(),limitations:z.array(z.string()),tables:z.object({primary_difference:difference,cohort_profiles:z.array(profile),windows:z.array(z.object({cutoff:z.string(),horizon_days:count,model:z.string(),observations:count,count_poisson_deviance:n,count_ratio:n,spend_ratio:n,spend_coverage_90:probability.optional()})),duplicate_accounting_sensitivity:z.object({primary_difference:difference}),gross_spend_tail:z.object({largest_customer_window_gbp:n,top_one_percent_share:probability})})});
export const customerReturnResult=schema.parse(saved);
export type CustomerReturnProfile=z.infer<typeof profile>;
for(const row of customerReturnResult.tables.cohort_profiles){
 if(row.unique_customers>row.observations||row.predicted_purchase_probability>row.predicted_count+1e-7)throw new Error("Customer forecast probability/count mismatch");
 if(row.predicted_spend_per_purchase!==null&&Math.abs(row.predicted_count*row.predicted_spend_per_purchase-row.predicted_spend_gbp)>.001)throw new Error("Customer spend decomposition mismatch");
 for(const masses of [row.predicted_count_distribution,row.observed_count_distribution])if(masses&&Math.abs(masses.reduce((a,b)=>a+b,0)-1)>1e-6)throw new Error("Customer distribution mass mismatch");
}
