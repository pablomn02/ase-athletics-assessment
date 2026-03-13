/**
 * Formato de números al estilo español: punto cada 3 cifras, coma para decimales.
 * Ej: 165000.00 → "165.000,00"
 */

/**
 * Formatea un valor como moneda (€) con punto de miles y coma decimal.
 * @param {number|string|null|undefined} value
 * @param {number} decimals - decimales a mostrar (por defecto 2)
 * @returns {string} Ej: "165.000,00" o "—" si no hay valor
 */
export function formatCurrency(value, decimals = 2) {
  if (value == null || value === '') return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Devuelve el número formateado con prefijo € (para mostrar en UI).
 */
export function formatCurrencyWithSymbol(value, decimals = 2) {
  const formatted = formatCurrency(value, decimals);
  return formatted === '—' ? '—' : `€${formatted}`;
}

/**
 * Formatea valor de mercado con punto cada 3 cifras (ej: €1.650.000,00).
 */
export function formatMarketValue(value) {
  if (value == null) return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return formatCurrencyWithSymbol(n, 0);
}
