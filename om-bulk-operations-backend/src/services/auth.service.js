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

module.exports = {
    register,
    login,
    getProfile
};
