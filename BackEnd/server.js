require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');
const productRoutes = require('./routes/productRoutes.js');
const reviewRoutes = require('./routes/reviewRoutes.js');
const analyticsRoutes = require('./routes/analyticsRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Kết nối Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
// Định tuyến API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes)
app.use('/api/orders', orderRoutes);
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/analytics', analyticsRoutes)
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/users', userRoutes);
// Thêm Route này để sửa lỗi Cannot GET /
app.get('/', (req, res) => {
    res.send('API Backend Đang Hoạt Động!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});