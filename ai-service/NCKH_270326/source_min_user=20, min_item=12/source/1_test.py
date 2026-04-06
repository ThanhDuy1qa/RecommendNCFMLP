import os
import pickle
import pandas as pd

data_dir = "processed_data"   # thay bằng tên thư mục của lần 4 nếu khác

print("Kiểm tra dữ liệu lần 4...\n")

files = os.listdir(data_dir)
for f in files:
    print(f"✓ {f}")

# Kiểm tra ma trận
if "user_item_matrix.pkl" in files:
    with open(f"{data_dir}/user_item_matrix.pkl", "rb") as f:
        matrix = pickle.load(f)
    print(f"\nMa trận kích thước: {matrix.shape}")
    print(f"Số tương tác: {matrix.nnz:,}")
    sparsity = 1 - (matrix.nnz / (matrix.shape[0] * matrix.shape[1]))
    print(f"Sparsity: {sparsity:.6f} ({sparsity*100:.4f}%)")
else:
    print("\n❌ Thiếu file user_item_matrix.pkl → Cần tạo lại")

print("\nKiểm tra xong!")