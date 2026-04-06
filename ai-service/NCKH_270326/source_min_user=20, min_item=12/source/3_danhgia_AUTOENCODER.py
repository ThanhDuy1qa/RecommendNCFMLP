import torch
import torch.nn as nn
import numpy as np
import pandas as pd
import pickle
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt
import os

print("🚀 ĐÁNH GIÁ MODEL AUTOENCODER - INPUT TỪ DATA-MODEL-AU-LAN1\n")

# ====================== ĐƯỜNG DẪN ======================
input_dir = "/kaggle/input/datasets/anhngocbui123/data-model-au-lan1"
output_dir = "/kaggle/working"

# ====================== ĐỊNH NGHĨA MODEL ======================
class DenoisingAutoencoder(nn.Module):
    def __init__(self, input_dim, latent_dim=128):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, latent_dim)
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, input_dim),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        latent = self.encoder(x)
        reconstructed = self.decoder(latent)
        return reconstructed, latent

# ====================== LOAD MODEL ======================
model_path = f"{input_dir}/best_autoencoder.pth"
print(f"Đang load model từ: {model_path}")

# Lấy input_dim từ ma trận
with open(f"{input_dir}/user_item_matrix.pkl", "rb") as f:
    train_matrix = pickle.load(f)

input_dim = train_matrix.shape[1]
print(f"Input dimension: {input_dim}")

model = DenoisingAutoencoder(input_dim=input_dim, latent_dim=128)
model.load_state_dict(torch.load(model_path, map_location='cpu'))
model.eval()

print("✓ Load model thành công\n")

# ====================== LOAD DỮ LIỆU ======================
print("Đang load test set...")
test_df = pd.read_csv(f"{input_dir}/test_interactions.csv")
print(f"Test samples: {len(test_df):,}")

# Load ma trận để tái tạo
train_dense = train_matrix.toarray()
train_tensor = torch.FloatTensor(train_dense)

# ====================== 1. RECONSTRUCTION LOSS ======================
print("1. Tính Reconstruction Loss...")

with torch.no_grad():
    reconstructed, _ = model(train_tensor)

mse = nn.MSELoss()(reconstructed, train_tensor).item()
rmse = np.sqrt(mse)

print(f"   MSE  : {mse:.6f}")
print(f"   RMSE : {rmse:.6f}")

# ====================== 2. TEST RMSE ======================
print("\n2. Tính Test RMSE...")

user_idx = test_df['user'].values
item_idx = test_df['item'].values
true_rating = test_df['rating'].values

reconstructed_np = reconstructed.numpy()
pred_rating = reconstructed_np[user_idx, item_idx]

test_rmse = np.sqrt(mean_squared_error(true_rating, pred_rating))

print(f"   Test RMSE: {test_rmse:.6f}")

# ====================== 3. EMBEDDING ANALYSIS ======================
print("\n3. Phân tích User Embeddings...")

with torch.no_grad():
    _, user_embeddings = model(train_tensor)

user_emb_np = user_embeddings.numpy()

print(f"   Shape          : {user_emb_np.shape}")
print(f"   Mean Norm      : {np.mean(np.linalg.norm(user_emb_np, axis=1)):.4f}")
print(f"   Std Norm       : {np.std(np.linalg.norm(user_emb_np, axis=1)):.4f}")

# ====================== LƯU KẾT QUẢ ĐÁNH GIÁ ======================
eval_results = {
    "Reconstruction_MSE": mse,
    "Reconstruction_RMSE": rmse,
    "Test_RMSE": test_rmse,
    "Embedding_Shape": user_emb_np.shape,
    "Mean_Embedding_Norm": float(np.mean(np.linalg.norm(user_emb_np, axis=1)))
}

import json
with open(f"{output_dir}/autoencoder_evaluation.json", "w") as f:
    json.dump(eval_results, f, indent=4)

print(f"\n✅ Đánh giá hoàn tất! Kết quả được lưu tại: {output_dir}/autoencoder_evaluation.json")