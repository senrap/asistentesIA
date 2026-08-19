import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DAILY_MISSIONS,
  closeDay,
  createState,
  hydrate,
  isDayComplete,
  rerollAt,
  rollMissions,
  rollOverDay,
} from '../src/lib/game.js'
import { earnedPetIds } from '../src/data/pets.js'
import { previousKey, todayKey } from '../src/lib/date.js'

const allDone = (missions) => missions.map((m) => ({ ...m, done: true }))

function closedDayAt(day) {
  const state = { ...createState(day), missions: allDone(rollMissions()) }
  return closeDay(state)
}

test('el sorteo diario da 3 misiones de categorias distintas', () => {
  for (let i = 0; i < 200; i++) {
    const missions = rollMissions()
    assert.equal(missions.length, DAILY_MISSIONS)
    assert.equal(new Set(missions.map((m) => m.cat)).size, DAILY_MISSIONS)
    assert.ok(missions.every((m) => m.done === false))
  }
})

test('el re-roll reemplaza la mision elegida y no repite categoria', () => {
  const missions = rollMissions()
  const next = rerollAt(missions, 1)
  assert.notEqual(next[1].id, missions[1].id)
  assert.equal(next[0].id, missions[0].id)
  assert.equal(next[2].id, missions[2].id)
  assert.equal(new Set(next.map((m) => m.cat)).size, DAILY_MISSIONS)
  assert.equal(next[1].done, false)
})

test('el dia se cierra con 3/3 o con el comodin', () => {
  const partial = { ...createState('2026-01-10'), missions: rollMissions() }
  assert.equal(isDayComplete(partial), false)
  assert.equal(isDayComplete({ ...partial, missions: allDone(partial.missions) }), true)
  assert.equal(isDayComplete({ ...partial, wildcardUsed: true }), true)
})

test('la racha encadena dias consecutivos', () => {
  const day1 = closedDayAt('2026-01-10')
  assert.equal(day1.streak, 1)

  const day2 = closeDay({ ...rollOverDay(day1, '2026-01-11'), missions: allDone(rollMissions()) })
  assert.equal(day2.streak, 2)
  assert.equal(day2.bestStreak, 2)
})

test('saltear un dia entero reinicia la racha', () => {
  const day1 = closedDayAt('2026-01-10')
  assert.equal(rollOverDay(day1, '2026-01-12').streak, 0)
})

test('un dia sin cerrar todavia no rompe la racha', () => {
  const day1 = closedDayAt('2026-01-10')
  const day2 = rollOverDay(day1, '2026-01-11')
  assert.equal(day2.streak, 1)
  assert.equal(day2.coinInserted, false)
  assert.equal(day2.missions.length, 0)
  assert.equal(day2.rerollsLeft, 1)
  assert.equal(day2.wildcardUsed, false)
})

test('el cambio de dia archiva el resultado anterior en el historial', () => {
  const day1 = closedDayAt('2026-01-10')
  const day2 = rollOverDay(day1, '2026-01-11')
  assert.deepEqual(day2.history['2026-01-10'], {
    done: DAILY_MISSIONS,
    total: DAILY_MISSIONS,
    wildcard: false,
    closed: true,
  })
})

test('hydrate tolera basura en localStorage y arranca de cero', () => {
  assert.equal(hydrate(null).points, 0)
  assert.equal(hydrate('roto').streak, 0)
  assert.equal(hydrate({ points: 42, day: todayKey() }).points, 42)
})

test('hydrate ajusta la racha si el usuario volvio despues de un hueco', () => {
  const stale = { ...closedDayAt(previousKey(previousKey(todayKey()))) }
  assert.equal(hydrate(stale).streak, 0)

  const yesterday = { ...closedDayAt(previousKey(todayKey())) }
  assert.equal(hydrate(yesterday).streak, 1)
})

test('las mascotas se desbloquean por racha, puntos o misiones', () => {
  assert.deepEqual(earnedPetIds({ streak: 0, points: 0, totalCompleted: 0 }), [])
  assert.ok(earnedPetIds({ streak: 1, points: 0, totalCompleted: 0 }).includes('cactus-gamer'))
  assert.ok(earnedPetIds({ streak: 3, points: 0, totalCompleted: 0 }).includes('rana-zen'))
  assert.ok(earnedPetIds({ streak: 0, points: 150, totalCompleted: 0 }).includes('gato-crt'))
  assert.ok(earnedPetIds({ streak: 0, points: 0, totalCompleted: 25 }).includes('pulpo-multitask'))
})
