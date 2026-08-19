# Power People 2026 — sitio del programa

Sitio estático para los alumnos de Power People 2026. Se despliega en `/power-people/`.
El contenido del programa **no vive en el repo**: vive en un Google Sheet que el sitio lee en vivo.

## Cómo está armado

| Archivo | Qué es |
|---|---|
| **El Google Sheet** | **Fuente de verdad.** Semanas, links, textos, material y facilitadores. |
| `config.json` | ID del Sheet y datos fijos del programa (Zoom, WhatsApp, fechas). |
| `lib/sheet.mjs` | Lectura y parseo del Sheet. Única copia: corre en el navegador y en Node. |
| `scripts/build.mjs` | Empaqueta `lib/` para el navegador y guarda una copia de respaldo. |
| `fixtures/*.csv` | Espejo local del Sheet, para desarrollar y testear sin red. |
| `index.html` + `assets/` | El sitio. |

```bash
npm run build:programa              # regenera los assets leyendo el Sheet
npm run build:programa -- --local   # los regenera desde fixtures/, sin red
```

`assets/sheet.js`, `assets/config.js` y `assets/contenido.js` son **generados**. No los edites.

## Cómo llega el contenido a la página

```
Google Sheet ──(fetch en vivo)──▶ navegador del alumno
     │
     └──(build)──▶ assets/contenido.js ──▶ respaldo si el fetch falla
```

El sitio intenta leer el Sheet en cada visita. Si no puede —Google caído, la planilla dejó de ser
pública, una red corporativa que bloquea `docs.google.com`— usa la copia de respaldo y avisa al
alumno con una línea chica bajo la barra de progreso.

**Editás el Sheet y se ve al recargar la página.** No hace falta buildear ni deployar.

## El bloqueo por fecha

Una semana cuya fecha y hora todavía no llegaron se muestra con candado: sin links, sin material y
sin texto.

**Este bloqueo es de presentación, no de seguridad.** Como el navegador lee la planilla entera para
poder mostrarla, el CSV con todas las filas —incluidas las futuras— llega hasta el navegador. Quien
abra las herramientas de desarrollo puede ver los links de las semanas que faltan. Es la
contrapartida de que el Sheet se edite y se publique al instante.

Si en algún momento querés bloqueo duro, el camino es que el sitio lea el Sheet en el build en vez
de en vivo: ahí los links futuros nunca salen del servidor. Se paga con un build por cada cambio.

La copia de respaldo **sí** tiene bloqueo duro: se genera con las URLs futuras ya recortadas.

## El Google Sheet

Tiene tres hojas. La de **Instrucciones** explica cada columna dentro de la propia planilla.

**Contenido** — una fila por semana:

| Columna | Qué poner |
|---|---|
| `Fecha` | Desde cuándo se ve. `AAAA-MM-DD`. Lo único obligatorio. |
| `Hora` | Hora de Argentina. Vacío = 19:00. |
| `Módulo` | Tiene que coincidir con la hoja Facilitadores. |
| `Grabación` | Etiqueta corta: `1 y 2`, `Talent 1`, `Descanso`, `CIERRE`. |
| `Título` | Lo que ve el alumno. Vacío = se usa `Grabación`. |
| `Nota` | Aclaración chica bajo la primera grabación. |
| `Facilitador` | Quién da esa semana. |
| `Link`, `Link 2` | Grabaciones de práctica. |
| `Sesión Online` | Número del encuentro. Vacío = esa semana no hay. |
| `Link Sesión` | Grabación del encuentro, cuando la subas. |
| `Texto` | Markdown: `**negrita**`, `- listas`, `## títulos`, links. |
| `Archivo 1/2/3` | Material. `Nombre \| https://drive.google.com/...` |

**Facilitadores** — una fila por módulo: `Módulo`, `Nombre`, `Rol`, `Iniciales`, `Bio`, `LinkedIn`,
`Cita`. El sitio muestra el del módulo que se está cursando, calculado a partir de la última semana
liberada.

**Requisito:** la planilla tiene que estar compartida como *Cualquier persona con el enlace ·
Lector*. Sin eso el sitio no la puede leer y siempre cae al respaldo.

## Las bases de datos

Van a Drive, compartidas como "cualquiera con el enlace", y el link se pega en `Archivo 1/2/3`.
No las subas al repo: el sitio es público y un archivo del repo queda accesible por URL aunque su
semana esté cerrada.

