# Biblioteca de Asistentes de HACHE

Sitio estático donde cualquiera puede **probar** un asistente de IA para procesos de selección y **descargar el prompt** que lo genera.

16 asistentes organizados por las 5 etapas del proceso: definición, atracción, filtrado, evaluación y cierre.

---

## Cómo está armado

Sin framework, sin build de bundler, sin backend. Tres piezas:

| Archivo | Qué es |
|---|---|
| `prompts/*.md` | **Fuente de verdad.** Un archivo por asistente, con el prompt completo. |
| `catalogo.json` | Metadata: nombre, etapa, resumen, qué necesitás, qué devuelve, tags. |
| `scripts/build.mjs` | Combina los dos anteriores en `assets/data.js`. |

El sitio (`index.html` + `assets/`) lee `window.BIBLIOTECA` de `assets/data.js`.

Se genera un `.js` y no un `.json` a propósito: así `index.html` funciona abriéndolo directo desde el disco, sin servidor. `fetch()` sobre `file://` lo bloquea el navegador, un `<script src>` no.

## Correrlo

```bash
node scripts/build.mjs      # regenera assets/data.js
npm run dev                 # build + servidor en http://localhost:4173
```

También podés abrir `index.html` con doble clic. `assets/data.js` está commiteado, así que no hace falta build para verlo.

## Agregar un asistente

1. Creá `prompts/mi-asistente.md` con el prompt.
2. Agregá la entrada en `catalogo.json` → `asistentes`:

```json
{
  "slug": "mi-asistente",
  "nombre": "Mi Asistente",
  "etapa": "filtrado",
  "orden": 3,
  "resumen": "Una línea de qué hace.",
  "para_que_sirve": "Dos líneas de en qué momento usarlo.",
  "necesitas": ["Dato 1", "Dato 2"],
  "entrega": "Qué te devuelve concretamente.",
  "tiempo": "10 min",
  "tags": ["etiqueta"],
  "destacado": false
}
```

3. `node scripts/build.mjs` y commiteá también `assets/data.js`.

El `slug` tiene que coincidir con el nombre del archivo. El build falla si hay un `.md` sin entrada en el catálogo, una entrada sin `.md`, un slug duplicado o una etapa que no existe.

Las variables `{{ASI}}` se detectan solas y se muestran resaltadas en el sitio.

## Convención de los prompts

Todos siguen la misma estructura:

```
Rol que asume la IA
## CONTEXTO          → variables {{ASI}} que completa el usuario
## TU TAREA          → qué hace, y si pregunta antes de responder
## FORMATO DE SALIDA → estructura exacta esperada
## REGLAS            → qué no hacer, incluidos criterios de no discriminación
```

Cada prompt funciona **standalone**: trae su propio bloque de contexto. Encadenarlos en una misma conversación funciona mejor, pero no es obligatorio.

## Cómo funciona "probar"

Los botones de ChatGPT y Claude copian el prompt al portapapeles y abren la herramienta con el prompt en la query string (`?prompt=` y `?q=`). Arriba de 6000 caracteres se abre la herramienta vacía y se avisa que el prompt ya está copiado — una URL más larga la rechaza el servidor.

No hay claves de API ni backend: nada de lo que hace el usuario sale de su navegador.

## Deploy

Es un sitio estático. Netlify (`netlify.toml` incluido), GitHub Pages, Vercel o cualquier hosting sirven sin configuración adicional.

## Origen del contenido

Los prompts parten de un documento interno de proceso de contratación y se reescribieron para: funcionar de forma independiente, usar variables en vez de datos hardcodeados de una empresa, agregar formatos de salida explícitos e incorporar criterios de no discriminación en los pasos de evaluación. Se sumaron cuatro asistentes que el proceso original no cubría: comité de decisión, propuesta de oferta, plan de onboarding 30/60/90 y `job-description-builder`.

## Licencia

Los prompts son de uso libre. Adaptalos al contexto de tu empresa: ningún prompt reemplaza el criterio de quien contrata.
