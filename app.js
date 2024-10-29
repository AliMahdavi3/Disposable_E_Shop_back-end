const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mainSliderRoutes = require('./routes/mainSlider');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const articleRoutes = require('./routes/article');
const questionRoutes = require('./routes/questions');
const bannerRoutes = require('./routes/banner');
const authRoutes = require('./routes/auth');
const productCommentRoutes = require('./routes/productComment');
const articleCommentRoutes = require('./routes/articleComment');
const discountRoutes = require('./routes/discount');
const searchRoutes = require('./routes/search');
const orderRoutes = require('./routes/order');

const app = express();


app.use(cors());
app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api',
    mainSliderRoutes,
    productRoutes,
    articleRoutes,
    questionRoutes,
    bannerRoutes,
    searchRoutes,
    discountRoutes,
    orderRoutes,
    articleCommentRoutes,
    productCommentRoutes,
    cartRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});


mongoose.connect('mongodb://127.0.0.1:27017/disposable_shop').then(() => {
    console.log('Connected To DB');
}).catch((error) => {
    console.log(error);
})

app.listen(4000, () => {
    console.log('Server is running on PORT 4000!');
});