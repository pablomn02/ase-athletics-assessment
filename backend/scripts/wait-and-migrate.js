/**
 * Espera a que Postgres acepte conexiones y ejecuta init_schema.sql.
 * Para uso en Docker; ignora errores "already exists" si las tablas ya están creadas.
 */
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const maxAttempts = 30;
const delayMs = 1000;

async function waitForPg() {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      if (i === maxAttempts - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function migrate() {
  const sqlPath = path.join(__dirname, '../migrations/init_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    await pool.query(sql);
    console.log('Migración ejecutada correctamente.');
  } catch (err) {
    if (/already exists/.test(err.message)) {
      console.log('Tablas ya existen, se omite migración.');
    } else {
      throw err;
    }
  }
}

waitForPg()
  .then(migrate)
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
