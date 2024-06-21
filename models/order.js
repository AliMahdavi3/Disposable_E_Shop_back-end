const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const orderSchema = new Schema({
    user: {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
    },
    cart: {
        items: [
            {
                product: {
                    type: Object,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    },
    total: {
        type: Number,
        required: true
    },
    discount: {
        code: String,
        amount: Number
    },
    additionalComment: {
        type: String,
        required: false
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
}, {
    timestamps: true
});


module.exports = mongoose.model('Order', orderSchema);