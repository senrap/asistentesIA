# Workshops HACHE — sitio de los programas

Sitio estático para los participantes de los workshops. El contenido **no vive en el repo**: vive
en el Google Sheet **Asistencia HACHE**, que el sitio lee en vivo. **Editás la planilla y se ve al
recargar la página.** No hace falta buildear ni deployar.

Cada programa de la hoja `Workshops` tiene su propia página, y cada bloque la suya:

```
/powerh_1                                 la página del programa
/powerh_1/bloque-1-los-datos-...          la de uno de sus bloques
```

Ninguna de las dos existe como archivo: las crea la planilla.

## Lo primero: la planilla NO se comparte entera

`Asistencia HACHE` tiene, además de `Workshops`, hojas con **nombres y mails de participantes**.
Compartirla como *"cualquiera con el enlace"* dejaría esos mails accesibles para cualquiera que
tenga la URL — y el sitio es público.

El camino correcto es **Archivo → Compartir → Publicar en la web**, en formato CSV, eligiendo
**solo** las seis pestañas que el sitio lee:

`Workshops` · `Bloques` · `Tarjetas` · `Grabaciones` · `Facilitadores` · `Ajustes`

Eso publica esas seis y nada más. Después, a `config.json` van el `pubId` (el `2PACX-…` que te da
Google) y el `gid` de cada pestaña — el `gid` sale de la URL de cada una, al final: `#gid=…`.

```json
"sheet": {
  "id": "1jvBsOanU3ltjIF3A-H-iS5apnu_1iXi9PHfzmtMyMOc",
  "pubId": "2PACX-…",
  "gids": { "Workshops": "0", "Bloques": "…", "Tarjetas": "…", "Grabaciones": "…",
            "Facilitadores": "…", "Ajustes": "…" }
}
```

Sin `pubId` el sitio intenta leerla por `gviz`, que **exige que el documento entero sea público**.
No uses ese camino con esta planilla.

## El sitio no escribe nunca

Solo lee, y de `Workshops` lee **seis columnas y ninguna nueva**:

| Columna | Qué usa |
|---|---|
| **A** `ID` | El id del programa. Es su dirección: `/powerh_1` |
| **B** `Actividad` | El nombre que se muestra |
| **C** `Inicio` | Cuándo arranca |
| **D** `Sesiones` | Cuántos encuentros tiene |
| **G** `Fin` | Cuándo termina |
| **M** `FACILITADOR` | El nombre, que se busca en la hoja `Facilitadores` |

`Cliente`, `Logo` y `COMENTARIOS` se leen **si están**, para la portada. Todo lo demás de esa hoja
—y las hojas de participantes y asistencia— el sitio ni las mira.

Las fechas de `Workshops` vienen como `10/03` o `8/4`, sin año. Se les pone el año de
`sitio.anioReferencia` en `config.json`, y si el fin queda antes del inicio se asume que el
programa cruza al año siguiente.

## Cómo está armado

| Archivo | Qué es |
|---|---|
| **El Google Sheet** | **Fuente de verdad.** Programas, bloques, tarjetas, grabaciones, facilitadores y textos. |
| `config.json` | El id de la planilla, el `pubId`/`gids` y el año de referencia. Lo único que se toca en el repo. |
| `lib/sheet.mjs` | Lectura y parseo. Única copia: corre en el navegador y en Node. |
| `scripts/build.mjs` | Empaqueta `lib/` para el navegador y guarda una copia de respaldo. |
| `scripts/servir.mjs` | Servidor de desarrollo, con las mismas reescrituras que Netlify. |
| `fixtures/*.csv` | Espejo local de la planilla, para desarrollar y testear sin red. |
| `index.html` | La portada. **No lista los programas** a propósito: la planilla tiene nombres de clientes. |
| `programa.html` + `assets/programa.js` | **Una sola página que dibuja cualquier programa.** |
| `bloque.html` + `assets/bloque.js` | **Una sola página que dibuja cualquier bloque.** |
| `assets/comun.js` | Lo compartido: markdown, fechas, rutas, lectura del Sheet. |
| `diagnostico.html` | Prueba en vivo si el sitio puede leer la planilla, hoja por hoja. |

```bash
npm run build          # regenera los assets leyendo el Sheet
npm run build:local    # los regenera desde fixtures/, sin red
npm run dev            # buildea con fixtures y sirve en http://localhost:4173/
```

