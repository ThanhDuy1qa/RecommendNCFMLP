const Cart = require('../models/Cart');
const Product = require('../models/Product');

// =======================================================
// 1. CART HELPER FUNCTIONS
// Các hàm hỗ trợ nội bộ, không export trực tiếp cho route
// =======================================================

/**
 * Tìm giỏ hàng của user.
 * Nếu user chưa có giỏ hàng thì tự động tạo giỏ mới.
 */
const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      items: []
    });
  }

  return cart;
};

/**
 * Kiểm tra sản phẩm có phải của chính user đang đăng nhập không.
 * Dùng để chặn seller tự mua sản phẩm của mình.
 */
const isOwnProduct = async (asin, userId) => {
  const productInfo = await Product.findOne({ asin });

  if (!productInfo) {
    return false;
  }

  return String(productInfo.seller_id) === String(userId);
};

// =======================================================
// 2. CUSTOMER CART FUNCTIONS
// Các hàm giỏ hàng dành cho user đang đăng nhập
// =======================================================

/**
 * Lấy giỏ hàng của user hiện tại.
 * Nếu chưa có giỏ hàng thì tạo mới và trả về mảng rỗng.
 */
const getCart = async (req, res) => {
  try {
    const cart = await findOrCreateCart(req.user.id);

    res.json(cart.items);
  } catch (error) {
    console.error('Lỗi lấy giỏ hàng:', error);
    res.status(500).json({
      message: 'Lỗi Server'
    });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { asin, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });

    if (cart) {
      const existing = cart.items.find(item => item.asin === asin);
      if (existing) {
        existing.quantity = quantity; // Ghi đè số lượng mới
        await cart.save();
      }
    }
    res.json({ message: 'Cập nhật số lượng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật số lượng' });
  }
};
// Nhớ thêm hàm này vào module.exports ở cuối file nhé!
/**
 * Đồng bộ giỏ hàng local vào database sau khi user đăng nhập.
 * Nếu sản phẩm đã tồn tại trong DB cart thì cộng dồn số lượng.
 * Nếu chưa có thì thêm mới vào cart.
 */
const syncCart = async (req, res) => {
  try {
    const { localItems } = req.body;

    const cart = await findOrCreateCart(req.user.id);

    if (!Array.isArray(localItems)) {
      return res.status(400).json({
        message: 'Dữ liệu giỏ hàng local không hợp lệ!'
      });
    }

    localItems.forEach((localItem) => {
      const existing = cart.items.find(
        (item) => item.asin === localItem.asin
      );

      if (existing) {
        existing.quantity += localItem.quantity;
      } else {
        cart.items.push(localItem);
      }
    });

    await cart.save();

    res.json({
      message: 'Đồng bộ giỏ hàng thành công',
      items: cart.items
    });
  } catch (error) {
    console.error('Lỗi đồng bộ giỏ hàng:', error);
    res.status(500).json({
      message: 'Lỗi đồng bộ giỏ hàng'
    });
  }
};

/**
 * Thêm sản phẩm vào giỏ hàng.
 * Nếu sản phẩm đã có trong giỏ thì tăng số lượng lên 1.
 * Nếu chưa có thì thêm mới.
 * Chặn trường hợp seller tự mua sản phẩm của chính mình.
 */
const addToCart = async (req, res) => {
  try {
    const { product } = req.body;

    if (!product || !product.asin) {
      return res.status(400).json({
        message: 'Thiếu thông tin sản phẩm!'
      });
    }

    const ownProduct = await isOwnProduct(product.asin, req.user.id);

    if (ownProduct) {
      return res.status(400).json({
        message: 'Bạn không thể tự mua sản phẩm do chính mình bán!'
      });
    }

    const cart = await findOrCreateCart(req.user.id);

    const existing = cart.items.find(
      (item) => item.asin === product.asin
    );

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
    console.error('Lỗi khi thêm vào giỏ:', error);
    res.status(500).json({
      message: 'Lỗi Server khi thêm vào giỏ'
    });
  }
};

/**
 * Xóa một sản phẩm khỏi giỏ hàng theo ASIN.
 * Nếu user chưa có giỏ hàng thì trả về mảng rỗng.
 */
const removeFromCart = async (req, res) => {
  try {
    const { asin } = req.params;

    const cart = await Cart.findOne({
      userId: req.user.id
    });

    if (!cart) {
      return res.json([]);
    }

    cart.items = cart.items.filter(
      (item) => item.asin !== asin
    );

    await cart.save();

    res.json(cart.items);
  } catch (error) {
    console.error('Lỗi khi xóa khỏi giỏ:', error);
    res.status(500).json({
      message: 'Lỗi khi xóa'
    });
  }
};

/**
 * Xóa toàn bộ sản phẩm trong giỏ hàng.
 * Thường dùng sau khi thanh toán thành công.
 */
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items: [] }
    );

    res.json({
      message: 'Đã dọn sạch giỏ hàng'
    });
  } catch (error) {
    console.error('Lỗi dọn giỏ hàng:', error);
    res.status(500).json({
      message: 'Lỗi dọn giỏ hàng'
    });
  }
};
const replaceCart = async (req, res) => {
  try {
    const { items } = req.body;
    const cart = await findOrCreateCart(req.user.id);
    
    // Ghi đè hoàn toàn mảng items cũ bằng mảng items mới
    cart.items = items; 
    await cart.save();

    res.json({ message: 'Ghi đè giỏ hàng thành công', items: cart.items });
  } catch (error) {
    console.error('Lỗi ghi đè giỏ hàng:', error);
    res.status(500).json({ message: 'Lỗi ghi đè giỏ hàng' });
  }
};
// =======================================================
// 3. EXPORT CONTROLLER FUNCTIONS
// Xuất các hàm để route sử dụng
// =======================================================

module.exports = {
  // Customer cart
  getCart,
  syncCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateQuantity,
  replaceCart,
};