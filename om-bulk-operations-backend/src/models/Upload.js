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
    }

}, {
    tableName: 'uploads',
    timestamps: true,
    underscored: true
});

module.exports = Upload;