const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productCommentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: false,
        min: 1,
        max: 5,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('ProductComment', productCommentSchema)