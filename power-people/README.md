# Power People 2026 — sitio del programa

Sitio estático para los alumnos de Power People 2026. Sin framework, sin build, sin backend:
`index.html` + dos archivos en `assets/`. Se abre con doble clic o se publica en cualquier hosting.

Se despliega en `/power-people/` del mismo sitio que la Biblioteca de Asistentes.

## Qué incluye hoy

La **columna de bienvenida**: bienvenida, "¿Cómo se cursa?", encuentros sincrónicos (con link de
Zoom) y canales de dudas. Las demás columnas del Padlet se suman a medida que llegue el contenido.

## Editar el programa

Todo lo configurable vive en el objeto `CONFIG`, arriba de `assets/programa.js`:

```js
var CONFIG = {
  zoom: "https://us02web.zoom.us/j/84283169271",
  whatsapp: null,          // poné acá la URL de invitación al grupo
  inicio: "2026-08-19",
  fin: "2026-12-02",
  horaArgentina: 19,
  duracionHoras: 1
};
```

En cuanto `whatsapp` deje de ser `null`, el botón "Entrar al grupo de WhatsApp" aparece solo en la
tarjeta correspondiente.

## Fechas de los encuentros

Están en el HTML, en `<ol data-agenda>`. Cada `<li>` necesita el `data-date` en formato
`YYYY-MM-DD` y el texto visible:

```html
<li data-date="2026-09-09"><span class="agenda-date">mié 9 sep</span></li>
```

El JS se encarga del resto: marca el próximo, tacha los que pasaron, calcula la cuenta regresiva y
arma el `.ics`.

## Qué resuelve el JS (y por qué)

| Función | Para qué |
|---|---|
| Barra de progreso | El alumno ve en qué semana del programa está, sin contar a mano. |
| Hora local | Los encuentros son 19 hs de Argentina. Si el alumno está en otra zona, ve su hora —y su fecha, que puede correrse al día siguiente. |
| Cuenta regresiva | Cuánto falta para el próximo encuentro. |
| Copiar link | El link de Zoom al portapapeles, sin seleccionar texto. |
| Descargar `.ics` | Los 8 encuentros a la agenda del alumno, con recordatorio 30 min antes. |

Argentina no aplica horario de verano, así que 19:00 ART es siempre 22:00 UTC. Los encuentros se
construyen en UTC y se formatean con `Intl` en la zona del navegador: no hay conversiones a mano.

## Probarlo

```bash
python3 -m http.server 4173   # desde la raíz del repo
# http://localhost:4173/power-people/
```
