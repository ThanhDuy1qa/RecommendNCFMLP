import numpy as np
import tensorflow as tf

from config import *
from preprocessing import load_ratings, filter_k_core, normalize_ratings
from dataset import create_user_item_matrix, train_val_test_split
from model import build_autoencoder
from data_generator import UserBatchGenerator

# File chính để huấn luyện mô hình autoencoder, kết hợp tất cả các bước từ tải và xử lý dữ liệu, xây dựng mô hình, tạo generator cho quá trình huấn luyện, và lưu mô hình sau khi huấn luyện xong. Đây là điểm khởi đầu để chạy toàn bộ quy trình huấn luyện mô hình autoencoder cho hệ thống gợi ý sản phẩm.

print("Loading dataset...")

df = load_ratings(DATA_PATH)

print("Cleaning dataset...")

df = filter_k_core(df)
df = normalize_ratings(df)

print("Creating user-item matrix...")

matrix = create_user_item_matrix(df)

print("Splitting dataset...")

X_train, X_val, X_test = train_val_test_split(
    matrix,
    TRAIN_RATIO,
    VAL_RATIO
)

print("Creating data generators...")

train_gen = UserBatchGenerator(X_train, batch_size=1024)
val_gen = UserBatchGenerator(X_val, batch_size=1024)

input_dim = matrix.shape[1]

print("Building Autoencoder...")

autoencoder, encoder = build_autoencoder(
    input_dim,
    LATENT_DIM
)

early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_loss",
    patience=3,
    restore_best_weights=True
)

print("Training model...")

history = autoencoder.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS,
    callbacks=[early_stop]
)

print("Saving model...")

autoencoder.save("outputs/autoencoder_model.keras")
encoder.save("outputs/encoder_model.keras")

print("Training completed")