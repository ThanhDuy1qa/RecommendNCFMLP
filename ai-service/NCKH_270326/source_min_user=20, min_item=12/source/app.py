from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
import numpy as np
import pickle
from sklearn.preprocessing import LabelEncoder

# =========================================================
# 1. ĐỊNH NGHĨA LẠI KIẾN TRÚC MÔ HÌNH HYBRID (ĐÃ SỬA CHUẨN KHỚP 100%)
# =========================================================
class HybridModel(nn.Module):
    def __init__(self, num_users, num_items):
        super().__init__()
        
        FACTOR_NUM = 32
        EMBED_DIM = 32
        AE_DIM = 128

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

# =========================================================
# 2. KHỞI TẠO APP & TẢI DỮ LIỆU LÊN RAM
# =========================================================
app = FastAPI()

# Bật CORS để cho phép Node.js/React gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🔥 Đang chạy AI trên: {device}")

# Tải các từ điển (Encoder)
print("📥 Đang nạp Label Encoders...")
with open("../data/clean_processed_data/user_encoder.pkl", "rb") as f:
    user_encoder = pickle.load(f)
with open("../data/clean_processed_data/item_encoder.pkl", "rb") as f:
    item_encoder = pickle.load(f)

num_users = len(user_encoder.classes_)
num_items = len(item_encoder.classes_)

# Tải Autoencoder Embeddings
print("📥 Đang nạp User Embeddings...")
ae_embeddings = torch.FloatTensor(np.load("../data/train_Au/user_embeddings.npy")).to(device)

# Khởi tạo mô hình và tải trọng số
print("🤖 Đang khởi tạo Hybrid Model...")
model = HybridModel(num_users, num_items).to(device)
model.load_state_dict(torch.load("../data/hybrid/final_hybrid.pth", map_location=device))
model.eval() # Bật chế độ dự đoán (quan trọng để BatchNorm và Dropout hoạt động đúng)

# =========================================================
# 3. MỞ API ĐỂ NODE.JS/REACT GỌI VÀO
# =========================================================
@app.get("/api/recommend/{reviewer_id}")
def get_recommendations(reviewer_id: str, top_k: int = 5):
    # Kiểm tra xem khách hàng này có trong tập dữ liệu lúc Train không
    if reviewer_id not in user_encoder.classes_:
        raise HTTPException(status_code=404, detail="Khách hàng chưa có đủ dữ liệu để AI phân tích.")
    
    # 1. Dịch chuỗi "A192..." thành số index (0, 1, 2...)
    user_idx = user_encoder.transform([reviewer_id])[0]
    
    # 2. Chuẩn bị Tensor cho toàn bộ sản phẩm
    users_tensor = torch.LongTensor([user_idx] * num_items).to(device)
    items_tensor = torch.LongTensor(list(range(num_items))).to(device)
    ae_tensor = ae_embeddings[users_tensor]

    # 3. Đẩy vào Model dự đoán điểm số cho TẤT CẢ sản phẩm
    with torch.no_grad():
        predictions = model(users_tensor, items_tensor, ae_tensor)
        predictions = predictions.cpu().numpy()

    # 4. Lấy Top K sản phẩm có điểm dự đoán cao nhất
    top_indices = predictions.argsort()[-top_k:][::-1]
    
    # 5. Dịch ngược từ số (0, 1, 2...) ra mã ASIN ("B000...")
    recommended_asins = item_encoder.inverse_transform(top_indices)

    return {
        "reviewerID": reviewer_id,
        "recommendations": recommended_asins.tolist()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)