import torch
import numpy as np
import pandas as pd
from torch.utils.data import DataLoader, Dataset
from sklearn.metrics import mean_squared_error
import math
import os

# ====================== CẤU HÌNH ======================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
K = 10 

class NeuMF(torch.nn.Module):
    def __init__(self, num_users, num_items, factor_num=32, layers=[64, 32, 16]):
        super(NeuMF, self).__init__()
        self.embed_user_GMF = torch.nn.Embedding(num_users, factor_num)
        self.embed_item_GMF = torch.nn.Embedding(num_items, factor_num)
        self.embed_user_MLP = torch.nn.Embedding(num_users, layers[0] // 2)
        self.embed_item_MLP = torch.nn.Embedding(num_items, layers[0] // 2)
        
        mlp_modules = []
        for i in range(len(layers) - 1):
            mlp_modules.append(torch.nn.Linear(layers[i], layers[i+1]))
            mlp_modules.append(torch.nn.ReLU())
            mlp_modules.append(torch.nn.Dropout(p=0.2))
        self.mlp_network = torch.nn.Sequential(*mlp_modules)
        
        self.predict_layer = torch.nn.Linear(factor_num + layers[-1], 1)
        self.sigmoid = torch.nn.Sigmoid()

    def forward(self, user_indices, item_indices):
        user_gmf = self.embed_user_GMF(user_indices)
        item_gmf = self.embed_item_GMF(item_indices)
        gmf_output = user_gmf * item_gmf
        user_mlp = self.embed_user_MLP(user_indices)
        item_mlp = self.embed_item_MLP(item_indices)
        mlp_input = torch.cat([user_mlp, item_mlp], dim=-1)
        mlp_output = self.mlp_network(mlp_input)
        combined = torch.cat([gmf_output, mlp_output], dim=-1)
        return self.sigmoid(self.predict_layer(combined)).view(-1)

# ====================== LOAD MODEL & DATA ======================
print("🚀 Đang load dữ liệu và model NCF...")
test_path = "../data/clean_processed_data/test_interactions.csv"
model_path = "../data/train_Au/best_ncf_model.pth"

if not os.path.exists(test_path):
    print(f"❌ Không tìm thấy file dữ liệu tại: {test_path}")
    exit()

test_df = pd.read_csv(test_path)
num_users = 19191  
num_items = 19482  

model = NeuMF(num_users, num_items).to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()
print(f"✓ Load thành công dữ liệu và model.")

# ====================== HÀM TÍNH METRICS ======================
def get_metrics(model, test_df, k=10):
    met_ndcg, met_hr, met_pre, met_rec = [], [], [], []
    threshold = 0.6 # Coi rating >= 3/5 là "thích" (vì rating đã chia 5) [cite: 39]
    
    user_group = test_df.groupby('user')
    
    for user, group in user_group:
        items = torch.LongTensor(group['item'].values).to(device)
        users = torch.LongTensor([user] * len(items)).to(device)
        # Sử dụng đúng tên cột 'rating' từ test_df [cite: 1]
        real_labels = group['rating'].values
        
        with torch.no_grad():
            preds = model(users, items).cpu().numpy()
        
        res = pd.DataFrame({'real': real_labels, 'pred': preds})
        # Lấy Top K dựa trên dự đoán của model [cite: 56]
        top_k_res = res.sort_values(by='pred', ascending=False).head(k)
        
        hits = top_k_res[top_k_res['real'] >= threshold]
        num_hits = len(hits)
        
        # Hit Rate [cite: 59]
        met_hr.append(1 if num_hits > 0 else 0)
        # Precision@K [cite: 56]
        met_pre.append(num_hits / k)
        # Recall@K [cite: 57]
        total_relevant = len(group[group['rating'] >= threshold])
        met_rec.append(num_hits / total_relevant if total_relevant > 0 else 0)
        # NDCG@K [cite: 58]
        idcg = sum([1.0 / math.log2(i + 2) for i in range(min(num_hits, k))])
        dcg = sum([1.0 / math.log2(i + 2) if r >= threshold else 0 for i, r in enumerate(top_k_res['real'])])
        met_ndcg.append(dcg / idcg if idcg > 0 else 0)

    return np.mean(met_pre), np.mean(met_rec), np.mean(met_ndcg), np.mean(met_hr)

# ====================== THỰC THI ======================
print("📊 Đang tính toán các chỉ số Top-10 (vui lòng đợi)...")
precision, recall, ndcg, hit_rate = get_metrics(model, test_df, K)

users_all = torch.LongTensor(test_df['user'].values).to(device)
items_all = torch.LongTensor(test_df['item'].values).to(device)
with torch.no_grad():
    preds_all = model(users_all, items_all).cpu().numpy()
rmse = np.sqrt(mean_squared_error(test_df['rating'].values, preds_all))

print("-" * 40)
print(f"✅ ĐÁNH GIÁ HOÀN TẤT (K={K}):")
print(f"🔹 RMSE         : {rmse:.4f}")
print(f"🔹 Precision@10 : {precision:.4f}")
print(f"🔹 Recall@10    : {recall:.4f}")
print(f"🔹 NDCG@10      : {ndcg:.4f}")
print(f"🔹 Hit Rate@10  : {hit_rate:.4f}")
print("-" * 40)