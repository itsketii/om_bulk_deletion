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

const listPendingValidation = async (req, res, next) => {

    try {

        const uploads = await uploadService.listPendingValidation();

        return res.status(200).json({
            success: true,
            data: uploads
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const downloadOriginal = async (req, res, next) => {

    try {

        const { absolutePath, filename } =
            await uploadService.getOriginalFileForDownload({
                uploadId: req.params.id,
                userId: req.user.id,
                role: req.user.role
            });

        return res.download(absolutePath, filename, (err) => {
            if (err && !res.headersSent) {
                return next(err);
            }
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const validateUpload = async (req, res, next) => {

    try {

        const upload = await uploadService.validateUpload({
            uploadId: req.params.id,
            validatorId: req.user.id,
            role: req.user.role,
            comment: req.body && req.body.comment
        });

        return res.status(200).json({
            success: true,
            message: 'Upload validated',
            data: upload
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const rejectUpload = async (req, res, next) => {

    try {

        const upload = await uploadService.rejectUpload({
            uploadId: req.params.id,
            validatorId: req.user.id,
            role: req.user.role,
            comment: req.body && req.body.comment
        });

        return res.status(200).json({
            success: true,
            message: 'Upload rejected',
            data: upload
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

module.exports = {
    uploadFile,
    listUploads,
    listPendingValidation,
    getUpload,
    downloadOriginal,
    validateUpload,
    rejectUpload
};
