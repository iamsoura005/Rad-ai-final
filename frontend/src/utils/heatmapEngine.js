/**
 * RAD-AI Heatmap Engine
 * Parses report text and maps findings to anatomical SVG zones.
 */

// Each anatomy string is rendered inside a 400x500 SVG viewBox.
export const ANATOMY_SVG = {
  chest: `
    <rect width="400" height="500" fill="#111"/>
    <ellipse cx="200" cy="60" rx="55" ry="30" fill="none" stroke="#444" stroke-width="1.5"/>
    <rect x="145" y="55" width="110" height="20" fill="#111"/>
    <rect x="155" y="70" width="90" height="300" rx="10" fill="#1a1a1a" stroke="#333" stroke-width="1"/>
    <ellipse cx="130" cy="250" rx="70" ry="140" fill="#1e1e1e" stroke="#3a3a3a" stroke-width="1.2"/>
    <ellipse cx="270" cy="250" rx="70" ry="140" fill="#1e1e1e" stroke="#3a3a3a" stroke-width="1.2"/>
    <ellipse cx="130" cy="330" rx="60" ry="70" fill="none" stroke="#2a2a2a" stroke-dasharray="3,3"/>
    <ellipse cx="270" cy="330" rx="60" ry="70" fill="none" stroke="#2a2a2a" stroke-dasharray="3,3"/>
    <ellipse cx="130" cy="180" rx="55" ry="60" fill="none" stroke="#2a2a2a" stroke-dasharray="3,3"/>
    <ellipse cx="270" cy="180" rx="55" ry="60" fill="none" stroke="#2a2a2a" stroke-dasharray="3,3"/>
    <ellipse cx="200" cy="260" rx="42" ry="80" fill="#222" stroke="#444" stroke-width="1.5"/>
    <rect x="170" y="140" width="60" height="160" rx="8" fill="#222" stroke="#3a3a3a" stroke-width="1"/>
    <line x1="200" y1="0" x2="200" y2="500" stroke="#1f1f1f" stroke-width="1"/>
    <text x="130" y="455" text-anchor="middle" fill="#444" font-size="10">L Lung</text>
    <text x="270" y="455" text-anchor="middle" fill="#444" font-size="10">R Lung</text>
    <text x="200" y="200" text-anchor="middle" fill="#333" font-size="9">Heart</text>
  `,

  bone_femur: `
    <rect width="400" height="500" fill="#111"/>
    <ellipse cx="200" cy="80" rx="65" ry="50" fill="#252525" stroke="#3a3a3a" stroke-width="1.5"/>
    <rect x="178" y="120" width="44" height="260" rx="6" fill="#252525" stroke="#3a3a3a" stroke-width="1.5"/>
    <ellipse cx="200" cy="390" rx="65" ry="45" fill="#252525" stroke="#3a3a3a" stroke-width="1.5"/>
    <ellipse cx="200" cy="380" rx="55" ry="35" fill="none" stroke="#2a2a2a" stroke-dasharray="2,3"/>
    <text x="200" y="490" text-anchor="middle" fill="#444" font-size="10">Femur</text>
    <line x1="60" y1="120" x2="340" y2="120" stroke="#1f1f1f" stroke-width="0.5" stroke-dasharray="4,4"/>
    <line x1="60" y1="380" x2="340" y2="380" stroke="#1f1f1f" stroke-width="0.5" stroke-dasharray="4,4"/>
    <text x="50" y="84" fill="#333" font-size="9" text-anchor="middle">Head</text>
    <text x="50" y="252" fill="#333" font-size="9" text-anchor="middle">Shaft</text>
    <text x="50" y="394" fill="#333" font-size="9" text-anchor="middle">Distal</text>
  `,

  bone_wrist: `
    <rect width="400" height="500" fill="#111"/>
    <rect x="160" y="40" width="80" height="200" rx="8" fill="#252525" stroke="#3a3a3a" stroke-width="1.5"/>
    <rect x="155" y="235" width="90" height="80" rx="6" fill="#252525" stroke="#3a3a3a" stroke-width="1.5"/>
    <rect x="175" y="230" width="14" height="90" rx="4" fill="#1e1e1e" stroke="#3a3a3a" stroke-width="1"/>
    <rect x="211" y="230" width="14" height="90" rx="4" fill="#1e1e1e" stroke="#3a3a3a" stroke-width="1.2"/>
    <text x="200" y="360" text-anchor="middle" fill="#444" font-size="10">Wrist / Radius</text>
    <text x="200" y="90" text-anchor="middle" fill="#333" font-size="9">Radius</text>
    <text x="200" y="255" text-anchor="middle" fill="#333" font-size="9">Distal</text>
  `,

  brain: `
    <rect width="400" height="500" fill="#111"/>
    <ellipse cx="200" cy="200" rx="155" ry="165" fill="#1e1e1e" stroke="#3a3a3a" stroke-width="1.5"/>
    <ellipse cx="200" cy="200" rx="125" ry="135" fill="none" stroke="#2a2a2a" stroke-width="0.8" stroke-dasharray="4,3"/>
    <path d="M200 35 Q200 200 200 365" stroke="#2a2a2a" stroke-width="1.2" fill="none"/>
    <ellipse cx="130" cy="190" rx="55" ry="90" fill="none" stroke="#2a2a2a" stroke-dasharray="3,3"/>
    <ellipse cx="270" cy="190" rx="55" ry="90" fill="none" stroke="#2a2a2a" stroke-dasharray="3,3"/>
    <ellipse cx="130" cy="100" rx="50" ry="55" fill="none" stroke="#2a2a2a" stroke-dasharray="3,3"/>
    <ellipse cx="270" cy="100" rx="50" ry="55" fill="none" stroke="#2a2a2a" stroke-dasharray="3,3"/>
    <ellipse cx="130" cy="290" rx="50" ry="50" fill="none" stroke="#2a2a2a" stroke-dasharray="3,3"/>
    <ellipse cx="270" cy="290" rx="50" ry="50" fill="none" stroke="#2a2a2a" stroke-dasharray="3,3"/>
    <ellipse cx="200" cy="360" rx="55" ry="30" fill="#1e1e1e" stroke="#333" stroke-width="1"/>
    <ellipse cx="200" cy="165" rx="30" ry="35" fill="#222" stroke="#333" stroke-width="0.8"/>
    <text x="130" y="465" text-anchor="middle" fill="#444" font-size="10">L Hemisphere</text>
    <text x="270" y="465" text-anchor="middle" fill="#444" font-size="10">R Hemisphere</text>
    <text x="200" y="490" text-anchor="middle" fill="#444" font-size="9">Cerebellum</text>
  `,
};

