import Modal from './Modal.jsx'
import PixelSprite from './PixelSprite.jsx'
import { PETS } from '../data/pets.js'

/** Vitrina de coleccionables: lo desbloqueado y lo que falta. */
export default function PetGallery({ unlocked, onClose }) {
  return (
    <Modal onClose={onClose} color="#ffe600" label="Colección de sprites">
      <p className="font-label text-[9px] tracking-[0.3em] text-neon-yellow">COLECCION</p>
      <h2 className="mt-2 font-pixel text-[12px] leading-6 text-white">
        {unlocked.length}/{PETS.length} SPRITES
      </h2>

      <ul className="mt-5 grid grid-cols-2 gap-3">
        {PETS.map((pet) => {
          const has = unlocked.includes(pet.id)
          return (
            <li
              key={pet.id}
              className="pixel-frame flex flex-col items-center bg-crt-950 p-3 text-center"
              style={{ '--frame-c': has ? '#39ff14' : '#241440' }}
            >
              <PixelSprite pet={pet} scale={5} locked={!has} />
              <p
                className={`mt-3 font-pixel text-[8px] leading-4 ${has ? 'text-neon-cyan' : 'text-crt-600'}`}
              >
                {has ? pet.name : '???'}
              </p>
              <p className="mt-2 font-label text-[8px] leading-3 tracking-wider text-white/45">
                {pet.unlock.label}
              </p>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}
