const { validationResult } = require('express-validator');
const User = require('../models/auth');
const { calculateTotals, formatPrice } = require('../utils/cartUtils');
const path = require('path');
const util = require('util');
const fs = require('fs');
const unlinkAsync = util.promisify(fs.unlink);

exports.adminDeleteProductFromCart = async (req, res, next) => {
    try {
        const { userId, productId } = req.params;

        if (req.user.role !== 'Admin') {
            const error = new Error('You are not authorized to perform this action!');
            error.statusCode = 403;
            throw error;
        }

        const user = await User.findById(userId);

        if (!user) {
            const error = new Error('User not found!');
            error.statusCode = 404;
            throw error;
        }

        const updatedCartItems = user.cart.items.filter(item => item.productId.toString() !== productId);

        if (updatedCartItems.length === user.cart.items.length) {
            const error = new Error('Product not found in cart!');
            error.statusCode = 404;
            throw error;
        }

        user.cart.items = updatedCartItems.map(item => ({
            ...item,
            updatedDate: new Date(),
        }));
        await user.save();
        await user.populate('cart.items.productId');

        const updatedCart = user.cart.items.map(item => ({
            product: { ...item.productId._doc },
            quantity: item.quantity,
            dateAdded: item.dateAdded,
            updatedDate: item.updatedDate,
        }));

        const { totalPrice, totalQuantity, formattedPrice } = calculateTotals(updatedCart);

        res.status(200).json({
            message: 'Product deleted from user cart successfully!',
            cart: updatedCart,
            totalPrice: totalPrice,
            formattedPrice: formattedPrice,
            totalQuantity: totalQuantity,
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.adminGetUserFavorites = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required!' });
        }
        const user = await User.findById(userId).populate('favorites');
        if (!user) {
            const error = new Error('User not found!');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'Favorites fetched successfully!',
            favorites: user.favorites,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.adminRemoveFromUserFavorites = async (req, res, next) => {
    try {
        const adminId = req.user._id;
        const { userId, productId } = req.params;
        const adminUser = await User.findById(adminId);
        if (!adminUser || adminUser.role !== 'Admin') {
            const error = new Error('Unauthorized! Only admins can perform this action.');
            error.statusCode = 403;
            throw error;
        }
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found!');
            error.statusCode = 404;
            throw error;
        }
        user.favorites = user.favorites.filter(id => id.toString() !== productId);
        await user.save();
        res.status(200).json({
            message: 'Product removed from favorites list successfully by admin!',
            favorites: user.favorites,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}