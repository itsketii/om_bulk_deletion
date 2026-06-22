const User = require('./User');
const Upload = require('./Upload');
const GeneratedFile = require('./GeneratedFiles');
const BulkExecution = require('./BulkExecution');
const Notification = require('./Notification');

User.hasMany(Upload, {
    foreignKey: 'user_id'
});

Upload.belongsTo(User, {
    foreignKey: 'user_id'
});

Upload.hasMany(GeneratedFile, {
    foreignKey: 'upload_id'
});

GeneratedFile.belongsTo(Upload, {
    foreignKey: 'upload_id'
});

Upload.hasMany(BulkExecution, {
    foreignKey: 'upload_id'
});

BulkExecution.belongsTo(Upload, {
    foreignKey: 'upload_id'
});

User.hasMany(BulkExecution, {
    foreignKey: 'triggered_by'
});

BulkExecution.belongsTo(User, {
    foreignKey: 'triggered_by',
    as: 'triggeredBy'
});

Upload.belongsTo(User, {
    foreignKey: 'validated_by',
    as: 'validatedBy'
});

User.hasMany(Notification, {
    foreignKey: 'user_id'
});

Notification.belongsTo(User, {
    foreignKey: 'user_id'
});

Upload.hasMany(Notification, {
    foreignKey: 'upload_id'
});

Notification.belongsTo(Upload, {
    foreignKey: 'upload_id'
});

module.exports = {
    User,
    Upload,
    GeneratedFile,
    BulkExecution,
    Notification
};