import pandas as pd
from config import MIN_USER_INTERACTIONS, MIN_ITEM_INTERACTIONS

# File chứa các hàm để tải dữ liệu đánh giá từ file CSV, làm sạch dữ liệu bằng cách loại bỏ những người dùng và sản phẩm có quá ít tương tác, cũng như chuẩn hóa điểm đánh giá để phù hợp với mô hình autoencoder. Các hàm này giúp đảm bảo rằng dữ liệu đầu vào cho mô hình là chất lượng và phù hợp để huấn luyện hiệu quả.

def load_ratings(path):

    print("Reading CSV...")

    df = pd.read_csv(
        path,
        names=["item", "user", "rating", "timestamp"]
    )

    # loại bỏ dòng lỗi
    df = df.dropna(subset=["item", "user", "rating"])

    return df


def filter_k_core(df):

    print("Filtering sparse users/items...")

    user_counts = df["user"].value_counts()
    item_counts = df["item"].value_counts()

    df = df[df["user"].isin(user_counts[user_counts >= MIN_USER_INTERACTIONS].index)]
    df = df[df["item"].isin(item_counts[item_counts >= MIN_ITEM_INTERACTIONS].index)]

    return df


def normalize_ratings(df):

    df["rating"] = df["rating"] / 5.0

    return df