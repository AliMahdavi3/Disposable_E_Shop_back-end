const { validationResult } = require('express-validator');
const User = require('../models/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

        const { email, phone, name, password, city, address, zipCode, birthDate } = req.body;

        const hashedPassword = await bcrypt.hash(password, 12);

        let UserEmail = await User.findOne({ email });
        if (UserEmail) {
            return res.status(409).json({
                message: 'User with this email already exists.'
            });
        }

        let UserPhone = await User.findOne({ phone });
        if (UserPhone) {
            return res.status(409).json({
                message: 'User with this phone number already exists.'
            });
        }

     

        const user = new User({
            email,
            name,
            phone,
            birthDate,
            city,
            address,
            zipCode,
            password: hashedPassword,
        });
        const result = await user.save();

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

exports.getUser = async (req, res, next) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation Faild!, Your Entered Data is Invalid');
            error.statusCode = 422;
            throw error;
        }
        const userId = req.user.userId;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            const error = new Error('User not found!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            user: user
        })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
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
        const { name, email, phone, city, address, zipCode} = req.body;

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