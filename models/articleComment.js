const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleCommentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
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

module.exports = mongoose.model('ArticleComment', ArticleCommentSchema)