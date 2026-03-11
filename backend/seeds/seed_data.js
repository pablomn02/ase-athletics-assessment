// Dependencias estándar de Node y cliente de PostgreSQL
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Carga variables de entorno desde ../.env (DATABASE_URL, etc.)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Pool de conexiones a la base de datos Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Normaliza atributos que vienen en escala 0-100 a la escala 1-10 requerida por la BBDD
const normalizeAttribute = (value) => {
  if (value === null || value === undefined) return null;
  const normalized = Math.round(Number(value) / 10);
  return Math.min(10, Math.max(1, normalized));
};

// Función principal que se encarga de vaciar y rellenar la base de datos con los JSON de /data
const seedDatabase = async () => {
  // Obtenemos un cliente del pool para ejecutar la transacción completa
  const client = await pool.connect();
  try {
    console.log('--- Iniciando proceso de siembra de datos (Seeding) ---');

    // Rutas a los ficheros de datos en el directorio /data
    const playersPath = path.join(__dirname, '../../data/players_Data_production.json');
    const scoutReportsPath = path.join(__dirname, '../../data/scout_report.json');

    // Leemos y parseamos el JSON de jugadores y de reportes de scouting
    const rawPlayersData = JSON.parse(fs.readFileSync(playersPath, 'utf-8'));
    const rawScoutReportsData = JSON.parse(fs.readFileSync(scoutReportsPath, 'utf-8'));

    // Soporta tanto formato de array directo como objeto con claves (ej: { "players": [...] })
    const playersData = Array.isArray(rawPlayersData)
      ? rawPlayersData
      : (rawPlayersData.players || rawPlayersData.data);
    const scoutReportsData = Array.isArray(rawScoutReportsData)
      ? rawScoutReportsData
      : (rawScoutReportsData.scoutingReports ||
        rawScoutReportsData.reports ||
        rawScoutReportsData.scout_reports ||
        []);

    if (!Array.isArray(playersData)) {
      throw new Error('No se pudo encontrar un array de jugadores en el archivo JSON. Verifica la estructura.');
    }

    console.log(`Procesando ${playersData.length} jugadores...`);

    // Iniciamos transacción y limpiamos tablas relacionadas antes de insertar
    await client.query('BEGIN');
    await client.query('TRUNCATE players, player_attributes, scout_reports CASCADE');

    // Mapa para relacionar los IDs originales del JSON con los IDs de la base de datos
    const playerIdMap = new Map();

    // Inserción de jugadores y sus atributos normalizados
    for (const player of playersData) {
      // Sub-objetos de estadísticas y contrato, opcionales en el JSON
      const stats = player.stats || {};
      const contract = player.contract || {};

      const playerRes = await client.query(
        `INSERT INTO players (
          name, position, age, team, nationality, height, weight, 
          goals, assists, appearances, contract_salary, contract_end, market_value
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id`,
        [
          player.name,
          player.position,
          player.age,
          player.team,
          player.nationality,
          player.height,
          player.weight,
          stats.goals ?? 0,
          stats.assists ?? 0,
          stats.appearances ?? 0,
          contract.salary ?? null,
          contract.contractEnd ?? null,
          player.marketValue ?? null
        ]
      );

      // ID autogenerado en la tabla players
      const playerId = playerRes.rows[0].id;

      // Guardamos el mapeo entre el id original del JSON y el id de la BD
      if (player.id !== undefined && player.id !== null) {
        playerIdMap.set(player.id, playerId);
      }

      if (player.attributes) {
        await client.query(
          `INSERT INTO player_attributes (
            player_id, pace, shooting, passing, defending, dribbling, physicality
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            playerId,
            // Los atributos del JSON suelen venir en escala 0-100 → los normalizamos a 1-10
            normalizeAttribute(player.attributes.pace),
            normalizeAttribute(player.attributes.shooting),
            normalizeAttribute(player.attributes.passing),
            normalizeAttribute(player.attributes.defending),
            normalizeAttribute(player.attributes.dribbling),
            normalizeAttribute(player.attributes.physical || player.attributes.physicality)
          ]
        );
      }
    }

    // Siembra de reportes de scouting asociados a los jugadores
    const finalReports = Array.isArray(scoutReportsData) ? scoutReportsData : [];
    for (const report of finalReports) {
      // Intentamos mapear el playerId del JSON al id real insertado en la BBDD
      const mappedPlayerId = report.playerId != null ? playerIdMap.get(report.playerId) : null;

      // Fortalezas y debilidades: si vienen como array, se convierten a string legible
      const strengthsText = Array.isArray(report.strengths)
        ? report.strengths.join(' | ')
        : (report.strengths || null);

      const weaknessesText = Array.isArray(report.weaknesses)
        ? report.weaknesses.join(' | ')
        : (report.weaknesses || null);

      // Diferentes posibles claves para la nota global en el JSON
      const overallRating =
        report.overallRating ||
        (report.ratings && report.ratings.overall) ||
        report.overall_rating ||
        null;

      // Fecha del partido asociada al reporte
      const matchDate = report.date || report.match_date || null;

      if (mappedPlayerId) {
        await client.query(
          `INSERT INTO scout_reports (
            player_id, overall_rating, strengths, weaknesses, recommendation, match_date
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [mappedPlayerId, overallRating, strengthsText, weaknessesText, report.recommendation, matchDate]
        );
      } else {
        // Fallback: si no encontramos el jugador en el mapa, asociamos el reporte a un jugador aleatorio
        await client.query(
          `INSERT INTO scout_reports (
            player_id, overall_rating, strengths, weaknesses, recommendation, match_date
          ) VALUES (
            (SELECT id FROM players ORDER BY random() LIMIT 1), 
            $1, $2, $3, $4, $5
          )`,
          [overallRating, strengthsText, weaknessesText, report.recommendation, matchDate]
        );
      }
    }

    // Confirmamos la transacción si todo ha ido bien
    await client.query('COMMIT');
    console.log('✅ ¡Siembra de datos completada con éxito!');
    
  } catch (error) {
    // Ante cualquier error, deshacemos todos los cambios hechos en la transacción
    if (client) await client.query('ROLLBACK');
    console.error('❌ Error durante la siembra de datos:', error.message);
  } finally {
    // Liberamos recursos: cliente y pool de conexiones
    client.release();
    await pool.end();
  }
};

// Ejecuta el proceso de seeding cuando se llama a este archivo con `node seeds/seed_data.js`
seedDatabase();