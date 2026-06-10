const bulkService = require('../services/bulk.service');

const handleServiceError = (error, res, next) => {

    if (error.statusCode) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    return next(error);
};

const executeBulk = async (req, res, next) => {

    try {

        const result = await bulkService.executeBulk({
            uploadId: req.params.uploadId,
            userId: req.user.id
        });

        const hasErrors = result.errors.length > 0;
        const hasSuccess = result.executions.length > 0;

        const statusCode = hasErrors && !hasSuccess ? 500 : 201;

        return res.status(statusCode).json({
            success: !hasErrors || hasSuccess,
            message: hasErrors
                ? 'Bulk execution partially launched'
                : 'Bulk execution launched',
            data: result
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const listExecutions = async (req, res, next) => {

    try {

        const executions = await bulkService.listExecutions();

        return res.status(200).json({
            success: true,
            data: executions
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const listExecutionsByUpload = async (req, res, next) => {

    try {

        const executions = await bulkService.listExecutionsByUpload({
            uploadId: req.params.uploadId,
            userId: req.user.id,
            role: req.user.role
        });

        return res.status(200).json({
            success: true,
            data: executions
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const getExecution = async (req, res, next) => {

    try {

        const execution = await bulkService.getExecution({
            id: req.params.id,
            userId: req.user.id,
            role: req.user.role
        });

        return res.status(200).json({
            success: true,
            data: execution
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const getExecutionStatus = async (req, res, next) => {

    try {

        const status = await bulkService.getExecutionStatus({
            id: req.params.id,
            userId: req.user.id,
            role: req.user.role
        });

        return res.status(200).json({
            success: true,
            data: status
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const getExecutionLog = async (req, res, next) => {

    try {

        const log = await bulkService.getExecutionLog({
            id: req.params.id,
            userId: req.user.id,
            role: req.user.role
        });

        return res.status(200).json({
            success: true,
            data: log
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const downloadExecutionReport = async (req, res, next) => {

    try {

        const { absolutePath, filename } =
            await bulkService.getExecutionReport({
                id: req.params.id,
                userId: req.user.id,
                role: req.user.role,
                kind: req.params.kind
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

module.exports = {
    executeBulk,
    listExecutions,
    listExecutionsByUpload,
    getExecution,
    getExecutionStatus,
    getExecutionLog,
    downloadExecutionReport
};
