/**
 * Espera a que Postgres acepte conexiones y ejecuta init_schema.sql.
 * Para uso en Docker/Railway; ignora errores "already exists" si las tablas ya están creadas.
 */
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Pool } = require('pg');

// Railway puede inyectar DATABASE_URL, DATABASE_PRIVATE_URL o referencias; leer de process.env
const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_CONNECTION_URL;
if (!connectionString) {
  console.error('[wait-and-migrate] ERROR: No hay URL de base de datos.');
  console.error('[wait-and-migrate] Define DATABASE_URL en Railway: Settings → Variables o enlaza el servicio PostgreSQL.');
  process.exit(1);
}
console.log('[wait-and-migrate] URL de BD encontrada, conectando a Postgres...');

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL !== 'false' && /railway|rlwy\.net|postgres\.railway/i.test(connectionString)
    ? { rejectUnauthorized: false }
    : false,
});

const maxAttempts = 30;
const delayMs = 1000;

async function waitForPg() {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('[wait-and-migrate] Postgres aceptando conexiones.');
      return;
    } catch (err) {
      console.log(`[wait-and-migrate] Intento ${i + 1}/${maxAttempts}: ${err.message}`);
      if (i === maxAttempts - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function migrate() {
  const sqlPath = path.join(__dirname, '../migrations/init_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`No se encuentra el archivo de migración: ${sqlPath}`);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log('[wait-and-migrate] Ejecutando init_schema.sql...');
  try {
    await pool.query(sql);
    console.log('[wait-and-migrate] Migración ejecutada correctamente.');
  } catch (err) {
    if (/already exists/.test(err.message)) {
      console.log('[wait-and-migrate] Tablas ya existen, se omite migración.');
    } else {
      console.error('[wait-and-migrate] Error en migración:', err.message);
      throw err;
    }
  }
}

waitForPg()
  .then(migrate)
  .then(() => pool.end())
  .then(() => {
    console.log('[wait-and-migrate] Listo.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[wait-and-migrate] FALLO:', err.message || err);
    process.exit(1);
  });
