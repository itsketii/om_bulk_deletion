const { Upload, GeneratedFile, User } = require('../models');

const UPLOADER_INCLUDE = {
    model: User,
    attributes: ['id', 'username', 'fullname', 'role']
};

const VALIDATED_BY_INCLUDE = {
    model: User,
    as: 'validatedBy',
    attributes: ['id', 'username', 'fullname', 'role']
};

const create = (data) => {
    return Upload.create(data);
};

const findById = (id) => {
    return Upload.findByPk(id);
};

const findByIdWithFiles = (id) => {
    return Upload.findByPk(id, {
        include: [
            { model: GeneratedFile },
            UPLOADER_INCLUDE,
            VALIDATED_BY_INCLUDE
        ]
    });
};

const findAll = () => {
    return Upload.findAll({
        include: [UPLOADER_INCLUDE, VALIDATED_BY_INCLUDE],
        order: [['createdAt', 'DESC']]
    });
};

const findAllByUserId = (userId) => {
    return Upload.findAll({
        where: { user_id: userId },
        include: [UPLOADER_INCLUDE, VALIDATED_BY_INCLUDE],
        order: [['createdAt', 'DESC']]
    });
};

const findAllByValidationStatus = (validationStatus) => {
    return Upload.findAll({
        where: { validation_status: validationStatus },
        include: [UPLOADER_INCLUDE, VALIDATED_BY_INCLUDE],
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
    findAllByValidationStatus,
    updateById
};
