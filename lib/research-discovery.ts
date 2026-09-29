export const businessAreas = [
  { id: "marketing", label: "Marketing" },
  { id: "sales", label: "Sales" },
  { id: "customer-value", label: "Customer value" },
  { id: "operations", label: "Operations" },
] as const;

const discovery: Record<string, { areas: string[]; keywords: string }> = {
  S02: { areas: ["operations", "sales"], keywords: "inventory demand retail forecast stock service cost" },
  S03: { areas: ["customer-value", "marketing"], keywords: "retention churn customer return win back repeat purchase customer lifetime value prediction" },
  S04: { areas: ["marketing"], keywords: "advertising targeting incrementality uplift treatment effect acquisition" },
  S13: { areas: ["operations"], keywords: "inspection manufacturing quality failure sensors" },
  S28: { areas: ["sales", "marketing"], keywords: "sales contact prioritization campaign response conversion" },
  S31: { areas: ["operations"], keywords: "insurance pricing claims loss risk" },
  S43: { areas: ["sales"], keywords: "property real estate valuation pricing" },
  S47: { areas: ["customer-value", "operations"], keywords: "retention churn customer return win back service recovery prediction" },
  S58: { areas: ["operations"], keywords: "workflow capacity process duration queue" },
  "marketing-incrementality": { areas: ["marketing"], keywords: "advertising acquisition incrementality treatment effect" },
  "customer-value": { areas: ["customer-value", "marketing"], keywords: "retention churn customer return win back lifetime value treatment effect" },
  "revenue-forecasting": { areas: ["sales", "operations"], keywords: "revenue sales forecast planning" },
  "operational-planning": { areas: ["operations"], keywords: "capacity allocation optimization" },
};

export function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[–—-]/g, " ").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function matchesResearch(query: string, id: string, description: string) {
  const text = normalizeSearch(`${description} ${discovery[id]?.keywords ?? ""}`);
  const words = normalizeSearch(query).replace(/winback/g, "win back").split(" ").filter(Boolean);
  return words.every(word => text.includes(word));
}

export function inBusinessArea(area: string, id: string, description: string) {
  if (area === "all") return true;
  if (discovery[id]) return discovery[id].areas.includes(area);
  // Agenda entries use their existing descriptive metadata, not a performance claim.
  const patterns: Record<string, RegExp> = {
    marketing: /marketing|advertis|campaign|acquisition|targeting/i,
    sales: /sales|revenue|pricing|conversion/i,
    "customer-value": /customer|retention|churn|repeat purchase/i,
    operations: /capacity|inventory|workflow|allocation|maintenance|inspection|queue|supply|staffing/i,
  };
  return patterns[area]?.test(description) ?? false;
}
