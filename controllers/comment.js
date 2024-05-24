const { validationResult } = require('express-validator');
const Comment = require('../models/comments');

exports.createComment = async (req, res, next) => {

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const error = new Error('Validation failed. Entered data is incorrect.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }

        const { productId } = req.params;
        const { content, rating } = req.body;
        const userId = req.user;

        const comment = await Comment.create({
            content,
            rating,
            user: userId,
            product: productId
        });


        res.status(201).json({
            message: 'Comment created successfully!',
            comment: comment // Send the entire comment object
        });

    } catch (error) {

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}

exports.getCommentsByProduct = async (req, res, next) => {

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const error = new Error('Validation failed. Entered data is incorrect.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }

        const { productId } = req.params;
        const comments = await Comment.find({ product: productId }).populate('user', 'name');

        res.status(200).json({
            comments: comments,
            message: 'Comments fetched successfully!'
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}