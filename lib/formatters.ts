/**
 * Formatea un número o string numérico como precio peruano: S/ 1.234,56
 */
export function formatPrice(n: number | string): string {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  const [int, dec] = num.toFixed(2).split('.');
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`;
}

/**
 * Formatea un número entero con separador de miles: 1.234
 */
export function formatInt(n: number): string {
  return n.toLocaleString('es-PE');
}

/**
 * Formatea una cantidad abreviada: 1.5k, 2k
 */
export function formatQuantity(qty: number): string {
  if (qty >= 1000) return `${(qty / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${qty}`;
}
