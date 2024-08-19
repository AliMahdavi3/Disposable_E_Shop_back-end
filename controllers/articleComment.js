const { validationResult } = require('express-validator');
const ArticleComment = require('../models/articleComment');


exports.createComment = async (req, res, next) => {

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const error = new Error('Validation failed. Entered data is incorrect.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }

        const { articleId } = req.params;
        const { content, rating } = req.body;
        const userId = req.user;

        const articleComment = await ArticleComment.create({
            content,
            rating,
            user: userId,
            article: articleId
        });


        res.status(201).json({
            message: 'Comment created successfully!',
            articleComment: articleComment
        });

    } catch (error) {

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}

exports.getCommentsByArticle = async (req, res, next) => {

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const error = new Error('Validation failed. Entered data is incorrect.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }

        const { articleId } = req.params;
        const articleComments = await ArticleComment.find({ article: articleId }).populate('user', 'name');

        res.status(200).json({
            articleComments: articleComments,
            message: 'Comments fetched successfully!'
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.deleteComment = async (req, res, next) => {
    try {

        const commentId = req.params.commentId;

        // Find the comment by ID
        const comment = await ArticleComment.findById(commentId);

        if (!comment) {
            const error = new Error('Comment not found!');
            error.statusCode = 404;
            throw error;
        }

        await ArticleComment.findByIdAndDelete(commentId);

        res.status(200).json({
            message: 'Comment deleted successfully!'
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}