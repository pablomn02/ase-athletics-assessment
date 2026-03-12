const pool = require('../config/db');

const getDashboardStats = async () => {
  const client = await pool.connect();

  try {
    const [
      playersAgg,
      topByGoals,
      topByAssists,
      byPosition,
      byTeam,
    ] = await Promise.all([
      client.query(`
        SELECT
          COUNT(*)::int AS total_players,
          AVG(age)::numeric(10,2) AS avg_age
        FROM players
      `),
      client.query(`
        SELECT id, name, team, goals
        FROM players
        ORDER BY goals DESC
        LIMIT 5
      `),
      client.query(`
        SELECT id, name, team, assists
        FROM players
        ORDER BY assists DESC
        LIMIT 5
      `),
      client.query(`
        SELECT position, COUNT(*)::int AS count
        FROM players
        GROUP BY position
        ORDER BY count DESC
      `),
      client.query(`
        SELECT team, COUNT(*)::int AS count
        FROM players
        GROUP BY team
        ORDER BY count DESC
        LIMIT 10
      `),
    ]);

    const base = playersAgg.rows[0] || {
      total_players: 0,
      avg_age: null,
    };

    return {
      totalPlayers: base.total_players,
      avgAge: base.avg_age,
      topByGoals: topByGoals.rows,
      topByAssists: topByAssists.rows,
      byPosition: byPosition.rows,
      byTeam: byTeam.rows,
    };
  } finally {
    client.release();
  }
};

module.exports = {
  getDashboardStats,
};

