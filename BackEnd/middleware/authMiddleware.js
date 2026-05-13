const jwt = require('jsonwebtoken');

// Lính gác 1: Kiểm tra xem người dùng đã đăng nhập chưa
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: "Từ chối truy cập! Bạn chưa đăng nhập." });

    const token = authHeader.split(" ")[1]; // Lấy token từ chuỗi "Bearer <token>"
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'datn_secret_key_sieu_bao_mat');
        req.user = decoded; // Gắn thông tin user vào request để các hàm sau dùng
        next(); // Cho phép đi tiếp
    } catch (error) {
        res.status(400).json({ message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn!" });
    }
};

// Lính gác 2: Kiểm tra xem có phải Người Bán (Seller) hoặc Admin không
const verifySeller = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 1 || req.user.role === 2) {
            next();
        } else {
            res.status(403).json({ message: "Cảnh báo: Bạn không có quyền Người Bán!" });
        }
    });
};

// Lính gác 3: Kiểm tra xem có phải là Admin tối cao không
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 2) {
            next();
        } else {
            res.status(403).json({ message: "Cảnh báo: Chỉ Admin mới có quyền thực hiện hành động này!" });
        }
    });
};

module.exports = { verifyToken, verifySeller, verifyAdmin };