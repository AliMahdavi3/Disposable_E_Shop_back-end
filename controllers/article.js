const { validationResult } = require('express-validator');
const Article = require('../models/article');
const path = require('path');
const fs = require('fs');
const util = require('util');
const unlinkAsync = util.promisify(fs.unlink);



exports.getArticles = async (req, res, next) => {
    try {

        const articleList = await Article.find();
        res.status(200).json({
            message: "Articls fetched successfully!",
            articles: articleList,
        });

    } catch (error) {
        if(!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}



exports.createArticle = async (req, res, next) => {

    try {
        
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            const error = new Error('Validation failed! your entered data is invalid!');
            error.statusCode = 422;
            throw error;
        }

        if(!req.files || req.files.length === 0) {
            const error = new Error('Please upload at least one file');
            error.statusCode = 422;
            throw error;
        }

        const { title, content, author } = req.body;

        const article = new Article({
            title: title,
            content: content,
            author: author,
            imageUrl: req.files.map(file => file.path.replace(/\\/g, '/'))
        });
        const articleResult = await article.save();

        res.status(201).json({
            message: 'Article created successfully!',
            article: articleResult
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

        if(!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}