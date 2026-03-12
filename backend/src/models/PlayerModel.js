const pool = require('../config/db');

const buildPlayersFilterQuery = (filters = {}) => {
  const { position, team, minAge, maxAge } = filters;
  const conditions = [];
  const values = [];

  if (position) {
    values.push(position);
    conditions.push(`p.position = $${values.length}`);
  }

  if (team) {
    values.push(team);
    conditions.push(`p.team = $${values.length}`);
  }

  if (minAge) {
    values.push(Number(minAge));
    conditions.push(`p.age >= $${values.length}`);
  }

  if (maxAge) {
    values.push(Number(maxAge));
    conditions.push(`p.age <= $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  return { whereClause, values };
};

const getPlayers = async ({ page = 1, limit = 20, filters = {} } = {}) => {
  const offset = (page - 1) * limit;
  const { whereClause, values } = buildPlayersFilterQuery(filters);

  const baseSelect = `
    SELECT
      p.id,
      p.name,
      p.position,
      p.age,
      p.team,
      p.nationality,
      p.height,
      p.weight,
      p.goals,
      p.assists,
      p.appearances,
      p.contract_salary,
      p.contract_end,
      p.market_value,
      pa.pace,
      pa.shooting,
      pa.passing,
      pa.defending,
      pa.dribbling,
      pa.physicality
    FROM players p
    LEFT JOIN player_attributes pa ON pa.player_id = p.id
  `;

  const selectQuery = `
    ${baseSelect}
    ${whereClause}
    ORDER BY p.name ASC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM players p
    ${whereClause}
  `;

  const client = await pool.connect();

  try {
    const selectValues = [...values, limit, offset];
    const [rowsResult, countResult] = await Promise.all([
      client.query(selectQuery, selectValues),
      client.query(countQuery, values),
    ]);

    const total = Number(countResult.rows[0].total) || 0;

    return {
      players: rowsResult.rows,
      total,
    };
  } finally {
    client.release();
  }
};

const getPlayerById = async (id) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT
        p.id,
        p.name,
        p.position,
        p.age,
        p.team,
        p.nationality,
        p.height,
        p.weight,
        p.goals,
        p.assists,
        p.appearances,
        p.contract_salary,
        p.contract_end,
        p.market_value,
        pa.pace,
        pa.shooting,
        pa.passing,
        pa.defending,
        pa.dribbling,
        pa.physicality
      FROM players p
      LEFT JOIN player_attributes pa ON pa.player_id = p.id
      WHERE p.id = $1
      `,
      [id]
    );

    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

const createPlayer = async (playerData) => {
  const {
    name,
    position,
    age,
    team,
    nationality,
    height,
    weight,
    goals = 0,
    assists = 0,
    appearances = 0,
    contract_salary = null,
    contract_end = null,
    market_value = null,
    attributes = null,
  } = playerData;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const playerResult = await client.query(
      `
      INSERT INTO players (
        name,
        position,
        age,
        team,
        nationality,
        height,
        weight,
        goals,
        assists,
        appearances,
        contract_salary,
        contract_end,
        market_value
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14
      )
      RETURNING *
      `,
      [
        name,
        position,
        age,
        team,
        nationality,
        height,
        weight,
        goals,
        assists,
        appearances,
        contract_salary,
        contract_end,
        market_value,
      ]
    );

    const player = playerResult.rows[0];

    if (attributes) {
      const {
        pace,
        shooting,
        passing,
        defending,
        dribbling,
        physicality,
      } = attributes;

      await client.query(
        `
        INSERT INTO player_attributes (
          player_id,
          pace,
          shooting,
          passing,
          defending,
          dribbling,
          physicality
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          player.id,
          pace,
          shooting,
          passing,
          defending,
          dribbling,
          physicality,
        ]
      );
    }

    await client.query('COMMIT');

    return player;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updatePlayer = async (id, playerData) => {
  const {
    name,
    position,
    age,
    team,
    nationality,
    height,
    weight,
    goals = 0,
    assists = 0,
    appearances = 0,
    contract_salary = null,
    contract_end = null,
    market_value = null,
    attributes = null,
  } = playerData;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updateResult = await client.query(
      `
      UPDATE players
      SET
        name = $1,
        position = $2,
        age = $3,
        team = $4,
        nationality = $5,
        height = $6,
        weight = $7,
        goals = $8,
        assists = $9,
        appearances = $10,
        contract_salary = $11,
        contract_end = $12,
        market_value = $13,
        updated_at = NOW()
      WHERE id = $14
      RETURNING *
      `,
      [
        name,
        position,
        age,
        team,
        nationality,
        height,
        weight,
        goals,
        assists,
        appearances,
        contract_salary,
        contract_end,
        market_value,
        id,
      ]
    );

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const player = updateResult.rows[0];

    if (attributes) {
      const upsertAttributesQuery = `
        INSERT INTO player_attributes (
          player_id,
          pace,
          shooting,
          passing,
          defending,
          dribbling,
          physicality
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (player_id) DO UPDATE SET
          pace = EXCLUDED.pace,
          shooting = EXCLUDED.shooting,
          passing = EXCLUDED.passing,
          defending = EXCLUDED.defending,
          dribbling = EXCLUDED.dribbling,
          physicality = EXCLUDED.physicality
      `;

      const {
        pace,
        shooting,
        passing,
        defending,
        dribbling,
        physicality,
      } = attributes;

      await client.query(upsertAttributesQuery, [
        player.id,
        pace,
        shooting,
        passing,
        defending,
        dribbling,
        physicality,
      ]);
    }

    await client.query('COMMIT');

    return player;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deletePlayer = async (id) => {
  const client = await pool.connect();

  try {
    const result = await client.query('DELETE FROM players WHERE id = $1', [id]);
    return result.rowCount > 0;
  } finally {
    client.release();
  }
};

const searchPlayers = async ({ q, page = 1, limit = 20 } = {}) => {
  const term = (q || '').trim();
  const offset = (page - 1) * limit;

  if (!term) {
    return { players: [], total: 0 };
  }

  const client = await pool.connect();

  try {
    const searchQuery = `
      SELECT
        p.id,
        p.name,
        p.position,
        p.age,
        p.team,
        p.nationality,
        p.height,
        p.weight,
        p.goals,
        p.assists,
        p.appearances,
        p.contract_salary,
        p.contract_end,
        p.market_value
      FROM players p
      WHERE
        p.name ILIKE $1
        OR p.team ILIKE $1
        OR p.nationality ILIKE $1
      ORDER BY p.name ASC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM players p
      WHERE
        p.name ILIKE $1
        OR p.team ILIKE $1
        OR p.nationality ILIKE $1
    `;

    const likeTerm = `%${term}%`;

    const [rowsResult, countResult] = await Promise.all([
      client.query(searchQuery, [likeTerm, limit, offset]),
      client.query(countQuery, [likeTerm]),
    ]);

    const total = Number(countResult.rows[0].total) || 0;

    return {
      players: rowsResult.rows,
      total,
    };
  } finally {
    client.release();
  }
};

module.exports = {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  searchPlayers,
};

