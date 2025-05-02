const express = require('express');
const orderController = require('../controllers/order');
const authenticate = require('../middlewares/authentication');
const router = express.Router();

router.post('/create-order', authenticate, orderController.createOrder);
router.get('/orders', authenticate, orderController.getUserOrders);
router.get('/checkout/:orderId', authenticate, orderController.getCheckoutDetails);
router.get('/payment-request/:orderId', authenticate, orderController.getPaymentRequest);
router.get('/payment-confirmation', authenticate, orderController.getPaymentConfirmation);

module.exports = router;