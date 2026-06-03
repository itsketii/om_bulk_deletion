const { Upload, GeneratedFile } = require('../models');

const create = (data) => {
    return Upload.create(data);
};

const findById = (id) => {
    return Upload.findByPk(id);
};

const findByIdWithFiles = (id) => {
    return Upload.findByPk(id, {
        include: [{ model: GeneratedFile }]
    });
};

const findAll = () => {
    return Upload.findAll({
        order: [['createdAt', 'DESC']]
    });
};

const findAllByUserId = (userId) => {
    return Upload.findAll({
        where: { user_id: userId },
        order: [['createdAt', 'DESC']]
    });
};

const updateById = async (id, data) => {

    const [affected] = await Upload.update(data, {
        where: { id }
    });

    return affected;
};

module.exports = {
    create,
    findById,
    findByIdWithFiles,
    findAll,
    findAllByUserId,
    updateById
};
