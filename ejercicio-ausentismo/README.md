# Ejercicio Final · Ausentismo — Power People

Web en formato slides para acompañar el ejercicio final de Power People: los alumnos analizan una base de ausentismo en Power BI y presentan hallazgos y recomendaciones.

Reversión de `ejerciciofinalpowerpeople.netlify.app`, con identidad HACHE.

## Qué tiene

14 slides navegables (flechas, swipe, índice con la tecla `I`, URL por slide `#1`…`#14`):

| # | Slide | Interacción |
|---|---|---|
| 1 | Portada | — |
| 2 | Quién te acompaña | Perfil editable desde `CONFIG` |
| 3 | El caso | Mail de la Gerenta de Personas |
| 4 | Tu misión | Limpiar → Modelar → Analizar → Contar |
| 5 | Qué medimos | Tasa, frecuencia, duración, Bradford |
| 6 | Calculadora | Tasa, días por persona, FTE y costo en vivo |
| 7 | La base | Diccionario de datos + descargas |
| 8 | Detective de datos | 6 tarjetas para revelar los errores de la base |
| 9 | Modelo y medidas | DAX con botón copiar |
| 10 | Preguntas guía | 9 preguntas en 3 niveles, con pistas y progreso guardado |
| 11 | Storytelling | Gráfico antes / después + estructura de 5 bloques |
| 12 | IA como copiloto | 3 prompts para copiar |
| 13 | Entrega | Rúbrica + autochequeo |
| 14 | Seguí explorando | Links a HACHE |

## Editar

- **Perfil, links y datos de la entrega:** objeto `window.CONFIG` al principio de `site/index.html`. Para sumar a alguien del equipo, agregá otro objeto en `acompanan`.
- **Textos de cada slide:** cada `<section class="slide">` en `site/index.html`.
- **Preguntas, medidas DAX, prompts y checklist:** arrays `LEVELS`, `DAX`, `PROMPTS` y `CHECKS` en el `<script>` final.

## La base

`site/datos/` tiene `empleados.csv`, `ausencias.csv` y `base_ausentismo.xlsx` (las dos tablas en un libro). Es ficticia y reproducible:

```bash
python3 scripts/generar_base.py   # requiere pandas y openpyxl
```

La guía docente con los patrones escondidos y las soluciones **no está en el repo** (es público): se guarda aparte.

## Deploy

Sitio estático, sin build. Dos opciones:

- **Netlify Drop:** arrastrá la carpeta `site/` a app.netlify.com/drop.
- **Desde el repo:** nuevo sitio en Netlify con *Base directory* = `ejercicio-ausentismo`. El `netlify.toml` publica solo `site/`.

También funciona abriendo `site/index.html` con doble clic.
