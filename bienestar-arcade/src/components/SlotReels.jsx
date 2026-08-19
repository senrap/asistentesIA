import { useEffect, useRef, useState } from 'react'
import { CATEGORY_LIST } from '../data/categories.js'
import { play } from '../lib/audio.js'

const SPIN_MS = 1500
const TICK_MS = 90

/**
 * Los tres rodillos girando despues de la moneda. Es puro teatro: el sorteo
 * real ya ocurrio en el reducer, esto le da el tiempo de suspenso.
 */
export default function SlotReels({ missions, onDone }) {
  const [frame, setFrame] = useState(0)
  const [stopped, setStopped] = useState(0)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    const spin = setInterval(() => {
      setFrame((f) => f + 1)
      play('reel', 0)
    }, TICK_MS)

    // Los rodillos frenan de a uno, como corresponde.
    const stops = [0, 1, 2].map((i) =>
      setTimeout(
        () => {
          setStopped(i + 1)
          play('select', 10)
        },
        SPIN_MS * 0.45 + i * 320,
      ),
    )
    const end = setTimeout(() => doneRef.current(), SPIN_MS * 0.45 + 3 * 320 + 420)

    return () => {
      clearInterval(spin)
      stops.forEach(clearTimeout)
      clearTimeout(end)
    }
  }, [])

  return (
    <div className="flex flex-col items-center py-10 text-center">
      <p className="font-pixel text-[11px] text-neon-yellow text-glow">SORTEANDO MISIONES...</p>

      <div className="mt-8 flex gap-2 sm:gap-4">
        {missions.map((mission, i) => {
          const cat = stopped > i ? CATEGORY_LIST.find((c) => c.id === mission.cat) : CATEGORY_LIST[(frame + i * 2) % CATEGORY_LIST.length]
          return (
            <div
              key={i}
              className="pixel-frame flex size-20 items-center justify-center bg-crt-950 sm:size-24"
              style={{ '--frame-c': cat.color }}
            >
              <span
                className={`font-pixel text-2xl sm:text-3xl ${stopped > i ? 'animate-pop text-glow' : 'animate-reel'}`}
                style={{ color: cat.color }}
                aria-hidden="true"
              >
                {cat.reel}
              </span>
            </div>
          )
        })}
      </div>

      <p className="mt-8 font-screen text-xl text-neon-cyan/80">
        {stopped < 3 ? 'La máquina está eligiendo por vos...' : '¡Listo! Ahí van tus 3 misiones.'}
      </p>
    </div>
  )
}
