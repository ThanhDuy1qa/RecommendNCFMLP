import pandas as pd
import pickle
from pymongo import MongoClient, UpdateOne
import datetime
import os

# =========================================================
# 1. CẤU HÌNH ĐƯỜNG DẪN (ĐÃ KHỚP VỚI MÁY CỦA DUY)
# =========================================================
DATA_PATH = r"D:\DATN\ai-service\NCKH_270326\source_min_user=20, min_item=12\data\clean_processed_data"
FUSION_FILE = r"D:\DATN\ai-service\data_v2\fusion_full_ae_ncf_mlp_knn_ease\final_fusion_test_top100.parquet"

# Thay đổi tên Database cho đúng với tên bạn đặt trong Compass
DB_NAME = "DATN" 
COLLECTION_NAME = "Recommendations"
MONGO_URI = "mongodb://localhost:27017/"

print("Starting the import process...")

try:
    # 2. Nạp dữ liệu và bộ giải mã ID
    print("Reading Parquet file and Encoders...")
    df = pd.read_parquet(FUSION_FILE)
    
    with open(os.path.join(DATA_PATH, "user_encoder.pkl"), "rb") as f:
        user_encoder = pickle.load(f)
    with open(os.path.join(DATA_PATH, "item_encoder.pkl"), "rb") as f:
        item_encoder = pickle.load(f)

    # 3. Kết nối MongoDB
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    # 4. Gom nhóm dữ liệu theo từng khách hàng
    print("Processing and mapping IDs...")
    bulk_ops = []
    
    # Chỉ lấy Top 20 cho mỗi khách hàng để tối ưu tốc độ Web
    df_top = df[df['rank'] <= 20]
    grouped = df_top.groupby("user_id")

    for user_idx, group in grouped:
        try:
            # Chuyển đổi ID số sang ReviewerID chuỗi
            reviewer_id = user_encoder.inverse_transform([user_idx])[0]
            
            # Lấy danh sách sản phẩm và chuyển sang mã ASIN chuỗi
            item_indices = group.sort_values("rank")["item_id"].tolist()
            recommended_asins = item_encoder.inverse_transform(item_indices).tolist()
            
            # Tạo document để lưu
            doc = {
                "reviewerID": reviewer_id,
                "recommendations": recommended_asins,
                "last_updated": datetime.datetime.now()
            }
            
            # Thêm vào danh sách chờ ghi (Upsert)
            bulk_ops.append(
                UpdateOne(
                    {"reviewerID": reviewer_id},
                    {"$set": doc},
                    upsert=True
                )
            )
        except:
            continue

    # 5. Thực thi ghi hàng loạt vào DB
    if bulk_ops:
        print(f"Writing {len(bulk_ops)} users to MongoDB...")
        result = collection.bulk_write(bulk_ops)
        print(f"Success! Updated: {result.modified_count}, New: {result.upserted_count}")
    else:
        print("No data found to import.")

except Exception as e:
    print(f"Error occurred: {e}")
finally:
    client.close()