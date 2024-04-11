const express = require('express');
const router = express.Router();
const questionControllers = require('../controllers/questions');
const multer = require('multer');
const upload = multer();


router.get('/questions', questionControllers.getQuestions);
router.post('/question', upload.none(), questionControllers.createQuestion);



module.exports = router;