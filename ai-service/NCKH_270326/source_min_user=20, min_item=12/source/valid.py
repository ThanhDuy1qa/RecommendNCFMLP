import pickle
with open("../data/clean_processed_data/user_encoder.pkl", "rb") as f:
    encoder = pickle.load(f)

print(f"\n🧠 Trí nhớ của AI đang chứa {len(encoder.classes_):,} khách hàng.")
print("🎯 Đây là 10 ID hợp lệ để bạn test:")
for uid in encoder.classes_[:50]:
    print(uid)