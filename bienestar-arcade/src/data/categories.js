/**
 * Las 5 familias de habitos traviesos. Cada una tiene su color neon y su
 * simbolo de 1 caracter para los rodillos de la tragamonedas.
 */
export const CATEGORIES = {
  movimiento: {
    id: 'movimiento',
    name: 'MOVIMIENTO DISRUPTIVO',
    short: 'MOVIMIENTO',
    color: '#39ff14',
    reel: '▲',
    tagline: 'Romper la quietud sin pedir permiso.',
  },
  ocular: {
    id: 'ocular',
    name: 'SALUD OCULAR',
    short: 'OCULAR',
    color: '#00f0ff',
    reel: '◉',
    tagline: 'Sacar los ojos de la pantalla.',
  },
  nutricion: {
    id: 'nutricion',
    name: 'NUTRICION ALEGRE',
    short: 'NUTRICION',
    color: '#ffe600',
    reel: '★',
    tagline: 'Comer y tomar con intencion.',
  },
  detox: {
    id: 'detox',
    name: 'DIGITAL DETOX',
    short: 'DETOX',
    color: '#ff007f',
    reel: '✖',
    tagline: 'Modo cueva, modo avion, modo humano.',
  },
  presencia: {
    id: 'presencia',
    name: 'PRESENCIA / SENSORIAL',
    short: 'PRESENCIA',
    color: '#b76bff',
    reel: '❋',
    tagline: 'Volver al cuerpo por la puerta de los sentidos.',
  },
}

export const CATEGORY_LIST = Object.values(CATEGORIES)
