const LINE_PREFIX = 'DELETE,CUSTOMER,0';

const DIGITS_ONLY = /^[0-9]+$/;

const extractCellText = (value) => {

    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    if (typeof value === 'object') {

        if (value.text !== undefined) {
            return String(value.text);
        }

        if (value.result !== undefined) {
            return String(value.result);
        }

        if (Array.isArray(value.richText)) {
            return value.richText
                .map((part) => part.text)
                .join('');
        }
    }

    return String(value);
};

const formatMsisdn = (rawValue) => {

    const text = extractCellText(rawValue).trim();

    if (!text) {
        return null;
    }

    if (!DIGITS_ONLY.test(text)) {
        return null;
    }

    return `${LINE_PREFIX}${text}`;
};

module.exports = {
    formatMsisdn
};
