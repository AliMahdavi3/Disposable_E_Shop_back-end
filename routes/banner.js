const express = require('express');
const router = express.Router();
const multer = require('multer');
const bannerControllers = require('../controllers/banner');

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

router.post('/banner', upload.single('image'), bannerControllers.createBanner);
router.get('/banners', bannerControllers.getBanners);
router.get('/banners/:bannerId', bannerControllers.getSingleBanner);
router.put('/banners/:bannerId', upload.single('image'), bannerControllers.updateBanner);
router.delete('/banners/:bannerId', bannerControllers.deleteBanner);


module.exports = router;