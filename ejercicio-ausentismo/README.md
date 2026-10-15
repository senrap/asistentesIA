# Ejercicio · Ausentismo — Power People

Web en formato slides para acompañar el ejercicio de ausentismo de Power People, con identidad HACHE. Publicada en https://ejercicio-ausentismo.netlify.app (se despliega sola desde esta carpeta).

## Dos recorridos: se eligen en la portada

Las slides 1 a 6 (portada, perfil, caso, misión, qué medimos, calculadora) son comunes. La elección queda guardada en el navegador y se puede cambiar desde el índice.

**Exprés · 1 clase de 60 min** (base limpia `base_lista`, con columna `Año`)

| Paso | Slide | Qué hace el alumno |
|---|---|---|
| 1 | La base | Descarga, elige la columna que relaciona y conecta Empleados con Ausencias |
| 2 | Medidas | 4 medidas DAX (días hábiles con `SWITCH` por Año, sin Calendario) |
| 3 | Preguntas del negocio | 3 conclusiones con validación |
| 4 | Contá la historia | Gráfico antes/después + 3 reglas |
| 5 | Gamma | Prompt armado con sus respuestas. **Fin del Exprés** |

**Completo · 2 clases de 60 min** (base con errores `base_ausentismo`)

| Clase | Pasos | Hasta dónde llega |
|---|---|---|
| Clase 1 · Preparar los datos | 1 Base · 2 Limpiar (4 controles) · 3 Calendario · 4 Modelo | Termina con el modelo armado y el .pbix guardado |
| Clase 2 · Analizar y contar | 5 Medidas · 6 Preguntas · 7 Historia · 8 Gamma | Termina con la presentación en Gamma |
| Para la semana | 4 casos extra con validación | Se suman solos al prompt de Gamma |

Las preguntas del negocio, la historia y Gamma son las mismas slides en los dos recorridos. Las dos bases dan exactamente las mismas respuestas.

## Editar

- **Perfil, links y entrega:** objeto `window.CONFIG` al principio de `site/index.html`.
- **Preguntas, controles, medidas:** objetos `Q`, `CONTROLS` y `MEDIDAS` en el `<script>` final.
- **Respuestas correctas y vista previa de las tablas:** `site/datos/ejercicio.js`. No se edita a mano: lo genera el script.

## La base

Ficticia y reproducible: 410 empleados, ~4.000 ausencias, 2024 y 2025 completos.

```bash
python3 scripts/generar_base.py   # requiere pandas y openpyxl
```

Genera las dos bases (`base_ausentismo` con errores y `base_lista` limpia, cada una en .xlsx y .zip de CSV) y `ejercicio.js`. Si cambiás la base, las respuestas que valida la web se actualizan solas.

Simplificaciones a propósito: dotación fija (nadie entra ni sale) y días hábiles = lunes a viernes, igual que en las medidas DAX.

La guía docente con los patrones escondidos **no está en el repo** (es público).

## Deploy

Netlify con *Base directory* = `ejercicio-ausentismo`. El `netlify.toml` publica solo `site/`.
