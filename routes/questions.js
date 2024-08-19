const express = require('express');
const router = express.Router();
const questionControllers = require('../controllers/questions');
const authenticate = require('../middlewares/authentication');
const multer = require('multer');
const upload = multer();


router.get('/questions', authenticate, questionControllers.getQuestions);
router.post('/question', upload.none(), authenticate, questionControllers.createQuestion);
router.get('/questions/:questionId', authenticate, questionControllers.getSingleQuestion);
router.put('/questions/:questionId', upload.none(), authenticate, questionControllers.updateQuestion);
router.delete('/questions/:questionId', authenticate, questionControllers.deleteQuestion);


module.exports = router;