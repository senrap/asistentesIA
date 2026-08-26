# PoweRH — sitio del workshop

Sitio estático para los participantes de PoweRH. El contenido **no vive en el repo**: vive en un
Google Sheet que el sitio lee en vivo. **Editás la planilla y se ve al recargar la página.** No
hace falta buildear ni deployar.

La novedad respecto del sitio de Power People: **cada bloque tiene su propia sub-página, y esas
sub-páginas las crea la planilla.** El nombre del bloque es su dirección web.

## Cómo está armado

| Archivo | Qué es |
|---|---|
| **El Google Sheet** | **Fuente de verdad.** Bloques, tarjetas, encuentros, facilitadores y los textos fijos del sitio. |
| `config.json` | El id de la planilla y cuatro datos del sitio. Lo único que se toca en el repo. |
| `lib/sheet.mjs` | Lectura y parseo del Sheet. Única copia: corre en el navegador y en Node. |
| `scripts/build.mjs` | Empaqueta `lib/` para el navegador y guarda una copia de respaldo. |
| `scripts/servir.mjs` | Servidor de desarrollo, con la misma reescritura de `/b/*` que Netlify. |
| `fixtures/*.csv` | Espejo local del Sheet, para desarrollar y testear sin red. |
| `index.html` + `assets/inicio.js` | La portada. |
| `bloque.html` + `assets/bloque.js` | **Una sola página que dibuja cualquier bloque.** |
| `assets/comun.js` | Lo que comparten las dos páginas: markdown, fechas, lectura del Sheet. |
| `diagnostico.html` | Prueba en vivo si el sitio puede leer la planilla. |

```bash
npm run build          # regenera los assets leyendo el Sheet
npm run build:local    # los regenera desde fixtures/, sin red
npm run dev            # buildea con fixtures y sirve en http://localhost:4173/
```

`assets/sheet.js`, `assets/config.js` y `assets/contenido.js` son **generados**. No los edites.

## Las sub-páginas

Cada fila de la hoja **Bloques** es una sub-página. Su nombre se convierte en la dirección:

```
"Bloque 1: Los datos pueden transformar HR 🚀"
                    ↓
   /b/bloque-1-los-datos-pueden-transformar-hr
```

No hay un archivo HTML por bloque: `/b/*` sirve siempre `bloque.html`, y el JavaScript busca en la
planilla el bloque que pide la URL y arma la página con él. **Si mañana agregás una fila a la hoja
Bloques, su sub-página existe sola**: aparece en la portada y su link funciona, sin tocar el repo.

La contracara: si le cambiás el nombre a un bloque, **cambia su dirección** y los links viejos
dejan de funcionar. Quien entre a un link roto ve una página que lo explica y lo manda a la
portada, pero si ya repartiste el link de un bloque, mejor no le toques el nombre. Para cambiar
solo lo que se ve, usá la columna **Título**: esa no afecta la dirección.

## Cómo llega el contenido a la página

```
Google Sheet ──(fetch en vivo)──▶ navegador del alumno
     │
     └──(build)──▶ assets/contenido.js ──▶ respaldo si el fetch falla
```

El sitio intenta leer el Sheet en cada visita. Si no puede —Google caído, la planilla dejó de ser
pública, una red corporativa que bloquea `docs.google.com`— usa la copia de respaldo y avisa con
una línea chica bajo la barra de progreso.

Las hojas **Bloques** y **Tarjetas** son obligatorias. Si falla alguna de las otras tres, esa sola
sale del respaldo y el resto se sigue leyendo en vivo: que falte una bio no justifica mandar al
alumno a la copia vieja del programa entero.

## El bloqueo por fecha

Un bloque cuya fecha y hora todavía no llegaron se muestra con candado: sin tarjetas, sin material
y sin objetivo. Una tarjeta puede tener su propia **Fecha** para liberarse más tarde que su bloque.

**Este bloqueo es de presentación, no de seguridad.** Como el navegador lee la planilla entera para
poder mostrarla, el CSV con todas las filas —incluidas las futuras— llega hasta el navegador. Quien
abra las herramientas de desarrollo puede ver los links de los bloques que faltan. Es la
contrapartida de que la planilla se edite y se publique al instante.

