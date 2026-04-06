import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import pickle
import numpy as np
import os
from tqdm import tqdm
import gc

print("🚀 TRAIN AUTOENCODER - PHIÊN BẢN TỐI ƯU CHO KAGGLE\n")

# ====================== ĐƯỜNG DẪN KAGGLE ======================
input_dir = "/kaggle/input/datasets/anhngocbui123/clean-lan4-au"
output_dir = "/kaggle/working"

os.makedirs(output_dir, exist_ok=True)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# ====================== LOAD DỮ LIỆU ======================
print("Đang load user_item_matrix.pkl...")
with open(f"{input_dir}/user_item_matrix.pkl", "rb") as f:
    train_matrix = pickle.load(f)

train_dense = train_matrix.toarray()
train_tensor = torch.FloatTensor(train_dense).to(device)

print(f"Ma trận kích thước: {train_tensor.shape}")
print(f"Số tương tác: {train_matrix.nnz:,}")

# ====================== HYPERPARAMETERS TỐI ƯU ======================
LATENT_DIM = 128
BATCH_SIZE = 256
EPOCHS = 80
LEARNING_RATE = 0.001
DROPOUT = 0.3
NOISE_FACTOR = 0.15
PATIENCE = 10

# ====================== MODEL ======================
class DenoisingAutoencoder(nn.Module):
    def __init__(self, input_dim, latent_dim):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.ReLU(),
            nn.Dropout(DROPOUT),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(DROPOUT),
            nn.Linear(256, latent_dim)
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 256),
            nn.ReLU(),
            nn.Dropout(DROPOUT),
            nn.Linear(256, 512),
            nn.ReLU(),
            nn.Dropout(DROPOUT),
            nn.Linear(512, input_dim),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        latent = self.encoder(x)
        reconstructed = self.decoder(latent)
        return reconstructed, latent

model = DenoisingAutoencoder(input_dim=train_tensor.shape[1], latent_dim=LATENT_DIM).to(device)

criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-5)

# ====================== TRAINING ======================
train_dataset = TensorDataset(train_tensor)
train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)

best_loss = float('inf')
patience_counter = 0
best_model_path = f"{output_dir}/best_autoencoder.pth"

print("Bắt đầu huấn luyện Autoencoder...\n")

for epoch in range(EPOCHS):
    model.train()
    total_loss = 0.0
    
    for batch in tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS}"):
        inputs = batch[0].to(device)
        
        # Denoising
        noise = torch.randn_like(inputs) * NOISE_FACTOR
        noisy_inputs = torch.clamp(inputs + noise, 0.0, 1.0)
        
        reconstructed, _ = model(noisy_inputs)
        loss = criterion(reconstructed, inputs)
        
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
    
    avg_loss = total_loss / len(train_loader)
    print(f"Epoch {epoch+1:3d} | Loss: {avg_loss:.6f}")
    
    # Early stopping
    if avg_loss < best_loss:
        best_loss = avg_loss
        patience_counter = 0
        torch.save(model.state_dict(), best_model_path)
        print(f"   → Lưu model tốt nhất")
    else:
        patience_counter += 1
        if patience_counter >= PATIENCE:
            print("Early stopping!")
            break

print(f"\n✅ Train Autoencoder hoàn tất! Best Loss: {best_loss:.6f}")

# ====================== TRÍCH XUẤT EMBEDDING ======================
print("Đang trích xuất embedding...")
model.load_state_dict(torch.load(best_model_path))
model.eval()

with torch.no_grad():
    _, user_embeddings = model(train_tensor)

user_embeddings = user_embeddings.cpu().numpy()

np.save(f"{output_dir}/user_embeddings.npy", user_embeddings)
print(f"Đã lưu user embeddings shape: {user_embeddings.shape}")

print(f"\nKết quả được lưu tại: {output_dir}")
print("Các file chính:")
print("   • best_autoencoder.pth")
print("   • user_embeddings.npy")