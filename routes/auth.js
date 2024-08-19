const express = require('express');
const { body } = require('express-validator'); 
const authController = require('../controllers/auth');
const router = express.Router();
const authenticate = require('../middlewares/authentication');


router.post('/register', [
    body('name').trim().isLength({min: 5}).notEmpty(),
    body('email').isEmail(),
    body('password').trim().isLength({min: 5}),
], authController.register);

router.post('/login', [
    body('name').trim().isLength({min: 5}).notEmpty(),
    body('email').isEmail(),
    body('password').trim().isLength({min: 5}),
], authController.login);

router.get('/user', authenticate, authController.getUser);
router.get('/users', authenticate, authController.getAllUsers);
router.put('/user/:userId', authenticate, authController.editUser);
router.delete('/user/:userId', authenticate, authController.deleteUser);

router.put('/changePassword/:userId', authenticate, authController.changePassword)


module.exports = router;