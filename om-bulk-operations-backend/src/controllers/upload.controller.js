const uploadService = require('../services/upload.service');

const uploadFile = async (req, res, next) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File is required'
            });
        }

        const result = await uploadService.processUpload({
            file: req.file,
            userId: req.user.id
        });

        return res.status(201).json({
            success: true,
            message: 'File processed',
            data: result
        });

    } catch (error) {

        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }

        return next(error);
    }
};

const handleServiceError = (error, res, next) => {

    if (error.statusCode) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    return next(error);
};

const listUploads = async (req, res, next) => {

    try {

        const uploads = await uploadService.listUploads({
            userId: req.user.id,
            role: req.user.role
        });

        return res.status(200).json({
            success: true,
            data: uploads
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const getUpload = async (req, res, next) => {

    try {

        const upload = await uploadService.getUpload({
            uploadId: req.params.id,
            userId: req.user.id,
            role: req.user.role
        });

        return res.status(200).json({
            success: true,
            data: upload
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

module.exports = {
    uploadFile,
    listUploads,
    getUpload
};
