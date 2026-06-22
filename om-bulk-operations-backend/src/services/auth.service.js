const bcrypt = require('bcryptjs');

const userRepository = require(
    '../repositories/user.repository'
);

const { generateToken } = require('../config/jwt');

const SALT_ROUNDS = 10;

const toPublicUser = (user) => {
    return {
        id: user.id,
        username: user.username,
        fullname: user.fullname || null,
        email: user.email,
        role: user.role
    };
};

const register = async ({ username, fullname, email, password }) => {

    const existingByUsername =
        await userRepository.findByUsername(username);

    if (existingByUsername) {
        const error = new Error('Username already in use');
        error.statusCode = 409;
        throw error;
    }

    const existingByEmail =
        await userRepository.findByEmail(email);

    if (existingByEmail) {
        const error = new Error('Email already in use');
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword =
        await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userRepository.create({
        username,
        fullname: fullname ? String(fullname).trim() : null,
        email,
        password: hashedPassword
    });

    return toPublicUser(user);
};

const login = async ({ username, password }) => {

    const user = await userRepository.findByUsername(username);

    if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const passwordMatch =
        await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user);

    return {
        token,
        user: toPublicUser(user)
    };
};

const getProfile = async (userId) => {

    const user = await userRepository.findById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return toPublicUser(user);
};

const updateProfile = async ({ userId, fullname, email }) => {

    const user = await userRepository.findById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const updates = {};

    if (fullname !== undefined) {
        const trimmed = fullname === null
            ? null
            : String(fullname).trim();

        updates.fullname = trimmed && trimmed.length > 0
            ? trimmed
            : null;
    }

    if (email !== undefined) {
        const normalizedEmail = String(email).trim().toLowerCase();

        if (!normalizedEmail) {
            const error = new Error('Email is required');
            error.statusCode = 400;
            throw error;
        }

        if (normalizedEmail !== user.email) {

            const existing =
                await userRepository.findByEmail(normalizedEmail);

            if (existing && String(existing.id) !== String(user.id)) {
                const error = new Error('Email already in use');
                error.statusCode = 409;
                throw error;
            }

            updates.email = normalizedEmail;
        }
    }

    if (Object.keys(updates).length > 0) {
        await userRepository.updateById(user.id, updates);
    }

    const refreshed = await userRepository.findById(user.id);

    return toPublicUser(refreshed);
};

const changePassword = async ({
    userId,
    currentPassword,
    newPassword
}) => {

    if (!currentPassword || !newPassword) {
        const error = new Error(
            'currentPassword and newPassword are required'
        );
        error.statusCode = 400;
        throw error;
    }

    if (newPassword.length < 8) {
        const error = new Error(
            'New password must be at least 8 characters long'
        );
        error.statusCode = 400;
        throw error;
    }

    if (currentPassword === newPassword) {
        const error = new Error(
            'New password must differ from the current password'
        );
        error.statusCode = 400;
        throw error;
    }

    const user = await userRepository.findById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const passwordMatch =
        await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
        const error = new Error('Current password is incorrect');
        error.statusCode = 401;
        throw error;
    }

    const hashedPassword =
        await bcrypt.hash(newPassword, SALT_ROUNDS);

    await userRepository.updateById(user.id, {
        password: hashedPassword
    });

    return toPublicUser(user);
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
};
