const ANALYSIS_TITLE_BY_NUMBER = {
  1: "Image Type",
  2: "Region Analyzed",
  3: "Key Observations",
  4: "Possible Conditions",
  5: "Severity Assessment",
  6: "Clinical Explanation",
  7: "Confidence Score",
  8: "Recommendation",
};

function maybeRejoinOversplitLines(text) {
  const lines = text.split("\n").map((line) => line.trim());
  const nonEmpty = lines.filter(Boolean);
  if (nonEmpty.length < 12) return text;

  const shortFragments = nonEmpty.filter(
    (line) => line.length <= 18 && !/[.:;!?]/.test(line) && !/^\d+\s*\./.test(line)
  ).length;
  const ratio = shortFragments / nonEmpty.length;
  if (ratio < 0.58) return text;

  return nonEmpty
    .join(" ")
    .replace(/\s+([,.:;!?])/g, "$1")
    .replace(/(\d)\s+\./g, "$1.")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeText(raw = "") {
  const normalized = raw
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\*\*/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return maybeRejoinOversplitLines(normalized);
}

function cleanSectionValue(text = "") {
  return text
    .replace(/^[-•]\s*/, "")
    .replace(/^[:\-\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toList(raw = "") {
  const normalized = raw.replace(/\r/g, "").trim();
  if (!normalized) return [];

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-•\d.)\s]+/, "").trim())
    .filter(Boolean);

  if (lines.length > 1) return lines;

  return normalized
    .split(/\s+-\s+/)
    .map((part) => cleanSectionValue(part))
    .filter(Boolean);
}

function extractNumber(raw, max = 100) {
  const found = (raw || "").match(/(\d{1,3})(?:\s*\/\s*10|\s*%|\b)/);
  if (!found) return 0;
  const n = Number(found[1]);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(max, n));
}

function extractBodyFromBlock(block, number) {
  const withoutPrefix = block.replace(new RegExp(`^${number}\\s*\\.\\s*`), "").trim();

  const colonIndex = withoutPrefix.indexOf(":");
  if (colonIndex !== -1 && colonIndex < 120) {
    return withoutPrefix.slice(colonIndex + 1).trim();
  }

  const lines = withoutPrefix
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines.slice(1).join("\n").trim();
  }

  const knownTitle = ANALYSIS_TITLE_BY_NUMBER[number] || "";
  return withoutPrefix
    .replace(new RegExp(`^${knownTitle.replace(/\s+/g, "\\s+")}\\s*:?`, "i"), "")
    .trim();
}

function numberedSections(text) {
  const map = {};
  const matches = [...text.matchAll(/([1-8])\s*\.\s+/g)];
  if (!matches.length) return map;

  for (let idx = 0; idx < matches.length; idx += 1) {
    const number = Number(matches[idx][1]);
    if (number < 1 || number > 8) continue;

    const start = matches[idx].index;
    const end = idx + 1 < matches.length ? matches[idx + 1].index : text.length;
    const block = text.slice(start, end).trim();
    const bodyRaw = extractBodyFromBlock(block, number);
    const bodyLines = toList(bodyRaw);

    map[number] = {
      title: ANALYSIS_TITLE_BY_NUMBER[number] || `Section ${number}`,
      raw: bodyRaw,
      body: bodyLines,
    };
  }

  return map;
}

