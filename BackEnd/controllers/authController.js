const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { transport } = require('./emailController');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

        // 🌟 KIỂM TRA NHANH XEM KHÁCH CÓ LỊCH SỬ MUA HÀNG KHÔNG
        // (Chỉ cần đếm xem có đơn nào Đã hoàn thành không, tốc độ cực nhanh)
        const orderCount = await Order.countDocuments({ 
            userId: user._id, 
            status: 'Hoàn thành' 
        });
        const hasPurchaseHistory = orderCount > 0;

        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username },
            process.env.JWT_SECRET || 'datn_secret_key_sieu_bao_mat',
            { expiresIn: '1d' }
        );

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
                phone: user.phone || '',
                address: user.address || '',
                preferences: user.preferences || [],
                // 🌟 GỬI THÊM CỜ NÀY CHO FRONTEND
                hasPurchaseHistory: hasPurchaseHistory 
            }
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};
const register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // 1. CHỐNG NOSQL INJECTION: Đảm bảo tất cả dữ liệu gửi lên phải là Chuỗi (String)
        if (
            typeof name !== 'string' || 
            typeof username !== 'string' || 
            typeof email !== 'string' || 
            typeof password !== 'string'
        ) {
            return res.status(400).json({ message: 'Định dạng dữ liệu không hợp lệ!' });
        }

        if (!name.trim() || !username.trim() || !email.trim() || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
        }

        // 2. BỨC TƯỜNG KIỂM TRA ĐỊNH DẠNG (REGEX)
        // Chặn khoảng trắng và ký tự đặc biệt ở Username (Chống giả mạo, lỗi URL)
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ 
                message: 'Tên đăng nhập chỉ gồm chữ, số, dấu gạch dưới và dài 3-20 ký tự!' 
            });
        }

        // Kiểm tra định dạng Email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Địa chỉ email không hợp lệ!' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự!' });
        }

        const cleanEmail = email.toLowerCase().trim();

        // 3. Kiểm tra xem user đã tồn tại ở bảng CHÍNH chưa
        const existingUser = await User.findOne({ $or: [{ email: cleanEmail }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email hoặc Tên đăng nhập đã được sử dụng!' });
        }

        // 4. Xử lý tài khoản bị kẹt (Chưa xác thực mà đăng ký lại)
        const existingPending = await PendingUser.findOne({ $or: [{ email: cleanEmail }, { username }] });
        if (existingPending) {
            await PendingUser.findByIdAndDelete(existingPending._id);
        }

        // 5. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 6. LƯU VÀO BẢNG TẠM
        const pendingUser = await PendingUser.create({
            name: name.trim(),
            username,
            email: cleanEmail,
            password: hashedPassword,
            role: 0
        });

        const token = jwt.sign(
            { pendingId: pendingUser._id },
            process.env.JWT_SECRET || 'datn_secret_key',
            { expiresIn: '24h' }
        );

        const verificationLink = `http://localhost:5173/verify-account?token=${token}`;

        // 7. CHỐNG XSS CHO EMAIL: Chuyển đổi các thẻ HTML nguy hiểm thành văn bản thường
        const escapeHTML = (str) => {
            return str.replace(/[&<>'"]/g, 
                tag => ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[tag])
            );
        };
        const safeName = escapeHTML(pendingUser.name);

        // 8. Gửi Email
        await transport.sendMail({
            from: '"Hệ Thống" <noreply@khodientu.com>',
            to: pendingUser.email,
            subject: "✅ Kích hoạt tài khoản của bạn",
            html: `
                <div style="font-family: Arial; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
                    <h2 style="color: #0284c7;">Chào ${safeName},</h2>
                    <p>Vui lòng click vào nút bên dưới để hoàn tất việc đăng ký tài khoản (Link có hiệu lực trong 24h):</p>
                    <a href="${verificationLink}" style="display:inline-block; padding: 10px 20px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 5px;">
                        Kích Hoạt Tài Khoản
                    </a>
                </div>
            `
        });

        res.status(201).json({ 
            success: true, 
            message: 'Đăng ký thành công! Vui lòng kiểm tra Email để kích hoạt tài khoản.' 
        });

    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký!' });
    }
};

const verifyAccount = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Mã xác nhận không tồn tại!' });

        // 1. Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'datn_secret_key');

        // 2. Tìm User trong BẢNG TẠM
        const pendingUser = await PendingUser.findById(decoded.pendingId);
        
        if (!pendingUser) {
            return res.status(400).json({ message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn (24h)!' });
        }

        // 3. COPY dữ liệu sang BẢNG CHÍNH
        await User.create({
            name: pendingUser.name,
            username: pendingUser.username,
            email: pendingUser.email,
            password: pendingUser.password, // Mật khẩu đã mã hóa sẵn
            role: pendingUser.role
        });

        // 4. XÓA ở BẢNG TẠM để dọn dẹp
        await PendingUser.findByIdAndDelete(pendingUser._id);

        res.json({ success: true, message: 'Tài khoản đã được kích hoạt thành công! Bạn có thể đăng nhập ngay bây giờ.' });

    } catch (error) {
        console.error("Lỗi xác thực tài khoản:", error);
        res.status(400).json({ message: 'Mã xác nhận đã hết hạn hoặc không hợp lệ!' });
    }
};

const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email!' });
        }

        // 1. Tìm user trong bảng PendingUser
        const pendingUser = await PendingUser.findOne({ email: email.toLowerCase() });
        
        if (!pendingUser) {
            return res.status(404).json({ 
                message: 'Tài khoản không tồn tại hoặc đã được xác thực! Vui lòng đăng nhập.' 
            });
        }

        // 2. Tạo Token mới
        const token = jwt.sign(
            { pendingId: pendingUser._id },
            process.env.JWT_SECRET || 'datn_secret_key',
            { expiresIn: '24h' }
        );

        const verificationLink = `http://localhost:5173/verify-account?token=${token}`;

        // 3. Gửi lại mail
        await transport.sendMail({
            from: '"Hệ Thống" <noreply@khodientu.com>',
            to: pendingUser.email,
            subject: "🔄 [Gửi lại] Kích hoạt tài khoản của bạn",
            html: `
                <div style="font-family: Arial; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
                    <h2 style="color: #0284c7;">Chào ${pendingUser.name},</h2>
                    <p>Bạn vừa yêu cầu gửi lại đường dẫn xác nhận tài khoản. Vui lòng click vào nút bên dưới (Link có hiệu lực trong 24h):</p>
                    <a href="${verificationLink}" style="display:inline-block; padding: 10px 20px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 5px;">
                        Kích Hoạt Tài Khoản
                    </a>
                </div>
            `
        });

        res.json({ success: true, message: 'Đã gửi lại email xác nhận. Vui lòng kiểm tra hộp thư!' });

    } catch (error) {
        console.error('Lỗi gửi lại mail:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi gửi lại email!' });
    }
};

// Nhớ export hàm này ra ở cuối file
module.exports = {
    login, register, verifyAccount, resendVerificationEmail
};
