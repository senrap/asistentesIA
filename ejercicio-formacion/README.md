# Ejercicio · Formación — Power People

Web en formato slides para un ejercicio **sin Power BI**: los alumnos piensan la pregunta, las hipótesis, el paquete de datos y las recomendaciones para decidir qué hacer con el presupuesto de formación de una empresa ficticia. Mismo estilo y navegación que `ejercicio-ausentismo`.

## El caso

Mercado Austral (cadena de supermercados, 2.300 personas, 48 sucursales) invierte $180 M por año en formación. El Directorio quiere recortar 30% porque "se capacita mucho y no cambia nada". Solo se mide la satisfacción (4,6 / 5).

## Recorrido · 90 minutos · 3 IA

| # | Slide | Qué hace el alumno | IA |
|---|---|---|---|
| 1–5 | Portada, perfil, caso, misión, 4 niveles de Kirkpatrick | Contexto | |
| 6 | Paso 1 · La pregunta | Elige entre 6 preguntas (una sola válida). Al encontrarla aparece el cartel "Anotalo" con los 4 criterios de una buena pregunta | |
| 7 | Paso 2 · Hipótesis | Clasifica 5 hipótesis y arma hasta 3 propias | |
| 8 | Paso 3 · Debatí con IA | Prompt con sus hipótesis para que un LLM haga de Director Financiero escéptico. Anota lo que aprendió (va al resumen y a Gamma) | Claude / ChatGPT / Gemini |
| 9 | Paso 4 · Los datos | Elige las 4 tablas necesarias entre 8 (4 no corresponden) | |
| 10 | Paso 5 · El modelo | Conecta las tablas en un diagrama tipo dbdiagram: 3 relaciones | |
| 11 | Paso 6 · Resultados | Decide qué hacer con 5 programas; el presupuesto queda fijo arriba y se recalcula | |
| 12 | Paso 7 · Recomendaciones | Recomendaciones, cómo medir y nombre del equipo | |
| 13 | Paso 8 · Lovable | Prompt para construir la app de seguimiento a 3 meses | Lovable |
| 14 | Paso 9 · Gamma | Prompt con todo lo anterior para la presentación al Directorio | Gamma |
| 15 | Paso 10 · Mesa de debate | Resumen del equipo: copiar, descargar en PDF y preguntas para debatir. Descarga de la guía de recomendaciones | |
| 16 | Seguí explorando | Links y guía en PDF | |

Todo lo que completan queda guardado en el navegador y alimenta los prompts y el resumen.

## Respuestas de referencia

- **Pregunta:** opción D (atada a la decisión, medible, no da por hecha la respuesta).
- **Hipótesis bien formuladas:** 2 y 4. Las demás hay que mejorarlas.
- **Datos:** Nómina, Cursos realizados, Programas y Sucursales. No corresponden: respuestas de satisfacción (redundante), diagnósticos médicos, mails y chats, redes sociales.
- **Modelo:** Nómina.Legajo ↔ Cursos realizados.Legajo · Programas.Programa ↔ Cursos realizados.Programa · Sucursales.Sucursal ↔ Nómina.Sucursal. Las tres, uno a varios.
- **Decisiones recomendadas:** Onboarding → Invertir más · Liderazgo → Mantener · IA en el trabajo diario → Rediseñar · Atención al cliente → Rediseñar · Charlas → Recortar. Resultado: $126,6 M (−29,7%).

Supuestos del presupuesto: invertir más = +30%, rediseñar = −40%, recortar = −100%.

## PDFs

- **Resumen del equipo:** se genera desde la slide "Mesa de debate" con el diálogo de impresión del navegador (Guardar como PDF). Página 1: lo que definió el equipo. Página 2: recomendaciones clave.
- **Guía de recomendaciones:** `site/assets/guia-del-dato-a-la-decision.pdf`, fija. Se regenera con `python3 scripts/generar_guia.py <carpeta con Poppins-Regular/SemiBold/ExtraBold.ttf>`.

## Editar

- **Perfil, links, entrega:** `window.CONFIG` al principio de `site/index.html`.
- **Contenido del caso:** objetos `PREGUNTAS`, `ENUNCIADOS`, `DATOS`, `TABLAS`, `REL_OK`, `PROGS`, `CORE` e `ITER` en el `<script>` final.

## Deploy

Netlify con *Base directory* = `ejercicio-formacion`. El `netlify.toml` publica solo `site/`.