export const REGION_RULES = {
  chest: [
    {
      id: "left_lower_lobe",
      keywords: ["left lower lobe", "left lower", "left lobe pneumonia", "left lung consolidation", "left basal"],
      zones: [{ cx: 130, cy: 330, rx: 62, ry: 72, color: "#FF4500" }],
      label: "Left lower lobe opacity / consolidation",
      location: "Left lower lobe",
      severity: "acute",
    },
    {
      id: "right_lower_lobe",
      keywords: ["right lower lobe", "right lower lung", "right basal consolidation", "right basal"],
      zones: [{ cx: 270, cy: 330, rx: 62, ry: 72, color: "#FF4500" }],
      label: "Right lower lobe opacity / consolidation",
      location: "Right lower lobe",
      severity: "acute",
    },
    {
      id: "left_upper_lobe",
      keywords: ["left upper lobe", "left upper lung", "left apical", "left apex"],
      zones: [{ cx: 130, cy: 175, rx: 55, ry: 65, color: "#FF4500" }],
      label: "Left upper lobe finding",
      location: "Left upper lobe",
      severity: "acute",
    },
    {
      id: "right_upper_lobe",
      keywords: ["right upper lobe", "right upper lung", "right apical", "right apex", "right upper lobe mass"],
      zones: [{ cx: 270, cy: 175, rx: 55, ry: 65, color: "#FF4500" }],
      label: "Right upper lobe finding / mass",
      location: "Right upper lobe",
      severity: "acute",
    },
    {
      id: "left_lung",
      keywords: ["left lung", "left pleural effusion", "left hemothorax"],
      zones: [{ cx: 130, cy: 250, rx: 68, ry: 140, color: "#FF6B35" }],
      label: "Left lung finding",
      location: "Left lung",
      severity: "significant",
    },
    {
      id: "right_lung",
      keywords: ["right lung", "right pleural effusion", "right hemothorax"],
      zones: [{ cx: 270, cy: 250, rx: 68, ry: 140, color: "#FF6B35" }],
      label: "Right lung finding",
      location: "Right lung",
      severity: "significant",
    },
    {
      id: "bilateral_lungs",
      keywords: ["bilateral", "both lungs", "bilateral pleural", "bibasal", "bilateral effusion"],
      zones: [
        { cx: 130, cy: 250, rx: 68, ry: 140, color: "#FF6B35" },
        { cx: 270, cy: 250, rx: 68, ry: 140, color: "#FF6B35" },
      ],
      label: "Bilateral lung findings",
      location: "Both lungs",
      severity: "significant",
    },
    {
      id: "heart",
      keywords: ["cardiomegaly", "cardiac enlargement", "pericardial effusion", "enlarged heart", "heart / cardiac"],
      zones: [{ cx: 200, cy: 260, rx: 44, ry: 82, color: "#FFD700" }],
      label: "Cardiac finding",
      location: "Heart / Pericardium",
      severity: "moderate",
    },
    {
      id: "mediastinum",
      keywords: ["mediastinal widening", "widened mediastinum", "mediastinal mass", "mediastinum"],
      zones: [{ cx: 200, cy: 220, rx: 40, ry: 100, color: "#FF8C00" }],
      label: "Mediastinal widening / mass",
      location: "Mediastinum",
      severity: "significant",
    },
  ],

  bone_femur: [
    {
      id: "femur_head",
      keywords: ["femoral head", "femoral neck", "subcapital", "neck of femur", "intracapsular", "hip fracture"],
      zones: [{ cx: 200, cy: 80, rx: 60, ry: 50, color: "#FF4500" }],
      label: "Femoral head / neck fracture",
      location: "Proximal femur / Hip",
      severity: "acute",
    },
    {
      id: "femur_midshaft",
      keywords: ["mid-shaft", "midshaft", "shaft fracture", "transverse fracture", "mid shaft", "diaphyseal"],
      zones: [{ cx: 200, cy: 248, rx: 30, ry: 22, color: "#FF4500" }],
      label: "Mid-shaft femur fracture",
      location: "Femur mid-shaft",
      severity: "acute",
    },
    {
      id: "femur_distal",
      keywords: ["distal femur", "supracondylar", "condylar fracture", "distal fracture"],
      zones: [{ cx: 200, cy: 385, rx: 55, ry: 40, color: "#FF4500" }],
      label: "Distal femur fracture",
      location: "Distal femur",
      severity: "acute",
    },
    {
      id: "knee_joint",
      keywords: ["knee", "joint space", "osteophyte", "medial compartment", "lateral compartment", "tibial plateau", "meniscus"],
      zones: [{ cx: 200, cy: 388, rx: 60, ry: 38, color: "#FFD700" }],
      label: "Knee joint pathology",
      location: "Knee joint",
      severity: "moderate",
    },
    {
      id: "comminuted",
      keywords: ["comminution", "comminuted", "butterfly fragment", "segmental fracture"],
      zones: [{ cx: 200, cy: 248, rx: 38, ry: 35, color: "#CC0000" }],
      label: "Comminuted fracture",
      location: "Fracture site",
      severity: "critical",
    },
  ],

  bone_wrist: [
    {
      id: "distal_radius",
      keywords: ["distal radius", "colles", "colles fracture", "smith fracture", "distal radial"],
      zones: [{ cx: 200, cy: 255, rx: 50, ry: 38, color: "#FF4500" }],
      label: "Distal radius fracture",
      location: "Distal radius",
      severity: "acute",
    },
    {
      id: "radial_shaft",
      keywords: ["radial shaft", "radius shaft", "radius fracture"],
      zones: [{ cx: 200, cy: 130, rx: 32, ry: 80, color: "#FF4500" }],
      label: "Radial shaft fracture",
      location: "Radius shaft",
      severity: "acute",
    },
    {
      id: "ulnar",
      keywords: ["ulnar", "ulna fracture", "galeazzi", "both bones"],
      zones: [{ cx: 218, cy: 200, rx: 18, ry: 100, color: "#FF6B35" }],
      label: "Ulnar fracture",
      location: "Ulna",
      severity: "acute",
    },
  ],

  brain: [
    {
      id: "left_temporal",
      keywords: ["left temporal", "left temporal lobe"],
      zones: [{ cx: 120, cy: 210, rx: 52, ry: 75, color: "#FF4500" }],
      label: "Left temporal lobe lesion",
      location: "Left temporal lobe",
      severity: "acute",
    },
    {
      id: "right_temporal",
      keywords: ["right temporal", "right temporal lobe"],
      zones: [{ cx: 280, cy: 210, rx: 52, ry: 75, color: "#FF4500" }],
      label: "Right temporal lobe lesion",
      location: "Right temporal lobe",
      severity: "acute",
    },
    {
      id: "left_frontal",
      keywords: ["left frontal", "left frontal lobe"],
      zones: [{ cx: 120, cy: 105, rx: 48, ry: 55, color: "#FF4500" }],
      label: "Left frontal lobe lesion",
      location: "Left frontal lobe",
      severity: "acute",
    },
    {
      id: "right_frontal",
      keywords: ["right frontal", "right frontal lobe"],
      zones: [{ cx: 280, cy: 105, rx: 48, ry: 55, color: "#FF4500" }],
      label: "Right frontal lobe lesion",
      location: "Right frontal lobe",
      severity: "acute",
    },
    {
      id: "left_parietal",
      keywords: ["left parietal", "left parietal lobe"],
      zones: [{ cx: 120, cy: 295, rx: 48, ry: 50, color: "#FF4500" }],
      label: "Left parietal lesion",
      location: "Left parietal lobe",
      severity: "acute",
    },
    {
      id: "right_parietal",
      keywords: ["right parietal", "right parietal lobe"],
      zones: [{ cx: 280, cy: 295, rx: 48, ry: 50, color: "#FF4500" }],
      label: "Right parietal lesion",
      location: "Right parietal lobe",
      severity: "acute",
    },
    {
      id: "midline_shift",
      keywords: ["midline shift", "midline deviation"],
      zones: [{ cx: 200, cy: 200, rx: 12, ry: 150, color: "#FFD700" }],
      label: "Midline shift",
      location: "Central / Midline",
      severity: "moderate",
    },
    {
      id: "bilateral_brain",
      keywords: ["bilateral hemisphere", "both hemisphere", "diffuse"],
      zones: [
        { cx: 130, cy: 200, rx: 120, ry: 140, color: "#FF6B35" },
        { cx: 270, cy: 200, rx: 120, ry: 140, color: "#FF6B35" },
      ],
      label: "Bilateral hemispheric finding",
      location: "Both hemispheres",
      severity: "significant",
    },
    {
      id: "cerebellum",
      keywords: ["cerebellum", "cerebellar", "posterior fossa"],
      zones: [{ cx: 200, cy: 360, rx: 55, ry: 32, color: "#FF4500" }],
      label: "Cerebellar / Posterior fossa finding",
      location: "Cerebellum",
      severity: "acute",
    },
  ],
};

