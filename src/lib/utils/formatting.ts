const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number, compact = false): string {
  return (compact ? usdCompact : usd).format(value);
}

export function formatPercent(value: number, options?: { signed?: boolean }): string {
  const sign = options?.signed && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatSignedCurrency(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${usd.format(Math.abs(value))}`;
}

export function maskAccountNumber(last4: string): string {
  return `•••• ${last4}`;
}

export function formatQty(value: number): string {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
