const userService = require('../services/user.service');

const handleServiceError = (error, res, next) => {

    if (error.statusCode) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    return next(error);
};

const listUsers = async (req, res, next) => {

    try {

        const users = await userService.listUsers();

        return res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const createUser = async (req, res, next) => {

    try {

        const { username, fullname, email, password, role } = req.body;

        const user = await userService.createUser({
            username,
            fullname,
            email,
            password,
            role
        });

        return res.status(201).json({
            success: true,
            message: 'User created',
            data: user
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const resetPassword = async (req, res, next) => {

    try {

        const { newPassword } = req.body;

        const user = await userService.resetPassword({
            userId: req.params.id,
            newPassword
        });

        return res.status(200).json({
            success: true,
            message: 'Password reset',
            data: user
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

module.exports = {
    listUsers,
    createUser,
    resetPassword
};
