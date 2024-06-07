const Order = require('../models/order');
const { calculateDiscountAmount, validateDiscountCode } = require('../services/discountService');

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