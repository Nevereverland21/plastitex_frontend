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

/**
 * Formatea una fecha en es-PE largo: "17 de junio de 2026".
 * Las fechas solo-fecha ("YYYY-MM-DD", ej. delivery_deadline) se parsean como
 * fecha LOCAL: `new Date("2026-06-17")` se interpreta en UTC y al mostrarla en
 * Lima (UTC-5) retrocede un día (17 → 16). Aquí se construye desde las partes
 * para evitar ese corrimiento. Las fechas con hora (ISO con zona) se parsean normal.
 */
export function formatDateLong(value: string | null | undefined): string {
  if (!value) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const d = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
}
