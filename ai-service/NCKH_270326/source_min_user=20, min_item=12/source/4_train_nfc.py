import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import pandas as pd
import numpy as np
import os

# Cấu hình thiết bị
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Tham số mô hình (Tùy chỉnh theo yêu cầu NCF)
FACTOR_NUM = 32      # Số chiều embedding cho GMF
MLP_LAYERS = [64, 32, 16]  # Kiến trúc MLP hình tháp [cite: 4]
DROPOUT = 0.2        # Chống overfitting [cite: 11]
BATCH_SIZE = 256
LEARNING_RATE = 0.001
EPOCHS = 20

class NCFDataset(Dataset):
    def __init__(self, csv_file):
        # Đọc dữ liệu từ kết quả clean lần 4 [cite: 12, 18]
        df = pd.read_csv(csv_file)
        self.users = torch.LongTensor(df['user'].values)
        self.items = torch.LongTensor(df['item'].values)
        self.ratings = torch.FloatTensor(df['rating'].values) # Rating đã chia 5 [cite: 39]
        
    def __len__(self):
        return len(self.users)
    
    def __getitem__(self, idx):
        return self.users[idx], self.items[idx], self.ratings[idx]
    
class NeuMF(nn.Module):
    def __init__(self, num_users, num_items, factor_num, layers):
        super(NeuMF, self).__init__()
        
        # Nhánh GMF (Tương tác tuyến tính) [cite: 8]
        self.embed_user_GMF = nn.Embedding(num_users, factor_num)
        self.embed_item_GMF = nn.Embedding(num_items, factor_num)
        
        # Nhánh MLP (Tương tác phi tuyến) [cite: 6, 9]
        self.embed_user_MLP = nn.Embedding(num_users, layers[0] // 2)
        self.embed_item_MLP = nn.Embedding(num_items, layers[0] // 2)
        
        mlp_modules = []
        for i in range(len(layers) - 1):
            mlp_modules.append(nn.Linear(layers[i], layers[i+1]))
            mlp_modules.append(nn.ReLU())
            mlp_modules.append(nn.Dropout(p=DROPOUT)) # Theo dõi overfitting [cite: 11]
        self.mlp_network = nn.Sequential(*mlp_modules)
        
        # Lớp dự đoán cuối cùng (Kết hợp GMF và MLP) [cite: 7]
        self.predict_layer = nn.Linear(factor_num + layers[-1], 1)
        self.sigmoid = nn.Sigmoid() # Giới hạn đầu ra trong [0, 1]

    def forward(self, user_indices, item_indices):
        # GMF Path
        user_gmf = self.embed_user_GMF(user_indices)
        item_gmf = self.embed_item_GMF(item_indices)
        gmf_output = user_gmf * item_gmf
        
        # MLP Path
        user_mlp = self.embed_user_MLP(user_indices)
        item_mlp = self.embed_item_MLP(item_indices)
        mlp_input = torch.cat([user_mlp, item_mlp], dim=-1)
        mlp_output = self.mlp_network(mlp_input)
        
        # Fusion
        combined = torch.cat([gmf_output, mlp_output], dim=-1)
        prediction = self.predict_layer(combined)
        return self.sigmoid(prediction).view(-1)
    
# Khởi tạo dữ liệu và mô hình
train_data = NCFDataset("../data/clean_processed_data/train_interactions.csv")
train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True)

model = NeuMF(num_users=19191, num_items=19482, factor_num=FACTOR_NUM, layers=MLP_LAYERS).to(device)
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

print("🚀 Bắt đầu huấn luyện NCF...")
for epoch in range(EPOCHS):
    model.train()
    total_loss = 0
    for user, item, label in train_loader:
        user, item, label = user.to(device), item.to(device), label.to(device)
        
        optimizer.zero_grad()
        prediction = model(user, item)
        loss = criterion(prediction, label)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        
    print(f"Epoch {epoch+1}/{EPOCHS} | Loss: {total_loss/len(train_loader):.6f}")

# Lưu mô hình
torch.save(model.state_dict(), "../data/train_Au/best_ncf_model.pth")
print("✅ Đã lưu mô hình NCF thành công!")

# Thêm vào cuối file 4_train_ncf.py
test_data = NCFDataset("../data/clean_processed_data/test_interactions.csv")
test_loader = DataLoader(test_data, batch_size=BATCH_SIZE, shuffle=False)

model.eval()
test_loss = 0
with torch.no_grad():
    for user, item, label in test_loader:
        user, item, label = user.to(device), item.to(device), label.to(device)
        prediction = model(user, item)
        loss = criterion(prediction, label)
        test_loss += loss.item()

print(f"📉 Final Test RMSE: {np.sqrt(test_loss/len(test_loader)):.6f}")