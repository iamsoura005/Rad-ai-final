import { motion } from "framer-motion";
import { AlertCircle, Loader2, Send, Siren } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ConfidenceBar from "../components/ConfidenceBar";
import DisclaimerBanner from "../components/DisclaimerBanner";
import StreamingText from "../components/StreamingText";
import useLocalStorage from "../hooks/useLocalStorage";
import useStream from "../hooks/useStream";
import { buildSymptomsRequest } from "../utils/api";
import { parseSymptomResponse } from "../utils/parseAnalysis";

const chips = [
  "Fever",
  "Headache",
  "Cough",
  "Nausea",
  "Fatigue",
  "Chest Pain",
  "Body Ache",
  "Dizziness",
  "Shortness of Breath",
];

function urgencyClass(raw = "") {
  const value = raw.toLowerCase();
  if (value.includes("emergency")) return "bg-rose-500/20 text-rose-300 border-rose-500/50";
  if (value.includes("see a doctor")) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
  return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
}

function SymptomChecker() {
  const [form, setForm] = useState({
    symptoms: "",
    age: 30,
    gender: "Male",
    duration: "Today",
  });
  const [hasRun, setHasRun] = useState(false);
  const [history, setHistory] = useLocalStorage("radiology_ai_history", []);

  const { text, isStreaming, error, start } = useStream("http://localhost:8000/symptoms", {
    method: "POST",
  });

  const parsed = useMemo(() => parseSymptomResponse(text), [text]);

  useEffect(() => {
    if (!isStreaming && hasRun && text.trim()) {
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          type: "symptom",
          summary: parsed.probableConditions[0] || "Symptom analysis",
          severity: parsed.urgencyLevel,
          confidence: 0,
          content: parsed.raw,
        },
        ...prev,
      ]);
    }
  }, [hasRun, isStreaming, parsed.probableConditions, parsed.raw, parsed.urgencyLevel, setHistory, text]);

  const submit = async () => {
    if (!form.symptoms.trim()) return;
    setHasRun(true);
    await start(buildSymptomsRequest(form));
  };

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="grid gap-5 xl:grid-cols-[1.05fr_1fr]">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 transition hover:border-cyan-500/40">
          <label className="text-sm text-gray-300">Describe your symptoms in detail...</label>
          <textarea
            value={form.symptoms}
            onChange={(event) => setForm((prev) => ({ ...prev, symptoms: event.target.value }))}
            className="mt-2 h-36 w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500"
            placeholder="I have had a fever of 101°F for 2 days, with headache and body pain..."
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    symptoms: prev.symptoms ? `${prev.symptoms}, ${chip}` : chip,
                  }))
                }
                className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300 hover:border-cyan-500/50"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              type="number"
              min="0"
              max="130"
              value={form.age}
              onChange={(event) => setForm((prev) => ({ ...prev, age: Number(event.target.value) }))}
              className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500"
              placeholder="Age"
            />
            <select
              value={form.gender}
              onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
              className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <select
              value={form.duration}
              onChange={(event) => setForm((prev) => ({ ...prev, duration: event.target.value }))}
              className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500"
            >
              <option>Today</option>
              <option>2-3 days</option>
              <option>1 week</option>
              <option>2+ weeks</option>
              <option>1+ month</option>
            </select>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={isStreaming || !form.symptoms.trim()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:scale-105 disabled:opacity-50"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Analyze Symptoms →
          </button>
        </div>

        <div className="space-y-4">
          {!hasRun && (
            <div className="grid min-h-[420px] place-items-center rounded-2xl border border-gray-800 bg-gray-900 p-5 text-center text-gray-400">
              Fill symptoms to begin smart triage analysis.
            </div>
          )}

          {hasRun && isStreaming && (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-2xl border border-gray-800 bg-gray-900" />
              <div className="h-20 animate-pulse rounded-2xl border border-gray-800 bg-gray-900" />
              <StreamingText text={text} isStreaming />
            </div>
          )}

          {hasRun && !isStreaming && text && !error && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
                <h3 className="text-sm font-semibold text-white">Probable Conditions</h3>
                <div className="mt-3 space-y-3">
                  {parsed.probableConditions.map((line, idx) => {
                    const confidence = Number((line.match(/(\d{1,3})\s?%/) || [0, 0])[1]) || 50;
                    return (
                      <div key={`${line}-${idx}`} className="rounded-xl border border-gray-800 bg-gray-950/70 p-3">
                        <p className="text-sm text-gray-200">{line.replace(/^[-•]\s*/, "")}</p>
                        <div className="mt-2">
                          <ConfidenceBar value={confidence} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
                <h3 className="text-sm font-semibold text-white">Urgency Level</h3>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-white">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${urgencyClass(parsed.urgencyLevel)}`}>
                    <Siren className="h-3.5 w-3.5" /> {parsed.urgencyLevel || "Not specified"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
                <h3 className="text-sm font-semibold text-white">Possible Causes</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-300">
                  {parsed.possibleCauses.map((cause, idx) => (
                    <li key={`${cause}-${idx}`}>{cause.replace(/^[-•]\s*/, "")}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
                <h3 className="text-sm font-semibold text-white">What to Do Next</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-300">
                  {parsed.nextSteps.map((step, idx) => (
                    <li key={`${step}-${idx}`}>{step.replace(/^[-•\d.]+\s*/, "")}</li>
                  ))}
                </ol>
              </div>

              <DisclaimerBanner text={parsed.safetyNote || "⚠️ This is AI-assisted guidance and not a diagnosis."} />
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-500/50 bg-rose-500/10 p-4 text-rose-100">
              <p className="font-medium">Unable to analyze symptoms</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 inline-flex items-center gap-2 text-xs text-gray-400">
        <AlertCircle className="h-3.5 w-3.5" />
        Symptom checker helps with triage, not definitive diagnosis.
      </p>
    </motion.section>
  );
}

export default SymptomChecker;
