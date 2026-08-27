# PoweRH — el sitio del workshop

Una página por cursada, con el material de cada bloque, las grabaciones y el
cierre. Sin framework, sin dependencias: HTML, CSS y JavaScript a secas.

---

## Lo primero: dónde se edita cada cosa

Hay **dos fuentes**, y no se pisan.

| Qué | Dónde | Cómo se cambia |
| --- | --- | --- |
| El contenido del programa: bloques, objetivos, material, tareas, la ficha de quien lo dicta, los textos del sitio, la página de cierre | `lib/curriculo.mjs` | Se edita el archivo, se commitea, se deploya |
| Lo de cada cursada: cliente, cuántas sesiones, inicio, fin, link al calendario, link de Zoom y **las grabaciones** | El Google Sheet | Se edita la planilla y se ve al recargar, sin deploy |

La regla para decidir dónde va algo: **si es igual en todas las cursadas, es
currículo; si cambia de una a otra, es planilla.**

---

## Cómo se abre un bloque

No hay fechas por bloque. **Lo que abre un bloque es su grabación.**

Cada bloque declara en `lib/curriculo.mjs` qué encuentros cubre:

```js
{ nombre: 'Bloque 2: …', sesiones: [3, 4], … }
```

Apenas una de esas sesiones tiene link cargado en la pestaña `Grabaciones`, el
bloque se abre: aparece su página, su objetivo y sus tarjetas. Antes de eso se
lista con candado y no lleva a ningún lado.

Cuando **todas** las sesiones tienen grabación, se suma la página de cierre.

> **Ojo con esto:** la tarjeta *Base para el ejercicio* está en el Bloque 1, así
> que con esta regla no se ve hasta que cargues la grabación del encuentro 1.
> Lo que sí se ve desde el primer día es la sección **Bienvenida**, con el paso
> a paso para instalar Power BI. Si querés que la base también esté antes de
> empezar, se mueve a `curriculo.antes` y listo.

---

## La planilla

Es esta: **PoweRH · Cursadas**
(`12VMD-rJAr970gLupIdywP-k7nt9gI4_Fo4kSzoqd28M`). Tiene una tercera pestaña,
`Como se usa`, que repite todo esto adentro del propio archivo.

### Pestaña `Cursos` — una fila por cursada

| Columna | | Para qué |
| --- | --- | --- |
| **ID curso** | obligatoria | La dirección de la página: `/powerh-acme`. Sin espacios ni acentos. Es el link que mandás al grupo. |
| **Cliente** | | El nombre que se ve arriba de todo. `General` significa cursada abierta y muestra "Workshop". |
| **Sesiones** | | Cuántos encuentros tiene. |
| **Inicio** / **Fin** | | `dd/mm/aaaa`. |
| **Link calendario** | opcional | Sin valor, el botón no aparece. |
| **Link Zoom** | opcional | Sin valor, el botón no aparece. |
| **Facilitador** | opcional | Sin valor va el del currículo. |

### Pestaña `Grabaciones` — una fila por encuentro

| Columna | | Para qué |
| --- | --- | --- |
| **ID curso** | obligatoria | El mismo id que pusiste en `Cursos`. |
| **Sesión** | obligatoria | El número de encuentro: 1, 2, 3… Con eso se sabe a qué bloque va. |
| **Link** | | La grabación. **Es lo que abre el bloque.** |
| **Título** | opcional | Para nombrar el encuentro. |
| **Bloque** | opcional | Solo si esa cursada agrupa las sesiones distinto del currículo. Acepta el número (`3`) o el nombre del bloque. |

No hay columna de fecha: no llevamos registro de cuándo fue cada encuentro.

### Para que el sitio la pueda leer

La planilla tiene que ser legible sin login. Dos caminos:

1. **Publicar en la web** (el prolijo). *Archivo → Compartir → Publicar en la
   web*, formato **CSV**, eligiendo `Cursos` y `Grabaciones`. Después va a
   `config.json` el `pubId` (el tramo `/d/e/…/pub` de la URL que te da) y el
   `gid` de cada pestaña —el `#gid=…` del final de su URL—:

   ```json
   "pubId": "2PACX-1vT…",
   "gids": { "Cursos": "0", "Grabaciones": "123456789" }
   ```

