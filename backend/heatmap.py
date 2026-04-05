import base64
import io
from typing import Iterable, Optional

import cv2
import numpy as np
from PIL import Image


def decode_upload_to_bgr(file_bytes: bytes) -> np.ndarray:
    pil_image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    rgb = np.array(pil_image)
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def _focus_mask_from_cam(cam_resized: np.ndarray) -> np.ndarray:
    cam_norm = np.clip(cam_resized.astype(np.float32), 0.0, 1.0)
    if not np.any(cam_norm > 0):
        return np.zeros_like(cam_norm, dtype=np.float32)

    threshold = max(0.75, float(np.percentile(cam_norm, 92)))
    binary = (cam_norm >= threshold).astype(np.uint8)

    if binary.sum() == 0:
        binary = (cam_norm >= (cam_norm.max() * 0.9)).astype(np.uint8)

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)

    if num_labels <= 1:
        component_mask = binary
    else:
        peak_y, peak_x = np.unravel_index(int(np.argmax(cam_norm)), cam_norm.shape)
        peak_label = labels[peak_y, peak_x]

        if peak_label > 0:
            selected = peak_label
        else:
            areas = stats[1:, cv2.CC_STAT_AREA]
            selected = int(np.argmax(areas)) + 1

        component_mask = (labels == selected).astype(np.uint8)

    min_dim = min(cam_norm.shape[:2])
    kernel_size = max(3, int(min_dim * 0.03) | 1)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    expanded = cv2.dilate(component_mask, kernel, iterations=1)

    soft_mask = cv2.GaussianBlur(expanded.astype(np.float32), (0, 0), sigmaX=max(1.5, min_dim * 0.01))
    max_val = float(soft_mask.max())
    if max_val > 0:
        soft_mask /= max_val
    return soft_mask


def _get_region_mask(shape: tuple, region: str) -> np.ndarray:
    h, w = shape[:2]
    mask = np.zeros((h, w), dtype=np.float32)

    # Chest / lungs
    if region == "left_lung":
        mask[:, : w // 2] = 1.0
    elif region == "right_lung":
        mask[:, w // 2 :] = 1.0
    elif region == "upper_lung":
        mask[: h // 2, :] = 1.0
    elif region == "lower_lung":
        mask[h // 2 :, :] = 1.0
    elif region == "chest":
        mask[h // 5 : (4 * h) // 5, :] = 1.0

    # Brain
    elif region == "brain":
        mask[h // 7 : (6 * h) // 7, w // 6 : (5 * w) // 6] = 1.0
    elif region == "left_temporal":
        mask[h // 3 : (2 * h) // 3, w // 10 : (9 * w) // 20] = 1.0
    elif region == "right_temporal":
        mask[h // 3 : (2 * h) // 3, (11 * w) // 20 : (9 * w) // 10] = 1.0
    elif region == "left_frontal":
        mask[h // 12 : (2 * h) // 5, w // 10 : (9 * w) // 20] = 1.0
    elif region == "right_frontal":
        mask[h // 12 : (2 * h) // 5, (11 * w) // 20 : (9 * w) // 10] = 1.0
    elif region == "left_parietal":
        mask[(3 * h) // 7 : (9 * h) // 10, w // 10 : (9 * w) // 20] = 1.0
    elif region == "right_parietal":
        mask[(3 * h) // 7 : (9 * h) // 10, (11 * w) // 20 : (9 * w) // 10] = 1.0
    elif region == "midline":
        mask[:, (9 * w) // 20 : (11 * w) // 20] = 1.0
    elif region == "cerebellum":
        mask[(7 * h) // 10 : h, (3 * w) // 10 : (7 * w) // 10] = 1.0

    # Femur / knee
    elif region == "femur_head":
        mask[: h // 3, w // 4 : (3 * w) // 4] = 1.0
    elif region == "femur_shaft":
        mask[h // 4 : (4 * h) // 5, (2 * w) // 5 : (3 * w) // 5] = 1.0
    elif region == "femur_distal":
        mask[(3 * h) // 4 : h, w // 4 : (3 * w) // 4] = 1.0
    elif region == "knee_joint":
        mask[(7 * h) // 10 : h, w // 5 : (4 * w) // 5] = 1.0

    # Wrist / radius / ulna
    elif region == "distal_radius":
        mask[h // 4 : (3 * h) // 4, w // 4 : (3 * w) // 5] = 1.0
    elif region == "radial_shaft":
        mask[h // 3 : (2 * h) // 3, (2 * w) // 5 : (9 * w) // 10] = 1.0
    elif region == "ulna":
        mask[(2 * h) // 5 : (4 * h) // 5, (2 * w) // 5 : (9 * w) // 10] = 1.0
    elif region == "wrist_joint":
        mask[h // 4 : (3 * h) // 4, w // 5 : (3 * w) // 5] = 1.0

    return mask


def _build_region_guidance_mask(shape: tuple, regions: Optional[Iterable[str]]) -> np.ndarray:
    h, w = shape[:2]
    if not regions:
        return np.ones((h, w), dtype=np.float32)

    guidance = np.zeros((h, w), dtype=np.float32)
    for region in regions:
        guidance = np.maximum(guidance, _get_region_mask(shape, region))

    if guidance.max() <= 0:
        return np.ones((h, w), dtype=np.float32)

    min_dim = min(h, w)
    guidance = cv2.GaussianBlur(guidance, (0, 0), sigmaX=max(1.5, min_dim * 0.015))
    guidance = np.clip(guidance, 0.0, 1.0)
    return guidance


def apply_heatmap(original_img: np.ndarray, cam: np.ndarray, regions: Optional[Iterable[str]] = None) -> np.ndarray:
    height, width = original_img.shape[:2]
    cam_resized = cv2.resize(np.clip(cam, 0.0, 1.0), (width, height), interpolation=cv2.INTER_CUBIC)
    guidance_mask = _build_region_guidance_mask((height, width), regions)
    guided_cam = cam_resized * guidance_mask

    guided_max = float(guided_cam.max())
    if guided_max <= 1e-8:
        return original_img.copy()

    guided_cam = guided_cam / guided_max
    focus_mask = _focus_mask_from_cam(guided_cam)

    heatmap = cv2.applyColorMap(np.uint8(255 * guided_cam), cv2.COLORMAP_JET).astype(np.float32)
    base = original_img.astype(np.float32)

    # Blend only around focused suspicious region to avoid whole-image heat tint.
    alpha = 0.72
    weight = (focus_mask * alpha)[..., None]
    blended = base * (1.0 - weight) + heatmap * weight
    return np.clip(blended, 0, 255).astype(np.uint8)


def bgr_image_to_base64_png(image_bgr: np.ndarray) -> str:
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    output = io.BytesIO()
    pil.save(output, format="PNG")
    return base64.b64encode(output.getvalue()).decode("utf-8")
