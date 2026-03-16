const { Pool } = require('pg');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
const useSSL =
  connectionString &&
  process.env.DATABASE_SSL !== 'false' &&
  /railway|rlwy\.net|postgres\.railway/i.test(connectionString);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(useSSL && { ssl: { rejectUnauthorized: false } }),
});

module.exports = pool;

