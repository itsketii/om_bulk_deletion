#!/usr/bin/env node

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const TRACKING_TABLE = 'schema_migrations';

const log = (...args) => console.log('[migrate]', ...args);
const warn = (...args) => console.warn('[migrate]', ...args);
const fail = (...args) => console.error('[migrate]', ...args);

const parseArgs = (argv) => {

    const args = argv.slice(2);

    return {
        baseline: args.includes('--baseline'),
        status: args.includes('--status'),
        dryRun: args.includes('--dry-run')
    };
};

const listMigrationFiles = () => {

    if (!fs.existsSync(MIGRATIONS_DIR)) {
        return [];
    }

    return fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((file) => file.toLowerCase().endsWith('.sql'))
        .sort();
};

const ensureTrackingTable = async (connection) => {

    await connection.query(`
        CREATE TABLE IF NOT EXISTS \`${TRACKING_TABLE}\` (
            \`filename\` VARCHAR(255) NOT NULL,
            \`applied_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (\`filename\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
};

const getAppliedMigrations = async (connection) => {

    const [rows] = await connection.query(
        `SELECT filename FROM \`${TRACKING_TABLE}\``
    );

    return new Set(rows.map((row) => row.filename));
};

const recordMigration = (connection, filename) => {
    return connection.query(
        `INSERT INTO \`${TRACKING_TABLE}\` (filename) VALUES (?)`,
        [filename]
    );
};

const runMigration = async (connection, filename) => {

    const filePath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filePath, 'utf8').trim();

    if (!sql) {
        log(`Skipping empty file: ${filename}`);
        return;
    }

    log(`Applying ${filename}...`);
    await connection.query(sql);
    await recordMigration(connection, filename);
    log(`Applied ${filename}`);
};

const buildConnection = () => {

    const {
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_USER,
        DB_PASSWORD
    } = process.env;

    if (!DB_HOST || !DB_NAME || !DB_USER) {
        throw new Error(
            'Missing DB_HOST / DB_NAME / DB_USER environment variables'
        );
    }

    return mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT ? Number(DB_PORT) : 3306,
        database: DB_NAME,
        user: DB_USER,
        password: DB_PASSWORD || '',
        multipleStatements: true
    });
};

const main = async () => {

    const { baseline, status, dryRun } = parseArgs(process.argv);

    const connection = await buildConnection();

    try {

        await ensureTrackingTable(connection);

        const allFiles = listMigrationFiles();
        const applied = await getAppliedMigrations(connection);
        const pending = allFiles.filter((file) => !applied.has(file));

        if (status) {
            log(`Total migrations: ${allFiles.length}`);
            log(`Applied: ${applied.size}`);
            log(`Pending: ${pending.length}`);
            pending.forEach((file) => log(`  - ${file}`));
            return;
        }

        if (pending.length === 0) {
            log('Nothing to migrate. Database is up to date.');
            return;
        }

        if (baseline) {
            warn(`Baselining ${pending.length} migration(s) without executing:`);
            for (const filename of pending) {
                warn(`  - ${filename}`);
                if (!dryRun) {
                    await recordMigration(connection, filename);
                }
            }
            log('Baseline complete.');
            return;
        }

        log(`Found ${pending.length} pending migration(s).`);

        for (const filename of pending) {
            if (dryRun) {
                log(`[dry-run] Would apply ${filename}`);
                continue;
            }
            await runMigration(connection, filename);
        }

        log('All migrations applied.');

    } finally {
        await connection.end();
    }
};

main().catch((error) => {
    fail(error.message || error);
    process.exit(1);
});
