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
    "chest": (
        "chest",
        "thorax",
        "thoracic",
    ),
}

DETECTED_REGION_LINE = re.compile(r"detected\s*region\s*:\s*([^\n\r]+)", re.IGNORECASE)
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
)

REGION_BASE_WEIGHT = {
    "left_lung": 0.8,
    "right_lung": 0.8,
    "upper_lung": 0.7,
    "lower_lung": 0.7,
    "brain": 0.75,
    "chest": 0.45,
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


def extract_region_weights(report_text: str) -> Dict[str, float]:
    text = _normalize(report_text or "")
    weights: Dict[str, float] = {}

    hinted = DETECTED_REGION_LINE.search(report_text or "")
    if hinted:
        hinted_regions = _canonical_from_hint(hinted.group(1))
        for region in hinted_regions:
            hinted_score = REGION_BASE_WEIGHT.get(region, 0.5) + 0.22
            _set_max_weight(weights, region, hinted_score)

    for region, aliases in REGION_CANONICAL.items():
        base = REGION_BASE_WEIGHT.get(region, 0.5)
        for alias in aliases:
            if alias in text:
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
