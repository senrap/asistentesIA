const CHECK = [
  '........',
  '......xx',
  '.....xx.',
  'x...xx..',
  'xx.xx...',
  '.xxx....',
  '..x.....',
  '........',
]

/** Tilde dibujado pixel por pixel, para que no dependa de ninguna fuente. */
export default function PixelCheck({ color = '#0d0814', scale = 3 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(8, ${scale}px)`,
        gridAutoRows: `${scale}px`,
      }}
    >
      {CHECK.flatMap((row, y) =>
        [...row].map((c, x) => (
          <span key={`${x}-${y}`} style={{ background: c === 'x' ? color : 'transparent' }} />
        )),
      )}
    </span>
  )
}
