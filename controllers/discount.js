const { validationResult } = require('express-validator');
const Discount = require('../models/discount');
const { calculateTotals, formatPrice } = require('../utils/cartUtils');


exports.createDiscountCode = async (req, res, next) => {
    try {
        const { discountCode, percentage, expiresAt } = req.body;

        const discount = new Discount({
            discountCode,
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
        const { discountCode } = req.body;

        if (!discountCode) {
            const error = new Error('Discount code is required!');
            error.statusCode = 400;
            throw error;
        }

        const discount = await Discount.findOne({ discountCode });

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
        const formattedDiscountedAmount = formatPrice(discountAmount);

        req.user.cart.appliedDiscount = {
            discountCode: discount.discountCode,
            percentage: discount.percentage,
        };

        await req.user.save();

        res.status(200).json({
            message: 'Discount applied successfully!',
            discount: {
                discountCode: discount.discountCode,
                percentage: discount.percentage,
            },
            cart: {
                items: cartItems,
                totalQuantity: totalQuantity,
                originalTotalPrice: totalPrice,
                originalFormattedPrice: formattedPrice,
                discountedTotalPrice: discountedPrice,
                formattedDiscountedPrice: formattedDiscountedPrice,
                discountAmount: discountAmount,
                formattedDiscountedAmount: formattedDiscountedAmount,
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
        const { discountCode, percentage, isActive, expiresAt } = req.body;

        const disCode = await Discount.findById(discountId);

        if (!disCode) {
            const error = new Error('Could not find discount code');
            error.statusCode = 404;
            throw error;
        }

        if (discountCode) disCode.discountCode = discountCode;
        if (percentage) disCode.percentage = percentage;
        if (typeof isActive !== 'undefined') disCode.isActive = isActive;
        if (expiresAt) disCode.expiresAt = expiresAt;

        await disCode.save();

        res.status(200).json({
            message: 'Discount code updated successfully!',
            disCode: disCode
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
        const disCode = await Discount.findById(discountId);

        if (!disCode) {
            const error = new Error('could not find Discount Code!');
            error.statusCode = 404;
            throw error;
        }

        const deletedDiscountCode = await Discount.findByIdAndDelete(discountId);

        res.status(200).json({
            message: 'Discount Code deleted successfully!',
            disCode: deletedDiscountCode
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}