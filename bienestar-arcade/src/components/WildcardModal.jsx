import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { WILDCARD_TASK } from '../lib/game.js'
import { play } from '../lib/audio.js'

/**
 * El bypass sin culpa: una micro-tarea de 10 segundos que salva la racha
 * cuando el dia vino imposible.
 */
export default function WildcardModal({ onClose, onComplete }) {
  const [phase, setPhase] = useState('intro') // intro | breathing | done
  const [left, setLeft] = useState(WILDCARD_TASK.seconds)

  useEffect(() => {
    if (phase !== 'breathing') return
    if (left <= 0) {
      setPhase('done')
      play('win', [20, 40, 20])
      return
    }
    const id = setTimeout(() => {
      setLeft((n) => n - 1)
      if (left % 3 === 0) play('breathe', 0)
    }, 1000)
    return () => clearTimeout(id)
  }, [phase, left])

  return (
    <Modal onClose={onClose} color="#b76bff" label="Comodín travieso" dismissable={phase !== 'breathing'}>
      <p className="font-label text-[9px] tracking-[0.3em] text-neon-violet">COMODIN TRAVIESO</p>

      {phase === 'intro' && (
        <>
          <h2 className="mt-3 font-pixel text-[13px] leading-6 text-white">
            {WILDCARD_TASK.title}
          </h2>
          <p className="mt-4 font-screen text-xl leading-6 text-neon-cyan/90">
            {WILDCARD_TASK.desc} Sirve para los días que salieron mal: la racha se conserva y las
            misiones de hoy quedan como estén.
          </p>
          <button
            type="button"
            onClick={() => {
              play('select')
              setPhase('breathing')
            }}
            className="pixel-btn mt-6 w-full bg-neon-violet px-4 py-3 font-pixel text-[10px] text-crt-950"
            style={{ '--btn-edge': '#0d0814', '--btn-shadow': '#4a2170' }}
          >
            EMPEZAR ({WILDCARD_TASK.seconds}s)
          </button>
        </>
      )}

      {phase === 'breathing' && (
        <div className="py-6 text-center">
          <div
            className="animate-float mx-auto flex size-28 items-center justify-center bg-crt-950"
            style={{
              boxShadow: '0 -6px 0 0 #b76bff, 0 6px 0 0 #b76bff, -6px 0 0 0 #b76bff, 6px 0 0 0 #b76bff',
            }}
          >
            <span className="font-pixel text-2xl text-neon-violet text-glow">{left}</span>
          </div>
          <p className="mt-6 font-screen text-2xl leading-7 text-white/90">
            {left > 6 ? 'Inhalá despacio...' : left > 3 ? 'Sostené...' : 'Soltá todo el aire.'}
          </p>
        </div>
      )}

      {phase === 'done' && (
        <div className="py-4 text-center">
          <h2 className="animate-pop font-pixel text-sm leading-7 text-neon-lime text-glow">
            RACHA SALVADA
          </h2>
          <p className="mt-4 font-screen text-xl leading-6 text-neon-cyan/90">
            Tres respiraciones y listo. +{WILDCARD_TASK.pts} PTS y el día cuenta igual. Sin culpa.
          </p>
          <button
            type="button"
            onClick={onComplete}
            className="pixel-btn mt-6 w-full bg-neon-lime px-4 py-3 font-pixel text-[10px] text-crt-950"
            style={{ '--btn-edge': '#0d0814', '--btn-shadow': '#1a7a0c' }}
          >
            CONTINUE
          </button>
        </div>
      )}
    </Modal>
  )
}
