import { Dices, Clock } from 'lucide-react'
import { CATEGORIES } from '../data/categories.js'
import PixelCheck from './PixelCheck.jsx'

/**
 * Una tarjeta de mision con su checkbox retro. El checkbox es el boton
 * principal: toda la fila superior es clickeable.
 */
export default function MissionCard({ mission, index, onToggle, onReroll, canReroll, locked }) {
  const cat = CATEGORIES[mission.cat]
  const { done } = mission

  return (
    <li
      className={`pixel-frame relative bg-crt-900 p-3 transition-opacity sm:p-4 ${done ? 'opacity-70' : ''}`}
      style={{ '--frame-c': cat.color }}
    >
      <div className="flex items-start gap-3">
        {/* --- CHECKBOX RETRO --- */}
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={`Marcar "${mission.title}" como cumplida`}
          onClick={() => onToggle(index)}
          disabled={locked}
          className="focus-pixel mt-0.5 flex size-9 shrink-0 items-center justify-center transition-transform active:translate-y-0.5 disabled:cursor-not-allowed"
          style={{
            background: done ? cat.color : '#0d0814',
            boxShadow: `0 -3px 0 0 ${cat.color}, 0 3px 0 0 ${cat.color}, -3px 0 0 0 ${cat.color}, 3px 0 0 0 ${cat.color}`,
          }}
        >
          {done && <PixelCheck color="#0d0814" scale={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className="font-label text-[9px] tracking-[0.2em]"
            style={{ color: cat.color }}
          >
            <span aria-hidden="true">{cat.reel}</span> {cat.short}
          </p>

          <h3
            className={`mt-1.5 font-pixel text-[10px] leading-5 sm:text-[11px] sm:leading-6 ${done ? 'text-crt-600 line-through decoration-4' : 'text-white'}`}
          >
            {mission.title}
          </h3>

          <p className="mt-1.5 font-screen text-lg leading-5 text-neon-cyan/85 sm:text-xl">
            {mission.desc}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-label text-[9px] tracking-widest">
            <span className="flex items-center gap-1.5 text-neon-cyan/70">
              <Clock size={11} strokeWidth={3} aria-hidden="true" /> {mission.mins} MIN
            </span>
            <span className="text-neon-yellow">+{mission.pts} PTS</span>

            {canReroll && !done && (
              <button
                type="button"
                onClick={() => onReroll(index)}
                className="focus-pixel ml-auto flex items-center gap-1.5 bg-crt-800 px-2 py-1 font-label text-[9px] tracking-widest text-neon-violet transition-colors hover:bg-crt-700"
              >
                <Dices size={12} strokeWidth={3} aria-hidden="true" /> RE-ROLL
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
