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

exports.getSingleSlide = async (req, res, next) => {
    try {
        const slideId = req.params.slideId;
        const slide = await MainSlider.findById(slideId);

        if (!slide) {
            const error = new Error('Slide not found!');
            error.statusCode = 404;
            throw error
        }

        res.status(200).json({
            message: 'Slide fetched successfully!',
            slide: slide
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error);
    }
}

exports.updateSlide = async (req, res, next) => {
    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                message: 'Validation failed! Your entered data is invalid!',
                errors: errors.array(),
            });
        }

        const slideId = req.params.slideId;
        const slide = await MainSlider.findById(slideId);

        if (!slide) {
            const error = new Error('Slide not found!')
            error.statusCode = 404;
            throw error
        }

        // If a new file is uploaded, update the image URL
        if (req.file) {
            // Delete the old image file
            try {
                await unlinkAsync(slide.imageUrl); // Remove the old image file
            } catch (cleanupError) {
                console.error('Error cleaning up old image:', cleanupError);
            }

            // Update the image URL with the new file path
            slide.imageUrl = req.file.path.replace(/\\/g, '/');
        }

        const updatedSlide = await slide.save();

        res.status(200).json({
            message: 'Slide updated successfully!',
            slide: updatedSlide
        })

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

exports.deleteSlide = async (req, res, next) => {
    try {
        const slideId = req.params.slideId;
        const slide = await MainSlider.findById(slideId);

        if (!slide) {
            const error = new Error('Slide not found!')
            error.statusCode = 404;
            throw error
        }

        // Delete the old image file
        try {
            await unlinkAsync(slide.imageUrl); // Remove the image file from the server
        } catch (cleanupError) {
            console.error('Error cleaning up image file:', cleanupError);
        }

        await MainSlider.findByIdAndDelete(slideId);

        res.status(200).json({
            message: 'Slide deleted successfully!',
        })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}