const express = require('express');
const mainSliderControllers = require('../controllers/mainSlider');
const multer = require('multer');
const router = express.Router();

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


router.get('/mainSliders', mainSliderControllers.getMainSlider);
router.post('/mainSlider', upload.single('image'), mainSliderControllers.createMainSlider);
router.get('/mainSliders/:slideId', mainSliderControllers.getSingleSlide);
router.put('/mainSliders/:slideId', upload.single('image'), mainSliderControllers.updateSlide);
router.delete('/mainSliders/:slideId', mainSliderControllers.deleteSlide);


module.exports = router;