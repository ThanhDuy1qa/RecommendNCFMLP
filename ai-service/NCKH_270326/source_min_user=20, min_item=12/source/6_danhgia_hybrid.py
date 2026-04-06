import torch
import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error
import math

# ====================== DEVICE ======================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
K = 10

# ====================== PATH ======================
DATA_PATH = "/kaggle/input/datasets/nguyenmaithienqui/recommendation-system-dl"

TEST_PATH = f"{DATA_PATH}/clean_processed_data/test_interactions.csv"
AE_PATH = f"{DATA_PATH}/train_Au/user_embeddings.npy"
MODEL_PATH = "/kaggle/working/final_hybrid.pth"

# ====================== LOAD DATA ======================
print("📥 Loading data...")

test_df = pd.read_csv(TEST_PATH)
ae_embeddings = torch.FloatTensor(np.load(AE_PATH))

# ===== FIX NUM USER/ITEM =====
num_users = max(test_df['user'].max(), ae_embeddings.shape[0]-1) + 1
num_items = test_df['item'].max() + 1

print("Num users:", num_users)
print("Num items:", num_items)

# ====================== MODEL ======================
class HybridModel(torch.nn.Module):
    def __init__(self, num_users, num_items):
        super().__init__()

        FACTOR_NUM = 32
        EMBED_DIM = 32
        AE_DIM = 128

        self.user_gmf = torch.nn.Embedding(num_users, FACTOR_NUM)
        self.item_gmf = torch.nn.Embedding(num_items, FACTOR_NUM)

        self.user_emb = torch.nn.Embedding(num_users, EMBED_DIM)
        self.item_emb = torch.nn.Embedding(num_items, EMBED_DIM)

        input_dim = EMBED_DIM*2 + AE_DIM

        self.attn = torch.nn.Sequential(
            torch.nn.Linear(input_dim, 64),
            torch.nn.ReLU(),
            torch.nn.Linear(64, input_dim),
            torch.nn.Sigmoid()
        )

        self.mlp = torch.nn.Sequential(
            torch.nn.Linear(input_dim, 128),
            torch.nn.BatchNorm1d(128),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.3),

            torch.nn.Linear(128, 64),
            torch.nn.BatchNorm1d(64),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.3),

            torch.nn.Linear(64, 32),
            torch.nn.ReLU(),

            torch.nn.Linear(32, 16)
        )

        self.predict = torch.nn.Linear(32 + 16, 1)
        self.sigmoid = torch.nn.Sigmoid()

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

# ====================== LOAD MODEL ======================
model = HybridModel(num_users, num_items).to(device)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.eval()

print("✅ Model loaded")

# ====================== METRICS ======================
def get_metrics(model, test_df, ae_embeddings, k=10):
    met_ndcg, met_hr, met_pre, met_rec = [], [], [], []
    threshold = 0.6

    user_group = test_df.groupby('user')

    for user, group in user_group:
        items = torch.LongTensor(group['item'].values).to(device)
        users = torch.LongTensor([user] * len(items)).to(device)
        ae = ae_embeddings[user].repeat(len(items), 1).to(device)

        real = group['rating'].values

        with torch.no_grad():
            preds = model(users, items, ae).cpu().numpy()

        res = pd.DataFrame({'real': real, 'pred': preds})
        top_k = res.sort_values(by='pred', ascending=False).head(k)

        hits = top_k[top_k['real'] >= threshold]
        num_hits = len(hits)

        met_hr.append(1 if num_hits > 0 else 0)
        met_pre.append(num_hits / k)

        total_rel = len(group[group['rating'] >= threshold])
        met_rec.append(num_hits / total_rel if total_rel > 0 else 0)

        idcg = sum([1.0 / math.log2(i + 2) for i in range(min(num_hits, k))])
        dcg = sum([1.0 / math.log2(i + 2) if r >= threshold else 0 for i, r in enumerate(top_k['real'])])
        met_ndcg.append(dcg / idcg if idcg > 0 else 0)

    return np.mean(met_pre), np.mean(met_rec), np.mean(met_ndcg), np.mean(met_hr)

# ====================== RUN ======================
print("📊 Evaluating...")

precision, recall, ndcg, hr = get_metrics(model, test_df, ae_embeddings, K)

# RMSE
users = torch.LongTensor(test_df['user'].values).to(device)
items = torch.LongTensor(test_df['item'].values).to(device)
ae = ae_embeddings[users].to(device)

with torch.no_grad():
    preds = model(users, items, ae).cpu().numpy()

rmse = np.sqrt(mean_squared_error(test_df['rating'].values, preds))

# ====================== PRINT ======================
print("-" * 40)
print("✅ HYBRID EVALUATION:")
print(f"RMSE         : {rmse:.4f}")
print(f"Precision@10 : {precision:.4f}")
print(f"Recall@10    : {recall:.4f}")
print(f"NDCG@10      : {ndcg:.4f}")
print(f"Hit Rate@10  : {hr:.4f}")
print("-" * 40)