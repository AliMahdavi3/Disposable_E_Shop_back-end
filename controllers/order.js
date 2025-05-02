const Order = require('../models/order');
const Product = require('../models/product');
const { calculateTotals } = require('../utils/cartUtils');
const ZarinpalCheckout = require('zarinpal-checkout');

var zarinpal = ZarinpalCheckout.create('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', true);

exports.createOrder = async (req, res, next) => {
    try {
        const user = req.user;
        const cartItems = user.cart.items;
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

        const order = new Order({
            user: {
                userId: user._id,
                name: user.name
            },
            items: orderItems,
            shippingAddress: shippingAddress,
            additionalComment: additionalComment,
            totalPrice: totals.totalPrice,
            totalQuantity: totals.totalQuantity,
            formattedPrice: totals.formattedPrice,
        });

        await order.save();
        user.cart.items = [];
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
            const error = new Error('no Orders found for this user!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: "Orders fetched successfully!",
            orders: orders.map(order => ({
                id: order._id,
                items: order.items,
                totalPrice: order.totalPrice,
                totalQuantity: order.totalQuantity,
                formattedPrice: order.formattedPrice,
                shippingAddress: order.shippingAddress,
                additionalComment: order.additionalComment,
                status: order.status,
                createdAt: order.createdAt,
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
                items: order.items,
                totalPrice: order.totalPrice,
                totalQuantity: order.totalQuantity,
                formattedPrice: order.formattedPrice,
                shippingAddress: order.shippingAddress,
                additionalComment: order.additionalComment,
                status: order.status,
                createdAt: order.createdAt,
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

        const order = await Order.findOne({ _id: orderId, "user.userId": userId });

        if (!order) {
            const error = new Error('Order not found!');
            error.statusCode = 404;
            throw error;
        }

        const paymentAmount = order.totalPrice;

        const response = await zarinpal.PaymentRequest({
            Amount: paymentAmount,
            CallbackURL: "http://localhost:3000/payment-confirmation",
            Description: `Payment for Order #${orderId}`,
            Email: req.user.email,
            Mobile: req.user.phone,
        });

        // console.log(response);

        if (response.status === 100) {
            res.status(200).json({
                message: 'Payment request created successfully!',
                paymentUrl: response.url,
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
        console.log('Payment confirmation endpoint called!');
        const { Authority, Status } = req.query;

        // console.log('Authority:', Authority);
        // console.log('Status:', Status);

        if (Status !== 'OK') {
            // console.log('Payment status is NOT OK');
            return res.status(400).json({
                message: "Payment was NOT successful!",
                status: Status,
            });
        }

        const userId = req.user._id;
        // console.log('User ID:', userId);
        const order = await Order.findOne({ "user.userId": userId, status: 'Pending' });


        if (!order) {
            // console.log('Order not found or already processed!');
            return res.status(404).json({
                message: 'Order not found or already processed!',
            });
        }

        // console.log('Order found:', order);

        const paymentAmount = order.totalPrice;
        const response = await zarinpal.PaymentVerification({
            Amount: paymentAmount,
            Authority: Authority,
        });
        // console.log('Payment Verification Response:', response);

        if (response.status === 100) {
            console.log('Payment verified:', response);
            order.status = 'Paid';
            await order.save();

            return res.status(200).json({
                message: 'Payment was successful!',
                status: response.status,
                order: {
                    id: order._id,
                    totalPrice: order.totalPrice,
                    totalQuantity: order.totalQuantity,
                    formattedPrice: order.formattedPrice,
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