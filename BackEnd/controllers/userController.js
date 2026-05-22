const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ==========================================
// 1. CHỨC NĂNG CẬP NHẬT TÊN HIỂN THỊ
// ==========================================
exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id; // Lấy ID từ token do middleware verifyToken cung cấp

        // Kiểm tra dữ liệu đầu vào
        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Tên không được để trống!" });
        }

        // Tìm và cập nhật user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name: name.trim() },
            { new: true } // Trả về document mới sau khi update
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        res.json({ 
            message: "Cập nhật tên thành công!", 
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });

    } catch (error) {
        console.error("Lỗi khi cập nhật profile:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật thông tin!" });
    }
};

// ==========================================
// 2. CHỨC NĂNG ĐỔI MẬT KHẨU
// ==========================================
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        // 1. Kiểm tra đầu vào
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới!" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
        }

        // 2. Tìm user trong database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
        }

        // 3. Kiểm tra mật khẩu cũ có khớp với database không
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu hiện tại không chính xác!" });
        }

        // 4. Kiểm tra mật khẩu mới có trùng mật khẩu cũ không (Tùy chọn cho tính bảo mật)
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: "Mật khẩu mới không được trùng với mật khẩu cũ!" });
        }

        // 5. Mã hóa mật khẩu mới và lưu vào DB
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save(); // Kích hoạt save để lưu lại password mới

        res.json({ message: "Đổi mật khẩu thành công!" });

    } catch (error) {
        console.error("Lỗi khi đổi mật khẩu:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi đổi mật khẩu!" });
    }
};