const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const articleRoutes = require('./routes/article');
const articleCommentRoutes = require('./routes/articleComment');
const authRoutes = require('./routes/auth');
const bannerRoutes = require('./routes/banner');
const cartRoutes = require('./routes/cart');
const discountRoutes = require('./routes/discount');
const mainSliderRoutes = require('./routes/mainSlider');
const productRoutes = require('./routes/product');
const productCommentRoutes = require('./routes/productComment');
const questionRoutes = require('./routes/questions');
const searchRoutes = require('./routes/search');
const ticketToSupportRoutes = require('./routes/ticketToSupport');
const orderRoutes = require('./routes/order');

const app = express();


app.use(cors());
app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api',
    articleRoutes,
    articleCommentRoutes,
    bannerRoutes,
    cartRoutes,
    discountRoutes,
    mainSliderRoutes,
    productRoutes,
    productCommentRoutes,
    questionRoutes,
    searchRoutes,
    ticketToSupportRoutes,
    orderRoutes,
);
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