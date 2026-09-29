const currencyFormats = new Map<string, Intl.NumberFormat>();
const percentFormats = new Map<number, Intl.NumberFormat>();

export function formatCurrency(value: number, digits = 2, currency = "USD") {
  const key = `${currency}:${digits}`;
  let formatter = currencyFormats.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits });
    currencyFormats.set(key, formatter);
  }
  return formatter.format(value);
}

export function formatPercent(value: number, digits = 1) {
  let formatter = percentFormats.get(digits);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits });
    percentFormats.set(digits, formatter);
  }
  return formatter.format(value);
}
