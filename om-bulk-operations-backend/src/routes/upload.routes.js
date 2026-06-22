const express = require('express');

const router = express.Router();

const upload =
    require('../config/multer');

const authMiddleware =
    require('../middlewares/auth.middleware');

const { requireRole } =
    require('../middlewares/role.middleware');

const { VALIDATION_ROLES } = require('../constants/roles');

const uploadController =
    require('../controllers/upload.controller');

router.use(authMiddleware);

router.post(
    '/',
    upload.single('file'),
    uploadController.uploadFile
);

router.get(
    '/',
    uploadController.listUploads
);

router.get(
    '/pending-validation',
    requireRole(...VALIDATION_ROLES),
    uploadController.listPendingValidation
);

router.get(
    '/:id',
    uploadController.getUpload
);

router.get(
    '/:id/download-original',
    uploadController.downloadOriginal
);

router.post(
    '/:id/validate',
    requireRole(...VALIDATION_ROLES),
    uploadController.validateUpload
);

router.post(
    '/:id/reject',
    requireRole(...VALIDATION_ROLES),
    uploadController.rejectUpload
);

module.exports = router;