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

const bulkReportService = require('./bulkReport.service');

const {
    BULK_STATUS,
    BULK_CURRENCIES,
    BULK_DIRECTORIES,
    BULK_BINARY,
    INACTIVITY_THRESHOLD_MS,
    LOG_TAIL_BYTES
} = require('../constants/bulkExecution');

const {
    PRIVILEGED_READ_ROLES,
    VALIDATION_STATUS
} = require('../constants/roles');

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

const BLOCKING_EXECUTION_STATUSES = [
    BULK_STATUS.PENDING,
    BULK_STATUS.RUNNING,
    BULK_STATUS.COMPLETED
];

const assertOwnership = ({ upload, userId, role }) => {

    if (PRIVILEGED_READ_ROLES.includes(role)) {
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

    if (upload.validation_status !== VALIDATION_STATUS.VALIDATED) {
        const error = new Error(
            'Upload must be validated before a bulk run can be triggered'
        );
        error.statusCode = 409;
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
        successFile: execution.success_file || null,
        failedFile: execution.failed_file || null,
        successCount: execution.success_count == null
            ? null
            : Number(execution.success_count),
        failedCount: execution.failed_count == null
            ? null
            : Number(execution.failed_count),
        hasSuccessReport: Boolean(execution.success_file),
        hasFailedReport: Boolean(execution.failed_file),
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

const generateExecutionReports = async (execution) => {

    try {
        const result = await bulkReportService.generateReportsFromLog(
            execution.log_file
        );

        await bulkExecutionRepository.updateById(execution.id, {
            success_file: result.successFile,
            failed_file: result.failedFile,
            success_count: result.successCount,
            failed_count: result.failedCount
        });

        return result;
    } catch (err) {
        console.error(
            `[bulk-monitor] failed to generate reports for execution ${execution.id}`,
            err
        );
        return null;
    }
};

const REPORT_KINDS = {
    success: 'success',
    failed: 'failed'
};

const getExecutionReport = async ({ id, userId, role, kind }) => {

    if (!REPORT_KINDS[kind]) {
        const error = new Error('Invalid report kind');
        error.statusCode = 400;
        throw error;
    }

    const execution = await loadExecutionWithOwnership({ id, userId, role });

    if (execution.status !== BULK_STATUS.COMPLETED) {
        const error = new Error(
            'Reports are only available after the bulk execution is COMPLETED'
        );
        error.statusCode = 409;
        throw error;
    }

    let filePath = kind === REPORT_KINDS.success
        ? execution.success_file
        : execution.failed_file;

    if (!filePath) {
        const result = await generateExecutionReports(execution);

        if (!result) {
            const error = new Error('Report not available');
            error.statusCode = 404;
            throw error;
        }

        filePath = kind === REPORT_KINDS.success
            ? result.successFile
            : result.failedFile;
    }

    const absolutePath = path.resolve(filePath);

    try {
        await fsp.access(absolutePath, fs.constants.R_OK);
    } catch {
        const error = new Error('Report file no longer available');
        error.statusCode = 410;
        throw error;
    }

    const base = path.basename(execution.log_file).replace(/\.log$/i, '');
    const filename = `${base}.${kind}.csv`;

    return { absolutePath, filename };
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

                await generateExecutionReports(execution);

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
    getExecutionReport,
    updateRunningStatuses,
    toExecutionSummary
};
