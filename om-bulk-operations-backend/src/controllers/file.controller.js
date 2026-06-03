const fileService = require('../services/file.service');

const downloadFile = async (req, res, next) => {

    try {

        const fileId = req.params.id;

        const { absolutePath, filename } =
            await fileService.getDownloadableFile({
                fileId,
                userId: req.user.id,
                role: req.user.role
            });

        return res.download(absolutePath, filename, (err) => {
            if (err && !res.headersSent) {
                return next(err);
            }
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

module.exports = {
    downloadFile
};
