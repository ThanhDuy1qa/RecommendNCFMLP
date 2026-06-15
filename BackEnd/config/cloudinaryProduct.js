const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Sử dụng chung thông tin cấu hình tài khoản Cloudinary của hệ thống
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình thư mục lưu trữ độc lập cho Sản phẩm
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'DATN_Products', // Tách biệt hoàn toàn sang thư mục mới
    allowedFormats: ['jpeg', 'png', 'jpg']
  }
});

const uploadProductCloud = multer({ storage });

module.exports = uploadProductCloud;