import base64
import io

import cv2
import numpy as np
from PIL import Image


def decode_upload_to_bgr(file_bytes: bytes) -> np.ndarray:
    pil_image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    rgb = np.array(pil_image)
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def apply_heatmap(original_img: np.ndarray, cam: np.ndarray) -> np.ndarray:
    height, width = original_img.shape[:2]
    cam_resized = cv2.resize(cam, (width, height))
    heatmap = cv2.applyColorMap(np.uint8(255 * np.clip(cam_resized, 0.0, 1.0)), cv2.COLORMAP_JET)
    return cv2.addWeighted(original_img, 0.6, heatmap, 0.4, 0)


def bgr_image_to_base64_png(image_bgr: np.ndarray) -> str:
    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    output = io.BytesIO()
    pil.save(output, format="PNG")
    return base64.b64encode(output.getvalue()).decode("utf-8")
