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

        if (!req.file) {
            const error = new Error("Please upload at least one file");
            error.statusCode = 422;
            throw error;
        }

        const { title, content, link } = req.body;

        const banner = new Banner({
            title: title,
            content: content,
            imageUrl: req.file.path.replace(/\\/g, '/'),
            link: link
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

        const {title, content, link} = req.body;
        
        if (title) banner.title = title;
        if (content) banner.content = content;
        if (link) banner.link = link;

        // If a new file is uploaded, update the image URL
        if (req.file) {
            // Delete the old image file
            try {
                await unlinkAsync(banner.imageUrl); // Remove the old image file
            } catch (cleanupError) {
                console.error('Error cleaning up old image:', cleanupError);
            }

            // Update the image URL with the new file path
            banner.imageUrl = req.file.path.replace(/\\/g, '/');
        }

        const updatedBanner = await banner.save();

        res.status(200).json({
            message: 'Banner updated successfully!',
            banner: updatedBanner,
        });

    } catch (error) {
        if (req.file) {
            // Clean up uploaded file in case of error
            try {
                await unlinkAsync(req.file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up uploaded file:', cleanupError);
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
        const bannerId = req.params.bannerId; // Extract banner ID from request parameters
        const banner = await Banner.findById(bannerId); // Find the banner by ID

        if (!banner) {
            const error = new Error('Banner not found!');
            error.statusCode = 404;
            throw error;
        }

        // Delete the old image file
        try {
            await unlinkAsync(banner.imageUrl); // Remove the image file from the server
        } catch (cleanupError) {
            console.error('Error cleaning up image file:', cleanupError);
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