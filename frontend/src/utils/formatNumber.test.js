import {
  formatCurrency,
  formatCurrencyWithSymbol,
  formatMarketValue,
} from './formatNumber';

describe('formatCurrency', () => {
  it('formatea número con punto de miles y coma decimal', () => {
    expect(formatCurrency(165000)).toBe('165.000,00');
    expect(formatCurrency(165000.5)).toBe('165.000,50');
  });

  it('acepta número como string', () => {
    expect(formatCurrency('165000')).toBe('165.000,00');
  });

  it('respeta decimales indicados', () => {
    expect(formatCurrency(100, 0)).toBe('100');
    expect(formatCurrency(100.567, 2)).toBe('100,57');
  });

  it('devuelve "—" para null, undefined o string vacío', () => {
    expect(formatCurrency(null)).toBe('—');
    expect(formatCurrency(undefined)).toBe('—');
    expect(formatCurrency('')).toBe('—');
  });

  it('devuelve "—" para valor no numérico', () => {
    expect(formatCurrency('abc')).toBe('—');
  });
});

describe('formatCurrencyWithSymbol', () => {
  it('añade el símbolo € al valor formateado', () => {
    const a = formatCurrencyWithSymbol(100);
    expect(a.startsWith('€')).toBe(true);
    expect(a).toMatch(/\d/);
    const b = formatCurrencyWithSymbol(1500.5);
    expect(b.startsWith('€')).toBe(true);
    expect(b).toMatch(/,50$|\.50$/);
  });

  it('devuelve "—" cuando no hay valor', () => {
    expect(formatCurrencyWithSymbol(null)).toBe('—');
  });
});

describe('formatMarketValue', () => {
  it('formatea valor de mercado con punto cada 3 cifras', () => {
    expect(formatMarketValue(1650000)).toBe('€1.650.000');
    expect(formatMarketValue(500000)).toBe('€500.000');
  });

  it('devuelve "—" para null o undefined', () => {
    expect(formatMarketValue(null)).toBe('—');
    expect(formatMarketValue(undefined)).toBe('—');
  });

  it('devuelve "—" para valor no numérico', () => {
    expect(formatMarketValue('n/a')).toBe('—');
  });
});
