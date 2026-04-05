import { motion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardCopy,
  FileType,
  ImagePlus,
  Loader2,
  Printer,
  Save,
  ScanLine,
  ShieldAlert,
  Stethoscope,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ConfidenceBar from "../components/ConfidenceBar";
import DisclaimerBanner from "../components/DisclaimerBanner";
import SeverityBadge from "../components/SeverityBadge";
import StreamingText from "../components/StreamingText";
import useLocalStorage from "../hooks/useLocalStorage";
import useStream from "../hooks/useStream";
import { buildAnalyzeRequest } from "../utils/api";
import { parseAnalysis } from "../utils/parseAnalysis";

const historyKey = "radiology_ai_history";

function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
}

function sectionCardClass() {
  return "rounded-2xl border border-gray-800 bg-gray-900 p-4 transition hover:border-cyan-500/40";
}

function validateAnalysisAssetsMeta(meta) {
  if (!meta || meta.type !== "analysis_assets") {
    return { valid: false, missing: ["analysis_assets_meta"] };
  }

  const missing = [];

  if (typeof meta.prediction_class !== "number" || Number.isNaN(meta.prediction_class)) {
    missing.push("prediction_class");
  }

  if (typeof meta.heatmap !== "string" || !meta.heatmap.startsWith("data:image/")) {
    missing.push("heatmap");
  }

  return { valid: missing.length === 0, missing };
}

