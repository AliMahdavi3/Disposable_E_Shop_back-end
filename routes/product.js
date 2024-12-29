const express = require('express');
const productsControllers = require('../controllers/product');
const authenticate = require('../middlewares/authentication');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + '.jpg');
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('file type not supported!'));
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

router.get('/products', productsControllers.getProducts);
router.post('/product', authenticate, upload.array('image', 4), productsControllers.createProduct);

router.get('/products/categories', productsControllers.getCategories);
router.get('/top-selling-products', productsControllers.getTopSellingProducts);
router.get('/disposable-products', productsControllers.getDisposableProducts);
router.get('/birth-day-products', productsControllers.getBirthDayProducts);
router.get('/newest-products', productsControllers.getNewestProducts);
router.get('/products/:productId', productsControllers.getSingleProduct);
router.get('/products/:productId/related', productsControllers.getRelatedProducts);

router.put('/products/:productId', authenticate, upload.array('image', 4), productsControllers.updateProduct);
router.delete('/products/:productId', authenticate, productsControllers.deleteProduct);



module.exports = router;