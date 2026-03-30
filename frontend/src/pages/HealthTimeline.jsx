import { motion } from "framer-motion";
import { Calendar, Eraser, Filter, History, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import SeverityBadge from "../components/SeverityBadge";
import useLocalStorage from "../hooks/useLocalStorage";

function fmtDate(value) {
  return new Date(value).toLocaleString();
}

function HealthTimeline() {
  const [records, setRecords] = useLocalStorage("radiology_ai_history", []);
  const [expandedId, setExpandedId] = useState("");
  const [filter, setFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const filtered = useMemo(() => {
    return records.filter((item) => {
      if (filter !== "all" && item.type !== filter) return false;
      const date = new Date(item.date);
      if (fromDate && date < new Date(fromDate)) return false;
      if (toDate && date > new Date(`${toDate}T23:59:59`)) return false;
      return true;
    });
  }, [filter, fromDate, records, toDate]);

  const stats = useMemo(() => {
    const total = records.length;
    const lastCheck = total ? records[0].date : null;

    const symptomTokens = records
      .filter((item) => item.type === "symptom")
      .flatMap((item) => item.summary.split(/[,.]/g).map((x) => x.trim().toLowerCase()));

    const counts = symptomTokens.reduce((acc, token) => {
      if (!token) return acc;
      acc[token] = (acc[token] || 0) + 1;
      return acc;
    }, {});

    let mostCommon = "-";
    let top = 0;
    for (const [word, count] of Object.entries(counts)) {
      if (count > top) {
        top = count;
        mostCommon = word;
      }
    }

    const confidenceValues = records
      .map((item) => Number(item.confidence))
      .filter((num) => Number.isFinite(num) && num > 0);
    const avgConfidence = confidenceValues.length
      ? Math.round(confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length)
      : 0;

    return {
      total,
      lastCheck: lastCheck ? fmtDate(lastCheck) : "-",
      mostCommon,
      avgConfidence,
    };
  }, [records]);

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs text-gray-400">Total Analyses</p>
          <p className="mt-1 text-2xl font-semibold text-cyan-300">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs text-gray-400">Last Check Date</p>
          <p className="mt-1 text-sm font-semibold text-gray-200">{stats.lastCheck}</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs text-gray-400">Most Common Symptom</p>
          <p className="mt-1 text-sm font-semibold capitalize text-gray-200">{stats.mostCommon}</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs text-gray-400">Average Confidence</p>
          <p className="mt-1 text-2xl font-semibold text-cyan-300">{stats.avgConfidence}%</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-cyan-300" />
          {[
            ["all", "All"],
            ["scan", "Scans"],
            ["symptom", "Symptoms"],
            ["chat", "Chat"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full border px-3 py-1 text-xs ${
                filter === value
                  ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-200"
                  : "border-gray-700 text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}

          <div className="ml-auto flex flex-wrap items-center gap-2 text-xs text-gray-300">
            <Calendar className="h-4 w-4" />
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1"
            />
            <span>to</span>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {!filtered.length && (
          <div className="grid min-h-[280px] place-items-center rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center text-gray-400">
            No health records yet. Start by analyzing an image or checking symptoms.
          </div>
        )}

        {filtered.map((record) => (
          <article key={record.id} className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <button
              type="button"
              onClick={() => setExpandedId((prev) => (prev === record.id ? "" : record.id))}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-cyan-300">{record.type}</p>
                <p className="mt-1 text-sm text-gray-100">{record.summary}</p>
                <p className="mt-1 text-xs text-gray-400">{fmtDate(record.date)}</p>
              </div>
              <SeverityBadge severity={record.severity || "Not specified"} />
            </button>

            {expandedId === record.id && (
              <div className="mt-3 rounded-xl border border-gray-800 bg-gray-950/70 p-3 text-sm text-gray-300 whitespace-pre-wrap">
                {record.content}
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-200"
        >
          <Eraser className="h-4 w-4" /> Clear History
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-5">
            <p className="flex items-center gap-2 text-white">
              <TriangleAlert className="h-4 w-4 text-rose-300" /> Confirm Clear History
            </p>
            <p className="mt-2 text-sm text-gray-300">This action removes all saved health records.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-gray-700 px-3 py-2 text-sm text-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecords([]);
                  setShowConfirm(false);
                  setExpandedId("");
                }}
                className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 inline-flex items-center gap-2 text-xs text-gray-400">
        <History className="h-3.5 w-3.5" />
        Data is stored in your browser localStorage key: radiology_ai_history
      </p>
    </motion.section>
  );
}

export default HealthTimeline;
