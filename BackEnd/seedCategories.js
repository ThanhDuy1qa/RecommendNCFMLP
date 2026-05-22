require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const seedCategories = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/DATN');
        console.log("✅ Đã kết nối Database");

        console.log("🔍 Đang quét các danh mục hiện có trong kho Sản phẩm...");
        
        // 1. Lấy toàn bộ danh mục giống hệt logic cũ
        const rawCategories = await Product.distinct("main_cat");
        const cleanedCategories = rawCategories
            .filter(cat => cat != null && cat.trim() !== "") 
            .filter(cat => !cat.includes("<img") && !cat.includes("<a") && !cat.startsWith("<")) 
            .map(cat => cat.replace(/&amp;/g, '&').trim()); 

        const uniqueCategories = [...new Set(cleanedCategories)];
        
        console.log(`🎯 Tìm thấy ${uniqueCategories.length} danh mục hợp lệ. Bắt đầu chuyển đổi...`);

        let addedCount = 0;

        // 2. Lưu từng danh mục vào bảng Category mới
        for (const catName of uniqueCategories) {
            // Kiểm tra xem đã tồn tại chưa để tránh lỗi Duplicate
            const exists = await Category.findOne({ name: catName });
            if (!exists) {
                await Category.create({ name: catName });
                addedCount++;
            }
        }

        console.log(`🎉 HOÀN TẤT! Đã đồng bộ thành công ${addedCount} danh mục sang bảng Category độc lập.`);
        process.exit();
    } catch (error) {
        console.error("❌ Lỗi:", error);
        process.exit(1);
    }
};

seedCategories();