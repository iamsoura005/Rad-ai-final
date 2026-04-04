import os
import importlib
from typing import Dict, Tuple

import cv2
import numpy as np
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image

try:
    xrv = importlib.import_module("torchxrayvision")
except Exception:
    xrv = None

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_TV_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ]
)


def _resolve_backend_name() -> str:
    requested = (os.getenv("GRADCAM_MODEL_BACKEND") or "torchvision_densenet121").strip().lower()
    aliases = {
        "torchvision": "torchvision_densenet121",
        "densenet": "torchvision_densenet121",
        "densenet121": "torchvision_densenet121",
        "resnet": "torchvision_resnet50",
        "resnet50": "torchvision_resnet50",
        "xrv": "torchxrayvision_densenet",
        "torchxrayvision": "torchxrayvision_densenet",
    }
    return aliases.get(requested, requested)


def _find_last_conv_layer(net: torch.nn.Module) -> Tuple[torch.nn.Module, str]:
    candidate_name = ""
    candidate_layer = None
    for name, layer in net.named_modules():
        if isinstance(layer, torch.nn.Conv2d):
            candidate_name = name
            candidate_layer = layer

    if candidate_layer is None:
        raise RuntimeError("No Conv2d layer found in model for Grad-CAM target.")

    return candidate_layer, candidate_name


def _build_torchvision_densenet() -> Tuple[torch.nn.Module, torch.nn.Module, Dict[str, str]]:
    try:
        weights = models.DenseNet121_Weights.IMAGENET1K_V1
        net = models.densenet121(weights=weights)
        weights_name = "imagenet1k"
    except Exception:
        net = models.densenet121(weights=None)
        weights_name = "random_init"

    target = net.features.denseblock4.denselayer16.conv2
    return net, target, {"weights": weights_name, "target_layer_name": "features.denseblock4.denselayer16.conv2"}


def _build_torchvision_resnet50() -> Tuple[torch.nn.Module, torch.nn.Module, Dict[str, str]]:
    try:
        weights = models.ResNet50_Weights.IMAGENET1K_V2
        net = models.resnet50(weights=weights)
        weights_name = "imagenet1k"
    except Exception:
        net = models.resnet50(weights=None)
        weights_name = "random_init"

    target, target_name = _find_last_conv_layer(net)
    return net, target, {"weights": weights_name, "target_layer_name": target_name}


def _build_torchxrayvision_densenet() -> Tuple[torch.nn.Module, torch.nn.Module, Dict[str, str]]:
    if xrv is None:
        raise RuntimeError(
            "TorchXRayVision backend requested but package is not installed. "
            "Install with: pip install torchxrayvision"
        )

    weights = (os.getenv("GRADCAM_XRV_WEIGHTS") or "densenet121-res224-all").strip()
    net = xrv.models.DenseNet(weights=weights)
    target, target_name = _find_last_conv_layer(net)
    return net, target, {"weights": weights, "target_layer_name": target_name}


def _build_model() -> Tuple[torch.nn.Module, torch.nn.Module, Dict[str, str]]:
    backend = _resolve_backend_name()

    if backend == "torchvision_resnet50":
        net, target, extra = _build_torchvision_resnet50()
        display_name = "torchvision/resnet50"
    elif backend == "torchxrayvision_densenet":
        net, target, extra = _build_torchxrayvision_densenet()
        display_name = "torchxrayvision/densenet"
    else:
        net, target, extra = _build_torchvision_densenet()
        display_name = "torchvision/densenet121"
        backend = "torchvision_densenet121"

    net.eval().to(device)
    info = {
        "backend": backend,
        "display_name": display_name,
        "device": str(device),
        **extra,
    }
    return net, target, info


model, target_layer, ACTIVE_MODEL_INFO = _build_model()


def _preprocess_torchvision(image: Image.Image) -> torch.Tensor:
    return _TV_TRANSFORM(image.convert("RGB")).unsqueeze(0).to(device)


def _preprocess_torchxrayvision(image: Image.Image) -> torch.Tensor:
    gray = np.array(image.convert("L"), dtype=np.float32)
    if xrv is not None:
        gray = xrv.datasets.normalize(gray, 255)
    else:
        gray = gray / 255.0

    gray = cv2.resize(gray, (224, 224), interpolation=cv2.INTER_AREA)
    return torch.from_numpy(gray).unsqueeze(0).unsqueeze(0).to(device)


def preprocess(image_bytes) -> torch.Tensor:
    image = Image.open(image_bytes)
    if ACTIVE_MODEL_INFO.get("backend") == "torchxrayvision_densenet":
        return _preprocess_torchxrayvision(image)
    return _preprocess_torchvision(image)
