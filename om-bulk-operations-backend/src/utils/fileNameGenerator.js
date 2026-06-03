const {
    FILE_PREFIXES,
    FILE_EXTENSION
} = require('../constants/fileTypes');

const generateFileName = (fileType, dateString) => {

    const prefix = FILE_PREFIXES[fileType];

    if (!prefix) {
        throw new Error(
            `Unknown file type: ${fileType}`
        );
    }

    return `${prefix}${dateString}${FILE_EXTENSION}`;
};

module.exports = {
    generateFileName
};
