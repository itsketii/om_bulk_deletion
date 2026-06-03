const { BulkExecution, Upload, User } = require('../models');

const TRIGGERED_BY_INCLUDE = {
    model: User,
    as: 'triggeredBy',
    attributes: ['id', 'username', 'fullname', 'role']
};

const UPLOAD_INCLUDE = {
    model: Upload,
    attributes: ['id', 'user_id', 'original_filename', 'status']
};

const create = (data) => {
    return BulkExecution.create(data);
};

const findById = (id) => {
    return BulkExecution.findByPk(id, {
        include: [TRIGGERED_BY_INCLUDE, UPLOAD_INCLUDE]
    });
};

const findByIdWithUpload = (id) => {
    return BulkExecution.findByPk(id, {
        include: [{ model: Upload }, TRIGGERED_BY_INCLUDE]
    });
};

const findAll = () => {
    return BulkExecution.findAll({
        include: [TRIGGERED_BY_INCLUDE],
        order: [['createdAt', 'DESC']]
    });
};

const findAllByUploadId = (uploadId) => {
    return BulkExecution.findAll({
        where: { upload_id: uploadId },
        include: [TRIGGERED_BY_INCLUDE],
        order: [['createdAt', 'DESC']]
    });
};

const findByStatus = (status) => {
    return BulkExecution.findAll({
        where: { status }
    });
};

const updateById = async (id, data) => {

    const [affected] = await BulkExecution.update(data, {
        where: { id }
    });

    return affected;
};

module.exports = {
    create,
    findById,
    findByIdWithUpload,
    findAll,
    findAllByUploadId,
    findByStatus,
    updateById
};
