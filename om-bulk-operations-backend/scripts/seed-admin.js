require('dotenv').config();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const sequelize = require('../src/config/database');
const { User } = require('../src/models');

const ADMIN_USERNAME = 'admin';
const ADMIN_FULLNAME = 'Administrator';
const ADMIN_EMAIL = 'admin@local';

const CREDENTIALS_FILE = path.join(
    __dirname,
    '..',
    'admin-credentials.txt'
);

const SALT_ROUNDS = 10;

const generatePassword = () => {

    return crypto
        .randomBytes(12)
        .toString('base64')
        .replace(/[+/=]/g, '')
        .slice(0, 16);
};

const writeCredentialsFile = (password) => {

    const lines = [
        'OM Bulk Deletion Portal - Admin credentials',
        'Generated at: ' + new Date().toISOString(),
        '',
        'Username: ' + ADMIN_USERNAME,
        'Email:    ' + ADMIN_EMAIL,
        'Password: ' + password,
        '',
        'Keep this file safe.',
        'Delete it once you have stored the credentials in a password manager.'
    ];

    fs.writeFileSync(
        CREDENTIALS_FILE,
        lines.join('\n'),
        { encoding: 'utf8' }
    );
};

(async () => {

    try {

        await sequelize.authenticate();
        await sequelize.sync();

        const existing = await User.findOne({
            where: { username: ADMIN_USERNAME }
        });

        if (existing) {

            console.log(
                `[seed:admin] Admin user "${ADMIN_USERNAME}" already exists ` +
                `(id=${existing.id}). Nothing to do.`
            );

            console.log(
                '[seed:admin] To regenerate the password, delete this user ' +
                'first then re-run this script.'
            );

            process.exit(0);
        }

        const plainPassword = generatePassword();

        const hashedPassword =
            await bcrypt.hash(plainPassword, SALT_ROUNDS);

        const user = await User.create({
            username: ADMIN_USERNAME,
            fullname: ADMIN_FULLNAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'ADMIN'
        });

        writeCredentialsFile(plainPassword);

        console.log(`[seed:admin] Admin user created (id=${user.id}).`);

        console.log(
            `[seed:admin] Credentials written to: ${CREDENTIALS_FILE}`
        );

        console.log(
            '[seed:admin] WARNING: this file contains a plaintext password. ' +
            'Move it to a secure location and delete it after use.'
        );

        process.exit(0);

    } catch (error) {

        console.error('[seed:admin] FAILED:', error.message);
        process.exit(1);
    }
})();
