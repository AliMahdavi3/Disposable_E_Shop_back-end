const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    city: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    zipCode: {
        type: String,
        required: false,
        trim: true,
    },
    birthDate: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true,
    },
    resetToken: {
        type: String,
        required: false,
    },
    resetTokenExpiry: {
        type: Date,
        required: false,
    },
    status: {
        type: String,
        default: 'New User!'
    },
    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User',
    },
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true
            }
        }],
        appliedDiscount: {
            discountCode: {
                type: String,
                required: false
            },
            percentage: {
                type: Number,
                required: false
            }
        },
    },
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
    }],
}, {
    timestamps: true
});

userSchema.methods.addToCart = function (product, quantity) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });

    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        updatedCartItems[cartProductIndex].quantity += quantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: quantity
        });
    }

    const updatedCart = {
        items: updatedCartItems
    };

    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter((item) => {
        return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.updateCartProductQuantity = function (productId, newQuantity) {

    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === productId.toString();
    });

    if (cartProductIndex === -1) {
        throw new Error('Product not found in cart!');
    };

    const updatedCartItems = [...this.cart.items];
    updatedCartItems[cartProductIndex].quantity = newQuantity;

    this.cart.items = updatedCartItems;
    return this.save();
};

module.exports = mongoose.model('User', userSchema);