const PATHOLOGY_COLOR_OVERRIDES = {
  hemorrhage: "#CC0000",
  haemorrhage: "#CC0000",
  "acute hemorrhage": "#CC0000",
  infarct: "#FF8C00",
  ischemic: "#FF8C00",
  ischaemic: "#FF8C00",
  malignant: "#9400D3",
  tumor: "#9400D3",
  mass: "#FF4500",
  abscess: "#FF6B35",
};

const NORMAL_INDICATORS = [
  "no acute",
  "normal study",
  "normal radiograph",
  "clear bilaterally",
  "no fracture",
  "no dislocation",
  "unremarkable",
  "no pneumothorax",
  "no consolidation",
  "no effusion",
  "no mass",
  "no hemorrhage",
  "no infarct",
  "no abnormality",
  "within normal limits",
  "no significant",
  "normal chest",
  "normal brain",
  "heatmap locations: none",
];

const ABNORMAL_INDICATORS = [
  "consolidation",
  "fracture",
  "effusion",
  "mass",
  "hemorrhage",
  "opacity",
  "infarct",
  "lesion",
  "pneumonia",
  "cardiomegaly",
  "widening",
  "shift",
  "edema",
  "comminution",
  "osteophyte",
  "hyperdense",
  "hypodense",
  "atelectasis",
];

