const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (req, res, next) => {

    try {
        
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            const error = new Error('No Token Provided!');
            error.statusCode = 401;
            throw error;
        }
    
        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRRET);
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = authenticate;