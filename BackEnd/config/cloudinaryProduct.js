const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Sử dụng chung thông tin cấu hình tài khoản Cloudinary của hệ thống
cloudinary.config({
  cloud_name: 'ĐIỀN_CLOUD_NAME_CỦA_BẠN',
  api_key: 'ĐIỀN_API_KEY_CỦA_BẠN',
  api_secret: 'ĐIỀN_API_SECRET_CỦA_BẠN'
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