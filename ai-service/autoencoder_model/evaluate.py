import tensorflow as tf

from preprocessing import load_ratings, filter_k_core, normalize_ratings
from dataset import create_user_item_matrix, train_val_test_split
from data_generator import UserBatchGenerator
from config import *

# File dùng để đánh giá mô hình autoencoder đã được huấn luyện trên tập test, giúp đo lường hiệu suất của mô hình bằng cách tính toán lỗi trung bình bình phương (MSE) giữa dự đoán của mô hình và dữ liệu thực tế trong tập test

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

print("Loading model...")

model = tf.keras.models.load_model("outputs/autoencoder_model.keras")

print("Creating generator...")

test_gen = UserBatchGenerator(X_test, batch_size=1024)

print("Evaluating model...")

mse = model.evaluate(test_gen)

print("Test MSE:", mse)