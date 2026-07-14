"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.healthCheck = healthCheck;
const pg_1 = require("pg");
const index_1 = require("./index");
exports.pool = new pg_1.Pool({
    connectionString: index_1.config.databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
exports.pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
});
async function query(text, params) {
    const result = await exports.pool.query(text, params);
    return result.rows;
}
async function healthCheck() {
    try {
        await exports.pool.query('SELECT 1');
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=database.js.map