const fs = require('fs');
const { once } = require('events');

const LINE_SEPARATOR = '\n';

const createTxtWriter = (filePath) => {

    const stream = fs.createWriteStream(filePath, {
        encoding: 'utf8'
    });

    const write = async (line) => {

        const ok = stream.write(line + LINE_SEPARATOR);

        if (!ok) {
            await once(stream, 'drain');
        }
    };

    const close = async () => {

        await new Promise((resolve, reject) => {
            stream.end((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    return {
        write,
        close
    };
};

module.exports = {
    createTxtWriter
};
