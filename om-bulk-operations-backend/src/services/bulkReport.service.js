const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const readline = require('readline');

const SUCCESS_TOKEN = 'SUCCESS';

const buildReportPaths = (logFilePath) => {

    const dir = path.dirname(logFilePath);
    const base = path.basename(logFilePath).replace(/\.log$/i, '');

    return {
        successFile: path.join(dir, `${base}.success.csv`),
        failedFile: path.join(dir, `${base}.failed.csv`)
    };
};

const generateReportsFromLog = async (logFilePath) => {

    await fsp.access(logFilePath, fs.constants.R_OK);

    const { successFile, failedFile } = buildReportPaths(logFilePath);

    const successStream = fs.createWriteStream(successFile, { flags: 'w' });
    const failedStream = fs.createWriteStream(failedFile, { flags: 'w' });

    let successCount = 0;
    let failedCount = 0;

    try {

        const input = fs.createReadStream(logFilePath, { encoding: 'utf8' });

        const rl = readline.createInterface({
            input,
            crlfDelay: Infinity
        });

        for await (const rawLine of rl) {

            const line = rawLine.replace(/\r$/, '').trim();

            if (line.length === 0) {
                continue;
            }

            if (line.includes(SUCCESS_TOKEN)) {
                successStream.write(line + '\n');
                successCount += 1;
            } else {
                failedStream.write(line + '\n');
                failedCount += 1;
            }
        }

    } finally {

        await new Promise((resolve) => successStream.end(resolve));
        await new Promise((resolve) => failedStream.end(resolve));
    }

    return {
        successFile,
        failedFile,
        successCount,
        failedCount
    };
};

module.exports = {
    buildReportPaths,
    generateReportsFromLog
};
