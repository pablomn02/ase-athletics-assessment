const pool = require('../config/db');

const listReports = async ({ page = 1, limit = 20, playerId, scoutId, recommendation } = {}) => {
  const offset = (page - 1) * limit;
  const where = [];
  const values = [];

  if (playerId) {
    values.push(Number(playerId));
    where.push(`sr.player_id = $${values.length}`);
  }

  if (scoutId) {
    values.push(Number(scoutId));
    where.push(`sr.scout_id = $${values.length}`);
  }

  if (recommendation && recommendation.trim()) {
    values.push(`${recommendation.trim()}%`);
    where.push(`sr.recommendation LIKE $${values.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const client = await pool.connect();

  try {
    const listQuery = `
      SELECT
        sr.id,
        sr.player_id,
        sr.scout_id,
        sr.match_date,
        sr.overall_rating,
        sr.strengths,
        sr.weaknesses,
        sr.recommendation,
        sr.created_at,
        p.name AS player_name,
        p.team AS player_team
      FROM scout_reports sr
      JOIN players p ON p.id = sr.player_id
      ${whereClause}
      ORDER BY sr.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM scout_reports sr
      ${whereClause}
    `;

    const listValues = [...values, limit, offset];

    const [rowsResult, countResult] = await Promise.all([
      client.query(listQuery, listValues),
      client.query(countQuery, values),
    ]);

    const total = Number(countResult.rows[0].total) || 0;

    return {
      reports: rowsResult.rows,
      total,
    };
  } finally {
    client.release();
  }
};

const getReportById = async (id) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT sr.id, sr.player_id, sr.scout_id, sr.match_date, sr.overall_rating, sr.strengths, sr.weaknesses, sr.recommendation, sr.created_at,
              p.name AS player_name, p.team AS player_team
       FROM scout_reports sr
       JOIN players p ON p.id = sr.player_id
       WHERE sr.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

const createReport = async (data) => {
  const {
    player_id,
    scout_id,
    match_date,
    overall_rating,
    strengths,
    weaknesses,
    recommendation,
  } = data;

  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      INSERT INTO scout_reports (
        player_id,
        scout_id,
        match_date,
        overall_rating,
        strengths,
        weaknesses,
        recommendation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        player_id,
        scout_id || null,
        match_date || null,
        overall_rating,
        strengths || null,
        weaknesses || null,
        recommendation || null,
      ]
    );

    return result.rows[0];
  } finally {
    client.release();
  }
};

const updateReport = async (id, data) => {
  const {
    player_id,
    scout_id,
    match_date,
    overall_rating,
    strengths,
    weaknesses,
    recommendation,
  } = data;

  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      UPDATE scout_reports
      SET
        player_id = $1,
        scout_id = $2,
        match_date = $3,
        overall_rating = $4,
        strengths = $5,
        weaknesses = $6,
        recommendation = $7
      WHERE id = $8
      RETURNING *
      `,
      [
        player_id,
        scout_id || null,
        match_date || null,
        overall_rating,
        strengths || null,
        weaknesses || null,
        recommendation || null,
        id,
      ]
    );

    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

const deleteReport = async (id) => {
  const client = await pool.connect();

  try {
    const result = await client.query('DELETE FROM scout_reports WHERE id = $1', [id]);
    return result.rowCount > 0;
  } finally {
    client.release();
  }
};

module.exports = {
  listReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
};

