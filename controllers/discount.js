const { validationResult } = require('express-validator');
const Discount = require('../models/discount');
const { validateDiscountCode, calculateDiscountAmount } = require('../services/discountService');


exports.listDiscountCodes = async (req, res, next) => {
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

exports.addDiscountCode = async (req, res, next) => {
    try {
        const { code, percentage, expiresAt } = req.body;
        const discount = new Discount({
            code,
            percentage,
            expiresAt
        });
        await discount.save();
        res.status(201).json({ message: 'Discount code added successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding discount code', error: error });
    }
};

exports.applyDiscount = async (req, res, next) => {
    try {
        const discountCode = req.body.code;
        const discount = await validateDiscountCode(discountCode);

        if (!discount) {
            const error = new Error('Discount code is invalid or expired!');
            error.statusCode = 400;
            throw error;
        }

        const cart = await req.user.populate('cart.items.productId');
        const cartItems = cart.cart.items;
        const subtotal = cartItems.reduce((total, currentItem) => {
            const itemPrice = currentItem.productId.price; // Directly use the number
            return total + currentItem.quantity * itemPrice;
        }, 0);

        const discountAmount = calculateDiscountAmount(subtotal, discount);
        const newTotal = subtotal - discountAmount;

        res.status(200).json({
            message: 'Discount applied successfully',
            discountAmount: discountAmount,
            newTotal: newTotal
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

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

exports.validateDiscountCode = async (req, res, next) => {
    try {
        const codeToValidate = req.params.code;

        // Find the discount code in the database
        const discountCode = await Discount.findOne({ code: codeToValidate });

        // Check if the discount code exists
        if (!discountCode) {
            return res.status(404).json({ message: 'Discount code not found.' });
        }

        // Check if the discount code is active
        if (!discountCode.isActive) {
            return res.status(400).json({ message: 'Discount code is not active.' });
        }

        // Check if the discount code has expired (if there's an expiration date)
        if (discountCode.expiresAt && discountCode.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Discount code has expired.' });
        }

        // If all checks pass, the discount code is valid
        return res.status(200).json({
            message: 'Discount code is valid.',
            discount: discountCode.percentage // Or any other relevant information
        });

    } catch (error) {
        // Generic error handling
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        return next(error);
    }
};