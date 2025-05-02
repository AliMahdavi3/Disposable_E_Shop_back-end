const express = require('express');
const ticketsControllers = require('../controllers/ticketToSupport');
const authenticate = require('../middlewares/authentication');
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

router.get('/tickets', authenticate, ticketsControllers.getAllTickets);
router.post('/ticket', authenticate, upload.array('image', 5), ticketsControllers.createTicket);
router.get('/tickets/:ticketId', authenticate, ticketsControllers.getSingleTicket);
router.put('/tickets/:ticketId', authenticate, upload.array('image', 5), ticketsControllers.updateTicket);
router.delete('/tickets/:ticketId', authenticate, ticketsControllers.deleteTicket);


module.exports = router;