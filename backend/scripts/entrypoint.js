/**
 * Arranque único: migración → seed → servidor.
 * Así el proceso no termina entre pasos y Railway ve el servidor correctamente.
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
process.chdir(root);

console.log('[entrypoint] Ejecutando migración...');
try {
  execSync('node scripts/wait-and-migrate.js', { stdio: 'inherit', cwd: root });
} catch (e) {
  process.exit(1);
}

console.log('[entrypoint] Ejecutando seed (opcional)...');
try {
  execSync('node seeds/seed_data.js', { stdio: 'inherit', cwd: root });
} catch (e) {
  console.log('[entrypoint] Seed omitido o fallido (continuando).');
}

console.log('[entrypoint] Arrancando API...');
require('../src/index.js');
