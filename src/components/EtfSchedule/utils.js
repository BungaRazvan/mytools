export function formatDate(dateStr) {
  if (!dateStr) return "TBD";
  const date = new Date(dateStr);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatShares(amount) {
  // Formats 11.80540000 -> 11.8054
  return (
    parseFloat(amount).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }) || "0.00"
  );
}
