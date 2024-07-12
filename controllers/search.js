const Product = require('../models/product');
const Article = require('../models/article');

exports.searchItems = async (req, res, next) => {
    try {

        const { term } = req.query;

        const searchQueries = [
            Product.find({ $text: { $search: term } }),
            Article.find({ $text: { $search: term } }),
        ];

        const [products, articles] = await Promise.all(searchQueries);

        const combinedResults = {
            products,
            articles,
        };

        res.status(200).json({
            status: 'success',
            results: Object.values(combinedResults).reduce((acc, curr) => acc + curr.length, 0),
            data: combinedResults
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'An error occurred during the search'
        });
    }
}