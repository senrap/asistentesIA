import { Flame, Star, Target } from 'lucide-react'
import { DAILY_MISSIONS } from '../lib/game.js'
import { displayDate, lastDays, todayKey } from '../lib/date.js'

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div
      className="pixel-frame flex-1 bg-crt-950 px-2 py-2 text-center"
      style={{ '--frame-c': color }}
    >
      <p className="flex items-center justify-center gap-1 font-label text-[8px] tracking-widest text-white/60">
        <Icon size={10} strokeWidth={3} aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1 font-pixel text-[13px] text-glow-soft" style={{ color }}>
        {value}
      </p>
    </div>
  )
}

/** Tira de los ultimos 14 dias: lleno = combo day, hueco = dia flojo. */
function StreakStrip({ history }) {
  const days = lastDays(14)
  const today = todayKey()

  return (
    <div className="mt-3 flex items-center gap-1.5">
      <span className="font-label text-[8px] tracking-widest text-white/40">14D</span>
      <div className="flex flex-1 gap-[3px]">
        {days.map((d) => {
          const entry = history[d]
          const closed = entry?.closed
          const partial = entry && entry.done > 0 && !closed
          return (
            <i
              key={d}
              title={d}
              className={`h-3 flex-1 ${
                closed
                  ? entry.wildcard
                    ? 'bg-neon-violet'
                    : 'bg-neon-lime'
                  : partial
                    ? 'bg-neon-yellow/60'
                    : 'bg-crt-700'
              } ${d === today ? 'outline-2 outline-offset-1 outline-neon-cyan/60' : ''}`}
            />
          )
        })}
      </div>
    </div>
  )
}

/** Marcador superior de la partida del dia. */
export default function Hud({ state, done }) {
  return (
    <header>
      <div className="mb-3 flex items-center justify-between font-label text-[9px] tracking-[0.25em]">
        <span className="text-neon-cyan/80">{displayDate()}</span>
        <span className="text-neon-magenta">1UP</span>
      </div>

      <div className="flex gap-3">
        <Stat icon={Flame} label="RACHA" value={state.streak} color="#ff7b00" />
        <Stat icon={Star} label="PTS" value={state.points} color="#ffe600" />
        <Stat icon={Target} label="HOY" value={`${done}/${DAILY_MISSIONS}`} color="#39ff14" />
      </div>

      <StreakStrip history={state.history} />
    </header>
  )
}
