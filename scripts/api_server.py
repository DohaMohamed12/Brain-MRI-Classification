import io
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torchvision.transforms as transforms
import numpy as np

# =========================
# 1. الموديل بنفس بنية التدريب بالضبط (بدون Padding)
# =========================
class CNN_TUMOR(nn.Module):
    def __init__(self, params):
        super().__init__()
        Cin, H, W = params["shape_in"]
        init_f = params["initial_filters"]
        num_fc1 = params["num_fc1"]
        num_classes = params["num_classes"]
        self.dropout_rate = params["dropout_rate"]

        # لاحظ: حذفنا padding=1 ليتطابق مع التدريب
        self.conv1 = nn.Conv2d(Cin, init_f, 3)
        self.conv2 = nn.Conv2d(init_f, 2*init_f, 3)
        self.conv3 = nn.Conv2d(2*init_f, 4*init_f, 3)
        self.conv4 = nn.Conv2d(4*init_f, 8*init_f, 3)

        self.flat_dim = self._get_flat_dim(H, W, Cin)
        self.fc1 = nn.Linear(self.flat_dim, num_fc1)
        self.fc2 = nn.Linear(num_fc1, num_classes)

    def _get_flat_dim(self, H, W, C):
        x = torch.zeros(1, C, H, W)
        x = F.max_pool2d(F.relu(self.conv1(x)), 2)
        x = F.max_pool2d(F.relu(self.conv2(x)), 2)
        x = F.max_pool2d(F.relu(self.conv3(x)), 2)
        x = F.max_pool2d(F.relu(self.conv4(x)), 2)
        return int(np.prod(x.size()[1:]))

    def forward(self, x):
        x = F.relu(F.max_pool2d(self.conv1(x), 2))
        x = F.relu(F.max_pool2d(self.conv2(x), 2))
        x = F.relu(F.max_pool2d(self.conv3(x), 2))
        x = F.relu(F.max_pool2d(self.conv4(x), 2))
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        x = F.dropout(x, p=self.dropout_rate, training=self.training)
        x = self.fc2(x)
        return x # سنطبق Softmax في مسار التوقع

# الإعدادات (نفس التدريب 256)
params = {
    "shape_in": (3, 256, 256),
    "initial_filters": 8,
    "num_fc1": 100,
    "dropout_rate": 0.25,
    "num_classes": 2
}

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = CNN_TUMOR(params).to(device)
model.load_state_dict(torch.load("cnn_model.pth", map_location=device))
model.eval()

# المعالجة (نفس كود Gradio والتدريب)
preprocess = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

CLASSES = ['Brain Tumor', 'Healthy']

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor_img = preprocess(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            logits = model(tensor_img)
            probs = F.softmax(logits, dim=1) 
            confidences = probs[0].cpu().numpy()
            pred_idx = np.argmax(confidences)

        return {
            "prediction": CLASSES[pred_idx],
            "probabilities": {
                "brainTumor": float(confidences[0]),
                "healthy": float(confidences[1])
            }
        }
    except Exception as e:
        return {"error": str(e)}