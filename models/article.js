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
        type: [String],
        required: true
    },
    author: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});


module.exports = mongoose.model('Article', articleSchema);