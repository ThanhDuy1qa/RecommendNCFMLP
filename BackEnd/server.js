require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db.js');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes.js');
const reviewRoutes = require('./routes/reviewRoutes.js');
const analyticsRoutes = require('./routes/analyticsRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const emailRoutes = require('./routes/emailRoutes');
const sepayRoutes = require('./routes/sepayRoutes');
const startOrderCronJobs = require('./cron/orderCron');
const financeRoutes = require('./routes/financeRoutes');

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
app.use('/api/analytics', analyticsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sepay', sepayRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api', emailRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API Backend Đang Hoạt Động!');
});

startOrderCronJobs(); 
console.log('⏱️ Cron Jobs đã được kích hoạt!');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});