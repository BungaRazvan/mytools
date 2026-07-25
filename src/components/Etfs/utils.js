export function formatDate(dateStr) {
  if (!dateStr) return "TBD";
  const date = new Date(dateStr);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatShares(amount, settings = {}) {
  // Formats 11.80540000 -> 11.8054
  const { minimumFractionDigits = 2, maximumFractionDigits = 8 } = settings;

  if (!amount) {
    return "0.00";
  }

  return (
    parseFloat(amount).toLocaleString("en-GB", {
      minimumFractionDigits,
      maximumFractionDigits,
    }) || "0.00"
  );
}

export function formatCurrency(value, settings = {}) {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 8,
    currencyType = "pound",
  } = settings;
  const amount = parseFloat(value || 0);
  const symbol = currencyType === "pound" ? "en-GB" : "de-DE";
  const currency = currencyType === "pound" ? "GBP" : "EUR";

  return new Intl.NumberFormat(symbol, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}
