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
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.createArticle = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed! Your entered data is invalid!');
            error.statusCode = 422;
            throw error;
        }

        if (!req.files || req.files.length === 0) {
            const error = new Error('Please upload at least one file');
            error.statusCode = 422;
            throw error;
        }

        const { title, content, excerpt, categories, readTime } = req.body;
        const imageUrl = req.files['image'][0].path.replace(/\\/g, '/');
        const authorProfileImagePath = req.files['authorProfileImage'][0].path.replace(/\\/g, '/');

        const author = {
            name: req.body.authorName,
            bio: req.body.authorBio,
            profileImage: authorProfileImagePath
        };

        const article = new Article({
            title,
            content,
            excerpt,
            imageUrl,
            author,
            categories,
            readTime
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

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getSingleArticle = async (req, res, next) => {
    try {

        const articleId = req.params.articleId;
        const article = await Article.findById(articleId);

        if (!article) {
            const error = new Error('Article not found!');
            error.statusCode = 404;
            throw error;
        }

        article.views += 1;
        await article.save();

        res.status(200).json({
            message: 'Article was found!',
            article: article
        });

    } catch (error) {

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.updateArticlesLike = async (req, res, next) => {
    try {
        const articleId = req.params.articleId;
        const userId = req.userId;

        const article = await Article.findById(articleId);

        if (!article) {
            const error = new Error('Article not found!');
            error.statusCode = 404;
            throw error;
        }

        const index = article.likedBy.indexOf(userId);
        if (index === -1) {
            article.likes += 1;
            article.likedBy.push(userId);
        } else {
            article.likes -= 1;
            article.likedBy.splice(index, 1);
        }

        const updatedArticle = await article.save();

        res.status(200).json({
            message: 'Article Likes updated successfully!',
            likes: updatedArticle.likes,
            likedBy: updatedArticle.likedBy
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getMoreViewedArticle = async (req, res, next) => {
    try {
        const moreViewedArticle = await Article.find().sort({ views: -1 }).limit(1);
        res.status(200).json({
            message: 'Article fetched successfully!',
            article: moreViewedArticle
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getNewestArticles = async (req, res, next) => {
    try {
        const newestArticles = await Article.find().sort({ createdAt: -1 }).limit(6);
        res.status(200).json({
            message: 'Newest articles fetched successfully!',
            articles: newestArticles
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.updateArticle = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                message: 'Validation failed! Your entered data is invalid!',
                errors: errors.array(),
            });
        }

        const articleId = req.params.articleId;
        const article = await Article.findById(articleId);

        if (!article) {
            const error = new Error('Article not found!');
            error.statusCode = 404;
            throw error;
        }

        const { title, content, excerpt, categories, readTime } = req.body;

        if (req.files && req.files['image']) {
            // If there's a new image, remove the old one
            await unlinkAsync(article.imageUrl);
            article.imageUrl = req.files['image'][0].path.replace(/\\/g, '/');
        }

        if (req.files && req.files['authorProfileImage']) {
            // If there's a new author profile image, remove the old one
            await unlinkAsync(article.author.profileImage);
            article.author.profileImage = req.files['authorProfileImage'][0].path.replace(/\\/g, '/');
        }

        article.title = title;
        article.content = content;
        article.excerpt = excerpt;
        article.categories = categories;
        article.readTime = readTime;
        article.author.name = req.body.authorName;
        article.author.bio = req.body.authorBio;

        const updatedArticle = await article.save();

        res.status(200).json({
            message: 'Article updated successfully!',
            article: updatedArticle,
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
};

exports.deleteArticle = async (req, res, next) => {
    try {

        const articleId = req.params.articleId;

        const article = await Article.findById(articleId);

        if (!article) {
            const error = new Error('Article not found!');
            error.statusCode = 404;
            throw error;
        }

        // Remove the associated image files from the filesystem
        await unlinkAsync(article.imageUrl);
        await unlinkAsync(article.author.profileImage);

        // Delete the article from the database
        await Article.findByIdAndDelete(articleId);

        res.status(200).json({
            message: 'Article deleted successfully!'
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}