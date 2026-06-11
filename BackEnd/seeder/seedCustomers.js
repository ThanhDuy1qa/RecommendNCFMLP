require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs'); 
const path = require('path');

const User = require('../models/User'); 
const Recommendation = require('../models/Recommendation'); 

const seedCustomers = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/DATN');
        console.log("✅ Đã kết nối Database");

        await User.deleteMany({ role: 0 });
        console.log("🧹 Đã dọn dẹp khách hàng cũ.");

        // 🌟 BƯỚC SỬA LỖI: Thuật toán đọc file CSV thông minh
        const amazonIdMap = new Map();
        const csvFilePath = path.join(__dirname, 'user_id_map.csv'); // Đảm bảo file nằm trong thư mục BackEnd
        
        if (!fs.existsSync(csvFilePath)) {
            console.error(`❌ KHÔNG TÌM THẤY FILE: ${csvFilePath}`);
            console.log("👉 Vui lòng copy file user_id_map.csv bỏ vào thư mục BackEnd!");
            process.exit(1);
        }

        const csvData = fs.readFileSync(csvFilePath, 'utf-8');
        let errorLines = 0;
        
        csvData.split('\n').forEach(line => {
            if (!line.trim()) return; // Bỏ qua dòng trống

            // Dùng Regex chia cắt bằng dấu phẩy, dấu tab, hoặc dấu cách đều được
            const parts = line.trim().split(/[\s,]+/); 
            
            if (parts.length >= 2) {
                const amazonId = parts[0]; 
                const numericId = parts[1]; 
                
                // Đảm bảo numericId là một số hợp lệ
                if (!isNaN(numericId)) {
                    amazonIdMap.set(Number(numericId), amazonId);
                }
            } else {
                errorLines++;
            }
        });

        console.log(`✅ Đã nạp xong ${amazonIdMap.size} mã định danh từ file CSV.`);
        if (errorLines > 0) console.log(`⚠️ Có ${errorLines} dòng trong CSV không đúng định dạng và bị bỏ qua.`);

        // NẾU VẪN LÀ 0 THÌ DỪNG LẠI NGAY LẬP TỨC
        if (amazonIdMap.size === 0) {
            console.error("❌ FILE CSV RỖNG HOẶC SAI ĐỊNH DẠNG. HÃY KIỂM TRA LẠI!");
            process.exit(1);
        }

        const uniqueUserIds = await Recommendation.distinct('user_id');
        console.log(`🎯 Tìm thấy ${uniqueUserIds.length} khách hàng có data AI.`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        let addedCount = 0;

        for (const userId of uniqueUserIds) {
            // Tra ID từ Map CSV vừa nạp
            const amazonId = amazonIdMap.get(userId) || null;

            await User.create({
                username: userId.toString(), 
                name: `Khách hàng #${userId}`,
                password: hashedPassword,
                email: `user${userId}@datn.com`,
                role: 0,
                amazon_id: amazonId 
            });
            
            addedCount++;
            if (addedCount % 500 === 0) {
                console.log(`⏳ Đã tạo ${addedCount} / ${uniqueUserIds.length} tài khoản...`);
            }
        }

        console.log(`🎉 HOÀN TẤT! Đã thêm ${addedCount} khách hàng với amazon_id đầy đủ.`);
        process.exit();
    } catch (error) {
        console.error("❌ Lỗi:", error);
        process.exit(1);
    }
};

seedCustomers();