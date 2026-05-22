const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// 1. Tạo đơn hàng (Đã tự động quét tìm Seller)
exports.createOrder = async (req, res) => {
    try {
        const { items, totalAmount, shippingInfo, paymentMethod } = req.body;

        // Quét qua từng món trong giỏ, truy vấn DB để tìm chủ nhân của nó
        const itemsWithSeller = await Promise.all(items.map(async (item) => {
            const productInfo = await Product.findOne({ asin: item.asin });
            return {
                ...item,
                sellerId: productInfo ? productInfo.seller_id : null // Gắn thẻ chủ nhân
            };
        }));

        const newOrder = await Order.create({ 
            userId: req.user.id, 
            items: itemsWithSeller, 
            totalAmount, 
            shippingInfo, 
            paymentMethod 
        });

        res.status(201).json({ message: "Đặt hàng thành công!", order: newOrder });
    } catch (error) {
        console.error("Lỗi tạo đơn hàng:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 2. Lấy lịch sử mua hàng của Khách hàng
exports.getMyHistory = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 3. Lấy danh sách đơn hàng dành cho Seller
exports.getSellerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ "items.sellerId": req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 4. Cập nhật trạng thái đơn hàng (Dành cho Seller xác nhận đơn)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId, { status: status }, { new: true }
        );
        res.json({ message: "Cập nhật thành công", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server khi cập nhật" });
    }
};

// Đếm số lượng đơn hàng "Chờ xác nhận" của Seller
exports.getPendingCount = async (req, res) => {
    try {
        const count = await Order.countDocuments({
            "items.sellerId": req.user.id,
            status: 'Chờ xác nhận'
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};


// 6. Lấy TOÀN BỘ đơn hàng trong hệ thống (CHỈ DÀNH CHO ADMIN)
exports.getAllOrdersForAdmin = async (req, res) => {
    try {
        if (req.user.role !== 2) {
            return res.status(403).json({ message: "Truy cập bị từ chối. Chỉ Admin mới có quyền này!" });
        }

        // Lấy tất cả đơn hàng (dùng .lean() để dễ dàng gắn thêm dữ liệu mới)
        const orders = await Order.find().sort({ createdAt: -1 }).lean();

        // THUẬT TOÁN TRA CỨU TÊN SELLER (Gộp ID lại để query 1 lần cho nhẹ Server)
        const sellerIds = [];
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.sellerId && !sellerIds.includes(item.sellerId)) {
                    sellerIds.push(item.sellerId);
                }
            });
        });

        // Tìm tất cả Seller có ID nằm trong danh sách trên
        const sellers = await User.find({ _id: { $in: sellerIds } }, 'name username');
        const sellerMap = {};
        sellers.forEach(seller => {
            sellerMap[seller._id.toString()] = seller.name || seller.username || "Người bán ẩn danh";
        });

        // Gắn thêm thuộc tính sellerName vào từng món hàng
        const formattedOrders = orders.map(order => {
            const newItems = order.items.map(item => ({
                ...item,
                sellerName: item.sellerId ? (sellerMap[item.sellerId.toString()] || "Không xác định") : "Cửa hàng gốc"
            }));
            return { ...order, items: newItems };
        });

        res.json(formattedOrders);
    } catch (error) {
        console.error("Lỗi lấy tất cả đơn hàng:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};