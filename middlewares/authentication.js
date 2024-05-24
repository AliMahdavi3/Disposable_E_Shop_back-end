const jwt = require('jsonwebtoken');
const User = require('../models/auth');
require('dotenv').config();

const authenticate = async (req, res, next) => {

    try {
        
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            const error = new Error('No Token Provided!');
            error.statusCode = 401;
            throw error;
        }
    
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRRET);

        const user = await User.findById(decoded.userId); 

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = authenticate;