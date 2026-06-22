const authService = require('../services/auth.service');

const handleServiceError = (error, res, next) => {

    if (error.statusCode) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    return next(error);
};

const register = async (req, res, next) => {

    try {

        const { username, fullname, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'username, email and password are required'
            });
        }

        const user = await authService.register({
            username,
            fullname,
            email,
            password
        });

        return res.status(201).json({
            success: true,
            message: 'User registered',
            data: user
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const login = async (req, res, next) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'username and password are required'
            });
        }

        const result = await authService.login({
            username,
            password
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const profile = async (req, res, next) => {

    try {

        const user = await authService.getProfile(req.user.id);

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const updateProfile = async (req, res, next) => {

    try {

        const { fullname, email } = req.body || {};

        const user = await authService.updateProfile({
            userId: req.user.id,
            fullname,
            email
        });

        return res.status(200).json({
            success: true,
            message: 'Profile updated',
            data: user
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const changePassword = async (req, res, next) => {

    try {

        const { currentPassword, newPassword } = req.body || {};

        const user = await authService.changePassword({
            userId: req.user.id,
            currentPassword,
            newPassword
        });

        return res.status(200).json({
            success: true,
            message: 'Password changed',
            data: user
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

module.exports = {
    register,
    login,
    profile,
    updateProfile,
    changePassword
};
