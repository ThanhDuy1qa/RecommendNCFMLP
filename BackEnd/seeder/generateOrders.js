require('dotenv').config({ path: '../.env' }); 
const mongoose = require('mongoose');
const User = require('../models/User');       
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/DATN'; 

/**
 * 🌟 THUẬT TOÁN AI PHÂN TÍCH HÀNH VI: Mô phỏng số lượng mua dựa trên giá trị sản phẩm
 * Áp dụng quy luật co giãn của cầu theo giá (Price Elasticity of Demand)
 */
const getRealisticQuantity = (price) => {
    const rand = Math.random();
    
    // 1. Phân khúc giá rẻ (< $15): Phụ kiện tiêu hao, dễ phát sinh mua bốc đồng/mua kèm số lượng nhiều
    if (price < 15) {
        if (rand < 0.70) return 1; // 70% mua 1 cái
        if (rand < 0.90) return 2; // 20% mua 2 cái
        if (rand < 0.98) return 3; // 8% mua 3 cái
        return 5;                  // 2% mua sỉ 5 cái
    }
    
    // 2. Phân khúc tầm trung ($15 - $100): Thiết bị ngoại vi, đôi khi mua cặp hoặc mua dự phòng
    if (price < 100) {
        if (rand < 0.92) return 1; // 92% mua 1 cái
        return 2;                  // 8% mua 2 cái (Ví dụ: 2 cáp sạc cao cấp, 2 chuột máy tính)
    }
    
    // 3. Phân khúc cao cấp (> $100): Giá trị cao, thiết bị chính (Tivi, Loa lớn, Máy ảnh) -> Luôn mua 1
    return 1;
};

const generateOrdersFast = async () => {
    try {
        console.log("Locating environment database access...");
        console.log("🔄 Đang kết nối tới Database...");
        await mongoose.connect(dbURI);
        console.log("✅ Kết nối Database thành công!\n");

        // ==========================================
        // 1. TẢI PRODUCT VÀO RAM
        // ==========================================
        console.log("📦 1/4. Đang tải dữ liệu Product vào RAM...");
        const products = await Product.find({}).select('asin title price price_clean image_url seller_id').lean();
        const productMap = new Map();
        for (const p of products) {
            productMap.set(p.asin, p);
        }
        console.log(`   -> Xong! Đã cache ${products.length} sản phẩm.\n`);

        // ==========================================
        // 2. TẢI USER VÀO RAM
        // ==========================================
        console.log("👥 2/4. Đang tải dữ liệu User vào RAM...");
        const users = await User.find({}).select('amazon_id username _id name').lean();
        const userMap = new Map();
        for (const u of users) {
            if (u.amazon_id) userMap.set(u.amazon_id, { id: u._id, name: u.name });
            if (u.username) {
                userMap.set(u.username, { id: u._id, name: u.name });
                if (!isNaN(u.username)) userMap.set(Number(u.username), { id: u._id, name: u.name });
            }
        }
        console.log(`   -> Xong! Đã cache ${users.length} người dùng.\n`);

        // ==========================================
        // 3. GOM NHÓM REVIEW TRỰC TIẾP TỪ LÕI MONGODB
        // ==========================================
        console.log("⚙️ 3/4. Đang yêu cầu MongoDB gom nhóm Reviews (Mất khoảng 10-30s)...");
        const cursor = Review.aggregate([
            {
                $group: {
                    _id: {
                        reviewer: { $ifNull: ["$reviewerID", "$user_id"] },
                        time: "$unixReviewTime"
                    },
                    reviews: { $push: "$$ROOT" }
                }
            }
        ]).allowDiskUse(true).cursor();

        // ==========================================
        // 4. TẠO ĐƠN HÀNG VÀ BẮN HÀNG LOẠT (BULK INSERT)
        // ==========================================
        console.log("🚀 4/4. Bắt đầu tạo Đơn hàng hàng loạt...");
        let ordersBatch = [];
        let totalOrders = 0;
        let totalItemsSold = 0; // Đếm tổng số món hàng thực tế bán ra

        for await (const group of cursor) {
            const identifier = group._id.reviewer;
            const timeKey = group._id.time;
            const reviewList = group.reviews;

            const matchedUser = userMap.get(identifier);
            if (!matchedUser) continue; 

            const orderItems = [];
            let totalAmount = 0;
            let orderDate = timeKey ? new Date(Number(timeKey) * 1000) : new Date();

            for (const review of reviewList) {
                const product = productMap.get(review.asin); 

                let price = review.price_clean || (product && product.price) || 0;
                if (typeof price === 'string') price = parseFloat(price.replace(/[^0-9.-]+/g, "")) || 0;

                let sellerId = null;
                if (product && product.seller_id) sellerId = product.seller_id;

                // 🌟 TÍNH TOÁN SỐ LƯỢNG MUA THÔNG MINH DỰA TRÊN PHÂN KHÚC GIÁ
                const qty = price > 0 ? getRealisticQuantity(price) : 1;
                totalItemsSold += qty;

                orderItems.push({
                    asin: review.asin,
                    title: review.title || (product ? product.title : "Sản phẩm không xác định"),
                    price: price,
                    image: review.image_url || (product ? product.image_url : "https://via.placeholder.com/150"),
                    quantity: qty, 
                    sellerId: sellerId
                });

                // Tổng tiền = Đơn giá * Số lượng
                totalAmount += (price * qty); 
            }

            if (orderItems.length === 0) continue;

            ordersBatch.push({
                userId: matchedUser.id,
                items: orderItems,
                totalAmount: parseFloat(totalAmount.toFixed(2)),
                shippingInfo: {
                    fullName: matchedUser.name || "Khách hàng Amazon",
                    phone: "0999999999",
                    address: "Địa chỉ khởi tạo tự động từ Dataset"
                },
                paymentMethod: "COD",
                status: "Hoàn thành",
                createdAt: orderDate,
                updatedAt: orderDate
            });

            if (ordersBatch.length >= 5000) {
                await Order.insertMany(ordersBatch);
                totalOrders += ordersBatch.length;
                console.log(`   ⚡ Tiến độ: Đã đẩy ${totalOrders.toLocaleString()} đơn hàng vào Database...`);
                ordersBatch = []; 
            }
        }

        if (ordersBatch.length > 0) {
            await Order.insertMany(ordersBatch);
            totalOrders += ordersBatch.length;
        }

        console.log(`\n🎉 HOÀN TẤT TUYỆT ĐỐI!`);
        console.log(`   - Tổng số đơn hàng (Orders): ${totalOrders.toLocaleString()}`);
        console.log(`   - Tổng sản phẩm bán ra (Units Sold): ${totalItemsSold.toLocaleString()}`);
        console.log(`   - Chỉ số UPT (Units Per Transaction): ${(totalItemsSold / totalOrders).toFixed(2)}`);

    } catch (error) {
        console.error("❌ Lỗi nghiêm trọng:", error);
    } finally {
        console.log("Đang ngắt kết nối an toàn...");
        mongoose.connection.close();
        process.exit(0);
    }
};

generateOrdersFast();