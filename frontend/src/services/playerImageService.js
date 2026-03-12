/**
 * playerImageService.js
 * Servicio MÍNIMO - sin APIs externas
 * 
 * Nota: Los avatares se generan en PlayerList.js
 * Este servicio ahora solo devuelve null/objeto vacío
 */

/**
 * Obtiene imagen de un futbolista (VERSIÓN BÁSICA)
 * @param {string} playerName - Nombre del jugador
 * @param {string} teamName - Nombre del equipo (opcional)
 * @returns {Promise<null>} Siempre null
 */
export const fetchPlayerImage = async (playerName, teamName = '') => {
  return null;
};

/**
 * Obtiene imágenes para múltiples jugadores (VERSIÓN BÁSICA)
 * @param {Array<{name, team}>} players - Array de objetos
 * @returns {Promise<Object>} Objeto vacío
 */
export const fetchMultiplePlayerImages = async (players) => {
  return {};
};

const playerImageService = {
  fetchPlayerImage,
  fetchMultiplePlayerImages,
};

export default playerImageService;


