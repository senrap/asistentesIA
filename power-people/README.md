# Power People 2026 — sitio del programa

Sitio estático para los alumnos de Power People 2026. Sin framework ni backend. Se despliega en
`/power-people/` del mismo sitio que la Biblioteca de Asistentes.

## Cómo está armado

| Archivo | Qué es |
|---|---|
| `contenido.json` | **Fuente de verdad.** Semanas, títulos, links de grabaciones y momentos de liberación. |
| `semanas/*.md` | Las notas de cada semana, en markdown. |
| `material/` | Archivos de práctica (Excel, etc.) que el alumno descarga. |
| `scripts/build.mjs` | Genera `assets/contenido.js` aplicando el bloqueo por fecha y hora. |
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

**Excepción: los archivos de `material/` no están bloqueados.** El link a un `.xlsx` desaparece de
la página igual que los demás, pero el archivo sigue existiendo en su URL para quien la conozca.
Si alguna vez hace falta un material realmente cerrado hasta su fecha, hay que subirlo a otro lado
y poner una URL externa.

### Consecuencia: hace falta un build programado

El build congela el estado del momento en que corre. Netlify buildea en cada push, así que si solo
pusheás, una grabación con fecha del 14 de octubre no aparece sola ese día — aparece en el
siguiente deploy.

Para que se libere sola hay que disparar un build periódico. Dos caminos:

- **Netlify scheduled function** que llame al build hook del sitio.
- **GitHub Action** con `schedule: cron` que haga POST al build hook de Netlify.

**La precisión del desbloqueo es la frecuencia del build.** Con un build diario a medianoche, algo
programado para las 19:30 se libera recién al día siguiente; con un build por hora, se libera
dentro de la hora. Para horarios como "19:30" conviene el build horario.

Mientras tanto sirve el camino manual: pushear (o apretar "Trigger deploy" en Netlify) cuando toca
liberar.

### Probar el bloqueo sin esperar

```bash
node power-people/scripts/build.mjs --ahora 2026-08-19T19:45
node power-people/scripts/build.mjs --ahora 2026-10-20        # fin de ese día
```

Recordá volver a correr `npm run build:programa` sin `--ahora` antes de commitear.

## Cargar el contenido de una semana

En `contenido.json`, dentro de la semana que corresponda:

```json
{
  "numero": 1,
  "libera": "2026-08-19",
  "hora": "19:30",
  "titulo": "Primeros pasos: obtener y transformar datos",
  "resumen": "Una línea de qué se ve.",
  "notas": "semana-01.md",
  "grabaciones": [
    { "titulo": "Clase 1", "url": "https://...", "nota": "Arrancá desde 1 h 50 min." },
    { "titulo": "Clase 2", "url": "https://..." }
  ],
  "material": [
    { "nombre": "Nómina Panda", "url": "material/nomina-panda.xlsx", "tipo": "Excel · 71 KB" }
  ],
  "encuentro": { "libera": "2026-08-20", "hora": "19:00", "grabacion": "https://..." }
}
```

- `libera` + `hora` — el momento exacto, en hora de Argentina, desde el que se ve el contenido.
- `notas` — nombre de un archivo en `semanas/`. Markdown común: títulos, listas, **negrita**,
  emoji. Se renderiza en el build.
- `grabaciones` — una o varias por semana. `nota` es opcional y sale como línea chica debajo.
- `material` — `material/archivo.xlsx` para un archivo del repo (se descarga), o una URL externa
  (se abre en otra pestaña).
- `encuentro` — solo en las semanas con sesión en vivo. El encuentro es el mismo miércoles de
  `libera`; `encuentro.libera` es cuándo se publica **la grabación** de esa sesión.
- Podés cargar los links con anticipación: mientras el momento no llegue, no salen del build.

El build valida fechas, horas, URLs, archivos de material faltantes, `.md` huérfanos y números de
semana duplicados. Falla antes de publicar algo roto.

## Datos generales del programa

En `contenido.json` → `programa`: nombre, fechas de inicio y fin, link de Zoom, horario y el
grupo de WhatsApp. En cuanto `whatsapp` deje de ser `null`, el botón aparece solo en la tarjeta.

## Qué resuelve el JS (y por qué)

| Función | Para qué |
|---|---|
| Barra de progreso | El alumno ve en qué semana del programa está, sin contar a mano. |
| Ruta del programa | Las 16 semanas, qué está disponible y cuándo se libera lo que falta. Las semanas con contenido se despliegan con las grabaciones, el material y las notas. |
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
