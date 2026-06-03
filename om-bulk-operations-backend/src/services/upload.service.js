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
const { FILE_TYPES } = require('../constants/fileTypes');

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
        user_id: userId
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

const ADMIN_ROLE = 'ADMIN';

const toUploadSummary = (upload) => {
    return {
        id: upload.id,
        originalFilename: upload.original_filename,
        totalRecords: upload.total_records,
        status: upload.status,
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

const listUploads = async ({ userId, role }) => {

    const uploads = role === ADMIN_ROLE
        ? await uploadRepository.findAll()
        : await uploadRepository.findAllByUserId(userId);

    return uploads.map(toUploadSummary);
};

const getUpload = async ({ uploadId, userId, role }) => {

    const upload =
        await uploadRepository.findByIdWithFiles(uploadId);

    if (!upload) {
        const error = new Error('Upload not found');
        error.statusCode = 404;
        throw error;
    }

    const isOwner =
        String(upload.user_id) === String(userId);

    const isAdmin = role === ADMIN_ROLE;

    if (!isOwner && !isAdmin) {
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

module.exports = {
    processUpload,
    listUploads,
    getUpload
};
