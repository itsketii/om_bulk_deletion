const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {

    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },

    fullname: {
        type: DataTypes.STRING(150),
        allowNull: true
    },

    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },

    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    role: {
        type: DataTypes.ENUM(
            'SUPERADMIN',
            'ADMIN',
            'VALIDATOR',
            'USER'
        ),
        defaultValue: 'USER'
    }

}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

module.exports = User;