const NEGATION_PATTERN = /(no|without|absent|negative for|free of|no evidence of|no sign of)\s+(\w+\s+){0,4}$/i;

const SCAN_TYPE_HINTS = {
  chest: ["chest", "thorax", "lung", "pleural", "mediastin", "cardiac", "pneumonia", "effusion"],
  bone_femur: ["femur", "femoral", "hip fracture", "supracondylar", "diaphyseal", "mid-shaft", "knee"],
  bone_wrist: ["wrist", "radius", "ulna", "radial", "colles", "smith", "galeazzi"],
  brain: ["brain", "intracranial", "temporal", "frontal", "parietal", "cerebell", "midline shift", "hemorrhage"],
};

function normalizeText(value = "") {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function isPositiveMention(text, phrase) {
  let index = text.indexOf(phrase);
  while (index !== -1) {
    const lookbehindStart = Math.max(0, index - 45);
    const prefix = text.slice(lookbehindStart, index);
    if (!NEGATION_PATTERN.test(prefix)) {
      return true;
    }
    index = text.indexOf(phrase, index + phrase.length);
  }
  return false;
}

function scoreScanType(scanType, sourceText) {
  return SCAN_TYPE_HINTS[scanType].reduce((score, token) => {
    if (sourceText.includes(token)) {
      return score + 1;
    }
    return score;
  }, 0);
}

export function inferScanType(report = "", hints = {}) {
  const sourceText = normalizeText(
    [report, hints.imageType, hints.regionAnalyzed, ...(hints.backendRegions || [])].filter(Boolean).join(" ")
  );

  let bestType = "chest";
  let bestScore = -1;

  for (const scanType of Object.keys(SCAN_TYPE_HINTS)) {
    const currentScore = scoreScanType(scanType, sourceText);
    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestType = scanType;
    }
  }

  return bestType;
}

