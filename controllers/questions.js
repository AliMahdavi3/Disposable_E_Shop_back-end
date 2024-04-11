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