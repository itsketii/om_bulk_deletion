const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || 'storage/uploads';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {

        const timestamp = Date.now();

        const extension = path.extname(file.originalname);

        cb(
            null,
            `upload_${timestamp}${extension}`
        );
    }
});

const fileFilter = (req, file, cb) => {

    const allowedExtensions = [
        '.xlsx',
        '.xls'
    ];

    const extension = path.extname(
        file.originalname
    ).toLowerCase();

    if (!allowedExtensions.includes(extension)) {

        return cb(
            new Error(
                'Only Excel files (.xlsx, .xls) are allowed'
            ),
            false
        );
    }

    cb(null, true);
};

const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 500 * 1024 * 1024 // 500 MB
    }

});

module.exports = upload;