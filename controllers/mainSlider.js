const { validationResult } = require('express-validator');
const MainSlider = require('../models/mainSlider');
const path = require('path');
const util = require('util');
const fs = require('fs');
const unlinkAsync = util.promisify(fs.unlink);

exports.getMainSlider = async (req, res, next) => {
    try {
        const mainSliderList = await MainSlider.find();
        res.status(200).json({
            message: 'MainSlider Found Successfully!',
            mainSliders: mainSliderList
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}



exports.createMainSlider = async (req, res, next) => {

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

        const mainSlider = new MainSlider({
            imageUrl: req.file.path.replace(/\\/g, '/')
        });
        const mainSliderResults = await mainSlider.save();

        res.status(201).json({
            message: "MainSlider Created Successfully!",
            mainSlider: mainSliderResults,
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