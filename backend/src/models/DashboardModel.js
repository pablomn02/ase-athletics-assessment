const pool = require('../config/db');

function buildWhere(filters) {
  const conditions = [];
  const values = [];
  let i = 1;
  if (filters.team) {
    conditions.push(`team = $${i++}`);
    values.push(filters.team);
  }
  if (filters.position) {
    conditions.push(`position = $${i++}`);
    values.push(filters.position);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, values };
}

const getDashboardStats = async (filters = {}) => {
  const client = await pool.connect();
  const { where, values } = buildWhere(filters);
  const fromClause = `FROM players ${where}`.trim();
  const andOrWhere = where ? `${where} AND` : 'WHERE';

  try {
    const [
      playersAgg,
      topByGoals,
      topByAssists,
      topByMarketValue,
      byPosition,
      byTeam,
      goalsDistribution,
      ageDistribution,
      marketValueBuckets,
      goalsByPosition,
    ] = await Promise.all([
      client.query(
        `SELECT COUNT(*)::int AS total_players, AVG(age)::numeric(10,2) AS avg_age, COALESCE(SUM(goals), 0)::bigint AS total_goals ${fromClause}`,
        values
      ),
      client.query(
        `SELECT id, name, team, goals FROM players ${where} ORDER BY goals DESC NULLS LAST LIMIT 5`,
        values
      ),
      client.query(
        `SELECT id, name, team, assists FROM players ${where} ORDER BY assists DESC NULLS LAST LIMIT 5`,
        values
      ),
      client.query(
        `SELECT id, name, team, market_value FROM players ${andOrWhere} market_value IS NOT NULL ORDER BY market_value DESC LIMIT 5`,
        values
      ),
      client.query(
        `SELECT position, COUNT(*)::int AS count FROM players ${andOrWhere} position IS NOT NULL AND position != '' GROUP BY position ORDER BY count DESC`,
        values
      ),
      client.query(
        `SELECT team, COUNT(*)::int AS count FROM players ${andOrWhere} team IS NOT NULL AND team != '' GROUP BY team ORDER BY count DESC LIMIT 10`,
        values
      ),
      client.query(
        `SELECT CASE WHEN goals IS NULL OR goals = 0 THEN '0' WHEN goals BETWEEN 1 AND 5 THEN '1-5' WHEN goals BETWEEN 6 AND 10 THEN '6-10' ELSE '11+' END AS bucket, COUNT(*)::int AS count ${fromClause} GROUP BY 1 ORDER BY MIN(COALESCE(goals, 0))`,
        values
      ),
      client.query(
        `SELECT CASE WHEN age IS NULL THEN 'N/A' WHEN age < 20 THEN '<20' WHEN age < 25 THEN '20-24' WHEN age < 30 THEN '25-29' WHEN age < 35 THEN '30-34' ELSE '35+' END AS bucket, COUNT(*)::int AS count ${fromClause} GROUP BY 1 ORDER BY MIN(COALESCE(age, 0))`,
        values
      ),
      client.query(
        `SELECT CASE WHEN market_value IS NULL OR market_value = 0 THEN 'Sin valor' WHEN market_value < 1000000 THEN '<1M' WHEN market_value < 10000000 THEN '1M-10M' WHEN market_value < 50000000 THEN '10M-50M' ELSE '50M+' END AS bucket, COUNT(*)::int AS count ${fromClause} GROUP BY 1 ORDER BY MIN(COALESCE(market_value, 0))`,
        values
      ),
      client.query(
        `SELECT position, COALESCE(SUM(goals), 0)::bigint AS goals FROM players ${andOrWhere} position IS NOT NULL AND position != '' GROUP BY position ORDER BY goals DESC`,
        values
      ),
    ]);

    const base = playersAgg.rows[0] || {
      total_players: 0,
      avg_age: null,
      total_goals: 0,
    };

    return {
      totalPlayers: base.total_players,
      avgAge: base.avg_age,
      totalGoals: base.total_goals,
      topByGoals: topByGoals.rows,
      topByAssists: topByAssists.rows,
      topByMarketValue: topByMarketValue.rows,
      byPosition: byPosition.rows,
      byTeam: byTeam.rows,
      goalsDistribution: goalsDistribution.rows,
      ageDistribution: ageDistribution.rows,
      marketValueBuckets: marketValueBuckets.rows,
      goalsByPosition: goalsByPosition.rows,
    };
  } finally {
    client.release();
  }
};

module.exports = {
  getDashboardStats,
};

