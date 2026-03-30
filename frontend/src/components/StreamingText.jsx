function StreamingText({ text, isStreaming, className = "" }) {
  return (
    <div className={`rounded-xl border border-gray-800 bg-gray-950/60 p-4 ${className}`}>
      <pre className="whitespace-pre-wrap break-words font-sans text-sm text-gray-200">{text}</pre>
      {isStreaming && <span className="ml-1 inline-block animate-blink text-cyan-300">|</span>}
    </div>
  );
}

export default StreamingText;
