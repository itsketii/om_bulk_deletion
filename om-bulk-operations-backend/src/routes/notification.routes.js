const express = require('express');

const router = express.Router();

const authMiddleware =
    require('../middlewares/auth.middleware');

const notificationController =
    require('../controllers/notification.controller');

router.use(authMiddleware);

router.get(
    '/',
    notificationController.list
);

router.get(
    '/unread-count',
    notificationController.unreadCount
);

router.post(
    '/read-all',
    notificationController.markAllAsRead
);

router.post(
    '/:id/read',
    notificationController.markAsRead
);

module.exports = router;
