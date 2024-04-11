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

        const banner = new Banner({
            imageUrl: req.file.path.replace(/\\/g, '/')
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