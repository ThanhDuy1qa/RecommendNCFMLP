const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/DATN');
        console.log("🟢 Đã kết nối Database.");

        // 🛑 BƯỚC QUAN TRỌNG: XÓA SẠCH BẢNG USER CŨ
        console.log("🧹 Đang xóa toàn bộ dữ liệu User cũ...");
        await User.deleteMany({});
        console.log("✅ Bảng User đã trống rỗng. Bắt đầu tạo mới...");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("123456", salt);

        // 1. TẠO TÀI KHOẢN ADMIN (Có thêm tên)
        await User.create({ 
            username: "admin", 
            name: "Quản trị viên Tối cao", // 👈 Đã thêm tên
            email: "admin@system.com", 
            password: hashedPassword, 
            role: 2 
        });
        console.log("✅ Đã tạo tài khoản Admin.");

        // 2. LẤY DANH SÁCH BRAND HỢP LỆ
        const invalidBrands = [null, "", "N/A", "Unknown", "null"];
        const distinctBrands = await Product.distinct("brand", { brand: { $nin: invalidBrands } });
        console.log(`🔍 Tìm thấy ${distinctBrands.length} thương hiệu hợp lệ. Đang tạo gian hàng...`);

        // 3. DUYỆT QUA TỪNG BRAND VÀ TẠO SELLER
        // 3. DUYỆT QUA TỪNG BRAND VÀ TẠO SELLER
        for (const brand of distinctBrands) {
            if (!brand) continue;
            const brandStr = String(brand);
            const cleanUsername = brandStr.toLowerCase().replace(/[^a-z0-9]/g, '') + "_store";
            
            if (!cleanUsername || cleanUsername === "_store") continue; 

            // THÊM BƯỚC KIỂM TRA: Nếu brand đã được tạo tài khoản rồi thì không tạo lại nữa
            let seller = await User.findOne({ username: cleanUsername });
            
            if (!seller) {
                seller = await User.create({
                    username: cleanUsername,
                    name: `Gian hàng ${brandStr}`, 
                    email: `${cleanUsername}@mall.com`,
                    password: hashedPassword,
                    role: 1
                });
            }

            // Gán tất cả sản phẩm của brand này vào seller (dù là tạo mới hay đã có sẵn)
            await Product.updateMany(
                { brand: brand },
                { $set: { seller_id: seller._id } }
            );
        }

        // 4. GOM CÁC SẢN PHẨM KHÔNG RÕ BRAND CHO "TẠP HÓA TỔNG HỢP"
        const generalStore = await User.create({
            username: "taphoa_tonghop",
            name: "Tạp Hóa Tổng Hợp", // 👈 Đã thêm tên
            email: "taphoa@system.com",
            password: hashedPassword,
            role: 1
        });

        const leftoverUpdate = await Product.updateMany(
            { $or: [{ seller_id: null }, { seller_id: { $exists: false } }] },
            { $set: { seller_id: generalStore._id } }
        );
        console.log(`✅ Đã gom ${leftoverUpdate.modifiedCount} sản phẩm lẻ tẻ vào gian hàng Tạp Hóa.`);

        console.log("🎉 HOÀN TẤT TẠO SELLER VÀ ADMIN!");
        process.exit();
    } catch (error) {
        console.error("❌ Lỗi khi chạy Seeder:", error);
        process.exit(1);
    }
};

seedData();