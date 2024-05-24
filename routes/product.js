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
router.post('/product', upload.array('image', 4), productsControllers.createProduct);
router.get('/products/:productId', productsControllers.getSingleProduct);

module.exports = router;