Si en algún momento querés bloqueo duro, el camino es que el sitio lea el Sheet en el build en vez
de en vivo: ahí los links futuros nunca salen del servidor. Se paga con un build por cada cambio.

La copia de respaldo **sí** tiene bloqueo duro: se genera con el contenido futuro ya recortado.

## El Google Sheet

Tiene cinco hojas más una de **Instrucciones** que explica cada columna dentro de la propia
planilla.

**Bloques** — una fila por sub-página:

| Columna | Qué poner |
|---|---|
| `Bloque` | El nombre. **Es la sub-página**: define su dirección. Lo único obligatorio. |
| `Fecha` | Desde cuándo se ve. `AAAA-MM-DD`. Vacío = siempre visible. |
| `Hora` | Hora de Argentina. Vacío = 19:00. |
| `Título` | El título largo que se ve adentro. Vacío = usa el nombre. |
| `Emoji` | Un emoji para la portada del bloque. |
| `Bajada` | Frase corta para la tarjeta de la portada. |
| `Objetivo` | «¿Cuál es el objetivo de este bloque?». Markdown. |
| `Facilitador` | Tiene que coincidir con un `Nombre` de la hoja Facilitadores. |

**Tarjetas** — una fila por tarjeta, colgada de un bloque:

| Columna | Qué poner |
|---|---|
| `Bloque` | A cuál pertenece. Tiene que coincidir con la hoja Bloques. |
| `Orden` | Número. Ordena las tarjetas dentro del bloque. |
| `Tipo` | `contenido` · `material` · `tarea` · `grabacion` · `enlace`. Define ícono y color. |
| `Título` | El título de la tarjeta. |
| `Texto` | Markdown: `**negrita**`, `*itálica*`, `- listas`, `1. numeradas`, `## títulos`, `` `código` ``, `[links](https://…)`. |
| `Archivo 1`, `2`, `3` | Material descargable. Pegá el link, o `Nombre \| https://drive.google.com/...` |
| `Imagen` | URL de una imagen para ilustrar. |
| `Link` | Un link principal (un video, un tutorial). |
| `Fecha` | Opcional, para liberar esta tarjeta después que su bloque. |

**Encuentros** — una fila por sesión en vivo: `Nº`, `Fecha`, `Hora`, `Título`, `Bloque`,
`Facilitador`, `Grabación`. La grabación se muestra en la sub-página del bloque que le
corresponde, y se libera junto con él.

**Facilitadores** — `Bloque`, `Nombre`, `Rol`, `Foto`, `Bio`, `LinkedIn`, `Mail`, `Cita`. Con
`Bloque` vacío, es el facilitador de todo el programa. `Foto` acepta la URL de una imagen o una o
dos letras para las iniciales.

**Ajustes** — `Clave` / `Valor`. Son los textos y links fijos del sitio: el título de la portada,
la bienvenida, el Zoom, el WhatsApp, las redes. **No cambies las claves**: son las que el sitio
busca. Una clave vacía esconde lo que cuelga de ella —dejá `whatsapp` en blanco y la tarjeta del
grupo desaparece sola—, y una clave borrada deja el texto que ya trae el HTML.

**Requisito:** la planilla tiene que estar compartida como *Cualquier persona con el enlace ·
Lector*. Sin eso el sitio no la puede leer y siempre cae al respaldo.

### Crear la planilla la primera vez

1. Subí a Drive el `PoweRH - contenido del sitio.xlsx` y abrilo con **Hojas de cálculo**: queda
   convertido en un Sheet nativo con las seis hojas ya cargadas. (Si no lo tenés a mano, se
   reconstruye importando los cinco `fixtures/*.csv` de este repo, cada uno como hoja nueva, y
   renombrando las hojas a `Bloques`, `Tarjetas`, `Encuentros`, `Facilitadores` y `Ajustes`.)
2. **Compartir → Cualquier persona con el enlace · Lector.**
3. Copiá el id de la URL —`docs.google.com/spreadsheets/d/`**`ESTO`**`/edit`— y pegalo en
   `config.json`, en `sheet.id`.
4. `npm run build` y abrí `/diagnostico.html` para confirmar que el sitio la lee.

**Las fechas que vienen cargadas son provisorias.** Están puestas para que el sitio se vea
funcionando de entrada, con bloques abiertos y bloques todavía cerrados. Cambialas por las de la
edición que estés dando: son la columna `Fecha` de **Bloques** y de **Encuentros**.

