const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mainSliderSchema = new Schema({
    imageUrl: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MainSlider', mainSliderSchema);