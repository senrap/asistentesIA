/**
 * El tubo: fondo oscuro, curvatura simulada, scanlines y una linea de barrido
 * que baja cada tanto. Todo el juego pasa adentro de este marco.
 */
export default function CRTScreen({ children }) {
  return (
    <div className="relative overflow-hidden rounded-[18px] bg-crt-950 p-[3px]">
      <div className="animate-flicker relative min-h-[420px] rounded-[16px] bg-linear-to-b from-crt-900 via-crt-950 to-crt-900 px-4 py-5 sm:px-7 sm:py-7">
        {children}
      </div>

      {/* Capas del tubo: scanlines, vineta y barrido */}
      <div className="crt-overlay pointer-events-none absolute inset-0 rounded-[16px]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[16px]" aria-hidden="true">
        <div className="animate-scan h-6 w-full bg-linear-to-b from-transparent via-white/6 to-transparent" />
      </div>
    </div>
  )
}
