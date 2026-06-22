const express = require('express');

const router = express.Router();

const authMiddleware =
    require('../middlewares/auth.middleware');

const { requireRole } =
    require('../middlewares/role.middleware');

const { BULK_EXECUTION_ROLES, PRIVILEGED_READ_ROLES } =
    require('../constants/roles');

const bulkController =
    require('../controllers/bulk.controller');

router.use(authMiddleware);

router.post(
    '/:uploadId/execute',
    requireRole(...BULK_EXECUTION_ROLES),
    bulkController.executeBulk
);

router.get(
    '/',
    requireRole(...PRIVILEGED_READ_ROLES),
    bulkController.listExecutions
);

router.get(
    '/by-upload/:uploadId',
    bulkController.listExecutionsByUpload
);

router.get(
    '/:id',
    bulkController.getExecution
);

router.get(
    '/:id/status',
    bulkController.getExecutionStatus
);

router.get(
    '/:id/log',
    bulkController.getExecutionLog
);

router.get(
    '/:id/download/:kind',
    bulkController.downloadExecutionReport
);

module.exports = router;
