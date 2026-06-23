// BackEnd/controllers/emailController.js
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'nina56@ethereal.email',
        pass: 'Jq1gDSPVjmhZ2RTBHm'
    }
});
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const sendMarketingEmail = async (req, res) => {
  try {
    const { to, subject, html } = req.body; 
    const recipientList = Array.isArray(to) ? to.join(', ') : to;

    const info = await transporter.sendMail({
      from: '"Kho Điện Tử Marketing" <marketing@khodientu.com>',
      to: recipientList, 
      subject: subject,
      html: html
    });

    console.log("✅ Đã gửi chiến dịch thành công! MessageId:", info.messageId);
    // THÊM DÒNG NÀY ĐỂ IN RA LINK XEM THƯ:
    console.log("👉 Xem email tại đây:", nodemailer.getTestMessageUrl(info)); 
    
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
      // 1. Gửi email xác nhận đến địa chỉ mới trước
      const infoNew = await transporter.sendMail(mailToNew);
      console.log("👉 Xem email xác nhận MỚI tại đây:", nodemailer.getTestMessageUrl(infoNew));
      console.log("✅ [1] Đã gửi link xác nhận đến mail mới thành công.");

      // 2. NGAY LẬP TỨC trả kết quả về Frontend để UI không bị treo
      res.json({ message: 'Đã gửi link xác nhận tới Email mới và gửi cảnh báo về Email cũ của bạn. Vui lòng kiểm tra!' });

      // 3. CHẠY NGẦM: Cho Node.js tự động gửi mail thứ 2 sau 10 giây
      setTimeout(async () => {
        try {
          const infoOld = await transporter.sendMail(mailToOld);
          console.log("✅ [2] Đã gửi cảnh báo bảo mật đến mail cũ (Chạy ngầm thành công).");
          console.log("👉 Xem email CẢNH BÁO CŨ tại đây:", nodemailer.getTestMessageUrl(infoOld));
        } catch (oldMailError) {
          console.error("⚠️ [2] Lỗi gửi mail cũ trong background:", oldMailError.message);
        }
      }, 10000); 

    } catch (mailError) {
      console.error("❌ Lỗi nghiêm trọng ở email xác nhận mới:", mailError);
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

// 🌟 HÀM MỚI: GỬI EMAIL NHẮC NHỞ THANH TOÁN
// 🌟 HÀM MỚI: GỬI EMAIL NHẮC NHỞ THANH TOÁN
const sendOrderReminderEmail = async (userEmail, orderId, amountInVND) => {
  try {
    const checkoutLink = `http://localhost:5173/order-history`; 

    // 🌟 SỬA Ở ĐÂY: Thêm "const info =" vào đầu
    const info = await transporter.sendMail({
      from: '"Hệ Thống Bán Hàng" <no-reply@khodientu.com>',
      to: userEmail,
      subject: "⏳ Đơn hàng của bạn đang chờ thanh toán!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #ea580c; margin-bottom: 20px;">Bạn đã quên thanh toán đơn hàng?</h2>
          <p>Chào bạn,</p>
          <p>Hệ thống ghi nhận bạn có một đơn hàng (Mã: <b>${orderId.substring(orderId.length - 8).toUpperCase()}</b>) trị giá <b>${amountInVND.toLocaleString()} đ</b> đang ở trạng thái Chờ xác nhận.</p>
          <p>Đơn hàng sẽ tự động bị hủy sau 24 giờ kể từ lúc đặt nếu không được thanh toán. Vui lòng hoàn tất thanh toán để chúng tôi có thể giao hàng cho bạn sớm nhất nhé!</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${checkoutLink}" style="display: inline-block; padding: 12px 24px; background-color: #ea580c; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px;">
              Thanh toán ngay
            </a>
          </div>
        </div>
      `
    });
    console.log("👉 Xem email nhắc nhở tại đây:", nodemailer.getTestMessageUrl(info));
    console.log(`✅ Đã gửi mail nhắc nhở thanh toán cho đơn hàng ${orderId}`);
  } catch (error) {
    console.error(`❌ Lỗi gửi mail nhắc nhở cho đơn ${orderId}:`, error);
  }
};

const sendShippingEmail = async (userEmail, orderId) => {
  try {
    const orderHistoryLink = `http://localhost:5173/order-history`;

    // 🌟 SỬA Ở ĐÂY: Thêm "const info =" vào đầu
    const info = await transporter.sendMail({
      from: '"Kho Điện Tử - Vận Chuyển" <shipping@khodientu.com>',
      to: userEmail,
      subject: "🚚 Đơn hàng của bạn đang trên đường giao!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #bae6fd; border-radius: 12px; background-color: #f0f9ff;">
          <h2 style="color: #0284c7; margin-bottom: 20px;">Đơn hàng đã được bàn giao cho đơn vị vận chuyển</h2>
          <p>Chào bạn,</p>
          <p>Tin vui! Đơn hàng mang mã số <b>#${orderId.substring(orderId.length - 8).toUpperCase()}</b> của bạn đã được cửa hàng đóng gói cẩn thận và giao cho bưu tá.</p>
          <p>Thời gian giao hàng dự kiến thường từ <b>2 - 4 ngày làm việc</b> tùy khu vực. Vui lòng chú ý điện thoại để bưu tá liên hệ giao hàng nhé!</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${orderHistoryLink}" style="display: inline-block; padding: 12px 24px; background-color: #0284c7; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px;">
              Theo dõi đơn hàng
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 13px; margin-top: 20px;">
            <b>Lưu ý:</b> Chỉ bấm nút "Đã nhận được hàng" trên ứng dụng SAU KHI bạn đã nhận và kiểm tra sản phẩm thành công để được bảo vệ quyền lợi.
          </p>
        </div>
      `
    });
    
    console.log("👉 Xem email tại đây:", nodemailer.getTestMessageUrl(info));
    console.log(`✅ Đã gửi mail thông báo giao hàng cho đơn ${orderId}`);
  } catch (error) {
    console.error(`❌ Lỗi gửi mail giao hàng cho đơn ${orderId}:`, error);
  }
};

// Đừng quên xuất hàm này ra ở cuối file:
module.exports = {
  transporter,
  sendMarketingEmail,
  requestEmailChange,
  verifyEmailChange,
  sendOrderReminderEmail,
  sendShippingEmail,
};