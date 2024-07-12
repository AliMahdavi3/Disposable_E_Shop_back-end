const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        required: true
    },
    author: {
        name: {
            type: String,
            required: true
        },
        bio: {
            type: String,
            required: true
        },
        profileImage: {
            type: String,
            required: true
        },
    },
    categories: {
        type: String,
        required: true
    },
    relatedProducts:[{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    readTime:{
        type: String,
        required: true
    },
    likes:{
        type: Number,
        default: 0
    },
    likedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    views: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});

articleSchema.index({ title: 'text', content: 'text' });
module.exports = mongoose.model('Article', articleSchema);