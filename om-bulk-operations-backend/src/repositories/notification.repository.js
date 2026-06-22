const { Notification } = require('../models');

const create = (data) => {
    return Notification.create(data);
};

const findAllByUserId = (userId, { limit = 50 } = {}) => {
    return Notification.findAll({
        where: { user_id: userId },
        order: [['createdAt', 'DESC']],
        limit
    });
};

const countUnreadByUserId = (userId) => {
    return Notification.count({
        where: {
            user_id: userId,
            is_read: false
        }
    });
};

const markAsReadById = async (id, userId) => {

    const [affected] = await Notification.update(
        { is_read: true },
        {
            where: {
                id,
                user_id: userId
            }
        }
    );

    return affected;
};

const markAllAsReadByUserId = async (userId) => {

    const [affected] = await Notification.update(
        { is_read: true },
        {
            where: {
                user_id: userId,
                is_read: false
            }
        }
    );

    return affected;
};

module.exports = {
    create,
    findAllByUserId,
    countUnreadByUserId,
    markAsReadById,
    markAllAsReadByUserId
};
