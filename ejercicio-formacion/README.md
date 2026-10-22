# Ejercicio · Formación — Power People

Web en formato slides para un ejercicio **sin Power BI**: los alumnos piensan la pregunta, las hipótesis, el paquete de datos y las recomendaciones para decidir qué hacer con el presupuesto de formación de una empresa ficticia. Mismo estilo y navegación que `ejercicio-ausentismo`.

## El caso

Mercado Austral (cadena de supermercados, 2.300 personas, 48 sucursales) invierte $180 M por año en formación. El Directorio quiere recortar 30% porque "se capacita mucho y no cambia nada". Solo se mide la satisfacción (4,6 / 5).

## Recorrido · 90 minutos · 3 IA

| # | Slide | Qué hace el alumno | IA |
|---|---|---|---|
| 1–5 | Portada, perfil, caso, misión, 4 niveles de Kirkpatrick | Contexto | |
| 6 | Paso 1 · La pregunta | Elige entre 4 preguntas (con devolución) y escribe la suya | |
| 7 | Paso 2 · Hipótesis | Clasifica 5 hipótesis y arma hasta 3 propias | |
| 8 | Paso 3 · Debatí con IA | Prompt con sus hipótesis para que un LLM haga de Director Financiero escéptico | Claude / ChatGPT / Gemini |
| 9 | Paso 4 · Paquete de datos | Elige entre 14 fuentes (3 no corresponden) y define la clave de cruce | |
| 10 | Paso 5 · Resultados | Ve el impacto de 5 programas y decide qué hacer con cada uno; el presupuesto se recalcula | |
| 11 | Paso 6 · Recomendaciones | Escribe recomendaciones y cómo medir | |
| 12 | Paso 7 · Lovable | Prompt para construir la app de seguimiento a 3 meses | Lovable |
| 13 | Paso 8 · Gamma | Prompt con todo lo anterior para la presentación al Directorio | Gamma |
| 14 | Seguí explorando | Links | |

Todo lo que completan queda guardado en el navegador y alimenta los prompts.

## Respuestas de referencia

- **Pregunta:** opción B (atada a la decisión, medible, no da por hecha la respuesta).
- **Hipótesis bien formuladas:** 2 y 4. Las demás hay que mejorarlas.
- **Paquete de datos:** imprescindibles Nómina, Registro de cursos y Costos + al menos 2 indicadores de resultado. No corresponden: diagnósticos médicos, mails y chats, redes sociales. Claves de cruce: Legajo (personas) y Sucursal (ventas y NPS).
- **Decisiones recomendadas:** Onboarding → Invertir más · Liderazgo → Mantener · Excel → Rediseñar · Atención al cliente → Rediseñar · Charlas → Recortar. Resultado: $126,6 M (−29,7%), prácticamente el recorte pedido, sin tocar lo que funciona.

Supuestos del presupuesto: invertir más = +30%, rediseñar = −40%, recortar = −100%.

## Editar

- **Perfil, links, entrega:** `window.CONFIG` al principio de `site/index.html`.
- **Contenido del caso:** objetos `PREGUNTAS`, `ENUNCIADOS`, `DATOS`, `PROGS` e `ITER` en el `<script>` final.

## Deploy

Netlify con *Base directory* = `ejercicio-formacion`. El `netlify.toml` publica solo `site/`.
