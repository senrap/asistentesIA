# Power People 2026 — sitio del programa

Sitio estático para los alumnos de Power People 2026. Sin framework ni backend. Se despliega en
`/power-people/` del mismo sitio que la Biblioteca de Asistentes.

## Cómo está armado

| Archivo | Qué es |
|---|---|
| `contenido.json` | **Fuente de verdad.** Semanas, títulos, links de grabaciones y fechas de liberación. |
| `scripts/build.mjs` | Genera `assets/contenido.js` aplicando el bloqueo por fecha. |
| `index.html` + `assets/` | El sitio. Lee `window.PROGRAMA` de `assets/contenido.js`. |

```bash
npm run build:programa        # regenera assets/contenido.js
npm run build                 # buildea la Biblioteca y el programa
```

## El bloqueo de grabaciones

**El bloqueo es real, no cosmético.** Una semana cuya `libera` todavía no llegó sale del build
**sin la URL**: el link no está en el HTML publicado. No hay "ver código fuente" que lo revele.

El alumno igual ve el título y la fecha en que se libera — eso es a propósito: sabe qué viene.

```
contenido.json  ──build──▶  assets/contenido.js  ──▶  navegador
  (todos los                 (solo lo ya                (solo ve lo
   links)                     liberado)                  que llegó)
```

### Consecuencia: hace falta un build diario

El build congela el estado del día en que corre. Netlify buildea en cada push, así que si solo
pusheás, una grabación con fecha del 14 de octubre no aparece sola ese día — aparece en el
siguiente deploy.

Para que se libere sola hay que disparar un build programado. Dos caminos:

- **Netlify scheduled function** que llame al build hook del sitio, una vez por día.
- **GitHub Action** con `schedule: cron` que haga POST al build hook de Netlify.

Mientras tanto sirve el camino manual: pushear (o apretar "Trigger deploy" en Netlify) el día que
toca liberar.

### Probar el bloqueo sin esperar

```bash
node power-people/scripts/build.mjs --fecha 2026-10-20
```

Simula ese día. Recordá volver a correr `npm run build:programa` sin `--fecha` antes de commitear.

## Cargar una grabación

En `contenido.json`, dentro de la semana que corresponda:

```json
{
  "numero": 3,
  "libera": "2026-09-02",
  "titulo": "Power Query de cero",
  "resumen": "Opcional: una línea de qué se ve.",
  "duracion": "2 h 15 min",
  "grabacion": "https://vimeo.com/...",
  "material": [{ "nombre": "Dataset de práctica", "url": "https://..." }],
  "encuentro": {
    "libera": "2026-09-03",
    "grabacion": "https://vimeo.com/..."
  }
}
```

- `libera` — desde qué día se ve la grabación de la semana. Formato `YYYY-MM-DD`.
- `encuentro` — solo en las semanas con sesión en vivo. El encuentro es el mismo miércoles de
  `libera`; `encuentro.libera` es cuándo se publica **la grabación** de esa sesión.
- Podés cargar el link con anticipación: mientras la fecha no llegue, no sale del build.

El build valida fechas, URLs y números de semana duplicados, y falla antes de publicar algo roto.

## Datos generales del programa

En `contenido.json` → `programa`: nombre, fechas de inicio y fin, link de Zoom, horario y el
grupo de WhatsApp. En cuanto `whatsapp` deje de ser `null`, el botón aparece solo en la tarjeta.

## Qué resuelve el JS (y por qué)

| Función | Para qué |
|---|---|
| Barra de progreso | El alumno ve en qué semana del programa está, sin contar a mano. |
| Ruta del programa | Las 16 semanas, qué está disponible y cuándo se libera lo que falta. |
| Hora local | Los encuentros son 19 hs de Argentina. Si el alumno está en otra zona, ve su hora —y su fecha, que puede correrse al día siguiente. |
| Cuenta regresiva | Cuánto falta para el próximo encuentro. |
| Copiar link | El link de Zoom al portapapeles, sin seleccionar texto. |
| Descargar `.ics` | Los 8 encuentros a la agenda del alumno, con recordatorio 30 min antes. |

Argentina no aplica horario de verano, así que 19:00 ART es siempre 22:00 UTC. Los encuentros se
construyen en UTC y se formatean con `Intl` en la zona del navegador: no hay conversiones a mano.

## Calendario

16 semanas, todos los miércoles del 19 de agosto al 2 de diciembre de 2026.
8 encuentros en vivo, cada dos semanas: 19/8, 2/9, 16/9, 30/9, 14/10, 28/10, 11/11 y 25/11.

## Probarlo

```bash
npm run dev    # buildea y sirve en http://localhost:4173/power-people/
```