## Probar sin esperar

```bash
node power-people/scripts/build.mjs --local --ahora 2026-09-20T12:00
```

Arma el respaldo como si fuera ese momento, leyendo `fixtures/` en vez del Sheet. Sirve para ver
cómo se comporta el bloqueo. Volvé a correr `npm run build:programa` antes de commitear.

Los `fixtures/*.csv` son un espejo del Sheet al momento de crearlo. Sirven para desarrollo; no se
sincronizan solos.

## Qué resuelve el JS

| Función | Para qué |
|---|---|
| Lectura del Sheet | El contenido se edita en una planilla, no en el código. |
| Respaldo | Si la planilla no se puede leer, el alumno igual ve el programa. |
| Barra de progreso | En qué semana del programa está, sin contar a mano. |
| Ruta del programa | Las semanas, qué está disponible y cuándo se libera lo que falta. |
| Hora local | Los encuentros son 19 hs de Argentina. Fuera del país muestra la hora —y la fecha, que puede correrse al día siguiente. |
| Cuenta regresiva | Cuánto falta para el próximo encuentro. |
| Markdown | La columna `Texto` se escribe en markdown y se renderiza en el navegador. |
| Copiar link / `.ics` | El Zoom al portapapeles; los encuentros a la agenda, con aviso 30 min antes. |

Argentina no aplica horario de verano, así que 19:00 ART es siempre 22:00 UTC. Los encuentros se
construyen en UTC y se formatean con `Intl` en la zona del navegador.

## Probarlo

```bash
npm run dev    # buildea y sirve en http://localhost:4173/power-people/
```

## Publicar en Netlify

El sitio tiene su propio proyecto: **power-people-2026**
(`https://app.netlify.com/projects/power-people-2026`).

Se conecta al repo desde la UI de Netlify, con:

| Campo | Valor |
|---|---|
| Repositorio | `senrap/asistentesIA` |
| Base directory | `power-people` |
| Build command | `node scripts/build.mjs` (lo toma solo de `power-people/netlify.toml`) |
| Publish directory | `.` (idem) |

Con **Base directory** en `power-people`, Netlify lee `power-people/netlify.toml` en vez del de la
raíz y publica esta carpeta como raíz del sitio: el programa queda en `/`, no en `/power-people/`.
El `netlify.toml` de la raíz sigue siendo el de la Biblioteca de Asistentes, que se despliega en su
propio proyecto sin tocar este.

Una vez conectado, cada push a la rama configurada redeploya solo. El contenido del programa no
necesita deploy: sale del Sheet en vivo.

Si el build no consigue leer el Sheet (todavía no es público, por ejemplo) no falla: avisa y
conserva la copia de respaldo que ya estaba commiteada.

## Diagnóstico

`/diagnostico.html` prueba en vivo si el sitio puede leer la planilla y muestra qué endpoint
funcionó, qué devolvió Google y qué se llegó a parsear. Es la primera parada cuando el contenido
no se actualiza. No está enlazada desde el sitio: es una herramienta interna.

El sitio principal también acepta `?debug` en la URL: muestra la fuente que usó y el resultado de
cada endpoint bajo la barra de progreso, y lo escribe en la consola.

### Si el contenido no se actualiza

1. Abrí `/diagnostico.html`. El veredicto de arriba dice si lee la planilla o está usando el
   respaldo.
2. Si **no la lee**: revisá que el Sheet esté compartido como *Cualquier persona con el enlace ·
   Lector*. Si ya lo está, usá **Archivo → Compartir → Publicar en la Web** (CSV) y sumá a
   `config.json` el `pubId` y los `gids` de cada hoja — el sitio prefiere ese endpoint, que es el
   más confiable para acceso anónimo.
3. Si **sí la lee** y aun así ves contenido viejo: es caché del navegador. `Ctrl+Shift+R`.
   Las peticiones al Sheet ya van con `cache: no-store` y un parámetro anti-caché.

### Config opcional para el endpoint publicado

```json
"sheet": {
  "id": "…",
  "pubId": "2PACX-…",
  "gids": { "Contenido": "0", "Facilitadores": "123456" },
  "hojaContenido": "Contenido",
  "hojaFacilitadores": "Facilitadores"
}
```
