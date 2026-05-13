require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User'); 
const ReviewOld = require('./models/Review'); // File model bảng Electronics của bạn
const Recommendation = require('./models/Recommendation'); // Móc thêm bảng Gợi ý vào

const seedCustomers = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/DATN');
        console.log("✅ Đã kết nối Database");

        // 1. LẤY DANH SÁCH KHÁCH HÀNG TỪ BẢNG RECOMMENDATIONS (Cực kỳ nhanh)
        console.log("🔍 Đang trích xuất tệp khách hàng VIP có dữ liệu AI...");
        const recommendedUsers = await Recommendation.find().select('reviewerID');
        
        // Lọc ra các ID duy nhất (đề phòng trùng lặp)
        const uniqueUserIds = [...new Set(recommendedUsers.map(r => r.reviewerID))];
        
        console.log(`🎯 Tìm thấy ${uniqueUserIds.length} khách hàng đủ điều kiện.`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        let addedCount = 0;

        console.log("⏳ Bắt đầu tạo tài khoản và quét tên thật (tốc độ cao)...");
        
        // 2. TẠO TÀI KHOẢN VÀ LẤY TÊN
        for (const userId of uniqueUserIds) {
            
            // Tìm nhanh 1 review đầu tiên của người này để lấy tên thật
            const review = await ReviewOld.findOne({ reviewerID: userId }).select('reviewerName');
            
            const userName = (review && review.reviewerName && review.reviewerName.trim() !== "") 
                ? review.reviewerName 
                : `Khách hàng ${userId.substring(0, 5)}`;

            await User.create({
                username: userId,
                name: userName, // Tên thật hiển thị lên Header
                password: hashedPassword,
                email: `${userId.toLowerCase()}@amazon-reviewer.com`,
                role: 0 
            });
            
            addedCount++;
            if (addedCount % 100 === 0) console.log(`⏳ Đã tạo ${addedCount} tài khoản...`);
        }

        console.log(`🎉 HOÀN TẤT! Đã thêm thành công ${addedCount} khách hàng (Role 0).`);
        console.log("Mật khẩu chung: 123456");
        process.exit();
    } catch (error) {
        console.error("❌ Lỗi:", error);
        process.exit(1);
    }
};

seedCustomers();