require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/database');
const bulkMonitor = require('./jobs/bulkMonitor.scheduler');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        await sequelize.sync();

        bulkMonitor.start();

        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

        const shutdown = (signal) => {
            console.log(`Received ${signal}, shutting down...`);
            bulkMonitor.stop();
            server.close(() => process.exit(0));
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
}

startServer();