const { GeneratedFile, Upload } = require('../models');

const create = (data) => {
    return GeneratedFile.create(data);
};

const findById = (id) => {
    return GeneratedFile.findByPk(id);
};

const findByIdWithUpload = (id) => {
    return GeneratedFile.findByPk(id, {
        include: [{ model: Upload }]
    });
};

module.exports = {
    create,
    findById,
    findByIdWithUpload
};
