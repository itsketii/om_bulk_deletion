const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BulkExecution = sequelize.define('BulkExecution', {

    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    upload_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },

    triggered_by: {
        type: DataTypes.BIGINT,
        allowNull: true
    },

    currency: {
        type: DataTypes.ENUM(
            'CDF',
            'USD'
        ),
        allowNull: false
    },

    input_file: {
        type: DataTypes.STRING(500),
        allowNull: false
    },

    log_file: {
        type: DataTypes.STRING(500),
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM(
            'PENDING',
            'RUNNING',
            'COMPLETED',
            'FAILED'
        ),
        defaultValue: 'PENDING'
    },

    pid: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    error_message: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    started_at: {
        type: DataTypes.DATE,
        allowNull: true
    },

    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },

    last_log_update: {
        type: DataTypes.DATE,
        allowNull: true
    }

}, {
    tableName: 'bulk_executions',
    timestamps: true,
    underscored: true
});

module.exports = BulkExecution;
