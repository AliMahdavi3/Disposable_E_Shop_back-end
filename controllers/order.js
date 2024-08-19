const Order = require('../models/order');
const Product = require('../models/product');
const { calculateDiscountAmount, validateDiscountCode } = require('../services/discountService');
const ZarinpalCheckout = require('zarinpal-checkout');
let zarinpal = ZarinpalCheckout.create('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', true);

exports.getOrders = async (req, res, next) => {
    try {
        const orderList = await Order.find({ 'user.userId': req.user._id, });
        console.log(orderList)
        res.status(200).json({
            meaasge: 'Order list fetched successfully!',
            orders: orderList
        });
        console.log(orders);
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error)
    }
}

exports.postOrder = async (req, res, next) => {
    try {
        const additionalComment = req.body.additionalComment || '';
        const user = req.user;

        await user.populate('cart.items.productId');

        const cartItems = user.cart.items.map(item => ({
            product: { ...item.productId._doc },
            quantity: item.quantity,
        }));

        let total = cartItems.reduce((acc, item) => acc + item.quantity * item.product.price, 0);


        const discountCode = req.body.discountCode;
        let discountAmount = 0;

        if (discountCode) {
            const discount = await validateDiscountCode(discountCode);
            if (discount) {
                discountAmount = calculateDiscountAmount(total, discount);
                total -= discountAmount;
            } else {
                return res.status(400).json({ message: 'Invalid or expired discount code.' });
            }
        }

        const order = new Order({
            user: {
                userId: user._id,
                name: user.name
            },
            cart: {
                items: cartItems
            },
            total: total,
            discount: {
                code: discountCode,
                amount: discountAmount
            },
            additionalComment: additionalComment
        });

        await order.save();

        // Increment sales count for each product
        for (const item of cartItems) {
            await Product.updateOne(
                { _id: item.product._id },
                { $inc: { salesCount: item.quantity } }
            );
        }

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
};

exports.getSingleOrder = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        if (!order) {
            const error = new Error('order not found!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: 'order fetched successfully!',
            order: order
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

// Checkout Endpoint's

exports.getPayment = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        if (!orderId) {
            const error = new Error('Order ID is required!');
            error.statusCode = 400;
            throw error;
        }

        const order = await Order.findById(orderId);
        if (!order) {
            const error = new Error('Order not found!');
            error.statusCode = 404;
            throw error;
        }

        if (order.user.userId.toString() !== req.user._id.toString()) {
            const error = new Error('Unauthorized user to make payment for this order!');
            error.statusCode = 403;
            throw error;
        };

        const amount = order.total;
        const callbackURL = `http://localhost:3000/checkPayment/${orderId}`;
        const description = 'تست اتصال به درگاه پرداخت';
        // const description = `Payment for Order ID: ${orderId}`;

        const response = await zarinpal.PaymentRequest({
            Amount: amount,
            CallbackURL: callbackURL,
            Description: description,
            Email: req.user.email,
            Mobile: req.user.phone,
        });

        if (response.status === 100) {
            console.log(response);
            res.json({
                paymentUrl: response.url
            });
        } else {
            res.status(500).json({ message: 'Failed to create payment request.' });
        }

    } catch (error) {
        console.error(error);
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.checkPayment = async (req, res, next) => {
    const authority = req.query.Authority;
    const status = req.query.Status;
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({ message: 'Order not found!' });
    }

    if (status == 'OK') {
        zarinpal.PaymentVerification({
            Amount: order.total,
            Authority: authority
        }).then((response) => {
            console.log(response)
        });
    }
};

// ============================================ //

// This two endpoint are not complete 

// exports.updateOrderStatus = async (req, res, next) => {
//     try {
//         const errors = validationResult(req);

//         if (!errors.isEmpty()) {
//             return res.status(422).json({
//                 message: 'Validation failed! Your entered data is invalid!',
//                 errors: errors.array(),
//             });
//         }

//         const orderId = req.params.orderId;
//         const newStatus = req.body.status;

//         const order = await Order.findById(orderId);

//         if(!order) {
//             const error = new Error('Order not found!');
//             error.statusCode = 404;
//             throw error
//         }

//         order.status = newStatus;
//         await order.save();

//         res.status(200).json({
//             message : 'Order status updated successfully!',
//             order : order
//         });

        
//     } catch (error) {
//         if(!error.statusCode) {
//             error.statusCode = 500;
//         }
//         next(error);
//     }
// }

// exports.cancelOrder = async (req, res, next) => {
//     try {

//     } catch (error) {
        
//     }
// }
