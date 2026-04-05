import re
from typing import Dict, List

REGION_CANONICAL = {
    "left_lung": (
        "left lung",
        "left pulmonary",
        "left hemithorax",
    ),
    "right_lung": (
        "right lung",
        "right pulmonary",
        "right hemithorax",
    ),
    "upper_lung": (
        "upper lung",
        "upper lobe",
        "apical",
    ),
    "lower_lung": (
        "lower lung",
        "lower lobe",
        "basal",
    ),
    "brain": (
        "brain",
        "intracranial",
        "cerebral",
        "cranial",
    ),
    "left_temporal": (
        "left temporal",
        "left temporal lobe",
    ),
    "right_temporal": (
        "right temporal",
        "right temporal lobe",
    ),
    "left_frontal": (
        "left frontal",
        "left frontal lobe",
    ),
    "right_frontal": (
        "right frontal",
        "right frontal lobe",
    ),
    "left_parietal": (
        "left parietal",
        "left parietal lobe",
    ),
    "right_parietal": (
        "right parietal",
        "right parietal lobe",
    ),
    "midline": (
        "midline shift",
        "midline deviation",
        "mass effect",
    ),
    "cerebellum": (
        "cerebellum",
        "cerebellar",
        "posterior fossa",
    ),
    "chest": (
        "chest",
        "thorax",
        "thoracic",
    ),
    "femur_head": (
        "femoral head",
        "femoral neck",
        "hip fracture",
        "subcapital",
        "neck of femur",
    ),
    "femur_shaft": (
        "femur shaft",
        "femoral shaft",
        "mid-shaft",
        "midshaft",
        "diaphyseal",
        "transverse fracture",
    ),
    "femur_distal": (
        "distal femur",
        "supracondylar",
        "condylar fracture",
    ),
    "knee_joint": (
        "knee",
        "knee joint",
        "joint space",
        "osteophyte",
        "tibial plateau",
    ),
    "distal_radius": (
        "distal radius",
        "distal radial",
        "colles",
        "smith fracture",
        "wrist fracture",
    ),
    "radial_shaft": (
        "radial shaft",
        "radius shaft",
        "radius fracture",
    ),
    "ulna": (
        "ulna",
        "ulnar",
        "ulnar fracture",
    ),
    "wrist_joint": (
        "wrist",
        "radiocarpal",
        "carpal",
    ),
}

DETECTED_REGION_LINE = re.compile(r"detected\s*region\s*:\s*([^\n\r]+)", re.IGNORECASE)
HEATMAP_LOCATIONS_LINE = re.compile(r"heatmap\s*locations\s*:\s*([^\n\r]+)", re.IGNORECASE)
PATHOLOGY_TERMS = (
    "opacity",
    "lesion",
    "nodule",
    "infiltrate",
    "consolidation",
    "mass",
    "effusion",
    "edema",
    "fracture",
    "hemorrhage",
    "haemorrhage",
    "infarct",
    "ischemic",
    "ischaemic",
    "dislocation",
    "comminuted",
    "comminution",
    "hyperdense",
    "hypodense",
    "shift",
)

NEGATION_PATTERN = re.compile(
    r"(no|without|absent|negative\s+for|free\s+of|no\s+evidence\s+of|no\s+sign\s+of)\s+(\w+\s+){0,4}$",
    re.IGNORECASE,
)

REGION_BASE_WEIGHT = {
    "left_lung": 0.8,
    "right_lung": 0.8,
    "upper_lung": 0.7,
    "lower_lung": 0.7,
    "brain": 0.75,
    "left_temporal": 0.9,
    "right_temporal": 0.9,
    "left_frontal": 0.9,
    "right_frontal": 0.9,
    "left_parietal": 0.85,
    "right_parietal": 0.85,
    "midline": 0.9,
    "cerebellum": 0.85,
    "chest": 0.45,
    "femur_head": 0.9,
    "femur_shaft": 0.9,
    "femur_distal": 0.9,
    "knee_joint": 0.8,
    "distal_radius": 0.92,
    "radial_shaft": 0.88,
    "ulna": 0.85,
    "wrist_joint": 0.75,
}


def _normalize(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def _canonical_from_hint(hint_value: str) -> List[str]:
    hint_text = _normalize(hint_value)
    found: List[str] = []

    for canonical, aliases in REGION_CANONICAL.items():
        if canonical in hint_text or any(alias in hint_text for alias in aliases):
            found.append(canonical)

    return found


def _set_max_weight(weights: Dict[str, float], region: str, score: float) -> None:
    previous = weights.get(region, 0.0)
    if score > previous:
        weights[region] = score


def _phrase_boost(text: str, phrase: str) -> float:
    if phrase not in text:
        return 0.0

    boosted = 0.0
    for pathology in PATHOLOGY_TERMS:
        pattern = rf"({re.escape(phrase)}).{{0,36}}({re.escape(pathology)})|({re.escape(pathology)}).{{0,36}}({re.escape(phrase)})"
        if re.search(pattern, text):
            boosted = max(boosted, 0.25)
    return boosted


def _is_positive_mention(text: str, phrase: str) -> bool:
    index = text.find(phrase)
    while index != -1:
        lookbehind_start = max(0, index - 48)
        prefix = text[lookbehind_start:index]
        if not NEGATION_PATTERN.search(prefix):
            return True
        index = text.find(phrase, index + len(phrase))
    return False


def _has_positive_abnormal_mention(text: str) -> bool:
    return any(_is_positive_mention(text, term) for term in PATHOLOGY_TERMS)


def _extract_hinted_regions(report_text: str) -> List[str]:
    found: List[str] = []

    detected_region_match = DETECTED_REGION_LINE.search(report_text or "")
    if detected_region_match:
        found.extend(_canonical_from_hint(detected_region_match.group(1)))

    heatmap_locations_match = HEATMAP_LOCATIONS_LINE.search(report_text or "")
    if heatmap_locations_match:
        locations_raw = heatmap_locations_match.group(1)
        for token in locations_raw.split(","):
            found.extend(_canonical_from_hint(token))

    # Preserve order while deduplicating.
    deduped: List[str] = []
    seen = set()
    for region in found:
        if region in seen:
            continue
        seen.add(region)
        deduped.append(region)

    return deduped


def extract_region_weights(report_text: str) -> Dict[str, float]:
    text = _normalize(report_text or "")
    weights: Dict[str, float] = {}

    if not _has_positive_abnormal_mention(text):
        return weights

    hinted_regions = _extract_hinted_regions(report_text)
    for region in hinted_regions:
        hinted_score = REGION_BASE_WEIGHT.get(region, 0.5) + 0.22
        _set_max_weight(weights, region, hinted_score)

    for region, aliases in REGION_CANONICAL.items():
        base = REGION_BASE_WEIGHT.get(region, 0.5)
        for alias in aliases:
            if _is_positive_mention(text, alias):
                score = base + _phrase_boost(text, alias)
                _set_max_weight(weights, region, score)

    return weights


def extract_region(report_text: str) -> List[str]:
    weighted = extract_region_weights(report_text)
    return sorted(weighted.keys(), key=lambda key: weighted[key], reverse=True)


def infer_intensity_from_report(report_text: str) -> float:
    text = _normalize(report_text)

    if "critical" in text:
        return 1.1
    if "severe" in text:
        return 1.0
    if "moderate" in text:
        return 0.8
    if "mild" in text:
        return 0.5
    return 0.75
