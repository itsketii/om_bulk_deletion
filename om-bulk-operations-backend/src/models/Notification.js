const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {

    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },

    type: {
        type: DataTypes.ENUM(
            'UPLOAD_VALIDATED',
            'UPLOAD_REJECTED'
        ),
        allowNull: false
    },

    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    upload_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },

    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }

}, {
    tableName: 'notifications',
    timestamps: true,
    underscored: true
});

module.exports = Notification;
