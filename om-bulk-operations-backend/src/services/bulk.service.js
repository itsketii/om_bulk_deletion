const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');

const uploadRepository = require(
    '../repositories/upload.repository'
);

const bulkExecutionRepository = require(
    '../repositories/bulkExecution.repository'
);

const {
    BULK_STATUS,
    BULK_CURRENCIES,
    BULK_DIRECTORIES,
    BULK_BINARY,
    INACTIVITY_THRESHOLD_MS,
    LOG_TAIL_BYTES
} = require('../constants/bulkExecution');

const { FILE_TYPES } = require('../constants/fileTypes');

const ensureDir = async (dirPath) => {
    await fsp.mkdir(dirPath, { recursive: true });
};

const copyFile = async (src, dest) => {

    const absSrc = path.resolve(src);

    try {
        await fsp.access(absSrc, fs.constants.R_OK);
    } catch (err) {
        const error = new Error(
            `Source file not readable: ${absSrc}`
        );
        error.statusCode = 404;
        throw error;
    }

    await fsp.copyFile(absSrc, dest);
};

const buildLogFileName = (inputFileName) => {
    const base = inputFileName.replace(/\.txt$/i, '');
    return `${base}.log`;
};

const spawnBulkProcess = async ({ workingDir, inputFile, logFile }) => {

    const logFd = await fsp.open(logFile, 'a');

    const child = spawn(
        BULK_BINARY,
        ['--input', inputFile],
        {
            cwd: workingDir,
            detached: true,
            stdio: ['ignore', logFd.fd, logFd.fd]
        }
    );

    child.on('error', (err) => {
        console.error('[bulk] spawn error', err);
    });

    child.unref();

    await logFd.close();

    return child.pid;
};

const runForCurrency = async ({ upload, currency, file, triggeredBy }) => {

    const targetDir = BULK_DIRECTORIES[currency];

    await ensureDir(targetDir);

    const destInput = path.join(targetDir, file.filename);
    const logFileName = buildLogFileName(file.filename);
    const logFilePath = path.join(targetDir, logFileName);

    const execution = await bulkExecutionRepository.create({
        upload_id: upload.id,
        triggered_by: triggeredBy,
        currency,
        input_file: destInput,
        log_file: logFilePath,
        status: BULK_STATUS.PENDING
    });

    try {

        await copyFile(file.file_path, destInput);

        const pid = await spawnBulkProcess({
            workingDir: targetDir,
            inputFile: file.filename,
            logFile: logFilePath
        });

        const now = new Date();

        await bulkExecutionRepository.updateById(execution.id, {
            status: BULK_STATUS.RUNNING,
            pid: pid || null,
            started_at: now,
            last_log_update: now
        });

        const refreshed =
            await bulkExecutionRepository.findById(execution.id);

        return refreshed || { ...execution.get({ plain: true }),
            status: BULK_STATUS.RUNNING,
            pid: pid || null,
            started_at: now,
            last_log_update: now };

    } catch (error) {

        await bulkExecutionRepository.updateById(execution.id, {
            status: BULK_STATUS.FAILED,
            error_message: error.message,
            completed_at: new Date()
        });

        throw error;
    }
};

const ADMIN_ROLE = 'ADMIN';

const BLOCKING_EXECUTION_STATUSES = [
    BULK_STATUS.PENDING,
    BULK_STATUS.RUNNING,
    BULK_STATUS.COMPLETED
];

const assertOwnership = ({ upload, userId, role }) => {

    if (role === ADMIN_ROLE) {
        return;
    }

    if (String(upload.user_id) !== String(userId)) {
        const error = new Error('Forbidden');
        error.statusCode = 403;
        throw error;
    }
};

const executeBulk = async ({ uploadId, userId }) => {

    const upload =
        await uploadRepository.findByIdWithFiles(uploadId);

    if (!upload) {
        const error = new Error('Upload not found');
        error.statusCode = 404;
        throw error;
    }

    if (upload.status !== 'COMPLETED') {
        const error = new Error(
            'Upload is not in COMPLETED state'
        );
        error.statusCode = 400;
        throw error;
    }

    const existing =
        await bulkExecutionRepository.findAllByUploadId(uploadId);

    const blocking = existing.filter(
        (e) => BLOCKING_EXECUTION_STATUSES.includes(e.status)
    );

    if (blocking.length > 0) {
        const error = new Error(
            'A bulk execution already exists for this upload'
        );
        error.statusCode = 409;
        throw error;
    }

    const files = upload.GeneratedFiles || [];

    const cdfFile = files.find(
        (f) => f.file_type === FILE_TYPES.CDF
    );

    const usdFile = files.find(
        (f) => f.file_type === FILE_TYPES.USD
    );

    if (!cdfFile || !usdFile) {
        const error = new Error(
            'Both CDF and USD generated files are required'
        );
        error.statusCode = 409;
        throw error;
    }

    const results = [];

    const errors = [];

    for (const [currency, file] of [
        [BULK_CURRENCIES.CDF, cdfFile],
        [BULK_CURRENCIES.USD, usdFile]
    ]) {

        try {
            const exec = await runForCurrency({
                upload,
                currency,
                file,
                triggeredBy: userId
            });
            results.push(exec);
        } catch (err) {
            errors.push({ currency, message: err.message });
        }
    }

    return { executions: results, errors };
};

