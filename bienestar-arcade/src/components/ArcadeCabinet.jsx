import { Volume2, VolumeX, Trophy } from 'lucide-react'

/**
 * El mueble de la maquina: marquesina arriba, tubo en el medio y el tablero de
 * control abajo. Todo el layout de la app cuelga de aca.
 */
export default function ArcadeCabinet({ children, muted, onToggleMute, onOpenGallery, unlockedCount, totalPets }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-3 pb-10 pt-5 sm:px-5">
      {/* --- MARQUESINA --- */}
      <div
        className="pixel-frame relative mb-5 bg-crt-800 px-4 py-4 text-center sm:px-8"
        style={{ '--frame-c': '#ff007f' }}
      >
        <div
          className="box-glow absolute inset-0 opacity-40"
          style={{ '--glow-c': '#ff007f' }}
          aria-hidden="true"
        />
        <h1 className="relative font-pixel text-[13px] leading-6 text-neon-cyan text-glow sm:text-lg sm:leading-8">
          BIENESTAR
          <span className="text-neon-magenta"> ARCADE</span>
        </h1>
        <p className="relative mt-2 font-label text-[10px] tracking-widest text-neon-lime sm:text-xs">
          HABITOS TRAVIESOS · 3 MISIONES POR DIA
        </p>
      </div>

      {/* --- BISEL + TUBO --- */}
      <div
        className="pixel-frame-thick relative bg-crt-700 p-3 sm:p-4"
        style={{ '--frame-c': '#00f0ff' }}
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="flex gap-1.5" aria-hidden="true">
            <i className="block size-2 bg-neon-magenta" />
            <i className="block size-2 bg-neon-yellow" />
            <i className="block size-2 bg-neon-lime" />
          </span>
          <span className="font-label text-[9px] tracking-[0.3em] text-neon-cyan/70">
            MODEL BA-1986
          </span>
        </div>

        {children}

        {/* --- TABLERO DE CONTROL --- */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t-4 border-crt-600 pt-4">
          <button
            type="button"
            onClick={onOpenGallery}
            className="focus-pixel flex items-center gap-2 bg-crt-900 px-3 py-2 font-pixel text-[9px] text-neon-yellow transition-colors hover:bg-crt-600"
            style={{ '--frame-c': '#ffe600' }}
          >
            <Trophy size={14} strokeWidth={3} aria-hidden="true" />
            COLECCION {unlockedCount}/{totalPets}
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-pressed={muted}
            aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
            className="focus-pixel bg-crt-900 p-2 text-neon-cyan transition-colors hover:bg-crt-600"
          >
            {muted ? <VolumeX size={16} strokeWidth={3} /> : <Volume2 size={16} strokeWidth={3} />}
          </button>
        </div>
      </div>

      <p className="mt-5 text-center font-label text-[9px] leading-5 tracking-widest text-crt-600">
        INSERT COIN · PLAY NICE WITH YOUR BODY · 1986—∞
      </p>
    </div>
  )
}
