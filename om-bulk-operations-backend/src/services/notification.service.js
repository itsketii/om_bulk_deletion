const notificationRepository = require(
    '../repositories/notification.repository'
);

const NOTIFICATION_TYPES = {
    UPLOAD_VALIDATED: 'UPLOAD_VALIDATED',
    UPLOAD_REJECTED: 'UPLOAD_REJECTED'
};

const toSummary = (notification) => {
    return {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message || null,
        uploadId: notification.upload_id || null,
        isRead: Boolean(notification.is_read),
        createdAt: notification.createdAt
    };
};

const createNotification = async ({
    userId,
    type,
    title,
    message,
    uploadId
}) => {

    if (!userId) {
        return null;
    }

    const notification = await notificationRepository.create({
        user_id: userId,
        type,
        title,
        message: message || null,
        upload_id: uploadId || null
    });

    return toSummary(notification);
};

const listForUser = async (userId, options = {}) => {

    const notifications =
        await notificationRepository.findAllByUserId(userId, options);

    return notifications.map(toSummary);
};

const getUnreadCount = (userId) => {
    return notificationRepository.countUnreadByUserId(userId);
};

const markAsRead = async ({ notificationId, userId }) => {

    const affected =
        await notificationRepository.markAsReadById(notificationId, userId);

    if (!affected) {
        const error = new Error('Notification not found');
        error.statusCode = 404;
        throw error;
    }

    return { id: notificationId };
};

const markAllAsRead = async (userId) => {

    const affected =
        await notificationRepository.markAllAsReadByUserId(userId);

    return { updated: affected };
};

module.exports = {
    NOTIFICATION_TYPES,
    createNotification,
    listForUser,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