/**
 * parseReport(report, scanType)
 * @returns {{ isNormal: boolean, findings: Array, heatZones: Array }}
 */
export function parseReport(report, scanType) {
  const text = normalizeText(report);
  const rules = REGION_RULES[scanType] || [];

  const hasNormalIndicator = NORMAL_INDICATORS.some((phrase) => text.includes(phrase));
  const hasAbnormal = ABNORMAL_INDICATORS.some((phrase) => isPositiveMention(text, phrase));

  if (!hasAbnormal) {
    return { isNormal: true, findings: [], heatZones: [] };
  }

  let globalColorOverride = null;
  for (const [phrase, color] of Object.entries(PATHOLOGY_COLOR_OVERRIDES)) {
    if (isPositiveMention(text, phrase)) {
      globalColorOverride = color;
      break;
    }
  }

  const findings = [];
  const heatZones = [];
  const matched = new Set();

  for (const rule of rules) {
    if (matched.has(rule.id)) continue;

    const isMatch = rule.keywords.some((keyword) => isPositiveMention(text, keyword));
    if (!isMatch) continue;

    matched.add(rule.id);

    const zones = rule.zones.map((zone) => ({
      ...zone,
      color: globalColorOverride || zone.color,
    }));

    heatZones.push(...zones);
    findings.push({
      id: rule.id,
      label: rule.label,
      location: rule.location,
      severity: rule.severity,
      color: globalColorOverride || zones[0]?.color || "#FF4500",
    });
  }

  return {
    isNormal: findings.length === 0 && hasNormalIndicator,
    findings,
    heatZones,
  };
}
