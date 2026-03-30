function SeverityBadge({ severity = "Not specified" }) {
  const normalized = severity.toLowerCase();

  let styles = "bg-gray-700/50 text-gray-200 border-gray-600";
  if (normalized.includes("mild")) styles = "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  if (normalized.includes("moderate")) styles = "bg-yellow-500/15 text-yellow-300 border-yellow-500/40";
  if (normalized.includes("severe")) styles = "bg-orange-500/15 text-orange-300 border-orange-500/40";
  if (normalized.includes("critical")) styles = "bg-rose-500/20 text-rose-300 border-rose-500/50";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}>
      {severity}
    </span>
  );
}

export default SeverityBadge;
