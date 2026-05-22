const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Thay bằng thông tin ở Bước 1 của bạn
cloudinary.config({
  cloud_name: 'dcaqccq0j',
  api_key: '752482775252186',
  api_secret: 'pWtSIZXNQRbc9vvGWI9QtWRWLYA'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'DATN_Categories', // Tên thư mục nó sẽ tự tạo trên Cloudinary
    allowedFormats: ['jpeg', 'png', 'jpg']
  }
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;