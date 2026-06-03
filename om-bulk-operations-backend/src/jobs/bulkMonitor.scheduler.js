const bulkService = require('../services/bulk.service');

const {
    MONITOR_INTERVAL_MS
} = require('../constants/bulkExecution');

let intervalHandle = null;
let isRunning = false;

const tick = async () => {

    if (isRunning) {
        return;
    }

    isRunning = true;

    try {
        const updated = await bulkService.updateRunningStatuses();

        if (updated.length > 0) {
            console.log(
                `[bulk-monitor] updated ${updated.length} execution(s)`
            );
        }
    } catch (err) {
        console.error('[bulk-monitor] tick failed', err);
    } finally {
        isRunning = false;
    }
};

const start = () => {

    if (intervalHandle) {
        return;
    }

    intervalHandle = setInterval(tick, MONITOR_INTERVAL_MS);

    if (typeof intervalHandle.unref === 'function') {
        intervalHandle.unref();
    }

    console.log(
        `[bulk-monitor] started (interval ${MONITOR_INTERVAL_MS}ms)`
    );

    setImmediate(tick);
};

const stop = () => {

    if (!intervalHandle) {
        return;
    }

    clearInterval(intervalHandle);
    intervalHandle = null;

    console.log('[bulk-monitor] stopped');
};

module.exports = {
    start,
    stop,
    tick
};