2. **Cualquiera con el enlace puede ver.** Alcanza y no hay que tocar nada más,
   pero abre el documento entero a quien tenga el link.

Sea cual sea, **la lista de clientes queda accesible para quien sepa buscarla**.
Por eso la portada del sitio no lista las cursadas: cada persona entra por su
link.

Si algo no anda, `/diagnostico.html` prueba la lectura en vivo y dice qué
endpoint funcionó y qué falló.

---

## Las direcciones

```
/                                    portada, pide el código de la cursada
/powerh-acme                         la página de esa cursada
/powerh-acme/bloque-1-los-datos-…    uno de sus bloques
/powerh-acme/cierre                  la despedida
/diagnostico.html                    la herramienta de diagnóstico
```

No hay un archivo por cursada ni por bloque: `netlify.toml` reescribe todo a
`curso.html`, `bloque.html` o `cierre.html`, y el JS decide qué mostrar. Una
cursada nueva en la planilla estrena su página sin tocar el repo.

**El orden de las reglas importa:** `/:curso/cierre` va antes que
`/:curso/:bloque`, que matchea cualquier segundo tramo.

---

## Los archivos

```
lib/curriculo.mjs      EL CONTENIDO. Es el archivo que más vas a editar.
lib/sheet.mjs          Lee y parsea el Sheet, y lo cruza con el currículo.
                       Corre igual en Node y en el navegador.

curso.html             /:curso
bloque.html            /:curso/:bloque
cierre.html            /:curso/cierre
index.html             la portada
diagnostico.html       herramienta interna

assets/comun.js        markdown, fechas, ruteo, arranque
assets/curso.js        dibuja la página de la cursada
assets/bloque.js       dibuja la de un bloque
assets/cierre.js       dibuja la despedida
assets/estilo.css      el sistema de diseño de HACHE

assets/sheet.js        ← generado desde lib/sheet.mjs
assets/curriculo.js    ← generado desde lib/curriculo.mjs
assets/config.js       ← generado desde config.json
assets/cursos.js       ← copia de respaldo de la planilla

scripts/build.mjs      genera esos cuatro
scripts/servir.mjs     servidor de desarrollo con las mismas reescrituras
fixtures/*.csv         datos de mentira para trabajar sin red
```

Los cuatro `assets/*` generados están versionados a propósito: el sitio anda
aunque el build no llegue a correr.

---

## Trabajar en local

```bash
npm run dev     # build desde fixtures/ + servidor en localhost:4173
```

Levanta tres cursadas de mentira que cubren los tres estados:

| | |
| --- | --- |
| `/powerh-demo` | a mitad de camino: dos bloques abiertos, dos con candado |
| `/powerh-acme` | recién arranca: sin ninguna grabación, todo cerrado |
| `/powerh-nubeq` | terminada: todo abierto, con la página de cierre |

Otros comandos:

```bash
npm run build         # lee el Sheet de verdad
npm run build:local   # lee fixtures/
```

Agregá `?debug` a cualquier URL para ver de dónde salió cada dato.

---

## El deploy

Netlify, con **Base directory: `poweRH`**. Con esa base Netlify lee este
`netlify.toml` y publica esta carpeta como raíz: las cursadas quedan en `/`, no
en `/poweRH/`.

El resto del repositorio —la Biblioteca de Asistentes en la raíz, Power People
en `power-people/`— se despliega aparte, cada uno con su propia base.

El build **no rompe el deploy** si no puede leer la planilla: avisa y conserva
el respaldo anterior. Sí se cae si `config.json` no tiene el id, que es un error
de configuración y no un problema de red.

---

## Un par de decisiones, por si sorprenden

- **El bloqueo no es seguridad.** En el navegador el currículo entero ya viajó
  hasta ahí: esconder un bloque ordena la experiencia, no protege un secreto.
  El recorte de verdad solo existe en la copia que guarda el build.
- **El texto que viene de la planilla se escapa siempre** antes de convertirse
  en HTML, y de las URLs solo se aceptan `http`, `https` y `mailto`. Una celda
  no puede meter un `javascript:` en la página.
- **La portada no lista las cursadas.** Los nombres de los clientes están en la
  planilla y esto es un sitio público.
