const { validationResult } = require('express-validator');
const Product = require('../models/product');
const { calculateTotals } = require('../utils/cartUtils');
const path = require('path');
const util = require('util');
const fs = require('fs');
const unlinkAsync = util.promisify(fs.unlink);


exports.postCart = async (req, res, next) => {
    try {
        const productId = req.body.productId;
        const quantity = parseInt(req.body.quantity);

        if (!quantity || quantity <= 0) {
            const error = new Error('Invalid quantity provided!');
            error.statusCode = 400;
            throw error;
        }

        const product = await Product.findById(productId);

        if (!product) {
            const error = new Error('Product Not Found!');
            error.statusCode = 404;
            throw error;
        }

        await req.user.addToCart(product, quantity);

        res.status(200).json({
            message: 'Product added to cart!'
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.getCart = async (req, res, next) => {
    try {
        await req.user.populate('cart.items.productId');
        const cartItems = req.user.cart.items.map((i) => {
            return {
                product: { ...i.productId._doc },
                quantity: i.quantity,
            };
        });

        const { totalPrice, totalQuantity, formattedPrice } = calculateTotals(cartItems);

        res.status(200).json({
            message: 'Fetched cart successfully!',
            cart: cartItems,
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

exports.updatingCartProductQuantity = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const newQuantity = parseInt(req.body.quantity);

        if (newQuantity <= 0) {
            const error = new Error('Invalid quantity provided!');
            error.statusCode = 400;
            throw error;
        }

        await req.user.updateCartProductQuantity(productId, newQuantity);
        await req.user.populate('cart.items.productId');
        const updatedCartItems = req.user.cart.items.map((i) => {
            return {
                product: { ...i.productId._doc },
                quantity: i.quantity,
            };
        });

        const { totalPrice, totalQuantity, formattedPrice } = calculateTotals(updatedCartItems);

        res.status(200).json({
            message: 'Cart updated successfully!',
            cart: updatedCartItems,
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

exports.deleteProductFromCart = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        await req.user.removeFromCart(productId);

        await req.user.populate('cart.items.productId');
        const updatedCartItems = req.user.cart.items.map((i) => {
            return {
                product: { ...i.productId._doc },
                quantity: i.quantity,
            };
        });

        const { totalPrice, totalQuantity, formattedPrice } = calculateTotals(updatedCartItems);

        res.status(200).json({
            message: 'Product deleted from cart successfully!',
            cart: updatedCartItems,
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

exports.getCartCount = async (req, res, next) => {
    try {
        await req.user.populate('cart.items.productId');
        const cartItems = req.user.cart.items;

        const totalCount = cartItems.reduce((count, currentItem) => {
            return count + currentItem.quantity;
        }, 0);

        res.status(200).json({
            message: 'Fetched cart count successfully!',
            count: totalCount
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}