### Los archivos de material

Van a Drive, compartidos como "cualquiera con el enlace", y el link se pega en una de las columnas
`Archivo 1`, `Archivo 2` o `Archivo 3`.

**Pegá el link sin formato** (`Ctrl+Shift+V`): si Sheets lo convierte en un chip, el CSV devuelve
el nombre del archivo en vez de la URL y el sitio no lo puede usar.

No los subas al repo: el sitio es público y un archivo del repo queda accesible por URL aunque su
bloque esté cerrado.

## Probar sin esperar

```bash
node scripts/build.mjs --local --ahora 2026-09-20T12:00
```

Arma el respaldo como si fuera ese momento, leyendo `fixtures/` en vez del Sheet. Sirve para ver
cómo se comporta el bloqueo. Volvé a correr `npm run build` antes de commitear.

Los `fixtures/*.csv` son un espejo del Sheet al momento de crearlo. Sirven para desarrollo; no se
sincronizan solos.

## Publicar en Netlify

El sitio se conecta desde la UI de Netlify como un proyecto propio, con:

| Campo | Valor |
|---|---|
| Repositorio | `senrap/asistentesIA` |
| Base directory | `poweRH` |
| Build command | `node scripts/build.mjs` (lo toma solo de `poweRH/netlify.toml`) |
| Publish directory | `.` (idem) |

Con **Base directory** en `poweRH`, Netlify lee `poweRH/netlify.toml` y publica esta carpeta como
raíz del sitio: el workshop queda en `/`, no en `/poweRH/`. Es el mismo arreglo que usa
`power-people/`: cada sitio del repo se despliega por su cuenta, en su propio proyecto y con su
propia base directory, sin enterarse de los demás.

La reescritura de `/b/*` a `bloque.html` está en ese `netlify.toml`: **sin ella las sub-páginas dan
404.**

Una vez conectado, cada push a la rama configurada redeploya solo. El contenido no necesita deploy:
sale del Sheet en vivo.

Si el build no consigue leer el Sheet (todavía no es público, por ejemplo) no falla: avisa y
conserva la copia de respaldo que ya estaba commiteada.

## Diagnóstico

`/diagnostico.html` prueba en vivo si el sitio puede leer la planilla, hoja por hoja, y lista las
sub-páginas que salen de ella con su dirección. Es la primera parada cuando el contenido no se
actualiza. No está enlazada desde el sitio: es una herramienta interna.

El sitio principal también acepta `?debug` en la URL: muestra la fuente que usó y el resultado de
cada endpoint, y lo escribe en la consola.

### Config opcional para el endpoint publicado

Si el acceso anónimo por gviz falla, publicá la planilla en la web (CSV) y agregá a `config.json`:

```json
"sheet": {
  "id": "…",
  "pubId": "2PACX-…",
  "gids": { "Bloques": "0", "Tarjetas": "123456", "Encuentros": "…" }
}
```

El sitio prefiere ese endpoint, que es el más confiable para acceso anónimo.

## Qué resuelve el JavaScript

| Función | Para qué |
|---|---|
| Lectura del Sheet | El contenido se edita en una planilla, no en el código. |
| Sub-páginas por slug | Los bloques de la planilla se convierten en páginas con dirección propia. |
| Respaldo | Si la planilla no se puede leer, el alumno igual ve el programa. |
| Ajustes | Los textos fijos del sitio también se editan desde la planilla. |
| Barra de progreso | En qué encuentro del workshop estamos, sin contar a mano. |
| Bloqueo por fecha | Qué está disponible y cuándo se libera lo que falta. |
| Hora local | Los encuentros son 19 hs de Argentina. Fuera del país muestra la hora —y la fecha, que puede correrse al día siguiente. |
| Cuenta regresiva | Cuánto falta para el próximo encuentro. |
| Markdown | Las columnas de texto se escriben en markdown y se renderizan en el navegador. |
| Copiar link / `.ics` | El Zoom al portapapeles; los encuentros a la agenda, con aviso 30 min antes. |

Argentina no aplica horario de verano, así que 19:00 ART es siempre 22:00 UTC. Los encuentros se
construyen en UTC y se formatean con `Intl` en la zona del navegador.
