const express = require('express');
const orderControllers = require('../controllers/order');
const authenticate = require('../middlewares/authentication');
const router = express.Router();


router.post('/post-order', authenticate, orderControllers.postOrder);
router.get('/orders', authenticate, orderControllers.getOrders);
router.get('/order/:orderId', authenticate, orderControllers.getSingleOrder);

module.exports = router;