import { Sparkles } from 'lucide-react'
import Hud from './Hud.jsx'
import MissionCard from './MissionCard.jsx'
import { COMBO_BONUS, WILDCARD_TASK } from '../lib/game.js'

/**
 * Pantalla de juego: marcador, las 3 misiones del dia y las dos valvulas de
 * escape (re-roll y comodin travieso).
 */
export default function MissionPanel({
  state,
  done,
  dayComplete,
  onToggle,
  onReroll,
  onWildcard,
}) {
  const canReroll = state.rerollsLeft > 0 && !state.wildcardUsed

  return (
    <div className="py-1">
      <Hud state={state} done={done} />

      {state.wildcardUsed ? (
        <div
          className="pixel-frame mt-5 bg-crt-900 p-4 text-center"
          style={{ '--frame-c': '#b76bff' }}
        >
          <p className="font-pixel text-[11px] leading-6 text-neon-violet text-glow">
            COMODIN TRAVIESO USADO
          </p>
          <p className="mt-3 font-screen text-xl leading-6 text-white/80">
            Hoy tu única misión era respirar tres veces. La racha quedó a salvo y nadie te va a
            pedir explicaciones.
          </p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {state.missions.map((mission, i) => (
            <MissionCard
              key={`${mission.id}-${i}`}
              mission={mission}
              index={i}
              onToggle={onToggle}
              onReroll={onReroll}
              canReroll={canReroll}
              locked={state.wildcardUsed}
            />
          ))}
        </ul>
      )}

      {/* --- BANNER DE DIA COMPLETO --- */}
      {dayComplete && (
        <div
          className="pixel-frame animate-pop mt-5 bg-crt-950 p-4 text-center"
          style={{ '--frame-c': '#39ff14' }}
        >
          <p className="font-pixel text-[12px] leading-6 text-neon-lime text-glow sm:text-sm">
            COMBO DAY x{state.streak}
          </p>
          <p className="mt-3 font-screen text-xl leading-6 text-neon-yellow">
            {state.wildcardUsed
              ? 'Día salvado con el comodín. Mañana volvés con todo.'
              : `¡3 de 3! Bonus de +${COMBO_BONUS} PTS y la racha sube.`}
          </p>
        </div>
      )}

      {/* --- PIE DE CONTROLES --- */}
      <div className="mt-5 flex flex-col gap-3 border-t-4 border-crt-700 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-label text-[9px] leading-4 tracking-widest text-white/50">
          RE-ROLLS: <span className="text-neon-violet">{state.rerollsLeft}</span> / 1 POR DIA
        </p>

        <button
          type="button"
          onClick={onWildcard}
          disabled={state.wildcardUsed}
          className="pixel-btn flex items-center justify-center gap-2 bg-neon-violet px-4 py-3 font-pixel text-[9px] text-crt-950"
          style={{ '--btn-edge': '#0d0814', '--btn-shadow': '#4a2170' }}
        >
          <Sparkles size={13} strokeWidth={3} aria-hidden="true" />
          {state.wildcardUsed ? 'COMODIN USADO' : `COMODIN TRAVIESO (${WILDCARD_TASK.seconds}s)`}
        </button>
      </div>
    </div>
  )
}
