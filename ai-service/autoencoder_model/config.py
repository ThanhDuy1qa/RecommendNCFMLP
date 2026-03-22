# File cấu hình cho dự án, chứa các tham số và đường dẫn quan trọng để điều chỉnh quá trình huấn luyện và đánh giá mô hình autoencoder

DATA_PATH = "data/sample.csv"
# đường dẫn đến file CSV chứa dữ liệu đánh giá, có thể thay đổi tùy theo vị trí của file trên hệ thống

MIN_USER_INTERACTIONS = 1
# số lượng đánh giá tối thiểu mà một người dùng phải có để được giữ lại trong tập dữ liệu, giúp loại bỏ những người dùng quá ít tương tác
MIN_ITEM_INTERACTIONS = 1
# số lượng đánh giá tối thiểu mà một sản phẩm phải có để được giữ lại trong tập dữ liệu, giúp loại bỏ những sản phẩm quá ít tương tác

LATENT_DIM = 50
# số chiều của không gian tiềm ẩn (latent space) trong mô hình autoencoder, ảnh hưởng đến khả năng biểu diễn của mô hình và chất lượng embeddings được tạo ra

EPOCHS = 20
# số lượng epoch (lượt huấn luyện) tối đa cho quá trình đào tạo mô hình, có thể điều chỉnh tùy theo kích thước dữ liệu và tốc độ hội tụ của mô hình
BATCH_SIZE = 256
# kích thước batch cho quá trình huấn luyện, ảnh hưởng đến tốc độ và hiệu suất huấn luyện
LEARNING_RATE = 0.001
# tốc độ học (learning rate) cho thuật toán tối ưu hóa, ảnh hưởng đến quá trình cập nhật trọng số của mô hình trong quá trình huấn luyện

TRAIN_RATIO = 0.8
# tỷ lệ phần trăm của dữ liệu được sử dụng cho tập huấn luyện, phần còn lại sẽ được chia cho tập validation và test
VAL_RATIO = 0.1
# tỷ lệ phần trăm của dữ liệu được sử dụng cho tập validation, phần còn lại sẽ được sử dụng cho tập test
TEST_RATIO = 0.1
# tỷ lệ phần trăm của dữ liệu được sử dụng cho tập test, đảm bảo rằng tổng của TRAIN_RATIO, VAL_RATIO và TEST_RATIO bằng 1.0