import numpy as np
import tensorflow as tf

# File dùng để tạo generator cho quá trình huấn luyện và đánh giá mô hình autoencoder, giúp xử lý dữ liệu lớn mà không cần tải toàn bộ vào bộ nhớ cùng lúc
class UserBatchGenerator(tf.keras.utils.Sequence):

    def __init__(self, sparse_matrix, batch_size=512):
        self.matrix = sparse_matrix
        self.batch_size = batch_size
        self.num_users = sparse_matrix.shape[0]

    def __len__(self):
        return int(np.ceil(self.num_users / self.batch_size))

    def __getitem__(self, idx):

        start = idx * self.batch_size
        end = min((idx + 1) * self.batch_size, self.num_users)

        batch_sparse = self.matrix[start:end]

        # convert only this batch to dense
        batch_dense = batch_sparse.toarray().astype("float32")

        return batch_dense, batch_dense