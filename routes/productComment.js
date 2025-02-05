const express = require('express');
const router = express.Router();
const productCommentController = require('../controllers/productComment');
const authenticate = require('../middlewares/authentication');


router.post('/products/:productId/comments', authenticate, productCommentController.createComment);
router.get('/products/:productId/comments', productCommentController.getCommentsByProduct);
router.get('/products/:productId/comments/random', productCommentController.getRandomComment);
router.delete('/products/:productId/comments/:commentId', authenticate, productCommentController.deleteComment);



module.exports = router;

