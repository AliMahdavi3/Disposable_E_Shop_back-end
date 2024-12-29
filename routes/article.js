const express = require('express');
const router = express.Router();
const articleControllers = require('../controllers/article');
const authenticate = require('../middlewares/authentication');
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
}).fields([
    { name: 'image', maxCount: 1 },
    { name: 'authorProfileImage', maxCount: 1 }
]);


router.get('/articles', articleControllers.getArticles);
router.post('/article', upload, articleControllers.createArticle);
router.get('/articles/more-view', articleControllers.getMoreViewedArticle);
router.get('/articles/newest', articleControllers.getNewestArticles);
router.get('/articles/:articleId', upload, articleControllers.getSingleArticle);
router.patch('/articles/:articleId/likes', authenticate, articleControllers.updateArticlesLike);
router.put('/articles/:articleId', authenticate, upload, articleControllers.updateArticle);
router.delete('/articles/:articleId', authenticate, articleControllers.deleteArticle);



module.exports = router;
