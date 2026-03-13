/**
 * Traduce la posición del jugador al español para mostrar en la UI.
 * Acepta valores en inglés (API/BD) o ya en español.
 */
const POSITION_ES = {
  goalkeeper: 'Portero',
  defender: 'Defensa',
  midfielder: 'Centrocampista',
  forward: 'Delantero',
};

export function positionToSpanish(position) {
  if (position == null || String(position).trim() === '') return '';
  const key = String(position).toLowerCase().trim();
  return POSITION_ES[key] ?? position;
}
