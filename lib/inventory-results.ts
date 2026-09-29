import { z } from "zod";
import saved from "./program-results/S02.json";
const n=z.number().finite();
const interval=z.object({lower:n,upper:n,confidence:z.literal(.95)});
const metric=z.object({name:z.string(),model:z.string(),estimate:n,unit:z.string(),split:z.string()}).merge(interval);
const scenario=z.object({scenario_id:z.string(),model:z.string(),lead_days:n,holding_per_unit_day:n,lost_sale_penalty:n,storage_multiplier:n,assumed_cost:n,lost_units:n,hindsight_cost:n,regret:n,cost_difference_vs_conventional:n,cost_difference_interval:interval});
const forecast=z.object({origin:n,forecast_date:z.string(),model:z.string(),level:z.string(),group:z.string(),observed_sales_units:n,point_units:n,lower_units:n,upper_units:n,covered:z.boolean()});
const origin=z.object({origin:n,scenario_id:z.string(),model:z.string(),order_units:n,unit_fill_rate:n,assumed_cost:n,lost_units:n,holding_unit_days:n,holding_per_unit_day:n,lost_sale_penalty:n,hindsight_cost:n,regret:n});
const result=z.object({study_id:z.literal("S02"),run_id:z.string(),code_version:z.string().regex(/^[a-f0-9]{40}$/),evaluated_on:z.string(),
 data:z.object({source_url:z.string().url(),coverage:z.string(),citation:z.string(),license:z.string()}),
 samples:z.object({test:n,series:n,items:n,stores:n,origins:n}),
 models:z.array(z.object({id:z.string(),label:z.string()})),metrics:z.array(metric),uncertainty:z.string(),limitations:z.array(z.string()),
 tables:z.object({primary_difference:z.object({estimate:n}).merge(interval),selected_leaves:n,inventory_scenarios:z.array(scenario).length(144),inventory_by_origin:z.array(origin).length(576),aggregate_forecasts:z.array(forecast),
 metrics_by_origin_level:z.array(z.object({origin:n,model:z.string(),level:z.string(),weighted_scaled_error_28d:n,coverage_80:n,mean_width_units:n})),
 failure_groups:z.array(z.object({origin:n,model:z.string(),grouping:z.string(),group:z.string(),weighted_scaled_error_28d:n,coverage_80:n})),
 dependence_ablation:z.array(z.object({origin:n,level:z.string(),dependence:z.string(),coverage_80:n,mean_width_units:n}))})
});
export const inventoryResult=result.parse(saved);
export type InventoryScenario=z.infer<typeof scenario>;
export type InventoryForecast=z.infer<typeof forecast>;
export type InventoryOrigin=z.infer<typeof origin>;
for(const row of inventoryResult.tables.inventory_by_origin){
 if(Math.abs(row.assumed_cost-row.holding_unit_days*row.holding_per_unit_day-row.lost_units*row.lost_sale_penalty)>.001||row.regret<0)throw new Error("Inventory accounting failed");
}
export const inventoryDemand=inventoryResult.tables.aggregate_forecasts.filter(row=>row.model==="quantile_boosting"&&row.level==="total").reduce((sum,row)=>sum+row.observed_sales_units,0);
if(inventoryDemand!==30600||inventoryResult.samples.test!==840)throw new Error("Inventory cohort mismatch");
