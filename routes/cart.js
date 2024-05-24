const express = require('express');
const cartControllers = require('../controllers/cart');
const authenticate = require('../middlewares/authentication');
const router = express.Router();


router.post('/cart', authenticate, cartControllers.postCart);
router.get('/cart', authenticate, cartControllers.getCart);
router.put('/cart/:productId', authenticate, cartControllers.updateCartProductQuantity);
router.delete('/cart/:productId', authenticate, cartControllers.deleteProductFromCart);
router.get('/cart/count', authenticate, cartControllers.getCartCount);


module.exports = router;