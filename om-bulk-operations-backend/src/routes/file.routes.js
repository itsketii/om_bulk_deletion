const express = require('express');

const router = express.Router();

const authMiddleware = require(
    '../middlewares/auth.middleware'
);

const fileController = require(
    '../controllers/file.controller'
);

router.get(
    '/:id/download',
    authMiddleware,
    fileController.downloadFile
);

module.exports = router;