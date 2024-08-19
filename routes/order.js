const express = require('express');
// const { body } = require('express-validator');
const orderControllers = require('../controllers/order');
const authenticate = require('../middlewares/authentication');
const router = express.Router();


router.post('/post-order', authenticate, orderControllers.postOrder);
router.get('/orders', authenticate, orderControllers.getOrders);
router.get('/order/:orderId', authenticate, orderControllers.getSingleOrder);
router.get('/PaymentRequest/:orderId', authenticate, orderControllers.getPayment);
router.get('/checkPayment/:orderId', authenticate, orderControllers.checkPayment);
// router.patch('/order/:orderId/status', authenticate,
//     [
//         body('status')
//             .isIn(['pending', 'completed', 'canceled'])
//             .withMessage('Invalid status value.')
//     ],
//     orderControllers.updateOrderStatus
// );



module.exports = router;