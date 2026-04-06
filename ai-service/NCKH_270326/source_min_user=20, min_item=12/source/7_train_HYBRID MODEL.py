import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import pandas as pd
import numpy as np

# ====================== DEVICE ======================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ====================== PATH ======================
DATA_PATH = "../data"

TRAIN_PATH = f"{DATA_PATH}/clean_processed_data/train_interactions.csv"
TEST_PATH = f"{DATA_PATH}/clean_processed_data/test_interactions.csv"
AE_PATH = f"{DATA_PATH}/train_Au/user_embeddings.npy"

# ====================== HYPERPARAM ======================
BATCH_SIZE = 256
LR = 0.001
EPOCHS = 20

FACTOR_NUM = 32
EMBED_DIM = 32
AE_DIM = 128

# ====================== LOAD AE ======================
print("📥 Loading AE embeddings...")
ae_embeddings = torch.FloatTensor(np.load(AE_PATH))

# ====================== LOAD DATA (🔥 FIX QUAN TRỌNG NHẤT) ======================
df_train = pd.read_csv(TRAIN_PATH)
df_test = pd.read_csv(TEST_PATH)

num_users = max(df_train['user'].max(), df_test['user'].max()) + 1
num_items = max(df_train['item'].max(), df_test['item'].max()) + 1

print("Train max user:", df_train['user'].max())
print("Test max user :", df_test['user'].max())
print("Train max item:", df_train['item'].max())
print("Test max item :", df_test['item'].max())

print("Num users:", num_users)
print("Num items:", num_items)

# ====================== DATASET ======================
class NCFDataset(Dataset):
    def __init__(self, df, ae):
        self.users = torch.LongTensor(df['user'].values)
        self.items = torch.LongTensor(df['item'].values)
        self.ratings = torch.FloatTensor(df['rating'].values)
        self.ae = ae

    def __len__(self):
        return len(self.users)

    def __getitem__(self, idx):
        u = self.users[idx]
        return u, self.items[idx], self.ratings[idx], self.ae[u]

# ====================== MODEL ======================
class HybridModel(nn.Module):
    def __init__(self, num_users, num_items):
        super().__init__()

        # GMF
        self.user_gmf = nn.Embedding(num_users, FACTOR_NUM)
        self.item_gmf = nn.Embedding(num_items, FACTOR_NUM)

        # ID embedding
        self.user_emb = nn.Embedding(num_users, EMBED_DIM)
        self.item_emb = nn.Embedding(num_items, EMBED_DIM)

        # Attention
        input_dim = EMBED_DIM * 2 + AE_DIM

        self.attn = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Linear(64, input_dim),
            nn.Sigmoid()
        )

        # MLP
        self.mlp = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(64, 32),
            nn.ReLU(),

            nn.Linear(32, 16)
        )

        self.predict = nn.Linear(FACTOR_NUM + 16, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, user, item, ae):
        gmf = self.user_gmf(user) * self.item_gmf(item)

        u = self.user_emb(user)
        i = self.item_emb(item)

        x = torch.cat([u, i, ae], dim=-1)

        w = self.attn(x)
        x = x * w

        mlp_out = self.mlp(x)

        out = torch.cat([gmf, mlp_out], dim=-1)

        return self.sigmoid(self.predict(out)).view(-1)

# ====================== DATA ======================
train_ds = NCFDataset(df_train, ae_embeddings)
test_ds = NCFDataset(df_test, ae_embeddings)

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE)

model = HybridModel(num_users, num_items).to(device)

# ====================== LOSS ======================
def weighted_mse(pred, target):
    w = 1 + target * 2
    return torch.mean(w * (pred - target) ** 2)

optimizer = optim.Adam(model.parameters(), lr=LR)

scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode='min', patience=2, factor=0.5
)

# ====================== TRAIN ======================
print("🚀 Training FINAL HYBRID...")

for epoch in range(EPOCHS):
    model.train()
    total_loss = 0

    for u, i, r, ae in train_loader:
        u, i, r, ae = u.to(device), i.to(device), r.to(device), ae.to(device)

        optimizer.zero_grad()

        pred = model(u, i, ae)
        loss = weighted_mse(pred, r)

        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    avg_loss = total_loss / len(train_loader)
    scheduler.step(avg_loss)

    print(f"Epoch {epoch+1} | Loss: {avg_loss:.6f}")

# ====================== SAVE ======================
torch.save(model.state_dict(), f"{DATA_PATH}/final_hybrid.pth") # Lưu thẳng vào thư mục data
print("✅ Model saved!")

# ====================== TEST ======================
model.eval()
loss_total = 0

with torch.no_grad():
    for u, i, r, ae in test_loader:
        u, i, r, ae = u.to(device), i.to(device), r.to(device), ae.to(device)

        pred = model(u, i, ae)
        loss = weighted_mse(pred, r)
        loss_total += loss.item()

rmse = np.sqrt(loss_total / len(test_loader))

print(f"\n📉 FINAL HYBRID RMSE: {rmse:.6f}")