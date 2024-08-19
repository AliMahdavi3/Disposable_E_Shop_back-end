const express = require('express');
const router = express.Router();
const articleCommentController = require('../controllers/articleComment');
const authenticate = require('../middlewares/authentication');


router.post('/articles/:articleId/comments', authenticate, articleCommentController.createComment);
router.get('/articles/:articleId/comments', articleCommentController.getCommentsByArticle);
router.delete('/comments/:commentId', authenticate, articleCommentController.deleteComment);



module.exports = router;