const toTriggeredBySummary = (user) => {

    if (!user) {
        return null;
    }

    return {
        id: user.id,
        username: user.username,
        fullname: user.fullname || null,
        role: user.role
    };
};

const toExecutionSummary = (execution) => {
    return {
        id: execution.id,
        uploadId: execution.upload_id,
        currency: execution.currency,
        inputFile: execution.input_file,
        logFile: execution.log_file,
        status: execution.status,
        pid: execution.pid,
        errorMessage: execution.error_message,
        triggeredById: execution.triggered_by,
        triggeredBy: toTriggeredBySummary(execution.triggeredBy),
        startedAt: execution.started_at,
        completedAt: execution.completed_at,
        lastLogUpdate: execution.last_log_update,
        createdAt: execution.createdAt,
        updatedAt: execution.updatedAt
    };
};

const listExecutions = async () => {

    const executions = await bulkExecutionRepository.findAll();

    return executions.map(toExecutionSummary);
};

const listExecutionsByUpload = async ({ uploadId, userId, role }) => {

    const upload = await uploadRepository.findById(uploadId);

    if (!upload) {
        const error = new Error('Upload not found');
        error.statusCode = 404;
        throw error;
    }

    assertOwnership({ upload, userId, role });

    const executions =
        await bulkExecutionRepository.findAllByUploadId(uploadId);

    return executions.map(toExecutionSummary);
};

const loadExecutionWithOwnership = async ({ id, userId, role }) => {

    const execution = await bulkExecutionRepository.findById(id);

    if (!execution) {
        const error = new Error('Bulk execution not found');
        error.statusCode = 404;
        throw error;
    }

    if (execution.Upload) {
        assertOwnership({ upload: execution.Upload, userId, role });
    }

    return execution;
};

const getExecution = async ({ id, userId, role }) => {

    const execution = await loadExecutionWithOwnership({ id, userId, role });

    return toExecutionSummary(execution);
};

const getExecutionStatus = async ({ id, userId, role }) => {

    const execution = await loadExecutionWithOwnership({ id, userId, role });

    return {
        id: execution.id,
        status: execution.status,
        startedAt: execution.started_at,
        completedAt: execution.completed_at,
        lastLogUpdate: execution.last_log_update
    };
};

const readLogTail = async (logFilePath, maxBytes) => {

    try {
        const stats = await fsp.stat(logFilePath);

        const fileHandle = await fsp.open(logFilePath, 'r');

        try {
            const size = stats.size;
            const start = size > maxBytes ? size - maxBytes : 0;
            const length = size - start;
            const buffer = Buffer.alloc(length);

            await fileHandle.read(buffer, 0, length, start);

            return {
                content: buffer.toString('utf8'),
                size,
                truncated: start > 0,
                modifiedAt: stats.mtime
            };
        } finally {
            await fileHandle.close();
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            return {
                content: '',
                size: 0,
                truncated: false,
                modifiedAt: null
            };
        }
        throw err;
    }
};

const getExecutionLog = async ({ id, userId, role }) => {

    const execution = await loadExecutionWithOwnership({ id, userId, role });

    const tail = await readLogTail(execution.log_file, LOG_TAIL_BYTES);

    return {
        id: execution.id,
        status: execution.status,
        logFile: execution.log_file,
        ...tail
    };
};

const updateRunningStatuses = async () => {

    const running = await bulkExecutionRepository.findByStatus(
        BULK_STATUS.RUNNING
    );

    const now = Date.now();
    const updated = [];

    for (const execution of running) {

        try {
            const stats = await fsp.stat(execution.log_file);
            const mtimeMs = stats.mtimeMs;
            const inactiveFor = now - mtimeMs;

            if (inactiveFor >= INACTIVITY_THRESHOLD_MS) {
                await bulkExecutionRepository.updateById(execution.id, {
                    status: BULK_STATUS.COMPLETED,
                    completed_at: new Date(),
                    last_log_update: new Date(mtimeMs)
                });
                updated.push({ id: execution.id, status: BULK_STATUS.COMPLETED });
            } else {
                await bulkExecutionRepository.updateById(execution.id, {
                    last_log_update: new Date(mtimeMs)
                });
            }
        } catch (err) {
            if (err.code === 'ENOENT') {
                continue;
            }
            console.error(
                `[bulk-monitor] error checking execution ${execution.id}`,
                err
            );
        }
    }

    return updated;
};

module.exports = {
    executeBulk,
    listExecutions,
    listExecutionsByUpload,
    getExecution,
    getExecutionStatus,
    getExecutionLog,
    updateRunningStatuses,
    toExecutionSummary
};
