const express = require('express');
const adminControllers = require('../controllers/admin');
const authenticate = require('../middlewares/authentication');
const router = express.Router();

router.get('/admin/:userId/favorites', authenticate, adminControllers.adminGetUserFavorites);
router.delete('/admin/cart/:userId/:productId', authenticate, adminControllers.adminDeleteProductFromCart);
router.delete('/admin/:userId/favorites/:productId', authenticate, adminControllers.adminRemoveFromUserFavorites);


module.exports = router;