const ExcelJS = require('exceljs');

const streamFirstColumn = async function* (filePath) {

    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
        return;
    }

    const rowCount = worksheet.actualRowCount || worksheet.rowCount;

    for (let i = 1; i <= rowCount; i++) {

        const row = worksheet.getRow(i);

        if (!row) {
            continue;
        }

        const cell = row.getCell(1);

        yield cell ? cell.value : null;
    }
};

module.exports = {
    streamFirstColumn
};
