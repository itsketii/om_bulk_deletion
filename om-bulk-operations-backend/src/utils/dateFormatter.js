const pad2 = (n) => String(n).padStart(2, '0');

const formatYYYYMMDD = (date = new Date()) => {

    const year = date.getFullYear();
    const month = pad2(date.getMonth() + 1);
    const day = pad2(date.getDate());

    return `${year}${month}${day}`;
};

module.exports = {
    formatYYYYMMDD
};
