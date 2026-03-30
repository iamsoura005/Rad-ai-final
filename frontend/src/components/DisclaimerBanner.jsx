function DisclaimerBanner({ text, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 ${className}`}
    >
      {text}
    </div>
  );
}

export default DisclaimerBanner;
