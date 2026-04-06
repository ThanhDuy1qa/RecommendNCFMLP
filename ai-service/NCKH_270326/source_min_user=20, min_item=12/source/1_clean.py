from pymongo import MongoClient
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from scipy.sparse import csr_matrix
import pickle
from tqdm import tqdm
import os
import time

print("🚀 BẮT ĐẦU CLEAN DỮ LIỆU - CÓ TÍNH SPARSITY RÕ RÀNG\n")

start_time = time.time()

client = MongoClient("mongodb://localhost:27017/")
db = client["KLTN"]

output_dir = "processed_data"
os.makedirs(output_dir, exist_ok=True)

MIN_USER = 20
MIN_ITEM = 12

print(f"Thông số lọc: User ≥ {MIN_USER} | Item ≥ {MIN_ITEM}\n")

# ====================== METADATA ======================
print("Đang lấy metadata...")
meta_list = list(tqdm(db["meta_Electronics"].aggregate([
    {"$project": {
        "item_id": "$asin",
        "title": 1, "brand": 1, "price": 1, "main_cat": 1,
        "category": 1, "description": 1, "imageURL": 1, "imageURLHighRes": 1
    }}
], allowDiskUse=True)))

meta_df = pd.DataFrame(meta_list)

def clean_price(x):
    if pd.isna(x) or x is None or str(x).strip() in ["", '""']:
        return None
    try:
        return float(str(x).replace('$', '').replace(',', '').strip())
    except:
        return None

meta_df['price'] = meta_df.get('price', pd.Series()).apply(clean_price)
meta_df['description'] = meta_df.get('description', pd.Series()).apply(
    lambda x: ' '.join(x) if isinstance(x, list) else str(x) if pd.notna(x) else ''
)
meta_df['image_url'] = meta_df.get('imageURL', pd.Series()).apply(
    lambda x: x[0] if isinstance(x, list) and len(x) > 0 else None
)
meta_df['image_url_high'] = meta_df.get('imageURLHighRes', pd.Series()).apply(
    lambda x: x[0] if isinstance(x, list) and len(x) > 0 else None
)

meta_df.rename(columns={'asin': 'item_id'}, inplace=True)

# ====================== REVIEWS + JOIN ======================
print("Đang lấy reviews và join...")
df = pd.DataFrame(list(tqdm(db["Electronics"].aggregate([
    {"$match": {"verified": True, "overall": {"$gt": 0}}},
    {"$project": {"user_id": "$reviewerID", "item_id": "$asin", "rating": "$overall", "timestamp": "$unixReviewTime"}}
], allowDiskUse=True))))

df = df.merge(meta_df, on='item_id', how='left')
df = df.dropna(subset=['user_id', 'item_id', 'rating'])
df['rating'] = df['rating'] / 5.0

print(f"Tổng records sau join và clean: {len(df):,}\n")

# ====================== LỌC SPARSE + TÍNH SPARSITY ======================
print("Lọc user & item thưa và tính Sparsity...")

for i in range(3):
    user_counts = df['user_id'].value_counts()
    item_counts = df['item_id'].value_counts()
    
    df = df[df['user_id'].isin(user_counts[user_counts >= MIN_USER].index)]
    df = df[df['item_id'].isin(item_counts[item_counts >= MIN_ITEM].index)]
    
    current_users = df['user_id'].nunique()
    current_items = df['item_id'].nunique()
    total_possible = current_users * current_items
    sparsity = 1 - (len(df) / total_possible) if total_possible > 0 else 0
    
    print(f"Vòng {i+1}:")
    print(f"   Records : {len(df):,}")
    print(f"   Users   : {current_users:,}")
    print(f"   Items   : {current_items:,}")
    print(f"   Sparsity: {sparsity:.6f} ({sparsity*100:.4f}%)")
    print("-" * 60)

# ====================== ENCODE & LƯU ======================
print("Encoding user & item...")
user_encoder = LabelEncoder()
item_encoder = LabelEncoder()
df['user'] = user_encoder.fit_transform(df['user_id'])
df['item'] = item_encoder.fit_transform(df['item_id'])

df = df.sort_values('timestamp')

split = int(0.8 * len(df))
train_df = df.iloc[:split]
test_df = df.iloc[split:]

train_matrix = csr_matrix((train_df['rating'], (train_df['user'], train_df['item'])), 
                          shape=(df['user'].nunique(), df['item'].nunique()))

# Lưu file
train_df[['user','item','rating','timestamp']].to_csv(f"{output_dir}/train_interactions.csv", index=False)
test_df[['user','item','rating','timestamp']].to_csv(f"{output_dir}/test_interactions.csv", index=False)
df.to_csv(f"{output_dir}/full_interactions.csv", index=False)

pickle.dump(train_matrix, open(f"{output_dir}/user_item_matrix.pkl", "wb"))
pickle.dump(user_encoder, open(f"{output_dir}/user_encoder.pkl", "wb"))
pickle.dump(item_encoder, open(f"{output_dir}/item_encoder.pkl", "wb"))

item_features = df[['item_id','title','brand','price','main_cat','category',
                    'image_url','image_url_high','description']].drop_duplicates('item_id')
item_features.to_csv(f"{output_dir}/item_features.csv", index=False)

print(f"\n✅ HOÀN TẤT!")
print(f"Thời gian: {(time.time() - start_time)/60:.2f} phút")
print(f"Users cuối: {df['user'].nunique():,} | Items: {df['item'].nunique():,}")
print(f"Thư mục lưu: ./{output_dir}/")