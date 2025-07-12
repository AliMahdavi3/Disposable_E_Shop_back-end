const { validationResult } = require('express-validator');
const User = require('../models/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/emailSender');
require('dotenv').config();


exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.status(422).json({
                message: 'Validation faild, your entered data is invalid!',
                errors: errors.array(),
            });
        }

        const { email, phone, name, password, city, address, zipCode, birthDate, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 12);

        let UserEmail = await User.findOne({ email });
        if (UserEmail) {
            const error = new Error("User with this email already exists!");
            error.statusCode = 409;
            throw error;
        }

        let UserPhone = await User.findOne({ phone });
        if (UserPhone) {
            const error = new Error("User with this phone number already exists!");
            error.statusCode = 409;
            throw error;
        }

        const user = new User({
            email,
            name,
            phone,
            birthDate,
            city,
            address,
            zipCode,
            role,
            password: hashedPassword,
        });
        const result = await user.save();

        await sendEmail({
            option: {
                userEmail: email,
                subject: "ثبت نام",
                html: `<p>ثبت نام شما موفقیت آمیز بود!</p>`
            },
        });

        return res.status(201).json({
            message: 'User created Successfully!',
            userId: result._id,
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, phone, password } = req.body;
        let user;
        if (email) {
            user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
        } else if (phone) {
            user = await User.findOne({ phone: phone });
        } else {
            return res.status(400).json({ message: "Please provide email or phone for login." });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password!" });
        }

        const token = jwt.sign({
            email: user.email,
            phone: user.phone,
            userId: user._id.toString(),
        }, process.env.JWT_SECRRET, {
            expiresIn: '365d'
        });

        res.status(200).json({
            message: "login was successful!",
            token: token,
            userId: user._id.toString()
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.resetPasswordRequest = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            const error = new Error('User not found!');
            error.statusCode = 404;
            throw error;
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000;

        await user.save();

        const resetLink = `http://localhost:3000/reset-password/${token}`;
        await sendEmail({
            option: {
                userEmail: email,
                subject: "بازیابی رمزعبور",
                html: `<p>
                    <span>
                        !شما درخواست بازیابی رمز عبور دادید
                    </span><br />
                    <span>
                        !برای تغییر رمزعبور بر روی لینک کلیک کنید!
                    </span> : 
                </p><br />
                <a href="${resetLink}">لینک بازیابی</a>`
            },
        });

        res.status(200).json({
            message: "Reset link sent to user email!",
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            const error = new Error('Token and new password are require!');
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            const error = new Error('Invalid or Expired Token!');
            error.statusCode = 404;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

        await sendEmail({
            option: {
                userEmail: user.email,
                subject: 'رمزعبور شما تغییر کرد!',
                html: `<p>بازیابی رمزعبور شما موفقیت آمیز بود!</p>`,
            }
        });

        res.status(200).json({
            message: "Password has been RESET successfully!",
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.changePassword = async (req, res, next) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation Faild!, Your Entered Data is Invalid');
            error.statusCode = 422;
            throw error;
        }

        const { oldPassword, newPassword } = req.body;

        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found!')
            error.statusCode = 404;
            throw error;
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            const error = new Error('Your old password is incorrect!')
            error.statusCode = 401;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            message: 'Password updated successfully!'
        })


    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}

exports.getUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation Faild!, Your Entered Data is Invalid');
            error.statusCode = 422;
            throw error;
        }

        const userId = req.params.userId || req.user;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            const error = new Error('User not found!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: "User fetched successfully!",
            user: user
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getAllUsers = async (req, res, next) => {
    try {
        const userList = await User.find().select('-password'); // Exclude the password field
        res.status(200).json({
            message: 'Users fetched successfully!',
            users: userList,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error);
    }
}

exports.editUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation Faild!, Your Entered Data is Invalid');
            error.statusCode = 422;
            throw error;
        }

        const userId = req.params.userId;
        const { name, email, phone, city, address, zipCode, birthDate, role } = req.body;
        const user = await User.findById(userId);


        if (!user) {
            const error = new Error('Could Not Find User!');
            error.statusCode = 404;
            throw error;
        }

        user.name = name;
        user.email = email;
        user.phone = phone;
        user.city = city;
        user.address = address;
        user.zipCode = zipCode;
        user.birthDate = birthDate;
        user.role = role;

        await user.save();

        res.status(200).json({
            message: 'User Updated Successfully!',
            user: user,
        });

    } catch (error) {

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            const error = new Error('User Not Found!');
            error.statusCode = 404;
            throw error;
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: 'User deleted successfully!'
        });

    } catch (error) {
        if (error.statusCode) {
            error.statusCode = 500
        }
        next(error);
    }
}

exports.getFavorites = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('favorites');

        if (!user) {
            const error = new Error('User not found!');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'Favorites fetched successfully!',
            favorites: user.favorites
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.addToFavorites = async (req, res, next) => {
    try {
        const userId = req.user._id;
        let { productId } = req.body;
        const user = await User.findById(userId);


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation Faild!, Your Entered Data is Invalid');
            error.statusCode = 422;
            throw error;
        }

        if (!user) {
            const error = new Error('User not found!');
            error.statusCode = 404;
            throw error;
        }

        if (!user.favorites.includes(productId)) {
            user.favorites.push(productId);
            await user.save();
        }

        res.status(200).json({
            message: "Product added to Fav list successfully!",
            favorites: user.favorites,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.removeFromFavorites = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const user = await User.findById(userId);


        if (!user) {
            const error = new Error('User not found!');
            error.statusCode = 404;
            throw error;
        }

        user.favorites = user.favorites.filter(id => id.toString() !== productId);
        await user.save();

        res.status(200).json({
            message: 'Product removed from Fav list successfully!',
            favorites: user.favorites
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};