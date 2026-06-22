const fs = require('fs');
const path = require('path');

const uploadRepository = require(
    '../repositories/upload.repository'
);

const generatedFileRepository = require(
    '../repositories/generatedFile.repository'
);

const { streamFirstColumn } = require('../utils/excelReader');
const { createTxtWriter } = require('../utils/txtWriter');
const { formatYYYYMMDD } = require('../utils/dateFormatter');
const { generateFileName } = require('../utils/fileNameGenerator');
const { formatMsisdn } = require('./formatter.service');
const notificationService = require('./notification.service');
const { FILE_TYPES } = require('../constants/fileTypes');
const {
    PRIVILEGED_READ_ROLES,
    VALIDATION_ROLES,
    VALIDATION_STATUS
} = require('../constants/roles');

const UPLOAD_DIR =
    process.env.UPLOAD_DIR || 'storage/uploads';

const GENERATED_DIR =
    process.env.GENERATED_DIR || 'storage/generated';

const ensureDir = (dirPath) => {

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const processUpload = async ({ file, userId }) => {

    const upload = await uploadRepository.create({
        original_filename: file.originalname,
        stored_filename: file.filename,
        status: 'PROCESSING',
        total_records: 0,
        user_id: userId,
        validation_status: VALIDATION_STATUS.PENDING_VALIDATION
    });

    const dateString = formatYYYYMMDD(new Date());

    const cdfName =
        generateFileName(FILE_TYPES.CDF, dateString);

    const usdName =
        generateFileName(FILE_TYPES.USD, dateString);

    const outputDir =
        path.join(GENERATED_DIR, String(upload.id));

    ensureDir(outputDir);

    const cdfPath = path.join(outputDir, cdfName);
    const usdPath = path.join(outputDir, usdName);

    const cdfWriter = createTxtWriter(cdfPath);
    const usdWriter = createTxtWriter(usdPath);

    let totalRecords = 0;

    try {

        for await (const cellValue of streamFirstColumn(file.path)) {

            const line = formatMsisdn(cellValue);

            if (!line) {
                continue;
            }

            await cdfWriter.write(line);
            await usdWriter.write(line);

            totalRecords++;
        }

        await cdfWriter.close();
        await usdWriter.close();

    } catch (error) {

        await cdfWriter.close().catch(() => {});
        await usdWriter.close().catch(() => {});

        await uploadRepository.updateById(upload.id, {
            status: 'FAILED'
        });

        throw error;
    }

    await uploadRepository.updateById(upload.id, {
        total_records: totalRecords,
        status: 'COMPLETED'
    });

    const cdfRecord = await generatedFileRepository.create({
        upload_id: upload.id,
        file_type: FILE_TYPES.CDF,
        filename: cdfName,
        file_path: cdfPath
    });

    const usdRecord = await generatedFileRepository.create({
        upload_id: upload.id,
        file_type: FILE_TYPES.USD,
        filename: usdName,
        file_path: usdPath
    });

    return {
        uploadId: upload.id,
        totalRecords,
        status: 'COMPLETED',
        files: [
            {
                id: cdfRecord.id,
                type: FILE_TYPES.CDF,
                filename: cdfName
            },
            {
                id: usdRecord.id,
                type: FILE_TYPES.USD,
                filename: usdName
            }
        ]
    };
};

const toUserSummary = (user) => {

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

const toUploadSummary = (upload) => {
    return {
        id: upload.id,
        originalFilename: upload.original_filename,
        totalRecords: upload.total_records,
        status: upload.status,
        validationStatus: upload.validation_status || null,
        validatedById: upload.validated_by || null,
        validatedBy: toUserSummary(upload.validatedBy),
        validatedAt: upload.validated_at || null,
        validationComment: upload.validation_comment || null,
        userId: upload.user_id || null,
        uploader: toUserSummary(upload.User),
        createdAt: upload.createdAt,
        updatedAt: upload.updatedAt
    };
};

const toFileSummary = (file) => {
    return {
        id: file.id,
        type: file.file_type,
        filename: file.filename
    };
};

const isPrivilegedRead = (role) => PRIVILEGED_READ_ROLES.includes(role);

const isValidator = (role) => VALIDATION_ROLES.includes(role);

const listUploads = async ({ userId, role }) => {

    const uploads = isPrivilegedRead(role)
        ? await uploadRepository.findAll()
        : await uploadRepository.findAllByUserId(userId);

    return uploads.map(toUploadSummary);
};

const listPendingValidation = async () => {

    const uploads = await uploadRepository.findAllByValidationStatus(
        VALIDATION_STATUS.PENDING_VALIDATION
    );

    return uploads.map(toUploadSummary);
};

const loadUploadOrThrow = async (uploadId) => {

    const upload = await uploadRepository.findByIdWithFiles(uploadId);

    if (!upload) {
        const error = new Error('Upload not found');
        error.statusCode = 404;
        throw error;
    }

    return upload;
};

const getUpload = async ({ uploadId, userId, role }) => {

    const upload = await loadUploadOrThrow(uploadId);

    const isOwner = String(upload.user_id) === String(userId);

    if (!isOwner && !isPrivilegedRead(role)) {
        const error = new Error('Forbidden');
        error.statusCode = 403;
        throw error;
    }

    const files = (upload.GeneratedFiles || []).map(toFileSummary);

    return {
        ...toUploadSummary(upload),
        files
    };
};

const getOriginalFileForDownload = async ({ uploadId, userId, role }) => {

    const upload = await loadUploadOrThrow(uploadId);

    const isOwner = String(upload.user_id) === String(userId);

    if (!isOwner && !isPrivilegedRead(role)) {
        const error = new Error('Forbidden');
        error.statusCode = 403;
        throw error;
    }

    const absolutePath = path.resolve(
        path.join(UPLOAD_DIR, upload.stored_filename)
    );

    if (!fs.existsSync(absolutePath)) {
        const error = new Error('Original file no longer available');
        error.statusCode = 410;
        throw error;
    }

    return {
        absolutePath,
        filename: upload.original_filename
    };
};

const assertValidatorRole = (role) => {

    if (!isValidator(role)) {
        const error = new Error('Forbidden');
        error.statusCode = 403;
        throw error;
    }
};

const setValidationDecision = async ({
    uploadId,
    validatorId,
    role,
    decision,
    comment
}) => {

    assertValidatorRole(role);

    const upload = await loadUploadOrThrow(uploadId);

    if (upload.validation_status !== VALIDATION_STATUS.PENDING_VALIDATION) {
        const error = new Error(
            `Upload is not pending validation (current: ${upload.validation_status})`
        );
        error.statusCode = 409;
        throw error;
    }

    const trimmedComment = comment ? String(comment).trim() : null;

    await uploadRepository.updateById(upload.id, {
        validation_status: decision,
        validated_by: validatorId,
        validated_at: new Date(),
        validation_comment: trimmedComment
    });

    const refreshed = await uploadRepository.findByIdWithFiles(upload.id);

    await notifyUploaderOfDecision({
        upload: refreshed,
        decision,
        comment: trimmedComment
    });

    return toUploadSummary(refreshed);
};

const notifyUploaderOfDecision = async ({ upload, decision, comment }) => {

    if (!upload || !upload.user_id) {
        return;
    }

    const isValidated = decision === VALIDATION_STATUS.VALIDATED;

    const type = isValidated
        ? notificationService.NOTIFICATION_TYPES.UPLOAD_VALIDATED
        : notificationService.NOTIFICATION_TYPES.UPLOAD_REJECTED;

    const title = isValidated
        ? `Upload validated: ${upload.original_filename}`
        : `Upload rejected: ${upload.original_filename}`;

    const message = isValidated
        ? (comment || 'Your upload has been validated and is ready for execution.')
        : (comment || 'Your upload was rejected by the validator.');

    try {
        await notificationService.createNotification({
            userId: upload.user_id,
            type,
            title,
            message,
            uploadId: upload.id
        });
    } catch (error) {
        console.error('Failed to create validation notification:', error);
    }
};

const validateUpload = ({ uploadId, validatorId, role, comment }) => {
    return setValidationDecision({
        uploadId,
        validatorId,
        role,
        decision: VALIDATION_STATUS.VALIDATED,
        comment
    });
};

const rejectUpload = ({ uploadId, validatorId, role, comment }) => {

    if (!comment || !String(comment).trim()) {
        const error = new Error('A comment is required when rejecting');
        error.statusCode = 400;
        throw error;
    }

    return setValidationDecision({
        uploadId,
        validatorId,
        role,
        decision: VALIDATION_STATUS.REJECTED,
        comment
    });
};

module.exports = {
    processUpload,
    listUploads,
    listPendingValidation,
    getUpload,
    getOriginalFileForDownload,
    validateUpload,
    rejectUpload
};
