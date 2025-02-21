const { validationResult } = require('express-validator');
const Banner = require('../models/banner');
const path = require('path');
const fs = require('fs');
const util = require('util');
const unlinkAsync = util.promisify(fs.unlink);

exports.getBanners = async (req, res, next) => {
    try {
        const bannerList = await Banner.find();
        res.status(200).json({
            message: 'Banners Found Successfully!',
            banners: bannerList
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.createBanner = async (req, res, next) => {

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const error = new Error('Validation is Faild!, Your Entered data is invalid!');
            error.statusCode = 422;
            throw error;
        }

        if (!req.files || req.files.length === 0) {
            const error = new Error("Please upload at least one file");
            error.statusCode = 422;
            throw error;
        }

        const { title, content } = req.body;

        const banner = new Banner({
            title: title,
            content: content,
            imageUrl: req.files.map(file => file.path.replace(/\\/g, '/')),
        });

        const bannerResults = await banner.save();

        res.status(201).json({
            message: "Banner Created Successfully!",
            banner: bannerResults,
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

exports.getSingleBanner = async (req, res, next) => {
    try {
        const bannerId = req.params.bannerId;
        const banner = await Banner.findById(bannerId);

        if (!banner) {
            const error = new Error('Banner not found!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: 'Banner fetched successfully!',
            banner: banner,
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error);
    }
}

exports.updateBanner = async (req, res, next) => {
    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                message: 'Validation failed! Your entered data is invalid!',
                errors: errors.array(),
            });
        }

        const bannerId = req.params.bannerId;
        const banner = await Banner.findById(bannerId);

        if (!banner) {
            const error = new Error('Banner not found!');
            error.statusCode = 404;
            throw error;
        }

        const { title, content, link } = req.body;

        if (title) banner.title = title;
        if (content) banner.content = content;

        if (req.files && req.files.length > 0) {
            if (banner.imageUrl && banner.imageUrl.length > 0) {
                for (let imagePath of banner.imageUrl) {
                    await unlinkAsync(imagePath);
                }
            }
            banner.imageUrl = req.files.map(file => file.path.replace(/\\/g, '/'));
        }

        const updatedBanner = await banner.save();

        res.status(200).json({
            message: 'Banner updated successfully!',
            banner: updatedBanner,
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
}

exports.deleteBanner = async (req, res, next) => {
    try {
        const bannerId = req.params.bannerId;
        const banner = await Banner.findById(bannerId);

        if (!banner) {
            const error = new Error('Banner not found!');
            error.statusCode = 404;
            throw error;
        }

        // Delete the old image file
        if (banner.imageUrl && banner.imageUrl.length > 0) {
            for (let imagePath of banner.imageUrl) {
                await unlinkAsync(imagePath);
            }
        }

        // Delete the banner from the database
        await Banner.findByIdAndDelete(bannerId);

        res.status(200).json({
            message: 'Banner deleted successfully!'
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}