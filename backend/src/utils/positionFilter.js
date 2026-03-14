/**
 * Mapeo posición UI (español) → valor en BD (inglés en seeds).
 * Usado en filtros de jugadores y dashboard para que "Defensa" filtre por "Defender", etc.
 */
const POSITION_ES_TO_EN = {
  Portero: 'Goalkeeper',
  Defensa: 'Defender',
  Centrocampista: 'Midfielder',
  Delantero: 'Forward',
};

/**
 * @param {string} [position]
 * @returns {string|undefined} Valor a usar en la consulta (inglés o el mismo si no está en el mapa)
 */
function normalizePositionForFilter(position) {
  if (!position || typeof position !== 'string') return position;
  const trimmed = position.trim();
  return POSITION_ES_TO_EN[trimmed] ?? trimmed;
}

module.exports = { normalizePositionForFilter };
