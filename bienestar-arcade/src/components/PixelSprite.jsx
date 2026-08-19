/**
 * Dibuja un sprite de 16x16 a partir de su grilla de caracteres.
 * Sin imagenes: cada pixel es una celda de una grilla CSS.
 */
export default function PixelSprite({ pet, scale = 6, locked = false, className = '' }) {
  const size = pet.pixels[0].length * scale

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${pet.pixels[0].length}, ${scale}px)`,
        gridAutoRows: `${scale}px`,
        width: size,
        height: pet.pixels.length * scale,
        filter: locked ? 'brightness(0) opacity(0.35)' : 'drop-shadow(0 0 6px rgba(0,240,255,0.25))',
      }}
      role="img"
      aria-label={locked ? `${pet.name} (bloqueada)` : pet.name}
    >
      {pet.pixels.flatMap((row, y) =>
        [...row].map((char, x) => (
          <div
            key={`${x}-${y}`}
            style={{ background: char === '.' ? 'transparent' : pet.palette[char] }}
          />
        )),
      )}
    </div>
  )
}
