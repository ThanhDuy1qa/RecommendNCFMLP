// BackEnd/controllers/emailController.js
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "aca4ecb2611f88",
    pass: "74c3f54128ee0f" 
  }
});
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const sendMarketingEmail = async (req, res) => {
  try {
    const { to, subject, html } = req.body; 
    const recipientList = Array.isArray(to) ? to.join(', ') : to;

    const info = await transport.sendMail({
      from: '"Kho Điện Tử Marketing" <marketing@khodientu.com>',
      to: recipientList, 
      subject: subject,
      html: html
    });

    console.log("✅ Đã gửi chiến dịch thành công! MessageId:", info.messageId);
    res.status(200).json({ message: "Gửi email thành công!", messageId: info.messageId });

  } catch (error) {
    console.error("❌ Lỗi gửi email:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi gửi email" });
  }
};

// 🌟 ĐÃ CẬP NHẬT: HÀM YÊU CẦU ĐỔI EMAIL (GỬI THÔNG BÁO CHO CẢ MAIL CŨ VÀ MỚI)
const requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user.id; 

    if (!newEmail) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email mới!' });
    }

    // 1. Kiểm tra email mới
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng bởi tài khoản khác!' });
    }

    // 2. Lấy email cũ
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản!' });
    }
    const oldEmail = currentUser.email;

    // 3. Tạo JWT Token
    const token = jwt.sign(
      { id: userId, newEmail: newEmail },
      process.env.JWT_SECRET || 'datn_secret_key',
      { expiresIn: '15m' }
    );

    const verificationLink = `http://localhost:5173/verify-email?token=${token}`;

    // 🌟 KHỞI TẠO NỘI DUNG 2 EMAIL SẴN SÀNG
    const mailToNew = {
      from: '"Hệ Thống Bảo Mật" <security@khodientu.com>',
      to: newEmail,
      subject: "➡️ Xác nhận thay đổi địa chỉ Email đăng nhập",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0284c7; margin-bottom: 20px;">Xác Thực Email Mới</h2>
          <p>Bạn vừa thực hiện yêu cầu đổi email đăng nhập hệ thống sang địa chỉ này.</p>
          <p>Vui lòng click vào nút bên dưới để hoàn tất việc xác nhận (Đường liên kết có hiệu lực trong <b>15 phút</b>):</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #0284c7; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px;">
              Xác nhận thay đổi Email
            </a>
          </div>
          <p style="color: #64748b; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 15px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        </div>
      `
    };

    const mailToOld = {
      from: '"Hệ Thống Bảo Mật" <security@khodientu.com>',
      to: oldEmail,
      subject: "⚠️ Cảnh báo bảo mật: Tài khoản của bạn đang yêu cầu đổi Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fca5a5; border-radius: 12px; background-color: #fff8f8;">
          <h2 style="color: #dc2626; margin-bottom: 20px;">⚠️ Cảnh Báo Thay Đổi Email</h2>
          <p>Hệ thống ghi nhận một yêu cầu thay đổi địa chỉ email đăng nhập từ tài khoản của bạn sang địa chỉ mới: <b>${newEmail}</b>.</p>
          <p style="margin-top: 15px; color: #1e293b;"><b>Lưu ý:</b> Email đăng nhập cũ của bạn sẽ ngừng hoạt động ngay sau khi email mới được xác thực thành công.</p>
          
          <div style="background-color: #ffffff; border-left: 4px solid #ea580c; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #ea580c;">Bạn có thực hiện hành động này không?</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #475569;">
              - Nếu <b>LÀ BẠN</b> đổi: Hãy truy cập vào hộp thư của email mới (<b>${newEmail}</b>) để click link kích hoạt.<br/>
              - Nếu <b>KHÔNG PHẢI BẠN</b>: Tài khoản của bạn đang có nguy cơ bị xâm nhập! Hãy đổi mật khẩu ngay lập tức hoặc liên hệ Quản trị viên để được hỗ trợ khóa tài khoản khẩn cấp.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #fee2e2; padding-top: 15px;">Đây là thông báo tự động từ hệ thống quản lý an toàn thông tin tài khoản.</p>
        </div>
      `
    };

    // 🌟 KỸ THUẬT CHẠY NGẦM (BACKGROUND TASK) ĐỂ GỬI 2 MAIL
    try {
      // 1. Gửi email xác nhận đến địa chỉ mới trước (Luồng chính bắt buộc đợi)
      await transport.sendMail(mailToNew);
      console.log("✅ [1] Đã gửi link xác nhận đến mail mới thành công.");

      // 2. NGAY LẬP TỨC trả kết quả về Frontend để UI không bị treo
      res.json({ message: 'Đã gửi link xác nhận tới Email mới và gửi cảnh báo về Email cũ của bạn. Vui lòng kiểm tra!' });

      // 3. CHẠY NGẦM: Cho Node.js tự động gửi mail thứ 2 sau 10 giây (10000ms)
      // Lúc này Frontend đã qua bước khác, không cần quan tâm server làm gì nữa.
      setTimeout(async () => {
        try {
          await transport.sendMail(mailToOld);
          console.log("✅ [2] Đã gửi cảnh báo bảo mật đến mail cũ (Chạy ngầm thành công).");
        } catch (oldMailError) {
          console.error("⚠️ [2] Lỗi gửi mail cũ trong background:", oldMailError.message);
        }
      }, 10000); // Đủ lâu để Mailtrap chắc chắn nhả Rate Limit

    } catch (mailError) {
      console.error("❌ Lỗi nghiêm trọng ở email xác nhận mới:", mailError);
      // Chỉ báo lỗi nếu luồng chính gặp trục trặc và chưa trả response về Frontend
      if (!res.headersSent) {
        return res.status(500).json({ message: 'Không thể gửi email xác nhận. Vui lòng thử lại sau!' });
      }
    }
  } catch (error) {
    console.error("Lỗi tổng quát ở API đổi email:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Lỗi hệ thống nghiêm trọng' });
    }
  }
};

const verifyEmailChange = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Mã xác nhận không tồn tại!' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'datn_secret_key');

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { email: decoded.newEmail },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });

    res.json({ message: 'Xác thực thành công! Email đã được thay đổi.' });

  } catch (error) {
    console.error("Lỗi xác thực email:", error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Mã xác nhận đã hết hạn 15 phút. Vui lòng thử lại!' });
    }
    res.status(400).json({ message: 'Mã xác nhận không hợp lệ hoặc đã được sử dụng!' });
  }
};

module.exports = {
  sendMarketingEmail,
  requestEmailChange,
  verifyEmailChange
};