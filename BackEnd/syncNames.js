const mongoose = require('mongoose');
const User = require('./models/User'); 
const Review = require('./models/Review'); // Tên model Review của bạn

const syncNames = async () => {
    try {
        // Thay link bằng URL DB của bạn (giống trong file seedCustomers)
        await mongoose.connect('mongodb://127.0.0.1:27017/DATN');
        console.log("✅ Đã kết nối DB. Bắt đầu đồng bộ tên thật...");

        const users = await User.find({ role: 0 });
        let count = 0;

        for (const user of users) {
            // Tìm 1 review bất kỳ của user này để lấy tên
            const review = await Review.findOne({ reviewerID: user.username });
            
            if (review && review.reviewerName) {
                user.name = review.reviewerName; // Lấy tên thật (VD: Teri Adams)
            } else {
                user.name = `Khách hàng ${user.username.substring(0, 4)}`; // Tên dự phòng
            }
            
            await user.save();
            count++;
            
            if (count % 500 === 0) console.log(`⏳ Đã cập nhật tên cho ${count} người dùng...`);
        }

        console.log("🎉 Hoàn tất! Đã đồng bộ tên cho toàn bộ khách hàng.");
        process.exit();
    } catch (error) {
        console.error("❌ Lỗi:", error);
        process.exit(1);
    }
};

syncNames();