/**
 * Chiptune casero con Web Audio API: ondas cuadradas, sin assets externos.
 * El AudioContext se crea recien en el primer gesto del usuario para no
 * pelearse con las politicas de autoplay del navegador.
 */
let ctx = null
let muted = false

function getCtx() {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || window.webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function setMuted(value) {
  muted = value
}

export function isMuted() {
  return muted
}

/** Una nota cuadrada con envolvente corta, al estilo de un chip de 8 bits. */
function tone({ freq, start = 0, duration = 0.09, type = 'square', gain = 0.16, sweepTo }) {
  const ac = getCtx()
  if (!ac) return
  const t0 = ac.currentTime + start
  const osc = ac.createOscillator()
  const amp = ac.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + duration)

  amp.gain.setValueAtTime(0.0001, t0)
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.008)
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)

  osc.connect(amp).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

/** Ruido blanco filtrado: sirve para los rodillos girando. */
function noise({ duration = 0.06, gain = 0.05, start = 0 }) {
  const ac = getCtx()
  if (!ac) return
  const frames = Math.floor(ac.sampleRate * duration)
  const buffer = ac.createBuffer(1, frames, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)

  const src = ac.createBufferSource()
  const amp = ac.createGain()
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1800

  amp.gain.value = gain
  src.buffer = buffer
  src.connect(filter).connect(amp).connect(ac.destination)
  src.start(ac.currentTime + start)
}

const SFX = {
  blip: () => tone({ freq: 620, duration: 0.05, gain: 0.1 }),
  select: () => {
    tone({ freq: 520, duration: 0.05 })
    tone({ freq: 780, duration: 0.06, start: 0.05 })
  },
  coin: () => {
    tone({ freq: 988, duration: 0.07, gain: 0.18 })
    tone({ freq: 1319, duration: 0.22, start: 0.07, gain: 0.18 })
  },
  lever: () => {
    tone({ freq: 180, duration: 0.14, sweepTo: 70, type: 'sawtooth', gain: 0.14 })
    noise({ duration: 0.12, gain: 0.06 })
  },
  reel: () => noise({ duration: 0.05, gain: 0.045 }),
  check: () => {
    tone({ freq: 784, duration: 0.06 })
    tone({ freq: 1175, duration: 0.09, start: 0.06 })
  },
  uncheck: () => tone({ freq: 300, duration: 0.08, sweepTo: 180, gain: 0.1 }),
  reroll: () => {
    tone({ freq: 440, duration: 0.05, gain: 0.12 })
    tone({ freq: 660, duration: 0.05, start: 0.05, gain: 0.12 })
    tone({ freq: 880, duration: 0.08, start: 0.1, gain: 0.12 })
  },
  win: () => {
    const notes = [523, 659, 784, 1047, 1319]
    notes.forEach((f, i) => tone({ freq: f, duration: 0.12, start: i * 0.09, gain: 0.17 }))
  },
  unlock: () => {
    const notes = [659, 784, 988, 1319, 1568, 2093]
    notes.forEach((f, i) => tone({ freq: f, duration: 0.14, start: i * 0.07, gain: 0.15 }))
  },
  breathe: () => tone({ freq: 320, duration: 0.5, sweepTo: 480, type: 'sine', gain: 0.1 }),
  error: () => {
    tone({ freq: 200, duration: 0.12, type: 'sawtooth', gain: 0.12 })
    tone({ freq: 140, duration: 0.16, start: 0.1, type: 'sawtooth', gain: 0.12 })
  },
}

/** Reproduce un efecto y, si el dispositivo lo soporta, vibra un toque. */
export function play(name, haptic = 12) {
  if (muted) return
  try {
    SFX[name]?.()
  } catch {
    /* si el audio falla, el juego sigue igual */
  }
  if (haptic && typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(haptic)
    } catch {
      /* ignorado */
    }
  }
}
