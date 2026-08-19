/** Clave de dia local (YYYY-MM-DD): evita el corrimiento de zona de toISOString. */
export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function yesterdayKey(date = new Date()) {
  const d = new Date(date)
  d.setDate(d.getDate() - 1)
  return todayKey(d)
}

const DAYS = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']
const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

/** Etiqueta corta para el marcador de la maquina: "MAR 19 AGO". */
export function displayDate(date = new Date()) {
  return `${DAYS[date.getDay()]} ${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]}`
}

/** Ultimos n dias (claves) terminando en hoy, para la tira de racha. */
export function lastDays(n, date = new Date()) {
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(date)
    d.setDate(d.getDate() - i)
    out.push(todayKey(d))
  }
  return out
}

/** Convierte una clave YYYY-MM-DD en Date local (sin sorpresas de UTC). */
export function parseKey(key) {
  const [y, m, d] = String(key).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/** Clave del dia anterior a una clave dada. */
export function previousKey(key) {
  const d = parseKey(key)
  d.setDate(d.getDate() - 1)
  return todayKey(d)
}