function ScanAnalysis() {
  const inputRef = useRef(null);
  const hasLoggedMetaWarningRef = useRef(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [context, setContext] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [history, setHistory] = useLocalStorage(historyKey, []);

  const { text, meta, isStreaming, error, start, reset } = useStream("http://localhost:8000/analyze", {
    method: "POST",
  });

  const parsed = useMemo(() => parseAnalysis(text), [text]);
  const analysisAssets = meta?.type === "analysis_assets" ? meta : null;

  useEffect(() => {
    if (!isStreaming && hasRun && text.trim()) {
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          type: "scan",
          summary: `${parsed.imageType} · ${parsed.regionAnalyzed}`,
          severity: parsed.severity,
          confidence: parsed.confidenceScore,
          content: parsed.raw,
        },
        ...prev,
      ]);
    }
  }, [hasRun, isStreaming, parsed.confidenceScore, parsed.imageType, parsed.raw, parsed.regionAnalyzed, parsed.severity, setHistory, text]);

  useEffect(() => {
    if (!hasRun || isStreaming || !meta || hasLoggedMetaWarningRef.current) {
      return;
    }

    if (meta.type === "analysis_assets") {
      const validation = validateAnalysisAssetsMeta(meta);
      if (!validation.valid) {
        console.warn("[RadiologyAI] Grad-CAM meta validation warning", {
          event: "analysis_assets_validation_failed",
          missing_fields: validation.missing,
          received_meta_keys: Object.keys(meta),
          timestamp: new Date().toISOString(),
        });
      }
      hasLoggedMetaWarningRef.current = true;
      return;
    }

    if (meta.type === "analysis_assets_unavailable") {
      console.warn("[RadiologyAI] Grad-CAM assets unavailable", {
        event: "analysis_assets_unavailable",
        reason: meta.reason || "unknown",
        detail: meta.detail || "",
        timestamp: new Date().toISOString(),
      });
      hasLoggedMetaWarningRef.current = true;
    }
  }, [hasRun, isStreaming, meta]);

  const selectFile = (nextFile) => {
    if (!nextFile) return;
    setFile(nextFile);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(nextFile);
    });
  };

  const onAnalyze = async () => {
    if (!file) return;
    hasLoggedMetaWarningRef.current = false;
    setHasRun(true);
    const req = buildAnalyzeRequest(file, context);
    await start(req);
  };

  const clearFile = () => {
    hasLoggedMetaWarningRef.current = false;
    setFile(null);
    setContext("");
    reset();
    setHasRun(false);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
  };

  const copyReport = async () => {
    if (!parsed.raw) return;
    await navigator.clipboard.writeText(parsed.raw);
  };

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 transition hover:border-cyan-500/40">
          <div
            className={`rounded-2xl border-2 border-dashed p-5 text-center transition ${
              dragActive ? "border-cyan-400 bg-cyan-500/10" : "border-gray-700 bg-gray-950/40"
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              selectFile(event.dataTransfer.files?.[0]);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.webp,.dcm"
              onChange={(event) => selectFile(event.target.files?.[0])}
            />

            {!file ? (
              <>
                <ScanLine className="mx-auto h-10 w-10 text-cyan-300" />
                <p className="mt-3 text-sm text-gray-200">Drag and drop your medical image here</p>
                <p className="mt-1 text-xs text-gray-400">
                  Supports JPG, PNG, WEBP - X-ray, MRI, CT Scan, Ultrasound
                </p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-4 rounded-xl border border-cyan-500/40 px-4 py-2 text-sm text-cyan-200"
                >
                  Click to browse
                </button>
              </>
            ) : (
              <div className="space-y-3 text-left">
                <img src={preview} alt="Preview" className="h-52 w-full rounded-xl object-contain" />
                <div className="rounded-xl border border-gray-700 bg-gray-950/60 p-3 text-sm text-gray-300">
                  <p className="truncate font-medium text-white">{file.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span>{formatFileSize(file.size)}</span>
                    <span className="rounded-full border border-gray-600 px-2 py-0.5 uppercase">
                      {file.type || "unknown"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full rounded-xl border border-rose-500/40 px-3 py-2 text-sm text-rose-200"
                  onClick={clearFile}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-sm text-gray-300">Add context (optional)</label>
            <textarea
              value={context}
              onChange={(event) => setContext(event.target.value)}
              className="h-24 w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500"
              placeholder="Patient age, symptom hints, history..."
            />
          </div>

          <button
            type="button"
            disabled={!file || isStreaming}
            onClick={onAnalyze}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {isStreaming ? "Analyzing..." : "🔬 Analyze Image"}
          </button>

          <p className="mt-2 text-xs text-gray-400">
            For best results, use clear, high-resolution images.
          </p>
        </div>

        <div className="space-y-4">
          {!hasRun && (
            <div className="grid min-h-[540px] place-items-center rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center">
              <div>
                <Stethoscope className="mx-auto h-10 w-10 text-cyan-300" />
                <p className="mt-3 text-gray-300">Upload an image to begin analysis</p>
              </div>
            </div>
          )}

          {hasRun && isStreaming && (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl border border-gray-800 bg-gray-900" />
                ))}
              </div>
              <StreamingText text={text} isStreaming className="min-h-[180px]" />
            </div>
          )}

          {hasRun && !isStreaming && !error && text && (
            <motion.div className="scan-print-report space-y-4" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}>
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className={sectionCardClass()}>
                <h3 className="mb-2 flex items-center gap-2 text-white">
                  <FileType className="h-4 w-4 text-cyan-300" /> Image Type
                </h3>
                <span className="inline-flex rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
                  {parsed.imageType}
                </span>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className={sectionCardClass()}>
                <h3 className="mb-2 text-white">Region Analyzed</h3>
                <p className="text-gray-200">{parsed.regionAnalyzed}</p>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className={sectionCardClass()}>
                <h3 className="mb-2 text-white">Key Observations</h3>
                <ul className="space-y-2 text-sm text-gray-200">
                  {parsed.keyObservations.map((item, idx) => {
                    const normal = /normal|no\s|without/i.test(item);
                    return (
                      <li key={`${item}-${idx}`} className="flex items-start gap-2">
                        {normal ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                        ) : (
                          <TriangleAlert className="mt-0.5 h-4 w-4 text-yellow-300" />
                        )}
                        <span>{item}</span>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className={sectionCardClass()}>
                <h3 className="mb-2 text-white">Possible Conditions</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {parsed.possibleConditions.map((item, idx) => (
                    <li key={`${item}-${idx}`} className={idx === 0 ? "font-semibold text-white" : ""}>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className={sectionCardClass()}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-white">Severity Assessment</h3>
                  <SeverityBadge severity={parsed.severity} />
                </div>
                <p className="mb-2 text-sm text-gray-300">Severity score: {parsed.severityScore}/10</p>
                <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all" style={{ width: `${(parsed.severityScore / 10) * 100}%` }} />
                </div>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className={sectionCardClass()}>
                <h3 className="mb-2 text-white">Clinical Explanation</h3>
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-gray-100">
                  {parsed.clinicalExplanation}
                </div>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className={sectionCardClass()}>
                <h3 className="mb-2 text-white">Confidence Score</h3>
                <ConfidenceBar value={parsed.confidenceScore} />
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className={sectionCardClass()}>
                <h3 className="mb-2 text-white">Recommendation</h3>
                <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 text-sm text-gray-200">
                  {parsed.recommendation}
                </div>
              </motion.div>

              {analysisAssets?.heatmap && (
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className={sectionCardClass()}>
                  <h3 className="mb-2 text-white">Region-Focused Heatmap</h3>
                  <img src={analysisAssets.heatmap} alt="Region focused heatmap" className="max-h-[460px] w-full rounded-xl object-contain" />
                  <p className="mt-2 text-xs text-gray-400">
                    Regions: {Array.isArray(analysisAssets.regions) && analysisAssets.regions.length
                      ? analysisAssets.regions.join(", ")
                      : "none"}
                  </p>
                </motion.div>
              )}

              <DisclaimerBanner text="⚠️ This is an AI-assisted analysis and not a medical diagnosis." />

              <div className="print:hidden flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={copyReport}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200"
                >
                  <ClipboardCopy className="h-4 w-4" /> 📋 Copy Report
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200"
                >
                  <Printer className="h-4 w-4" /> 🖨️ Print
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHistory((prev) => [
                      {
                        id: crypto.randomUUID(),
                        date: new Date().toISOString(),
                        type: "scan",
                        summary: `${parsed.imageType} · ${parsed.regionAnalyzed}`,
                        severity: parsed.severity,
                        confidence: parsed.confidenceScore,
                        content: parsed.raw,
                      },
                      ...prev,
                    ]);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200"
                >
                  <Save className="h-4 w-4" /> 💾 Save to History
                </button>
              </div>
            </motion.div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-500/50 bg-rose-500/10 p-4 text-rose-200">
              <p className="font-semibold">Analysis failed</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 inline-flex items-center gap-2 text-xs text-gray-400">
        <ShieldAlert className="h-3.5 w-3.5" />
        For medical decisions, consult a licensed clinician.
      </p>
    </motion.section>
  );
}

export default ScanAnalysis;
