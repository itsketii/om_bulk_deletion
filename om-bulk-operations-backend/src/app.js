const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const uploadRoutes = require('./routes/upload.routes');
const fileRoutes = require('./routes/file.routes');
const userRoutes = require('./routes/user.routes');
const bulkRoutes = require('./routes/bulk.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.get('/health', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'OM Bulk Deletion API is running'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((err, req, res, next) => {
    console.error(err);

    return res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;