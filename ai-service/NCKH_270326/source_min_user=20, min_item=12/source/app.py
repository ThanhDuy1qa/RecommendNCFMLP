from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# 1. NẠP DỮ LIỆU FUSION VÀ ENCODER (Dùng đường dẫn tuyệt đối)
# =========================================================
# Đã sửa lại khớp với đường dẫn thực tế trên máy bạn
DATA_PATH = r"D:\DATN\ai-service\NCKH_270326\source_min_user=20, min_item=12\data\clean_processed_data" 
FUSION_FILE = r"D:\DATN\ai-service\data_v2\fusion_full_ae_ncf_mlp_knn_ease\final_fusion_test_top100.parquet"

print("Dang khoi dong Fusion...")

try:
    # Nạp các bộ giải mã ID
    user_encoder = pickle.load(open(f"{DATA_PATH}\\user_encoder.pkl", "rb"))
    item_encoder = pickle.load(open(f"{DATA_PATH}\\item_encoder.pkl", "rb"))

    # Nạp kết quả AI đã tính toán sẵn
    df_fusion = pd.read_parquet(FUSION_FILE)
    print("He thong Fusion da san sang!")
except Exception as e:
    print(f"Lỗi khi nạp dữ liệu: {e}")

# =========================================================
# 2. API XỬ LÝ GỢI Ý
# =========================================================
@app.get("/api/recommend/{reviewer_id}")
def get_recommendations(reviewer_id: str, top_k: int = 9):
    if reviewer_id not in user_encoder.classes_:
        raise HTTPException(status_code=404, detail="Khach hang chua co du du lieu tuong tac")

    try:
        user_idx = user_encoder.transform([reviewer_id])[0]
        user_recs = df_fusion[df_fusion['user_id'] == user_idx].head(top_k)

        if user_recs.empty:
            return {"recommendations": []}

        top_item_indices = user_recs['item_id'].tolist()
        recommendations = item_encoder.inverse_transform(top_item_indices)

        return {"recommendations": list(recommendations)}
    except Exception as e:
        print(f"Lỗi xử lý: {e}")
        return {"recommendations": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)