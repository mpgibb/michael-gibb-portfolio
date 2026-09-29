import { z } from "zod";
import s28 from "./program-results/S28.json";

const interval = z.object({ lower: z.number().finite(), upper: z.number().finite(), confidence: z.literal(.95) });
const metric = z.object({ name: z.string(), model: z.string(), estimate: z.number().finite(), unit: z.string(), split: z.string() }).merge(interval);
const frontier = z.object({ model: z.string(), capacity: z.number().positive().max(1), selected: z.number().int().positive(), responses: z.number().nonnegative(), precision: z.number().min(0).max(1), capture: z.number().min(0).max(1), precision_interval: interval, capture_interval: interval, kind: z.string() });
const result = z.object({
  schema_version: z.literal("1.0"), study_id: z.literal("S28"), run_id: z.string(), code_version: z.string().regex(/^[a-f0-9]{40}$/),
  evaluated_on: z.string(), data: z.object({ source_url: z.string().url(), release: z.string(), sha256: z.string(), license: z.string(), citation: z.string(), coverage: z.string() }),
  target: z.object({ label: z.string(), estimand: z.string(), prediction_cutoff: z.string(), horizon: z.string(), unit: z.string() }),
  cohort: z.string(), samples: z.object({ total: z.number().int(), train: z.number().int(), calibration: z.number().int(), test: z.number().int(), events: z.object({ train: z.number().int(), calibration: z.number().int(), test: z.number().int() }) }),
  models: z.array(z.object({ id: z.string(), label: z.string() })), metrics: z.array(metric), uncertainty: z.string(), assumptions: z.array(z.string()), limitations: z.array(z.string()),
  tables: z.object({ selected_model: z.string(), capacity_frontier: z.array(frontier),
    periods: z.array(z.object({ model: z.string(), period: z.number().int(), n: z.number().int(), events: z.number().int(), log_loss: z.number(), precision_at_20_percent: z.number() })),
    calibration: z.array(z.object({ model: z.string(), n: z.number().int(), prediction: z.number(), observed: z.number() })),
    block_sensitivity: z.array(z.object({ block_length: z.number(), estimate: z.number() }).merge(interval)),
  }),
});
export const contactResult = result.parse(s28);
export type ContactFrontier = z.infer<typeof frontier>;

if (contactResult.samples.train + contactResult.samples.calibration + contactResult.samples.test !== contactResult.samples.total) throw new Error("Research cohort count mismatch");
for (const row of contactResult.tables.capacity_frontier) {
  if (Math.abs(row.precision * row.selected - row.responses) > .0001 || row.selected !== Math.floor(contactResult.samples.test * row.capacity)) throw new Error("Research decision table count mismatch");
}

export const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
