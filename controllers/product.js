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

        const newestProducts = await Product.find().sort({ createdAt: -1 }).limit(6);
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

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Product.distinct('category');
        res.status(200).json({
            message: 'Categories fetched successfully!',
            categories: categories
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.updateProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                message: 'Validation failed! Your entered data is invalid!',
                errors: errors.array(),
            });
        }

        const productId = req.params.productId;
        const product = await Product.findById(productId);

        if (!product) {
            const error = new Error('Product not found!');
            error.statusCode = 404;
            throw error;
        }

        const { title, content, price, productCode, weight, size, available, category, color, tag } = req.body;

        if (title) product.title = title;
        if (content) product.content = content;
        if (price) product.price = price;
        if (productCode) product.productCode = productCode;
        if (weight) product.weight = weight;
        if (size) product.size = size;
        if (available !== undefined) product.available = available;
        if (category) product.category = category;
        if (color) product.color = color;
        if (tag) product.tag = tag;

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            if (product.imageUrl && product.imageUrl.length > 0) {
                for (let imagePath of product.imageUrl) {
                    await unlinkAsync(imagePath);
                }
            }
            // Update the imageUrl with new images
            product.imageUrl = req.files.map(file => file.path.replace(/\\/g, '/'));
        }

        const updatedProduct = await product.save();

        res.status(200).json({
            message: 'Product updated successfully!',
            product: updatedProduct,
        });

    } catch (error) {
        // Clean up uploaded files in case of error
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
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);

        if (!product) {
            const error = new Error('Product not found!');
            error.statusCode = 404;
            throw error;
        }

        // Delete associated image files if they exist
        if (product.imageUrl && product.imageUrl.length > 0) {
            for (let imagePath of product.imageUrl) {
                await unlinkAsync(imagePath);
            }
        }

        await Product.findByIdAndDelete(productId);

        res.status(200).json({
            message: 'Product deleted successfully!'
        })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
}