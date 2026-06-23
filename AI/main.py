from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity # Thêm thư viện này

app = FastAPI()

# 1. Load "Bộ não" AI khi khởi động server
print("Đang tải mô hình...")
artifacts = joblib.load("nv1_cold_start_deployment_artifacts.joblib")
vectorizer = artifacts["vectorizer"]
item_vectors = artifacts["item_vectors"]
meta_df = artifacts["meta_df"]
print("Tải mô hình thành công!")

class NewProduct(BaseModel):
    product_id: str
    title: str
    brand: str
    category: str
    description: str
    price: float

@app.post("/predict_cold_start")
def predict_cold_start(product: NewProduct):
    # ==========================================
    # BƯỚC 1: BIẾN SẢN PHẨM MỚI THÀNH VECTOR
    # ==========================================
    # Gom các đặc trưng thành 1 chuỗi text giống như lúc train
    text_features = f"{product.title} {product.brand} {product.category} {product.description}"
    
    # Biến text thành vector bằng bộ vectorizer đã train
    new_vector = vectorizer.transform([text_features])
    
    # ==========================================
    # BƯỚC 2: TÌM CÁC SẢN PHẨM CŨ GIỐNG NHẤT
    # ==========================================
    # Tính độ tương đồng (Similarity) giữa SP mới và 16.461 SP cũ
    sim_scores = cosine_similarity(new_vector, item_vectors).flatten()
    
    # Lấy ra index của Top 10 sản phẩm giống nhất
    top_k = 10
    top_indices = sim_scores.argsort()[-top_k:][::-1]
    
    similar_items = []
    for idx in top_indices:
        asin = meta_df.iloc[idx]['asin']
        score = float(sim_scores[idx])
        if score > 0: # Chỉ lấy những SP có độ tương đồng lớn hơn 0
            similar_items.append({"asin": asin, "similarity_score": score})
            
    # ==========================================
    # BƯỚC 3: KẾT LUẬN & TRẢ VỀ CHO NODE.JS
    # ==========================================
    # Tính điểm tự tin (Confidence) dựa trên điểm tương đồng trung bình của Top 5
    avg_top5_score = np.mean([item["similarity_score"] for item in similar_items[:5]]) if similar_items else 0
    
    business_summary = {
        "confidence_score": avg_top5_score,
        "advice": "Độ tương đồng cao, nên nhập số lượng lớn." if avg_top5_score > 0.5 else "Sản phẩm mới lạ, cần khảo sát kỹ trước khi nhập."
    }

    # Trả về danh sách ASIN của các SP giống nhất thay vì trả thẳng user
    return {
        "product_id": product.product_id,
        "business_summary": business_summary,
        "similar_items": similar_items
    }