`assets/sheet.js`, `assets/config.js` y `assets/contenido.js` son **generados**. No los edites.

## Las pestañas que suma el sitio

**Bloques** — una fila por sub-página:

| Columna | Qué poner |
|---|---|
| `ID programa` | A cuál pertenece. Tiene que coincidir con un `ID` de `Workshops`. |
| `Bloque` | El nombre. **Es la sub-página**: define su dirección. |
| `Orden` | Número. Ordena los bloques dentro del programa. |
| `Título` | El título largo que se ve adentro. Vacío = usa el nombre. |
| `Emoji`, `Bajada` | Para la tarjeta en la página del programa. |
| `Objetivo` | «¿Cuál es el objetivo de este bloque?». Markdown. |
| `Fecha` | Desde cuándo se ve (`D/M`). Antes, aparece con candado. Vacío = siempre visible. |

**Tarjetas** — una fila por tarjeta:

| Columna | Qué poner |
|---|---|
| `ID programa`, `Bloque` | De quién cuelga. |
| `Tipo` | `material` · `enlace` · `grabacion` · `tarea` · `contenido`. |
| `Título`, `Texto` | El texto es markdown. |
| `Archivo 1`, `2`, `3` | Pegá el link, o `Nombre \| https://…` |
| `Imagen`, `Link` | Opcionales. |
| `Fecha` | Para liberar la tarjeta más tarde que su bloque. |
| `Orden` | Solo si querés pisar el orden por defecto. |

**El `Tipo` define el orden**: primero el material y los enlaces, después las grabaciones y la
tarea, y **el texto largo queda al final** — que es lo que se pidió. La columna `Orden` pisa eso
cuando hace falta.

**Grabaciones** — una fila por sesión:

| Columna | Qué poner |
|---|---|
| `ID programa` | A qué programa pertenece. |
| `Sesión` | El número, para asociarla a la que corresponda. |
| `Título` | Cómo se llamó ese encuentro. Opcional. |
| `Fecha` | Cuándo fue. Opcional. |
| `Bloque` | Opcional: si lo ponés, la grabación también aparece dentro de ese bloque. |
| `Link de la grabación` | El link, cuando la subas. Vacío = «todavía no está». |

La página del programa lista **todas** las sesiones que dice `Workshops` (columna `Sesiones`), no
solo las que ya tienen link: así se ve qué falta.

**Facilitadores** — `Nombre`, `Rol`, `Foto`, `Bio`, `LinkedIn`, `Mail`, `Cita`. El `Nombre` tiene
que coincidir con lo que dice la columna `FACILITADOR` de `Workshops`. Si no hay ficha cargada, el
sitio muestra igual el nombre que dice `Workshops`. `Foto` acepta la URL de una imagen o una o dos
letras para las iniciales.

**Ajustes** — `ID programa`, `Clave`, `Valor`. Son los textos y links del sitio.

- Una fila **sin** `ID programa` vale para **todos** los programas.
- Una fila **con** `ID programa` pisa ese valor **solo** para ese programa.

Así el Zoom y el calendario de cada workshop se cargan una vez, y los textos comunes no se repiten.
Las claves que usa el sitio: `zoom`, `calendario`, `hero.titulo`, `hero.bajada`,
`bienvenida.titulo`, `bienvenida`, `bienvenida.nota`, `ayuda.titulo`, `ayuda`, `mail`,
`instagram`, `linkedin.hache`, `linkedin.grupo`, `youtube`, `web`.

**No cambies las claves**: son las que el sitio busca. Una clave vacía esconde lo que cuelga de
ella; una clave borrada deja el texto que ya trae el HTML.

### Los archivos de material

Van a Drive, compartidos como "cualquiera con el enlace", y el link se pega en `Archivo 1`, `2` o
`3`. **Pegalo sin formato** (`Ctrl+Shift+V`): si Sheets lo convierte en un chip, el CSV devuelve el
nombre del archivo en vez de la URL y el sitio no lo puede usar.

No los subas al repo: el sitio es público y un archivo del repo queda accesible por URL aunque su
bloque esté cerrado.

## Cómo llega el contenido a la página

```
Google Sheet ──(fetch en vivo)──▶ navegador del alumno
     │
     └──(build)──▶ assets/contenido.js ──▶ respaldo si el fetch falla
```

El sitio intenta leer la planilla en cada visita. Si no puede —Google caído, la publicación dada de
baja, una red corporativa que bloquea `docs.google.com`— usa la copia de respaldo y avisa con una
línea chica.

