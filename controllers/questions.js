const { validationResult } = require('express-validator');
const Question = require('../models/questions');
const path = require('path');
const fs = require('fs');


exports.getQuestions = async (req, res, next) => {
    try {
        const questionList = await Question.find();
        res.status(200).json({
            message: "Questions fetched successfully!",
            questions: questionList
        });

    } catch (error) {

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}

exports.createQuestion = async (req, res, next) => {
    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const error = new Error('Validation failed! your entered data is invalid!');
            error.statusCode = 422;
            throw error;
        }

        const title = req.body.title;
        const content = req.body.content;

        const question = new Question({
            title: title,
            content: content
        });

        const questionResult = await question.save();

        res.status(201).json({
            message: "Question created successfully!",
            question: questionResult
        });


    } catch (error) {

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getSingleQuestion = async (req, res, next) => {
    try {
        const questionId = req.params.questionId;
        const question = await Question.findById(questionId);

        if(!question) {
            const error = new Error('Question not found!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message : 'Question fetched successfully!',
            question : question
        });

    } catch (error) {
        if(!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
}

exports.updateQuestion = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                message: 'Validation failed! Your entered data is invalid!',
                errors: errors.array(),
            });
        }

        const questionId = req.params.questionId;
        const { title, content } = req.body;
        
        const question = await Question.findById(questionId);

        if(!question) {
            const error = new Error('Question not found!');
            error.statusCode = 404;
            throw error;
        }

        question.title = title;
        question.content = content;

        const updatedQuestion = await question.save();

        res.status(200).json({
            message: 'Question updated successfully!',
            question : updatedQuestion
        });

    } catch (error) {
        if(!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
}

exports.deleteQuestion = async (req, res, next) => {
    try {
        const questionId = req.params.questionId;
        const question = await Question.findById(questionId);

        if(!question) {
            const error = new Error('Question not found!');
            error.statusCode = 404;
            throw error;
        }

        await Question.findByIdAndDelete(questionId);

        res.status(200).json({
            message : 'Question deleted successfully!'
        })
        
    } catch (error) {
        if(!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
}