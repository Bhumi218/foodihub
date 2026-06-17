const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/db');
const localStore = require('./data/localStore');

// Import routes
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/foods');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const sellerRoutes = require('./routes/seller');

const app = express();
const PORT = process.env.PORT || 5000;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'foodiehub_local_dev_secret';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'FoodieHub API running', timestamp: new Date().toISOString() });
});

// API Routes
// Auth: POST /api/signup, POST /api/login
app.use('/api', authRoutes);

// Foods: GET /api/foods
app.use('/api/foods', foodRoutes);

// Restaurants: GET /api/restaurants
app.use('/api/restaurants', require('./routes/restaurants'));

// Cart: POST /api/cart/add, GET /api/cart/:userId, DELETE /api/cart/remove, DELETE /api/cart/clear
app.use('/api/cart', cartRoutes);

// Orders: POST /api/order/create, GET /api/order/:userId
app.use('/api/order', orderRoutes);

// Seller: POST /api/seller/register, POST /api/seller/login, GET /api/seller/dashboard, etc.
app.use('/api/seller', sellerRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const start = async () => {
    const conn = await connectDB();
    app.locals.store = localStore;
    app.locals.useLocalStore = !conn;
    app.listen(PORT, () => {
        console.log(`\n🍕 FoodieHub Server`);
        console.log(`   URL:  http://localhost:${PORT}`);
        console.log(`   APIs: http://localhost:${PORT}/api\n`);
        console.log('📋 Endpoints:');
        console.log('   POST /api/signup            - Register');
        console.log('   POST /api/login             - Login');
        console.log('   GET  /api/foods             - Food list');
        console.log('   GET  /api/restaurants       - Restaurant list');
        console.log('   POST /api/cart/add          - Add to cart');
        console.log('   GET  /api/cart/:userId      - Get cart');
        console.log('   POST /api/order/create      - Place order');
        console.log('   GET  /api/order/:userId     - My orders');
        console.log('   POST /api/seller/register   - Seller Register');
        console.log('   POST /api/seller/login      - Seller Login');
        console.log('   GET  /api/seller/dashboard  - Seller Dashboard');
        console.log('   POST /api/seller/dish       - Add Seller Dish');
        console.log('   PUT  /api/seller/dish/:id   - Update Seller Dish');
        console.log('   DELETE /api/seller/dish/:id - Delete Seller Dish\n');
        console.log(`   Data: ${app.locals.useLocalStore ? 'local JSON store' : 'MongoDB'}\n`);
    });
};

start();
