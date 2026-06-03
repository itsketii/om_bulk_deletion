const { verifyToken } = require('../config/jwt');

const authMiddleware = (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token missing'
            });
        }

        const token =
            authHeader.split(' ')[1];

        const decoded =
            verifyToken(token);

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });

    }

};

module.exports = authMiddleware;