# Power BI para recursos humanos

Una sola página con todo el programa: quién lo dicta, qué hay que tener listo
antes de empezar, y las dos partes del contenido con su material y su tarea.

Sin planilla, sin sub-páginas y **sin una línea de JavaScript en el navegador**.
Es HTML y CSS servidos tal cual.

---

## Qué tiene y qué no

A diferencia del sitio de PoweRH (`../poweRH/`), que arma una página por cursada
leyendo un Google Sheet, acá **no hay nada dinámico**: es un programa fijo, en
una página, con el mismo link para todos.

Si algún día hace falta una página por cliente, con grabaciones y bloques que se
abren de a poco, eso ya existe y es el otro sitio. Este no se cruza con aquel:
son dos proyectos de Netlify distintos, con su propia base directory.

---

## Cómo se edita

Todo el contenido está en **`contenido.mjs`**: los títulos, la ficha de quién lo
dicta, las dos tarjetas de "antes de empezar" y las tarjetas de cada parte.

```bash
node scripts/build.mjs   # regenera index.html
```

`index.html` está versionado a propósito: el sitio anda aunque el build no
llegue a correr. Netlify igual lo regenera en cada deploy.

**No edites `index.html` a mano**, se pisa en el próximo build.

### El orden de las tarjetas

Es el orden del array `tarjetas` de cada parte, sin ninguna lógica encima. Hoy:

| Parte 1 | Parte 2 |
| --- | --- |
| Base para el ejercicio | 5 pasos para crear buenas visualizaciones |
| Las 4 vistas de Power BI | Poderes ocultos de las visualizaciones |
| Obtener datos | Tarea |
| Transformar datos | |
| Tarea | |

La tarea va al final en las dos.

### El texto de las tarjetas

Acepta un markdown mínimo: `**negrita**`, `*itálica*`, `` `código` ``,
`## subtítulo`, listas con guiones y listas numeradas, y `[texto](url)`. Un
asterisco literal se escribe `\*`.

Todo se escapa antes de convertirse en HTML, y de las URLs solo se aceptan
`http`, `https` y `mailto`.

---

## Los archivos

```
contenido.mjs          EL CONTENIDO. Es el único archivo que vas a editar.
scripts/build.mjs      Lo convierte en index.html. Incluye el markdown.
index.html             ← generado
assets/estilo.css      El sistema de diseño de HACHE
assets/pablo.png       La foto, ya recortada en cuadrado y a 400px
netlify.toml           Config del deploy
```

La hoja de estilos es una copia de la del sitio de PoweRH, para que los dos se
vean igual. Trae reglas de componentes que esta página no usa (las rutas de
bloques, las grabaciones, el cierre); están de más pero no molestan, y dejarlas
significa que agregar un componente después no requiere tocar nada.

---

## El deploy

Netlify, con **Base directory: `powerbi-rrhh`**. Con esa base Netlify lee este
`netlify.toml` y publica esta carpeta como raíz del sitio.

El resto del repositorio —la Biblioteca de Asistentes en la raíz, Power People
en `power-people/`, PoweRH en `poweRH/`— se despliega aparte, cada uno con su
propia base.

---

## Trabajar en local

```bash
npm run dev     # build + servidor en localhost:4174
```
