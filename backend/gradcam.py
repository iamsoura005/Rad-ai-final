from typing import Optional, Tuple
from threading import Lock

import numpy as np
import torch


class GradCAM:
    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module):
        self.model = model
        self.target_layer = target_layer
        self.gradients: Optional[torch.Tensor] = None
        self.activations: Optional[torch.Tensor] = None
        self._lock = Lock()

        self.target_layer.register_forward_hook(self._forward_hook)
        self.target_layer.register_full_backward_hook(self._backward_hook)

    def _forward_hook(self, module, input_tensor, output):
        self.activations = output.detach()

    def _backward_hook(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(self, input_tensor: torch.Tensor, class_idx: Optional[int] = None) -> Tuple[np.ndarray, int]:
        with self._lock:
            self.gradients = None
            self.activations = None

            output = self.model(input_tensor)
            if output.ndim != 2 or output.shape[0] == 0:
                raise ValueError("Unexpected model output shape for Grad-CAM generation.")

            if class_idx is None:
                class_idx = int(torch.argmax(output[0]).item())

            self.model.zero_grad(set_to_none=True)
            output[0, class_idx].backward()

            if self.gradients is None or self.activations is None:
                raise RuntimeError("Grad-CAM hooks did not capture gradients/activations.")

            gradients = self.gradients
            activations = self.activations

            weights = gradients.mean(dim=(2, 3), keepdim=True)
            cam = (weights * activations).sum(dim=1).squeeze(0)
            cam = torch.relu(cam)

            cam = cam - cam.min()
            cam = cam / (cam.max() + 1e-8)

            return cam.cpu().numpy(), class_idx