`Workshops` es la única hoja obligatoria. Si falla cualquiera de las otras cinco, esa sola sale del
respaldo y el resto se sigue leyendo en vivo: que falte una bio no justifica mandar al alumno a la
copia vieja del programa entero.

## El bloqueo por fecha

Un bloque cuya fecha todavía no llegó se muestra con candado: sin tarjetas, sin material y sin
objetivo. Una tarjeta puede tener su propia `Fecha` para liberarse más tarde que su bloque.

**Este bloqueo es de presentación, no de seguridad.** Como el navegador lee las pestañas enteras
para poder mostrarlas, el CSV con todas las filas —incluidas las futuras— llega hasta el navegador.
Quien abra las herramientas de desarrollo puede ver los links que faltan. Es la contrapartida de que
la planilla se edite y se publique al instante.

**Y hay algo más fuerte que eso:** las pestañas publicadas son públicas, así que
`Workshops` entera —todos los clientes, todas las fechas— queda legible por cualquiera que arme la
URL del CSV. Si eso no es aceptable, el camino es que el sitio lea la planilla en el build en vez
de en vivo. Se paga con un build por cada cambio.

La copia de respaldo **sí** tiene bloqueo duro: se genera con el contenido futuro ya recortado.

## Probar sin esperar

```bash
node scripts/build.mjs --local --ahora 2026-04-15
```

Arma el respaldo como si fuera ese día, leyendo `fixtures/` en vez del Sheet. Sirve para ver cómo
se comporta el bloqueo. Volvé a correr `npm run build` antes de commitear.

Los `fixtures/*.csv` son un espejo de la planilla al momento de crearlo — con **filas reales** de
`Workshops`, para que el parseo se pruebe contra las formas de verdad. No se sincronizan solos.

## Publicar en Netlify

El sitio se conecta desde la UI de Netlify como un proyecto propio, con:

| Campo | Valor |
|---|---|
| Repositorio | `senrap/asistentesIA` |
| Base directory | `poweRH` |
| Build command | `node scripts/build.mjs` (lo toma solo de `poweRH/netlify.toml`) |
| Publish directory | `.` (idem) |

Con **Base directory** en `poweRH`, Netlify lee `poweRH/netlify.toml` y publica esta carpeta como
raíz del sitio. Es el mismo arreglo que usa `power-people/`: cada sitio del repo se despliega por su
cuenta, en su propio proyecto y con su propia base directory, sin enterarse de los demás.

Las reescrituras de `/:programa` y `/:programa/:bloque` están en ese `netlify.toml`: **sin ellas las
páginas dan 404.** Netlify sirve primero los archivos que existen de verdad, así que `/assets/…`,
`/diagnostico.html` y la portada ganan sobre esas reglas.

## Diagnóstico

`/diagnostico.html` prueba en vivo si el sitio puede leer la planilla, hoja por hoja, y lista los
programas y bloques que salen de ella con su dirección. Es la primera parada cuando el contenido no
se actualiza. No está enlazada desde el sitio: es una herramienta interna.

El sitio también acepta `?debug` en la URL: muestra la fuente que usó y el resultado de cada
endpoint, y lo escribe en la consola.

### Si el contenido no se actualiza

1. Abrí `/diagnostico.html`. El veredicto de arriba dice si lee la planilla o usa el respaldo.
2. Si **no la lee**: revisá que la publicación en la web siga activa y que el `pubId` y los `gids`
   de `config.json` sean los de esas pestañas.
3. Si **sí la lee** y ves contenido viejo: es caché del navegador. `Ctrl+Shift+R`.

## Qué resuelve el JavaScript

| Función | Para qué |
|---|---|
| Lectura del Sheet | El contenido se edita en una planilla, no en el código. |
| Páginas por id | Cada programa de `Workshops` estrena su página sin tocar el repo. |
| Sub-páginas por slug | Y cada bloque la suya, a partir de su nombre. |
| Respaldo | Si la planilla no se puede leer, el alumno igual ve el programa. |
| Ajustes | Los textos y links del sitio también se editan desde la planilla, por programa. |
| Bloqueo por fecha | Qué está disponible y cuándo se libera lo que falta. |
| Markdown | Las columnas de texto se escriben en markdown y se renderizan en el navegador. |
| Copiar el Zoom | El link al portapapeles, de un click. |
