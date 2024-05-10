const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment');
const authenticate = require('../middlewares/authentication');


router.post('/products/:productId/comments', authenticate, commentController.createComment);
router.get('/products/:productId/comments', commentController.getCommentsByProduct);

module.exports = router;