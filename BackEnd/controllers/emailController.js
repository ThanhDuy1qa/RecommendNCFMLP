// BackEnd/controllers/emailController.js
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "aca4ecb2611f88",
    pass: "74c3f54128ee0f" // Pass bạn vừa cung cấp
  }
});

const sendMarketingEmail = async (req, res) => {
  try {
    // Nhận dữ liệu từ giao diện gửi xuống
    const { to, subject, html } = req.body; 

    // Nếu 'to' là mảng (gửi nhiều người), chuyển thành chuỗi cách nhau bằng dấu phẩy
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

module.exports = { sendMarketingEmail };