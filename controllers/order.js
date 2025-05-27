const Order = require('../models/order');
const Product = require('../models/product');
const { calculateTotals, formatPrice } = require('../utils/cartUtils');
const ZarinpalCheckout = require('zarinpal-checkout');
require('dotenv').config();

var zarinpal = ZarinpalCheckout.create('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', true);

exports.createOrder = async (req, res, next) => {
    try {
        const user = req.user;
        const cartItems = user.cart.items;
        const appliedDiscount = user.cart.appliedDiscount || null;
        const { shippingAddress, additionalComment = '' } = req.body;

        if (cartItems.length === 0) {
            const error = new Error('Cart is empty!');
            error.statusCode = 400;
            throw error;
        }

        const orderItems = [];

        for (const item of cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({
                    message: `Product not found for ID: ${item.productId}`
                });
            }
            orderItems.push({
                product: {
                    title: product.title,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    productCode: product.productCode,
                    weight: product.weight,
                    size: product.size,
                    category: product.category,
                    color: product.color,
                    tag: product.tag,
                    rating: product.rating,
                },
                quantity: item.quantity
            });
        }

        const totals = calculateTotals(orderItems);

        let discountAmount = 0;
        let discountedPrice = totals.totalPrice;
        let formattedDiscountedPrice = totals.formattedPrice;
        if (appliedDiscount && appliedDiscount.percentage) {
            discountAmount = (totals.totalPrice * appliedDiscount.percentage) / 100;
            discountedPrice = totals.totalPrice - discountAmount;
            formattedDiscountedPrice = formatPrice(discountedPrice);
        }

        const order = new Order({
            user: {
                userId: user._id,
                name: user.name
            },
            items: orderItems,
            shippingAddress: shippingAddress,
            additionalComment: additionalComment,
            totalPrice: totals.totalPrice,
            formattedPrice: totals.formattedPrice,
            totalQuantity: totals.totalQuantity,
            discountedPrice: appliedDiscount ? discountedPrice : totals.totalPrice,
            formattedDiscountedPrice: appliedDiscount ? formattedDiscountedPrice : totals.formattedPrice,
            discount: appliedDiscount
                ? {
                    discountCode: appliedDiscount.discountCode,
                    percentage: appliedDiscount.percentage,
                    amount: discountAmount,
                }
                : {
                    discountCode: null,
                    percentage: 0,
                    amount: 0,
                },
        });

        await order.save();
        user.cart.items = [];
        user.cart.appliedDiscount = null;
        await user.save();

        res.status(201).json({
            message: 'Order created successfully!',
            order: order
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const orders = await Order.find({ "user.userId": userId }).populate('items.product');

        if (!orders || orders.length === 0) {
            return res.status(200).json({
                message: "No orders found for this user.",
                orders: [],
            });
        }

        res.status(200).json({
            message: "Orders fetched successfully!",
            orders: orders.map(order => ({
                _id: order._id,
                user: order.user,
                items: order.items,
                totalPrice: order.totalPrice,
                formattedPrice: order.formattedPrice,
                totalQuantity: order.totalQuantity,
                discountedPrice: order.discountedPrice || order.totalPrice,
                formattedDiscountedPrice: order.formattedDiscountedPrice || order.formattedPrice,
                discount: order.discount || { amount: 0 },
                shippingAddress: order.shippingAddress,
                additionalComment: order.additionalComment,
                status: order.status,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            })),
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getCheckoutDetails = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, "user.userId": userId }).populate("items.product");

        if (!order) {
            const error = new Error('Order not found!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: "Checkout details fetched successfully!",
            order: {
                id: order._id,
                user: order.user,
                items: order.items,
                totalPrice: order.totalPrice,
                formattedPrice: order.formattedPrice,
                totalQuantity: order.totalQuantity,
                discountedPrice: order.discountedPrice || order.totalPrice,
                formattedDiscountedPrice: order.formattedDiscountedPrice || order.formattedPrice,
                discount: order.discount || { amount: 0 },
                shippingAddress: order.shippingAddress,
                additionalComment: order.additionalComment,
                status: order.status,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            }
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

// Payment Gate (Zarinpal)

exports.getPaymentRequest = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const userId = req.user._id;

        if (!req.user.email || !req.user.phone) {
            const error = new Error('User email or phone is missing! Payment request cannot be created.');
            error.statusCode = 400;
            throw error;
        }

        const order = await Order.findOne({ _id: orderId, "user.userId": userId });

        if (!order) {
            const error = new Error('Order not found!');
            error.statusCode = 404;
            throw error;
        }
        const paymentAmount = order.discountedPrice || order.totalPrice;
        const callbackUrl = process.env.PAYMENT_CALLBACK_URL;

        const response = await zarinpal.PaymentRequest({
            Amount: paymentAmount,
            CallbackURL: callbackUrl,
            Description: `Payment for Order #${orderId}`,
            Email: req.user.email,
            Mobile: req.user.phone,
        });

        console.log(response);

        if (response.status === 100) {
            order.paymentAuthority = response.authority;
            await order.save();

            res.status(200).json({
                message: 'Payment request created successfully!',
                paymentUrl: response.url,
                authority: response.authority,
                order: {
                    _id: order._id,
                    totalPrice: order.totalPrice,
                    formattedPrice: order.formattedPrice,
                    discountedPrice: order.discountedPrice || order.totalPrice,
                    formattedDiscountedPrice: order.formattedDiscountedPrice || order.formattedPrice,
                },
            });

        } else {
            const error = new Error('Failed to create payment request!');
            error.statusCode = 500;
            throw error;
        }

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getPaymentConfirmation = async (req, res, next) => {
    try {
        const { Authority, Status } = req.query;

        console.log('Authority:', Authority);
        console.log('Status:', Status);

        if (Status !== 'OK') {
            return res.status(400).json({
                message: `Payment faild with status ${Status}`,
                status: Status,
            });
        }

        const userId = req.user._id;
        const order = await Order.findOne({ paymentAuthority: Authority, "user.userId": userId });

        if (!order) {
            const error = new Error('Order not found or already processed!');
            error.statusCode = 404;
            throw error;
        }

        if (order.status === 'Paid') {
            console.log('Order is already paid:', order);
            return res.status(200).json({
                message: 'Payment was already verified!',
                status: 101,
                authority: Authority,
                order: {
                    refId: order.refId || null,
                    cardPan: order.cardPan || null,
                    fee: order.fee || null,
                    id: order._id,
                    totalPrice: order.totalPrice,
                    formattedPrice: order.formattedPrice,
                    discountedPrice: order.discountedPrice || order.totalPrice,
                    formattedDiscountedPrice: order.formattedDiscountedPrice || order.formattedPrice,
                },
            });
        }
        const paymentAmount = order.discountedPrice || order.totalPrice;
        const response = await zarinpal.PaymentVerification({
            Amount: paymentAmount,
            Authority: Authority,
        });
        console.log('Zarinpal Payment Verification Response:', response);

        if (response.status === 100) {
            console.log('Payment verified:', response);
            order.status = 'Paid';
            order.refId = response.refId;
            order.cardPan = response.cardPan;
            order.fee = response.fee;
            await order.save();

            return res.status(200).json({
                message: 'Payment was successful!',
                status: response.status,
                authority: Authority,
                order: {
                    id: order._id,
                    totalPrice: order.totalPrice,
                    formattedPrice: order.formattedPrice,
                    discountedPrice: order.discountedPrice || order.totalPrice,
                    formattedDiscountedPrice: order.formattedDiscountedPrice || order.formattedPrice,
                    refId: order.refId,
                    cardPan: order.cardPan,
                    fee: order.fee,
                },
            });

        } else if (response.status === 101) {
            console.log('Payment already verified:', response);
            return res.status(200).json({
                message: 'Payment was already verified!',
                status: response.status,
                authority: Authority,
                order: {
                    id: order._id,
                    totalPrice: order.totalPrice,
                    formattedPrice: order.formattedPrice,
                    discountedPrice: order.discountedPrice || order.totalPrice,
                    formattedDiscountedPrice: order.formattedDiscountedPrice || order.formattedPrice,
                    refId: order.refId,
                    cardPan: order.cardPan,
                    fee: order.fee,
                },
            });
        } else {
            console.log('Payment verification failed:', response);
            return res.status(400).json({
                message: 'Payment verification failed!',
                status: response.status,
            });
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}