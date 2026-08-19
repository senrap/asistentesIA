import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/** Ventana modal con marco pixelado, cierre con Escape y foco atrapado basico. */
export default function Modal({ children, onClose, color = '#00f0ff', label, dismissable = true }) {
  const ref = useRef(null)

  useEffect(() => {
    ref.current?.focus()
    if (!dismissable) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, dismissable])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-crt-950/88 p-4"
      onClick={dismissable ? onClose : undefined}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className="pixel-frame-thick relative max-h-[85vh] w-full max-w-md overflow-y-auto bg-crt-800 p-5 outline-hidden sm:p-6"
        style={{ '--frame-c': color }}
      >
        {dismissable && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="focus-pixel absolute right-3 top-3 bg-crt-950 p-1.5 text-white/70 transition-colors hover:text-neon-magenta"
          >
            <X size={14} strokeWidth={3} />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
