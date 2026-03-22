import numpy as np
import tensorflow as tf

from preprocessing import load_ratings, filter_k_core, normalize_ratings
from dataset import create_user_item_matrix, train_val_test_split
from data_generator import UserBatchGenerator
from config import *

# File dùng để xuất embeddings người dùng đã được tạo ra bởi mô hình autoencoder sau khi huấn luyện, giúp lưu trữ và sử dụng các embeddings này cho các tác vụ khác như gợi ý sản phẩm hoặc phân tích dữ liệu sau này

print("Loading dataset...")

df = load_ratings(DATA_PATH)

df = filter_k_core(df)
df = normalize_ratings(df)

matrix = create_user_item_matrix(df)

X_train, X_val, X_test = train_val_test_split(
    matrix,
    TRAIN_RATIO,
    VAL_RATIO
)

print("Loading encoder...")

encoder = tf.keras.models.load_model("outputs/encoder_model.keras")

print("Creating generator...")

test_gen = UserBatchGenerator(X_test, batch_size=1024)

print("Generating embeddings...")

embeddings = encoder.predict(test_gen)

np.save("outputs/user_embeddings.npy", embeddings)

print("Embeddings saved")