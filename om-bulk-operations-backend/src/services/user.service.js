const bcrypt = require('bcryptjs');

const userRepository = require(
    '../repositories/user.repository'
);

const { ALL_ROLES, USER_ROLES } = require('../constants/roles');

const SALT_ROUNDS = 10;

const ALLOWED_ROLES = ALL_ROLES;

const toPublicUser = (user) => {
    return {
        id: user.id,
        username: user.username,
        fullname: user.fullname || null,
        email: user.email,
        role: user.role,
        createdAt: user.created_at || user.createdAt,
        updatedAt: user.updated_at || user.updatedAt
    };
};

const listUsers = async () => {

    const users = await userRepository.findAll();

    return users.map(toPublicUser);
};

const createUser = async ({ username, fullname, email, password, role }) => {

    if (!username || !email || !password) {
        const error = new Error(
            'username, email and password are required'
        );
        error.statusCode = 400;
        throw error;
    }

    const normalizedRole =
        role && ALLOWED_ROLES.includes(role) ? role : USER_ROLES.USER;

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
        password: hashedPassword,
        role: normalizedRole
    });

    return toPublicUser(user);
};

const resetPassword = async ({ userId, newPassword }) => {

    if (!newPassword || newPassword.length < 8) {
        const error = new Error(
            'New password must be at least 8 characters long'
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

    const hashedPassword =
        await bcrypt.hash(newPassword, SALT_ROUNDS);

    await userRepository.updateById(user.id, {
        password: hashedPassword
    });

    return toPublicUser(user);
};

module.exports = {
    listUsers,
    createUser,
    resetPassword
};
