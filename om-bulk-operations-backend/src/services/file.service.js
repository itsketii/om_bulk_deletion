const fs = require('fs');
const path = require('path');

const generatedFileRepository = require(
    '../repositories/generatedFile.repository'
);

const { PRIVILEGED_READ_ROLES } = require('../constants/roles');

const getDownloadableFile = async ({ fileId, userId, role }) => {

    const file =
        await generatedFileRepository.findByIdWithUpload(fileId);

    if (!file) {
        const error = new Error('File not found');
        error.statusCode = 404;
        throw error;
    }

    const upload = file.Upload;

    const isOwner =
        upload && String(upload.user_id) === String(userId);

    const isPrivileged = PRIVILEGED_READ_ROLES.includes(role);

    if (!isOwner && !isPrivileged) {
        const error = new Error('Forbidden');
        error.statusCode = 403;
        throw error;
    }

    const absolutePath = path.resolve(file.file_path);

    if (!fs.existsSync(absolutePath)) {
        const error = new Error('File no longer available');
        error.statusCode = 410;
        throw error;
    }

    return {
        absolutePath,
        filename: file.filename
    };
};

module.exports = {
    getDownloadableFile
};
