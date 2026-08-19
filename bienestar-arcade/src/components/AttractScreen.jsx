import { CATEGORY_LIST } from '../data/categories.js'
import { displayDate } from '../lib/date.js'

/**
 * Modo atraccion: lo que se ve antes de pagar la moneda del dia.
 */
export default function AttractScreen({ state, onInsertCoin }) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <p className="font-label text-[10px] tracking-[0.35em] text-neon-cyan/80">
        {displayDate()}
      </p>

      <h2 className="mt-5 font-pixel text-xl leading-8 text-neon-yellow text-glow sm:text-3xl sm:leading-12">
        READY
        <br />
        PLAYER
        <br />
        <span className="text-neon-magenta">ONE</span>
      </h2>

      <p className="mt-5 max-w-sm font-screen text-xl leading-6 text-neon-lime/90 sm:text-2xl">
        Pagá una moneda y la máquina te tira 3 misiones traviesas de 1 a 5 minutos.
      </p>

      {/* Rodillos quietos: adelanto de las 5 familias de misiones */}
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {CATEGORY_LIST.map((c) => (
          <li
            key={c.id}
            className="pixel-frame bg-crt-950 px-2.5 py-1.5 font-label text-[9px] tracking-widest"
            style={{ '--frame-c': c.color, color: c.color }}
            title={c.tagline}
          >
            <span aria-hidden="true">{c.reel}</span> {c.short}
          </li>
        ))}
      </ul>

      {/* --- LA PALANCA / RANURA DE MONEDAS --- */}
      <button
        type="button"
        onClick={onInsertCoin}
        className="pixel-btn mt-8 bg-neon-magenta px-6 py-4 font-pixel text-xs text-white sm:px-10 sm:text-sm"
        style={{ '--btn-edge': '#0d0814', '--btn-shadow': '#7a0040' }}
      >
        <span className="animate-blink">▸</span> INSERT COIN / START{' '}
        <span className="animate-blink">◂</span>
      </button>

      <div className="mt-7 flex w-full max-w-sm items-center justify-between gap-3 border-t-4 border-crt-700 pt-4 font-label text-[10px] tracking-widest">
        <span className="text-neon-orange">
          RACHA <span className="text-neon-yellow">{state.streak}</span>
        </span>
        <span className="text-neon-cyan/70">
          HI-SCORE <span className="text-neon-cyan">{state.points}</span>
        </span>
        <span className="text-neon-violet">
          BEST <span className="text-neon-yellow">{state.bestStreak}</span>
        </span>
      </div>
    </div>
  )
}
