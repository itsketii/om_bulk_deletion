const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Upload = sequelize.define('Upload', {

    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    original_filename: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    stored_filename: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    total_records: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    status: {
        type: DataTypes.ENUM(
            'PENDING',
            'PROCESSING',
            'COMPLETED',
            'FAILED'
        ),
        defaultValue: 'PENDING'
    },

    validation_status: {
        type: DataTypes.ENUM(
            'PENDING_VALIDATION',
            'VALIDATED',
            'REJECTED'
        ),
        allowNull: true,
        defaultValue: 'PENDING_VALIDATION'
    },

    validated_by: {
        type: DataTypes.BIGINT,
        allowNull: true
    },

    validated_at: {
        type: DataTypes.DATE,
        allowNull: true
    },

    validation_comment: {
        type: DataTypes.TEXT,
        allowNull: true
    }

}, {
    tableName: 'uploads',
    timestamps: true,
    underscored: true
});

module.exports = Upload;