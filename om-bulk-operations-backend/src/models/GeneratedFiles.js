const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GeneratedFile = sequelize.define('GeneratedFile', {

    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    file_type: {
        type: DataTypes.ENUM(
            'CDF',
            'USD'
        ),
        allowNull: false
    },

    filename: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    file_path: {
        type: DataTypes.STRING(500),
        allowNull: false
    }

}, {
    tableName: 'generated_files',
    timestamps: true,
    underscored: true
});

module.exports = GeneratedFile;