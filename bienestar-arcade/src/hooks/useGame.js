import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  COMBO_BONUS,
  DAILY_MISSIONS,
  STORAGE_KEY,
  closeDay,
  completedCount,
  createState,
  hydrate,
  isDayComplete,
  newlyUnlocked,
  rerollAt,
  rollMissions,
  rollOverDay,
  writeHistory,
  WILDCARD_TASK,
} from '../lib/game.js'
import { PETS } from '../data/pets.js'
import { todayKey } from '../lib/date.js'
import { play, setMuted } from '../lib/audio.js'

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return hydrate(raw ? JSON.parse(raw) : null)
  } catch {
    return createState()
  }
}

/** Tras cada accion, registra el dia y anota las mascotas recien ganadas. */
function settle(state) {
  const unlocked = [...state.unlocked, ...newlyUnlocked(state)]
  return writeHistory({ ...state, unlocked })
}

function reducer(state, action) {
  switch (action.type) {
    case 'insert-coin': {
      if (state.coinInserted) return state
      return settle({ ...state, coinInserted: true, missions: rollMissions(DAILY_MISSIONS) })
    }

    case 'toggle': {
      const { index } = action
      const target = state.missions[index]
      if (!target || state.wildcardUsed) return state

      const done = !target.done
      const missions = state.missions.map((m, i) => (i === index ? { ...m, done } : m))
      let next = {
        ...state,
        missions,
        points: Math.max(0, state.points + (done ? target.pts : -target.pts)),
        totalCompleted: Math.max(0, state.totalCompleted + (done ? 1 : -1)),
      }

      const all = missions.filter((m) => m.done).length >= DAILY_MISSIONS
      if (all && !next.comboBonusGiven) {
        next = closeDay({ ...next, points: next.points + COMBO_BONUS, comboBonusGiven: true })
      } else if (!all && next.comboBonusGiven) {
        // Se desmarco una mision: se devuelve el bonus, pero el combo day ya esta ganado.
        next = { ...next, points: Math.max(0, next.points - COMBO_BONUS), comboBonusGiven: false }
      }

      return settle(next)
    }

    case 'reroll': {
      if (state.rerollsLeft <= 0 || state.wildcardUsed) return state
      const target = state.missions[action.index]
      if (!target || target.done) return state
      return settle({
        ...state,
        missions: rerollAt(state.missions, action.index),
        rerollsLeft: state.rerollsLeft - 1,
      })
    }

    case 'wildcard': {
      if (state.wildcardUsed) return state
      return settle(
        closeDay({ ...state, wildcardUsed: true, points: state.points + WILDCARD_TASK.pts }),
      )
    }

    case 'rollover':
      return rollOverDay(state, action.day)

    case 'mute':
      return { ...state, muted: action.value }

    case 'reset':
      return createState()

    default:
      return state
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, null, readStorage)
  const [celebrating, setCelebrating] = useState(null)
  const knownPets = useRef(state.unlocked)

  // Persistencia: LocalStorage alcanza para el MVP.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* modo incognito lleno o storage bloqueado: el juego sigue en memoria */
    }
  }, [state])

  useEffect(() => {
    setMuted(state.muted)
  }, [state.muted])

  // Si la app queda abierta y cruza la medianoche, arranca un dia nuevo sola.
  useEffect(() => {
    const tick = () => {
      const day = todayKey()
      if (day !== state.day) dispatch({ type: 'rollover', day })
    }
    const id = setInterval(tick, 30_000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [state.day])

  // Una mascota nueva merece su pantalla de celebracion.
  useEffect(() => {
    const fresh = state.unlocked.filter((id) => !knownPets.current.includes(id))
    knownPets.current = state.unlocked
    if (fresh.length) {
      const pet = PETS.find((p) => p.id === fresh[fresh.length - 1])
      if (pet) {
        setCelebrating(pet)
        play('unlock', [18, 40, 18, 40, 60])
      }
    }
  }, [state.unlocked])

  const done = completedCount(state)
  const dayComplete = isDayComplete(state)

  const actions = useMemo(
    () => ({
      insertCoin: () => dispatch({ type: 'insert-coin' }),
      toggle: (index) => dispatch({ type: 'toggle', index }),
      reroll: (index) => dispatch({ type: 'reroll', index }),
      useWildcard: () => dispatch({ type: 'wildcard' }),
      setMuted: (value) => dispatch({ type: 'mute', value }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [],
  )

  const dismissCelebration = useCallback(() => setCelebrating(null), [])

  return { state, done, dayComplete, celebrating, dismissCelebration, ...actions }
}
