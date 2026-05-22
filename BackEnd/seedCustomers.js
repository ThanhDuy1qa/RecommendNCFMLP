require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User'); 
const Recommendation = require('./models/Recommendation'); 
const TrainData = require('./models/TrainData'); // BỔ SUNG: Import TrainData

const seedCustomers = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/DATN');
        console.log("✅ Đã kết nối Database");

        // Xóa sạch user có role 0 cũ để tránh trùng lặp
        await User.deleteMany({ role: 0 });
        console.log("🧹 Đã dọn dẹp khách hàng cũ.");

        console.log("🔍 Đang trích xuất danh sách khách hàng từ Recommendation...");
        const uniqueUserIds = await Recommendation.distinct('user_id');
        console.log(`🎯 Tìm thấy ${uniqueUserIds.length} khách hàng có data AI.`);

        // BƯỚC MỚI: Tạo "Từ điển" map giữa ID số (user) và ID chuỗi Amazon (user_id)
        console.log("📚 Đang tải bộ từ điển định danh từ TrainData...");
        const trainDataMappings = await TrainData.find({}, 'user user_id').lean();
        
        // Dùng Map của JavaScript để tra cứu siêu tốc độ (O(1))
        const amazonIdMap = new Map();
        trainDataMappings.forEach(doc => {
            if (doc.user !== undefined && doc.user_id) {
                amazonIdMap.set(doc.user, doc.user_id);
            }
        });
        console.log(`✅ Đã nạp xong ${amazonIdMap.size} mã định danh Amazon.`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        let addedCount = 0;

        console.log("⚙️ Đang tiến hành tạo tài khoản...");
        
        // Tạo tài khoản mới
        for (const userId of uniqueUserIds) {
            // Tra cứu amazon_id từ bộ từ điển, nếu không có thì để null
            const amazonId = amazonIdMap.get(userId) || null;

            await User.create({
                username: userId.toString(), 
                name: `Khách hàng AI #${userId}`,
                password: hashedPassword,
                email: `user${userId}@datn.com`,
                role: 0,
                amazon_id: amazonId // ĐÃ BỔ SUNG: Gắn mã Amazon vào đây!
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