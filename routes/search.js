const express = require('express');
const Product = require('../models/product');
const router = express.Router();


router.get('/search', async (req, res, next) => {
    try {
        const searchTerm = req.query.term;
        const products = await Product.find({ $text: { $search: searchTerm } });

        const results = { products };

        res.json(results);

    } catch (error) {
        if(!error.statusCode) {
            error.statusCode = 500;
        }
        next(error)
    }
});


module.exports = router;