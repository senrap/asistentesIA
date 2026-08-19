import { MISSIONS, MISSIONS_BY_CAT, WILDCARD_TASK } from '../data/missions.js'
import { CATEGORY_LIST } from '../data/categories.js'
import { earnedPetIds } from '../data/pets.js'
import { todayKey, previousKey } from './date.js'

export const STORAGE_KEY = 'bienestar-arcade:v1'
export const STATE_VERSION = 1
export const DAILY_MISSIONS = 3
export const DAILY_REROLLS = 1
export const COMBO_BONUS = 30
export const HISTORY_DAYS = 30

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)]

function shuffle(arr) {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Estado limpio: se usa la primera vez y cuando localStorage viene roto. */
export function createState(day = todayKey()) {
  return {
    version: STATE_VERSION,
    day,
    coinInserted: false,
    missions: [],
    rerollsLeft: DAILY_REROLLS,
    wildcardUsed: false,
    dayClosed: false,
    comboBonusGiven: false,
    streak: 0,
    bestStreak: 0,
    points: 0,
    totalCompleted: 0,
    lastComboDay: null,
    unlocked: [],
    muted: false,
    history: {},
  }
}

/**
 * Sortea las misiones del dia: 3 categorias distintas, una mision de cada una.
 * Asi nunca salen tres sentadillas seguidas.
 */
export function rollMissions(count = DAILY_MISSIONS) {
  const cats = shuffle(CATEGORY_LIST.map((c) => c.id)).slice(0, count)
  return cats.map((cat) => ({ ...sample(MISSIONS_BY_CAT[cat]), done: false }))
}

/**
 * Reemplaza una mision por otra: primero busca una categoria que hoy no salio,
 * y si no queda ninguna libre cae en otra mision de la misma categoria.
 */
export function rerollAt(missions, index) {
  const current = missions[index]
  const usedCats = new Set(missions.map((m) => m.cat))
  const freeCats = CATEGORY_LIST.map((c) => c.id).filter((c) => !usedCats.has(c))

  const pool = freeCats.length
    ? MISSIONS_BY_CAT[sample(freeCats)]
    : MISSIONS_BY_CAT[current.cat].filter((m) => m.id !== current.id)

  const next = { ...sample(pool.length ? pool : MISSIONS), done: false }
  return missions.map((m, i) => (i === index ? next : m))
}

/** Un dia se considera "combo day" con 3/3 misiones o con el comodin activado. */
export function isDayComplete(state) {
  return state.wildcardUsed || state.missions.filter((m) => m.done).length >= DAILY_MISSIONS
}

export function completedCount(state) {
  return state.missions.filter((m) => m.done).length
}

/** Marca el dia como cumplido y encadena (o reinicia) la racha. */
export function closeDay(state) {
  if (state.dayClosed) return state
  const streak = state.lastComboDay === previousKey(state.day) ? state.streak + 1 : 1
  return {
    ...state,
    dayClosed: true,
    lastComboDay: state.day,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
  }
}

/** Guarda el resultado del dia en el historial y lo recorta a los ultimos 30. */
export function writeHistory(state) {
  const history = {
    ...state.history,
    [state.day]: {
      done: completedCount(state),
      total: DAILY_MISSIONS,
      wildcard: state.wildcardUsed,
      closed: state.dayClosed,
    },
  }
  const keys = Object.keys(history).sort()
  const extra = keys.length - HISTORY_DAYS
  if (extra > 0) keys.slice(0, extra).forEach((k) => delete history[k])
  return { ...state, history }
}

/** Devuelve las mascotas recien desbloqueadas por el progreso actual. */
export function newlyUnlocked(state) {
  const earned = earnedPetIds(state)
  return earned.filter((id) => !state.unlocked.includes(id))
}

/**
 * Cambio de dia: se archiva el dia anterior, se reinician las misiones y,
 * si el usuario se salteo un dia entero, la racha vuelve a cero.
 */
export function rollOverDay(state, day = todayKey()) {
  if (state.day === day) return state
  const archived = writeHistory(state)
  const keepStreak = archived.lastComboDay === day || archived.lastComboDay === previousKey(day)
  return {
    ...archived,
    day,
    coinInserted: false,
    missions: [],
    rerollsLeft: DAILY_REROLLS,
    wildcardUsed: false,
    dayClosed: false,
    comboBonusGiven: false,
    streak: keepStreak ? archived.streak : 0,
  }
}

/** Migra/valida lo que haya en localStorage sin tirar el progreso viejo. */
export function hydrate(raw, day = todayKey()) {
  if (!raw || typeof raw !== 'object') return createState(day)
  const base = { ...createState(raw.day || day), ...raw }
  base.missions = Array.isArray(base.missions) ? base.missions : []
  base.unlocked = Array.isArray(base.unlocked) ? base.unlocked : []
  base.history = base.history && typeof base.history === 'object' ? base.history : {}
  base.version = STATE_VERSION
  return rollOverDay(base, day)
}

export { WILDCARD_TASK }
