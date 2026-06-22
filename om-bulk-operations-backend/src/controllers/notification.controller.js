const notificationService = require('../services/notification.service');

const handleServiceError = (error, res, next) => {

    if (error.statusCode) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    return next(error);
};

const list = async (req, res, next) => {

    try {

        const notifications =
            await notificationService.listForUser(req.user.id);

        const unreadCount =
            await notificationService.getUnreadCount(req.user.id);

        return res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount
            }
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const unreadCount = async (req, res, next) => {

    try {

        const count =
            await notificationService.getUnreadCount(req.user.id);

        return res.status(200).json({
            success: true,
            data: { unreadCount: count }
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const markAsRead = async (req, res, next) => {

    try {

        const result = await notificationService.markAsRead({
            notificationId: req.params.id,
            userId: req.user.id
        });

        return res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: result
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

const markAllAsRead = async (req, res, next) => {

    try {

        const result =
            await notificationService.markAllAsRead(req.user.id);

        return res.status(200).json({
            success: true,
            message: 'Notifications marked as read',
            data: result
        });

    } catch (error) {
        return handleServiceError(error, res, next);
    }
};

module.exports = {
    list,
    unreadCount,
    markAsRead,
    markAllAsRead
};
