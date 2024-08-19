const { validationResult } = require('express-validator');
const ProductComment = require('../models/productComments');

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

        const productComment = await ProductComment.create({
            content,
            rating,
            user: userId,
            product: productId
        });


        res.status(201).json({
            message: 'Comment created successfully!',
            productComment: productComment // Send the entire comment object
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
        const productComments = await ProductComment.find({ product: productId }).populate('user', 'name');

        res.status(200).json({
            productComments: productComments,
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
        const comment = await ProductComment.findById(commentId);

        if (!comment) {
            const error = new Error('Comment not found!');
            error.statusCode = 404;
            throw error;
        }

        await ProductComment.findByIdAndDelete(commentId);

        res.status(200).json({
            message: 'Comment deleted successfully!'
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
}