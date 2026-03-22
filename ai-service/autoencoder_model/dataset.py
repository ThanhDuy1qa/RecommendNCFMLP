import numpy as np
import scipy.sparse as sp
from sklearn.model_selection import train_test_split

# File chứa các hàm để tạo ma trận người dùng - sản phẩm từ dữ liệu thô, cũng như chia dữ liệu thành các tập huấn luyện, validation và test để sử dụng trong quá trình đào tạo và đánh giá mô hình autoencoder

def create_user_item_matrix(df):

    print("Encoding users and items...")

    df = df.dropna(subset=["user", "item", "rating"])

    user_ids = df["user"].astype("category").cat.codes.values
    item_ids = df["item"].astype("category").cat.codes.values
    ratings = df["rating"].astype("float32").values

    num_users = user_ids.max() + 1
    num_items = item_ids.max() + 1

    print("Building sparse matrix...")

    matrix = sp.csr_matrix(
        (ratings, (user_ids, item_ids)),
        shape=(num_users, num_items)
    )

    return matrix


def train_val_test_split(matrix, train_ratio, val_ratio):

    print("Splitting dataset...")

    num_users = matrix.shape[0]

    indices = np.arange(num_users)

    train_idx, temp_idx = train_test_split(
        indices,
        test_size=(1 - train_ratio),
        random_state=42
    )

    val_size = val_ratio / (1 - train_ratio)

    val_idx, test_idx = train_test_split(
        temp_idx,
        test_size=(1 - val_size),
        random_state=42
    )

    X_train = matrix[train_idx]
    X_val = matrix[val_idx]
    X_test = matrix[test_idx]

    return X_train, X_val, X_test