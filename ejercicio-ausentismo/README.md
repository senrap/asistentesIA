# Ejercicio · Ausentismo — Power People

Web en formato slides para acompañar el ejercicio de ausentismo de Power People, con identidad HACHE. Publicada en https://ejercicio-ausentismo.netlify.app (se despliega sola desde esta carpeta).

## Estructura: 2 clases de una hora + casos para la semana

| # | Slide | Qué hace el alumno |
|---|---|---|
| 1–6 | **Intro**: portada, quién acompaña, el caso, misión, qué medimos, calculadora | Contexto (~10 min) |
| 7 | **Clase 1 · La base** | Descarga XLSX o CSV (.zip) y elige la columna que relaciona las tablas |
| 8 | **Clase 1 · Limpiar** | 4 controles en Power Query: tipo de datos, duplicados por ID, motivos (reemplazar valores), fechas invertidas (con IA). Paso a paso opcional |
| 9 | **Clase 1 · Calendario** | Consulta en blanco + Generador de Calendario (01/01/2024 – 31/12/2025) |
| 10 | **Clase 1 · Modelo** | Relaciones Empleados→Ausencias y Calendario→Ausencias |
| 11 | **Clase 2 · Medidas** | 4 medidas DAX + checkpoint de días perdidos |
| 12 | **Clase 2 · Preguntas del negocio** | 3 conclusiones para completar, con validación |
| 13 | **Clase 2 · Contá la historia** | Gráfico antes/después + 3 reglas |
| 14 | **Clase 2 · Gamma** | Prompt armado con sus respuestas + recomendación |
| 15 | **Semana · Casos extra** | 4 casos con validación que se suman al prompt |
| 16 | **Seguí explorando** | Web, Generador de Calendario, YouTube |

## Editar

- **Perfil, links y entrega:** objeto `window.CONFIG` al principio de `site/index.html`.
- **Preguntas, controles, medidas:** objetos `Q`, `CONTROLS` y `MEDIDAS` en el `<script>` final.
- **Respuestas correctas y vista previa de las tablas:** `site/datos/ejercicio.js`. No se edita a mano: lo genera el script.

## La base

Ficticia y reproducible: 410 empleados, ~4.000 ausencias, 2024 y 2025 completos.

```bash
python3 scripts/generar_base.py   # requiere pandas y openpyxl
```

Genera `base_ausentismo.xlsx`, `base_ausentismo_csv.zip` y `ejercicio.js`. Si cambiás la base, las respuestas que valida la web se actualizan solas.

Simplificaciones a propósito: dotación fija (nadie entra ni sale) y días hábiles = lunes a viernes, igual que en las medidas DAX.

La guía docente con los patrones escondidos **no está en el repo** (es público).

## Deploy

Netlify con *Base directory* = `ejercicio-ausentismo`. El `netlify.toml` publica solo `site/`.
