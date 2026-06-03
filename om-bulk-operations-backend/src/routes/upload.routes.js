const express = require('express');

const router = express.Router();

const upload =
    require('../config/multer');

const authMiddleware =
    require('../middlewares/auth.middleware');

const uploadController =
    require('../controllers/upload.controller');

router.post(
    '/',
    authMiddleware,
    upload.single('file'),
    uploadController.uploadFile
);

router.get(
    '/',
    authMiddleware,
    uploadController.listUploads
);

router.get(
    '/:id',
    authMiddleware,
    uploadController.getUpload
);

module.exports = router;