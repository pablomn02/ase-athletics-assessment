const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Carga variables del archivo .env

// Configuración de la conexión usando variables de entorno para evitar hardcoding [4]
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('Iniciando proceso de siembra de datos...');

    // 1. Cargar archivos JSON desde la carpeta /data [3]
    const playersPath = path.join(__dirname, '../../data/players_Data_production.json');
    const scoutReportsPath = path.join(__dirname, '../../data/scout_report.json');

    const playersData = JSON.parse(fs.readFileSync(playersPath, 'utf-8'));
    const scoutReportsData = JSON.parse(fs.readFileSync(scoutReportsPath, 'utf-8'));

    await client.query('BEGIN');

    // Limpiar tablas para evitar duplicados en desarrollo (opcional)
    await client.query('TRUNCATE players, player_attributes, scout_reports CASCADE');

    for (const player of playersData) {
      // 2. Insertar en tabla 'players' [1]
      const playerRes = await client.query(
        `INSERT INTO players (name, position, age, team, nationality, height, weight, goals, assists, appearances, contract_salary, contract_end, market_value)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id`,
        [player.name, player.position, player.age, player.team, player.nationality, player.height, player.weight, 
         player.goals, player.assists, player.appearances, player.contract_salary, player.contract_end, player.market_value]
      );

      const playerId = playerRes.rows.id;

      // 3. Insertar Atributos (si el JSON contiene el objeto de atributos físicos) [1, 5]
      if (player.attributes) {
        await client.query(
          `INSERT INTO player_attributes (player_id, pace, shooting, passing, defending, dribbling, physicality)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [playerId, player.attributes.pace, player.attributes.shooting, player.attributes.passing, 
           player.attributes.defending, player.attributes.dribbling, player.attributes.physicality]
        );
      }
    }

    // 4. Insertar Reportes de Scouting [1, 5, 6]
    // Nota: El scout_id se deja nulo o se asocia a un usuario demo creado previamente
    for (const report of scoutReportsData) {
      await client.query(
        `INSERT INTO scout_reports (player_id, overall_rating, strengths, weaknesses, recommendation, match_date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [report.player_id, report.overall_rating, report.strengths, report.weaknesses, report.recommendation, report.match_date]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Siembra de datos completada con éxito.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante la siembra de datos:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

seedDatabase();