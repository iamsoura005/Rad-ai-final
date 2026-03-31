import base64
import io
import random
from typing import Dict, Iterable, Optional

import cv2
import numpy as np
from PIL import Image


def get_region_mask(shape: tuple, region: str) -> np.ndarray:
    h, w = shape[:2]
    mask = np.zeros((h, w), dtype=np.float32)

    if region == "left_lung":
        mask[:, : w // 2] = 1.0
    elif region == "right_lung":
        mask[:, w // 2 :] = 1.0
    elif region == "upper_lung":
        mask[: h // 2, :] = 1.0
    elif region == "lower_lung":
        mask[h // 2 :, :] = 1.0
    elif region == "brain":
        mask[h // 6 : (4 * h) // 6, w // 5 : (4 * w) // 5] = 1.0
    elif region == "chest":
        mask[h // 5 : (4 * h) // 5, :] = 1.0
    else:
        # Fallback to center area if no known region is matched.
        mask[h // 4 : (3 * h) // 4, w // 4 : (3 * w) // 4] = 1.0

    return mask


def generate_region_based_cam(
    image_shape: tuple,
    regions: Iterable[str],
    intensity: float = 1.0,
    region_weights: Optional[Dict[str, float]] = None,
) -> np.ndarray:
    h, w = image_shape[:2]
    cam = np.zeros((h, w), dtype=np.float32)

    resolved_regions = list(regions) if regions else ["center"]

    xv, yv = np.meshgrid(np.arange(w), np.arange(h))

    for region in resolved_regions:
        mask = get_region_mask(image_shape, region)
        ys, xs = np.where(mask == 1.0)

        if len(xs) == 0:
            continue

        idx = random.randint(0, len(xs) - 1)
        x, y = xs[idx], ys[idx]
        sigma = random.randint(max(20, min(h, w) // 18), max(35, min(h, w) // 8))
        local_weight = (region_weights or {}).get(region, 1.0)

        blob = np.exp(-((xv - x) ** 2 + (yv - y) ** 2) / (2.0 * sigma**2)).astype(np.float32)
        cam += blob * mask * float(local_weight)

    cam *= max(0.1, float(intensity))
    cam = cam - cam.min()

    max_val = cam.max()
    if max_val > 0:
        cam = cam / max_val

    cam = cv2.GaussianBlur(cam, (21, 21), 0)
    return cam


def overlay_heatmap(image_bgr: np.ndarray, cam: np.ndarray, alpha: float = 0.45) -> np.ndarray:
    heat = np.uint8(np.clip(cam, 0.0, 1.0) * 255)
    colored = cv2.applyColorMap(heat, cv2.COLORMAP_JET)
    return cv2.addWeighted(colored, alpha, image_bgr, 1 - alpha, 0)


def decode_upload_to_bgr(file_bytes: bytes) -> np.ndarray:
    pil_image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    rgb = np.array(pil_image)
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def bgr_image_to_base64_png(image_bgr: np.ndarray) -> str:
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    output = io.BytesIO()
    pil.save(output, format="PNG")
    return base64.b64encode(output.getvalue()).decode("utf-8")
