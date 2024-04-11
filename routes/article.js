const express = require('express');
const router = express.Router();
const articleControllers = require('../controllers/article');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + '.jpg');
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('file type not supported!'));
    }
}
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});


router.get('/articles', articleControllers.getArticles);
router.post('/article', upload.array('image', 2), articleControllers.createArticle);

module.exports = router;
