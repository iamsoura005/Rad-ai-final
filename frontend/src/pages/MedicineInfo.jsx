import { motion } from "framer-motion";
import { Loader2, Pill, Search } from "lucide-react";
import { useMemo, useState } from "react";
import DisclaimerBanner from "../components/DisclaimerBanner";
import StreamingText from "../components/StreamingText";
import useStream from "../hooks/useStream";
import { buildMedicineRequest } from "../utils/api";
import { parseMedicineResponse } from "../utils/parseAnalysis";

const popular = ["Paracetamol", "Ibuprofen", "Amoxicillin", "Metformin", "Cetirizine", "Omeprazole"];

function InfoCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 transition hover:border-cyan-500/40">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-300">{value || "Not provided"}</p>
    </div>
  );
}

function MedicineInfo() {
  const [medicineName, setMedicineName] = useState("");
  const [hasRun, setHasRun] = useState(false);

  const { text, isStreaming, error, start } = useStream("http://localhost:8000/medicine", {
    method: "POST",
  });

  const parsed = useMemo(() => parseMedicineResponse(text), [text]);

  const onSearch = async () => {
    if (!medicineName.trim()) return;
    setHasRun(true);
    await start(buildMedicineRequest({ medicine_name: medicineName.trim() }));
  };

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Pill className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300" />
            <input
              type="text"
              value={medicineName}
              onChange={(event) => setMedicineName(event.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 pl-9 pr-3 text-sm text-gray-100 outline-none focus:border-cyan-500"
              placeholder="Enter medicine name (e.g., Paracetamol, Amoxicillin)"
            />
          </div>
          <button
            type="button"
            onClick={onSearch}
            disabled={!medicineName.trim() || isStreaming}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:scale-105 disabled:opacity-50"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search Medicine →
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {popular.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setMedicineName(chip)}
              className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300 hover:border-cyan-500/50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {!hasRun && (
          <div className="grid min-h-[320px] place-items-center rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center text-gray-400">
            Search for a medicine to view detailed clinical information.
          </div>
        )}

        {hasRun && isStreaming && (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-2xl border border-gray-800 bg-gray-900" />
            <StreamingText text={text} isStreaming />
          </div>
        )}

        {hasRun && !isStreaming && !error && text && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                <Pill className="h-5 w-5 text-cyan-300" /> {medicineName}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard title="💊 Generic Name & Drug Class" value={parsed.genericNameAndClass} />
              <InfoCard title="🎯 Uses & Indications" value={parsed.uses} />
              <InfoCard title="📏 Dosage & Administration" value={parsed.dosage} />
              <InfoCard title="⚠️ Side Effects" value={parsed.sideEffects} />
              <InfoCard title="🚫 Contraindications & Warnings" value={parsed.contraindications} />
              <InfoCard title="🔄 Drug Interactions" value={parsed.interactions} />
              <InfoCard title="📦 Storage Instructions" value={parsed.storage} />
            </div>

            <DisclaimerBanner text={parsed.disclaimer || "Always consult your doctor or pharmacist before taking medication."} />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-500/50 bg-rose-500/10 p-4 text-rose-100">
            <p className="font-semibold">Medicine lookup failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default MedicineInfo;
