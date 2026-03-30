function ConfidenceBar({ value = 0, max = 100, label = "Confidence" }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  let fill = "bg-rose-400";
  if (percent >= 80) fill = "bg-emerald-400";
  else if (percent >= 60) fill = "bg-yellow-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-200">
        <span>{label}</span>
        <span className="font-semibold">{Math.round(percent)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-800">
        <div className={`h-full ${fill} transition-all`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default ConfidenceBar;
