const { validationResult } = require('express-validator');
const Discount = require('../models/discount');
const { calculateTotals, formatPrice } = require('../utils/cartUtils');


exports.createDiscountCode = async (req, res, next) => {
    try {
        const { code, percentage, expiresAt } = req.body;

        const discount = new Discount({
            code,
            percentage,
            expiresAt,
        });

        await discount.save();

        res.status(201).json({
            message: 'Discount code added successfully!'
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.applyDiscount = async (req, res, next) => {
    try {
        const { code } = req.body;

        if (!code) {
            const error = new Error('Discount code is required!');
            error.statusCode = 400;
            throw error;
        }

        const discount = await Discount.findOne({ code });

        if (!discount) {
            const error = new Error('Invalid discount code!');
            error.statusCode = 404;
            throw error;
        }

        if (!discount.isActive) {
            const error = new Error('This discount code is no longer active!');
            error.statusCode = 400;
            throw error;
        }

        if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
            const error = new Error('This discount code has expired!');
            error.statusCode = 400;
            throw error;
        }

        await req.user.populate('cart.items.productId');
        const cartItems = req.user.cart.items.map((item) => {
            return {
                product: { ...item.productId._doc },
                quantity: item.quantity,
            };
        });

        const { totalPrice, totalQuantity, formattedPrice } = calculateTotals(cartItems);

        const discountAmount = (totalPrice * discount.percentage) / 100;
        const discountedPrice = totalPrice - discountAmount;
        const formattedDiscountedPrice = formatPrice(discountedPrice);

        req.user.cart.appliedDiscount = {
            code: discount.code,
            percentage: discount.percentage,
        };

        await req.user.save();

        res.status(200).json({
            message: 'Discount applied successfully!',
            discount: {
                code: discount.code,
                percentage: discount.percentage,
            },
            cart: {
                items: cartItems,
                originalTotalPrice: totalPrice,
                originalFormattedPrice: formattedPrice,
                totalQuantity: totalQuantity,
                discountedTotalPrice: discountedPrice,
                formattedDiscountedPrice: formattedDiscountedPrice,
            }
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.getDiscountCodesList = async (req, res, next) => {
    try {
        const discountList = await Discount.find();
        res.status(200).json({
            message: 'Discount list fetched successfully!',
            discounts: discountList
        });
    } catch (error) {

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getSingleDiscountCode = async (req, res, next) => {
    try {
        const discountId = req.params.discountId;
        const discount = await Discount.findById(discountId);

        if (!discount) {
            const error = new Error('Discount not found!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: "Discount was found!",
            discount: discount
        })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.updateDiscountCode = async (req, res, next) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }

        const discountId = req.params.discountId;
        const { code, percentage, isActive, expiresAt } = req.body;

        const discountCode = await Discount.findById(discountId);

        if (!discountCode) {
            const error = new Error('Could not find discount code');
            error.statusCode = 404;
            throw error;
        }

        if (code) discountCode.code = code;
        if (percentage) discountCode.percentage = percentage;
        if (typeof isActive !== 'undefined') discountCode.isActive = isActive;
        if (expiresAt) discountCode.expiresAt = expiresAt;

        await discountCode.save();

        res.status(200).json({
            message: 'Discount code updated successfully!',
            discountCode: discountCode
        });

    } catch (error) {

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error)
    }
}

exports.deleteDiscountCode = async (req, res, next) => {
    try {
        const discountId = req.params.discountId;
        const discountCode = await Discount.findById(discountId);

        if (!discountCode) {
            const error = new Error('could not find Discount Code!');
            error.statusCode = 404;
            throw error;
        }

        const deletedDiscountCode = await Discount.findByIdAndDelete(discountId);

        res.status(200).json({
            message: 'Discount Code deleted successfully!',
            discountCode: deletedDiscountCode
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}