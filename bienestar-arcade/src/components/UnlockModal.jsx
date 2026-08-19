import Modal from './Modal.jsx'
import PixelSprite from './PixelSprite.jsx'

/** Celebracion cuando se desbloquea una mascota nueva. */
export default function UnlockModal({ pet, onClose }) {
  return (
    <Modal onClose={onClose} color="#ffe600" label={`Nueva mascota: ${pet.name}`}>
      <div className="text-center">
        <p className="animate-blink font-pixel text-[10px] tracking-widest text-neon-yellow">
          ★ NEW SPRITE UNLOCKED ★
        </p>

        <div className="my-6 flex justify-center">
          <PixelSprite pet={pet} scale={9} className="animate-float" />
        </div>

        <h2 className="font-pixel text-[13px] leading-6 text-neon-cyan text-glow">{pet.name}</h2>
        <p className="mt-3 font-screen text-xl leading-6 text-white/85">{pet.tagline}</p>
        <p className="mt-2 font-label text-[9px] tracking-widest text-neon-lime">
          {pet.unlock.label}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="pixel-btn mt-6 w-full bg-neon-yellow px-4 py-3 font-pixel text-[10px] text-crt-950"
          style={{ '--btn-edge': '#0d0814', '--btn-shadow': '#8a7d00' }}
        >
          GENIAL
        </button>
      </div>
    </Modal>
  )
}
