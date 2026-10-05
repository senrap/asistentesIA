# Este repositorio

Cuatro sitios estáticos **independientes**, cada uno con su propia carpeta, su
propio `netlify.toml` y su propio proyecto en Netlify. No comparten build ni se
pisan entre sí: tocar uno no afecta a los otros.

| Carpeta | Qué es | Dónde se documenta |
| --- | --- | --- |
| raíz | Biblioteca de Asistentes de IA para selección | `README.md` |
| `power-people/` | Sitio del programa Power People | `power-people/` |
| `poweRH/` | Workshop PoweRH: **una página por cursada**, alimentado por un Google Sheet | `poweRH/README.md` |
| `powerbi-rrhh/` | Power BI para recursos humanos: **una sola página**, sin planilla | `powerbi-rrhh/README.md` |

**Antes de tocar cualquiera de los dos últimos, leé su README.** Ahí está cómo
se edita el contenido, cómo se abren los bloques y cómo se despliega. Esto es
solo el mapa.

Sin framework y sin dependencias: HTML, CSS y JavaScript a secas en los cuatro.

---

## Estado operativo

Lo que no se deduce del código.

### poweRH

- Netlify: proyecto **`powerh-hache`**, ya conectado al repo y publicando.
- Planilla: **PoweRH · Cursadas**
  (`12VMD-rJAr970gLupIdywP-k7nt9gI4_Fo4kSzoqd28M`), compartida como
  "cualquiera con el enlace puede ver". Tiene una pestaña `Como se usa` con las
  instrucciones adentro.
- Está en uso con cursadas reales cargadas.

### powerbi-rrhh

- Netlify: proyecto **`powerbi-rrhh-hache`** creado, **todavía sin conectar al
  repo y sin ningún deploy**. Queda pendiente conectarlo desde la interfaz de
  Netlify con *Base directory* `powerbi-rrhh`.

---

## Dos cosas que conviene saber

**El deploy no se puede hacer desde la sesión.** La política de red del entorno
bloquea `api.netlify.com` y `netlify-mcp.netlify.app`, que son los dos caminos
para subir archivos. Crear proyectos y leer su estado sí funciona, porque va por
el conector de Netlify. Conectar el repo desde la interfaz es lo que destraba el
deploy automático; no hay que insistir con la subida directa.

**La rama de producción no es `main`.** Los sitios se despliegan desde
`claude/web-powerh-editable-e86559`. Funciona, pero es una rama de trabajo: si
se borra, los sitios se quedan sin fuente. Mergearla a `main` y cambiar la rama
de producción en cada proyecto de Netlify es una mejora pendiente, no urgente.

---

## Convenciones

- Los archivos generados (`assets/sheet.js`, `assets/curriculo.js`,
  `assets/cursos.js`, `powerbi-rrhh/index.html`) **están versionados a
  propósito**: los sitios andan aunque el build no llegue a correr. No editarlos
  a mano, se pisan en el próximo build.
- Comentarios y mensajes de commit en español rioplatense.
- Todo texto que venga de una planilla o del contenido se escapa antes de
  convertirse en HTML, y de las URLs solo se aceptan `http`, `https` y `mailto`.
- El sistema de diseño de HACHE (navy `#00344D`, verde `#00FF90`, Poppins) está
  implementado en `assets/estilo.css` de cada sitio.
