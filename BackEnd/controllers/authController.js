const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Kiểm tra tài khoản có tồn tại không
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Tài khoản không tồn tại!" });
        }

        // 2. Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Sai mật khẩu!" });
        }

        // 3. Tạo vé thông hành (Token) chứa thông tin chức vụ (role)
        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username },
            process.env.JWT_SECRET || 'datn_secret_key_sieu_bao_mat',
            { expiresIn: '1d' } // Vé có hạn 1 ngày
        );

        // 4. Trả về cho Frontend
        res.json({
            message: "Đăng nhập thành công!",
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                amazon_id: user.amazon_id,
                name: user.name,
                email: user.email,
                // 🌟 THÊM 2 DÒNG NÀY ĐỂ FRONTEND NHẬN ĐƯỢC SĐT VÀ ĐỊA CHỈ
                phone: user.phone || '',
                address: user.address || ''
            }
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

module.exports = { login };