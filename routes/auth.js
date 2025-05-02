const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth');
const router = express.Router();
const authenticate = require('../middlewares/authentication');


router.post('/register', [
    body('name').trim().isLength({ min: 5 }).notEmpty(),
    body('email').isEmail(),
    body('password').trim().isLength({ min: 5 }),
], authController.register);

router.post('/login', [
    body('name').trim().isLength({ min: 5 }).notEmpty(),
    body('email').isEmail(),
    body('password').trim().isLength({ min: 5 }),
], authController.login);

router.post('/reset-password-request', [
    body('email').isEmail(),
], authController.resetPasswordRequest);

router.post('/reset-password', [
    body('password').trim().isLength({ min: 5 }),
], authController.resetPassword);

router.get('/user', authenticate, authController.getUser);
router.get('/users', authenticate, authController.getAllUsers);
router.post('/user/favorites', authenticate, authController.addToFavorites);
router.get('/user/favorites', authenticate, authController.getFavorites);
router.delete('/user/favorites/:productId', authenticate, authController.removeFromFavorites);
router.put('/user/:userId', authenticate, authController.editUser);
router.delete('/user/:userId', authenticate, authController.deleteUser);

router.put('/changePassword/:userId', authenticate, authController.changePassword)


module.exports = router;