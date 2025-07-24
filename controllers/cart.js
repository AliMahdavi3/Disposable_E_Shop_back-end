const { validationResult } = require('express-validator');
const Product = require('../models/product');
const User = require('../models/auth');
const { calculateTotals, formatPrice } = require('../utils/cartUtils');
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
        const userId = req.params.userId || req.user._id;
        const user = await User.findById(userId).populate('cart.items.productId');

        if (!user) {
            const error = new Error('User not found!');
            error.statusCode = 404;
            throw error;
        }

        const cartItems = user.cart.items.map((i) => {
            return {
                product: { ...i.productId._doc },
                quantity: i.quantity,
                dateAdded: i.dateAdded,
                updatedDate: i.updatedDate,
            };
        });

        const { totalPrice, totalQuantity, formattedPrice } = calculateTotals(cartItems);

        const appliedDiscount = user.cart.appliedDiscount;
        let discountedPrice = null;
        let formattedDiscountedPrice = null;
        let discountAmount = null;
        let formattedDiscountAmount = null;

        const discountDetails = (appliedDiscount && appliedDiscount.discountCode && appliedDiscount.percentage)
            ? {
                discountCode: appliedDiscount.discountCode,
                percentage: appliedDiscount.percentage,
            }
            : null;

        if (discountDetails) {
            discountAmount = (totalPrice * appliedDiscount.percentage) / 100;
            discountedPrice = totalPrice - discountAmount;
            formattedDiscountedPrice = formatPrice(discountedPrice);
            formattedDiscountAmount = formatPrice(discountAmount);
        }

        res.status(200).json({
            message: 'Fetched cart successfully!',
            cart: cartItems,
            totalPrice: totalPrice,
            formattedPrice: formattedPrice,
            totalQuantity: totalQuantity,
            appliedDiscount: discountDetails,
            discountedPrice: discountedPrice,
            formattedDiscountedPrice: formattedDiscountedPrice,
            discountAmount: discountAmount,
            formattedDiscountAmount: formattedDiscountAmount,
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
                dateAdded: i.dateAdded,
                updatedDate: i.updatedDate,
            };
        });

        const { totalPrice, totalQuantity, formattedPrice } = calculateTotals(updatedCartItems);

        if (updatedCartItems.length === 0) {
            req.user.cart.appliedDiscount = null;
            await req.user.save();
        }

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
                dateAdded: i.dateAdded,
                updatedDate: i.updatedDate,
            };
        });

        const { totalPrice, totalQuantity, formattedPrice } = calculateTotals(updatedCartItems);

        if (updatedCartItems.length === 0) {
            req.user.cart.appliedDiscount = null;
            await req.user.save();
        }

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
