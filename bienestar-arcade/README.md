# Bienestar Arcade 👾🎮

MVP de una app que gamifica el cuidado personal con **hábitos traviesos**: micro-acciones de 1 a 5
minutos que entran en cualquier día, envueltas en una máquina arcade de los 80/90.

La lógica es simple: insertás una moneda, la máquina te tira 3 misiones, las marcás durante el día y
la racha sube. Si el día vino imposible, el **Comodín Travieso** te salva con 10 segundos de
respiración y sin culpa.

## Cómo se juega

| Mecánica | Qué hace |
| --- | --- |
| **INSERT COIN** | Arranca el día: los rodillos sortean 3 misiones de 3 categorías distintas. |
| **Checkbox retro** | Marca una misión cumplida (+PTS). Se puede desmarcar. |
| **RE-ROLL** | 1 por día. Cambia una misión que no podés hacer por otra de una categoría libre. |
| **COMODÍN TRAVIESO** | Bypass de 10 segundos ("respirá 3 veces") que conserva la racha en un mal día. |
| **COMBO DAY** | 3/3 (o comodín) cierra el día: bonus de +30 PTS y la racha encadena. |
| **COLECCIÓN** | 6 sprites pixel se desbloquean por racha, puntos o misiones acumuladas. |

### Las 5 familias de misiones

- **Movimiento Disruptivo** — sentadillas en un lugar inusual, escalera, un tema de baile.
- **Salud Ocular** — mirar a 6 metros, regla 20-20-20, palmeo oscuro.
- **Nutrición Alegre** — agua con limón antes del café, almuerzo sin pantalla.
- **Digital Detox** — modo cueva 20 minutos, teléfono en otra habitación.
- **Presencia / Sensorial** — descalzo sobre el piso frío, inventario 5-4-3-2-1.

El pool tiene 40 misiones (8 por categoría) en `src/data/missions.js`.

## Estética

- **Paleta CRT**: fondo `#0d0814` / `#180e29`, acentos cian `#00f0ff`, magenta `#ff007f`,
  lima `#39ff14`, amarillo `#ffe600` y violeta `#b76bff`.
- **Tipografías**: `Press Start 2P` para títulos y botones, `VT323` para texto largo,
  `Silkscreen` para etiquetas (Google Fonts, con fallback a monoespaciada del sistema).
- **Marco de máquina**: marquesina, bisel y tablero de control; el tubo suma scanlines, viñeta,
  parpadeo y una línea de barrido, todo en CSS.
- **Sprites**: cada mascota es una grilla de 16×16 caracteres renderizada con CSS Grid
  (`src/data/pets.js`). Cero imágenes, cero assets binarios.
- **Sonido**: chiptune generado en vivo con Web Audio API (ondas cuadradas + ruido filtrado),
  más vibración háptica donde el dispositivo la soporte. Se puede silenciar desde el tablero.

## Stack

- **Vite 8** + **React 19**
- **Tailwind CSS 4** (tokens de diseño en `@theme`, sin archivo de config)
- **lucide-react** para los íconos, con `image-rendering: pixelated` global
- **LocalStorage** como única persistencia (clave `bienestar-arcade:v1`)

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # tests de la lógica de juego (node:test, sin dependencias)
npm run build    # build de producción en dist/
npm run preview  # sirve el build
```

## Estructura

```
src/
  data/         categorías, pool de misiones y sprites de las mascotas
  lib/          lógica de juego pura, fechas, audio chiptune
  hooks/        useGame: reducer + persistencia + rollover de medianoche
  components/   gabinete, tubo CRT, rodillos, misiones, modales
```

La lógica de juego (`src/lib/game.js`) es de funciones puras y está cubierta por tests: sorteo,
re-roll, cierre del día, encadenado y reinicio de rachas, historial e hidratación de LocalStorage.

## Detalles que importan

- **El día es local**, no UTC: las claves `YYYY-MM-DD` se arman con la fecha del dispositivo para que
  la racha no se corra de huso horario.
- **Medianoche en vivo**: si la app queda abierta, revisa cada 30 segundos (y al volver a la pestaña)
  si cambió el día, y arranca uno nuevo sola.
- **Saltear un día** reinicia la racha; un día en curso todavía sin cerrar, no.
- **Accesibilidad**: los checkboxes son `role="checkbox"` con `aria-checked`, los modales cierran con
  Escape y hay foco visible pixelado. `prefers-reduced-motion` apaga las animaciones.

## Pendientes post-MVP

- Recordatorios / notificaciones para las misiones del día.
- Sincronización entre dispositivos (hoy todo vive en LocalStorage).
- Más sprites y un modo "co-op" para hacer misiones con otra persona.
