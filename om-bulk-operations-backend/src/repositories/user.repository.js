const { User } = require('../models');

const findByUsername = (username) => {
    return User.findOne({
        where: { username }
    });
};

const findByEmail = (email) => {
    return User.findOne({
        where: { email }
    });
};

const findById = (id) => {
    return User.findByPk(id);
};

const findAll = () => {
    return User.findAll({
        order: [['created_at', 'DESC']]
    });
};

const create = (data) => {
    return User.create(data);
};

const updateById = (id, data) => {
    return User.update(data, {
        where: { id }
    });
};

module.exports = {
    findByUsername,
    findByEmail,
    findById,
    findAll,
    create,
    updateById
};
