const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Lấy giỏ hàng của user
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });
        res.json(cart.items);
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// Gộp giỏ hàng Local vào Database khi vừa đăng nhập
exports.syncCart = async (req, res) => {
    try {
        const { localItems } = req.body;
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

        // Gộp đồ: Trùng thì cộng dồn số lượng, mới thì đẩy vào
        localItems.forEach(localItem => {
            const existing = cart.items.find(item => item.asin === localItem.asin);
            if (existing) {
                existing.quantity += localItem.quantity;
            } else {
                cart.items.push(localItem);
            }
        });

        await cart.save();
        res.json({ message: "Đồng bộ giỏ hàng thành công", items: cart.items });
    } catch (error) {
        res.status(500).json({ message: "Lỗi đồng bộ giỏ hàng" });
    }
};

// Thêm/Cập nhật 1 món vào giỏ
exports.addToCart = async (req, res) => {
    try {
        const { product } = req.body;
        
        // ĐÃ FIX LỖI 500 TẠI ĐÂY: Sửa item_id thành asin để khớp với Database mới
        const productInfo = await Product.findOne({ asin: product.asin });

        if (productInfo && String(productInfo.seller_id) === String(req.user.id)) {
            return res.status(400).json({ message: "Bạn không thể tự mua sản phẩm do chính mình bán!" });
        }
        
        let cart = await Cart.findOne({ userId: req.user.id });
        
        // VÁ LỖI: Nếu user chưa có giỏ hàng, tự động tạo mới cho họ ngay lập tức
        if (!cart) cart = new Cart({ userId: req.user.id, items: [] });
        
        const existing = cart.items.find(item => item.asin === product.asin);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.items.push({
                asin: product.asin,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        await cart.save();
        res.json(cart.items);
    } catch (error) {
        console.error("Lỗi khi thêm vào giỏ:", error);
        res.status(500).json({ message: "Lỗi Server khi thêm vào giỏ" });
    }
};

// Xóa 1 món khỏi giỏ
exports.removeFromCart = async (req, res) => {
    try {
        const { asin } = req.params;
        let cart = await Cart.findOne({ userId: req.user.id });
        
        // VÁ LỖI: Nếu không tìm thấy giỏ thì không làm gì cả
        if (!cart) return res.json([]); 

        cart.items = cart.items.filter(item => item.asin !== asin);
        await cart.save();
        res.json(cart.items);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa" });
    }
};

// Xóa trắng giỏ hàng (Dùng sau khi thanh toán xong)
exports.clearCart = async (req, res) => {
    try {
        await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });
        res.json({ message: "Đã dọn sạch giỏ hàng" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi dọn giỏ hàng" });
    }
};