function fallbackByLabels(text) {
  const defs = [
    { number: 1, regex: /image\s*type\s*:/i },
    { number: 2, regex: /region\s*analy[sz]ed\s*:/i },
    { number: 3, regex: /key\s*observations\s*:/i },
    { number: 4, regex: /possible\s*condition(?:\(s\))?s?\s*:/i },
    { number: 5, regex: /severity\s*assessment\s*:/i },
    { number: 6, regex: /clinical\s*explanation\s*:/i },
    { number: 7, regex: /confidence\s*score\s*:/i },
    { number: 8, regex: /recommendation\s*:/i },
  ];

  const found = defs
    .map((def) => {
      const match = text.match(def.regex);
      if (!match?.index && match?.index !== 0) return null;
      return { ...def, index: match.index };
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  const map = {};
  for (let idx = 0; idx < found.length; idx += 1) {
    const current = found[idx];
    const next = found[idx + 1];
    const start = current.index;
    const end = next ? next.index : text.length;
    const block = text.slice(start, end);
    const bodyRaw = block.replace(current.regex, "").trim();

    map[current.number] = {
      title: ANALYSIS_TITLE_BY_NUMBER[current.number],
      raw: bodyRaw,
      body: toList(bodyRaw),
    };
  }

  return map;
}

function sectionMap(text) {
  const normalized = normalizeText(text);
  const numbered = numberedSections(normalized);
  if (Object.keys(numbered).length >= 3) return numbered;

  const fallback = fallbackByLabels(normalized);
  if (Object.keys(fallback).length) return fallback;
  return numbered;
}

export function parseAnalysis(rawText) {
  const normalized = normalizeText(rawText);
  const sections = sectionMap(normalized);

  const imageTypeRaw = sections[1]?.raw || "";
  const regionRaw = sections[2]?.raw || "";
  const observationsRaw = sections[3]?.body || [];
  const possibleRaw = sections[4]?.body || [];
  const severityRaw = sections[5]?.raw || normalized;
  const explanationRaw = sections[6]?.raw || "";
  const confidenceRaw = sections[7]?.raw || normalized;
  const recommendationRaw = sections[8]?.raw || "";

  const severityLabelMatch = severityRaw.match(/\b(Mild|Moderate|Severe|Critical)\b/i);

  return {
    imageType: cleanSectionValue(imageTypeRaw) || "Not specified",
    regionAnalyzed: cleanSectionValue(regionRaw) || "Not specified",
    keyObservations: observationsRaw.map(cleanSectionValue).filter(Boolean),
    possibleConditions: possibleRaw.map(cleanSectionValue).filter(Boolean),
    severity: severityLabelMatch ? severityLabelMatch[1] : "Not specified",
    severityScore: extractNumber(severityRaw, 10),
    clinicalExplanation: cleanSectionValue(explanationRaw) || "No explanation provided.",
    confidenceScore: extractNumber(confidenceRaw, 100),
    recommendation: cleanSectionValue(recommendationRaw) || "No recommendation provided.",
    raw: normalized,
  };
}

export function parseSymptomResponse(raw = "") {
  const normalized = normalizeText(raw);
  const sections = sectionMap(normalized);
  const urgencyRaw = sections[2]?.raw || normalized;

  return {
    probableConditions: (sections[1]?.body || []).map(cleanSectionValue).filter(Boolean),
    urgencyLevel: cleanSectionValue(urgencyRaw) || "Not specified",
    possibleCauses: (sections[3]?.body || []).map(cleanSectionValue).filter(Boolean),
    nextSteps: (sections[4]?.body || []).map(cleanSectionValue).filter(Boolean),
    safetyNote: cleanSectionValue(sections[5]?.raw || ""),
    raw: normalized,
  };
}

export function parseMedicineResponse(raw = "") {
  const normalized = normalizeText(raw);
  const sections = sectionMap(normalized);
  return {
    genericNameAndClass: cleanSectionValue(sections[1]?.raw || ""),
    uses: cleanSectionValue(sections[2]?.raw || ""),
    dosage: cleanSectionValue(sections[3]?.raw || ""),
    sideEffects: cleanSectionValue(sections[4]?.raw || ""),
    contraindications: cleanSectionValue(sections[5]?.raw || ""),
    interactions: cleanSectionValue(sections[6]?.raw || ""),
    storage: cleanSectionValue(sections[7]?.raw || ""),
    disclaimer: cleanSectionValue(sections[8]?.raw || ""),
    raw: normalized,
  };
}
