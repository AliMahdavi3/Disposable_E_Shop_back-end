const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mainSliderSchema = new Schema({
    title : {
        type : String,
        required: false
    },
    content : {
        type : String,
        required: false
    },
    imageUrl: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MainSlider', mainSliderSchema);