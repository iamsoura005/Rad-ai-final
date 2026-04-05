import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def _build_model() -> torch.nn.Module:
    try:
        weights = models.DenseNet121_Weights.IMAGENET1K_V1
        net = models.densenet121(weights=weights)
    except Exception:
        # Fallback keeps Grad-CAM pipeline operational if pretrained weights are unavailable.
        net = models.densenet121(weights=None)

    net.eval().to(device)
    return net


model = _build_model()
target_layer = model.features.denseblock4.denselayer16.conv2

transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ]
)


def preprocess(image_bytes) -> torch.Tensor:
    image = Image.open(image_bytes).convert("RGB")
    return transform(image).unsqueeze(0).to(device)
