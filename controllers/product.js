const { validationResult } = require('express-validator');
const Product = require('../models/product');
const path = require('path');
const util = require('util');
const fs = require('fs');
const unlinkAsync = util.promisify(fs.unlink);

exports.getProducts = async (req, res, next) => {
    try {
        const productsList = await Product.find();
        res.status(200).json({
            message: 'Products Fetched Successfully!',
            products: productsList,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error)
    }
}

exports.createProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const error = new Error('Validation Faild!, Your Entered Data is Invalid');
            error.statusCode = 422;
            throw error;
        }

        if (!req.files || req.files.length === 0) {
            const error = new Error("Please upload at least one file");
            error.statusCode = 422;
            throw error;
        }

        const { title, content, price, productCode, weight, size, available, category, color, tag, userId } = req.body

        const product = new Product({
            title: title,
            content: content,
            productCode: productCode,
            price: price,
            weight: weight,
            size: size,
            available: available,
            category: category,
            color: color,
            tag: tag,
            imageUrl: req.files.map(file => file.path.replace(/\\/g, '/')),
            userId: req.user._id,
        });
        const productResults = await product.save();

        res.status(201).json({
            message: "Product Created Successfully!",
            product: productResults,
        });

    } catch (error) {

        if (req.files) {
            for (let file of req.files) {
                try {
                    await unlinkAsync(file.path);
                } catch (cleanupError) {
                    console.error('Error cleaning up files:', cleanupError);
                }
            }
        }

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getSingleProduct = async (req, res, next) => {

    try {

        const productId = req.params.productId;
        const product = await Product.findByIdAndUpdate(
            productId,
            { $inc: { views: 1 } },
            { new: true },
        );

        if (!product) {
            const error = new Error('Product not found!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: "Product was found!",
            product: product
        })

    } catch (error) {

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);

    }
}

exports.getTopSellingProducts = async (req, res, next) => {
    try {
        const topProducts = await Product.find().sort({ salesCount: -1 }).limit(6);
        res.status(200).json({
            message: 'Top selling products fetched successfully!',
            products: topProducts
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getDisposableProducts = async (req, res, next) => {
    try {
        const disposableProducts = await Product.find({ category: 'ظروف یکبارمصرف' });
        res.status(200).json({
            message: 'Disposable Products fetched successfully!',
            products: disposableProducts,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getBirthDayProducts = async (req, res, next) => {
    try {
        const birthDayProducts = await Product.find({ category: 'تم تولدی' });
        res.status(200).json({
            message: 'Birth Day Products fetched successfully!',
            products: birthDayProducts,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getNewestProducts = async (req, res, next) => {
    try {

        const newestProducts = await Product.find().sort({ createdAt: -1 }).limit(7);
        res.status(200).json({
            message: 'Newest Products fetched succesfully!',
            products: newestProducts
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}