const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth.route.js');
const partnerRoutes = require('./routes/partner.route.js');
const productRoutes = require('./routes/product.route.js');
const cartRoutes = require('./routes/cart.route.js');
const orderRoutes = require('./routes/order.route.js');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim())
    : [];

app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
}));

app.get('/', (req, res) => {
    res.send("hello world");
});

app.use('/api/auth', authRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);

module.exports = app;
