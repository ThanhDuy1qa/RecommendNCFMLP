import tensorflow as tf

# File chứa định nghĩa kiến trúc của mô hình autoencoder, bao gồm các lớp và hàm cần thiết để xây dựng mô hình, giúp tách biệt phần xây dựng mô hình khỏi phần xử lý dữ liệu và huấn luyện, làm cho mã nguồn trở nên rõ ràng và dễ bảo trì hơn

def build_autoencoder(input_dim, latent_dim):

    input_layer = tf.keras.Input(shape=(input_dim,))

    x = tf.keras.layers.Dense(512, activation="relu")(input_layer)
    x = tf.keras.layers.Dropout(0.2)(x)

    x = tf.keras.layers.Dense(128, activation="relu")(x)

    latent = tf.keras.layers.Dense(latent_dim, activation="relu")(x)

    x = tf.keras.layers.Dense(128, activation="relu")(latent)
    x = tf.keras.layers.Dense(512, activation="relu")(x)

    output = tf.keras.layers.Dense(input_dim, activation="sigmoid")(x)

    autoencoder = tf.keras.Model(input_layer, output)

    encoder = tf.keras.Model(input_layer, latent)

    autoencoder.compile(
        optimizer="adam",
        loss="mse"
    )

    return autoencoder, encoder