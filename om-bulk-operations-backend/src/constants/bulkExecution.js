const BULK_STATUS = {
    PENDING: 'PENDING',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
};

const BULK_CURRENCIES = {
    CDF: 'CDF',
    USD: 'USD'
};

const BULK_DIRECTORIES = {
    CDF: process.env.BULK_CDF_DIR || '/bulk_master/bukl-master-CDF',
    USD: process.env.BULK_USD_DIR || '/bulk_master/bukl-master-USD'
};

const BULK_BINARY = process.env.BULK_BINARY || './bulk';

const INACTIVITY_THRESHOLD_MS = Number(
    process.env.BULK_INACTIVITY_THRESHOLD_MS || 10 * 60 * 1000
);

const MONITOR_INTERVAL_MS = Number(
    process.env.BULK_MONITOR_INTERVAL_MS || 60 * 1000
);

const LOG_TAIL_BYTES = Number(
    process.env.BULK_LOG_TAIL_BYTES || 64 * 1024
);

module.exports = {
    BULK_STATUS,
    BULK_CURRENCIES,
    BULK_DIRECTORIES,
    BULK_BINARY,
    INACTIVITY_THRESHOLD_MS,
    MONITOR_INTERVAL_MS,
    LOG_TAIL_BYTES
};
