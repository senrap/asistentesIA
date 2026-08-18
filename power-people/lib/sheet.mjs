/* ==========================================================================
   Lectura del Google Sheet de Power People 2026.

   Este archivo es la ÚNICA fuente del parseo: corre en el navegador (el sitio
   lee la planilla en vivo) y en Node (el build guarda una copia de respaldo).
   scripts/build.mjs lo empaqueta a assets/sheet.js para el navegador.
   ========================================================================== */

/** URL del CSV de una hoja de un Sheet publicado como "cualquiera con el enlace". */
export function urlHoja(id, hoja) {
  return (
    'https://docs.google.com/spreadsheets/d/' +
    id +
    '/gviz/tq?tqx=out:csv&sheet=' +
    encodeURIComponent(hoja)
  );
}

/**
 * Parser de CSV (RFC 4180): respeta comillas, comas y saltos de línea dentro
 * de una celda — la columna Texto los va a tener.
 */
export function parseCsv(texto) {
  var filas = [];
  var fila = [];
  var campo = '';
  var enComillas = false;
  var i = 0;

  // Sacar el BOM que a veces manda Google.
  if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1);

  while (i < texto.length) {
    var c = texto[i];

    if (enComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          campo += '"';
          i += 2;
          continue;
        }
        enComillas = false;
        i++;
        continue;
      }
      campo += c;
      i++;
      continue;
    }

    if (c === '"') {
      enComillas = true;
      i++;
    } else if (c === ',') {
      fila.push(campo);
      campo = '';
      i++;
    } else if (c === '\r') {
      i++;
    } else if (c === '\n') {
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = '';
      i++;
    } else {
      campo += c;
      i++;
    }
  }

  if (campo !== '' || fila.length) {
    fila.push(campo);
    filas.push(fila);
  }

  return filas;
}

/** Filas + encabezado -> array de objetos con las claves normalizadas. */
export function aObjetos(filas) {
  if (!filas.length) return [];
  var claves = filas[0].map(normalizarClave);
  return filas.slice(1).map(function (f) {
    var o = {};
    claves.forEach(function (k, i) {
      if (k) o[k] = (f[i] || '').trim();
    });
    return o;
  });
}

/** "Sesión Online" -> "sesion online". Sin tildes, sin mayúsculas. */
export function normalizarClave(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Fechas: aceptamos todo lo que la planilla pueda escupir, porque depende de
 * cómo Google interprete la celda y de la configuración regional del archivo.
 * Devuelve "AAAA-MM-DD" o "".
 */
export function aISO(valor) {
  var v = String(valor || '').trim();
  if (!v) return '';

  // gviz a veces devuelve Date(2026,7,19): el mes viene en base 0.
  var g = v.match(/^Date\((\d+),(\d+),(\d+)/);
  if (g) return dosPuntos(+g[1], +g[2] + 1, +g[3]);

  // AAAA-MM-DD
  var iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return dosPuntos(+iso[1], +iso[2], +iso[3]);

  // D/M/AAAA. Es la forma en que lo escribe gente en Argentina, y también la
  // que devuelve gviz con el archivo en configuración regional local.
  var barra = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (barra) return dosPuntos(+barra[3], +barra[2], +barra[1]);

  return '';
}

function dosPuntos(y, m, d) {
  return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}

/** "19:30", "19:30:00", "7:05 p. m." -> "19:30". Vacío -> por defecto. */
export function aHora(valor, porDefecto) {
  var v = String(valor || '').trim();
  if (!v) return porDefecto || '19:00';
  var m = v.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return porDefecto || '19:00';
  var h = +m[1];
  if (/p\.?\s?m/i.test(v) && h < 12) h += 12;
  if (/a\.?\s?m/i.test(v) && h === 12) h = 0;
  return String(h).padStart(2, '0') + ':' + m[2];
}

/** Le pone https:// a "youtube.com/watch?v=..." y descarta "-" o vacío. */
export function aUrl(valor) {
  var v = String(valor || '').trim();
  if (!v || v === '-' || v === '—') return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (/^www\./i.test(v) || /^[a-z0-9-]+\.[a-z]{2,}\//i.test(v)) return 'https://' + v;
  return '';
}

/** "Nómina Panda | https://..." -> {nombre, url}. Sin nombre -> nombre por defecto. */
export function aArchivo(valor, indice) {
  var v = String(valor || '').trim();
  if (!v || v === '-') return null;
  var partes = v.split('|');
  if (partes.length > 1) {
    var url = aUrl(partes.slice(1).join('|'));
    if (!url) return null;
    return { nombre: partes[0].trim() || 'Archivo ' + indice, url: url };
  }
  var solo = aUrl(v);
  return solo ? { nombre: 'Archivo ' + indice, url: solo } : null;
}

/** Instante real de un "AAAA-MM-DD" + "HH:MM" en hora de Argentina (GMT-3). */
export function instanteAR(fecha, hora) {
  var f = fecha.split('-').map(Number);
  var h = (hora || '00:00').split(':').map(Number);
  return new Date(Date.UTC(f[0], f[1] - 1, f[2], h[0], h[1]) + 3 * 3600000);
}

/** Filas de la hoja Contenido -> semanas del programa. */
export function mapearSemanas(objetos) {
  var semanas = [];

  objetos.forEach(function (o) {
    var fecha = aISO(o['fecha']);
    if (!fecha) return; // fila vacía o basura: se ignora en silencio

    var videos = [];
    var l1 = aUrl(o['link']);
    var l2 = aUrl(o['link 2'] || o['link2']);
    if (l1) videos.push({ titulo: 'Grabación 1', url: l1, nota: (o['nota'] || '').trim() });
    if (l2) videos.push({ titulo: 'Grabación 2', url: l2, nota: '' });
    if (videos.length === 1) videos[0].titulo = 'Ver la grabación';

    var archivos = [];
    [1, 2, 3].forEach(function (n) {
      var a = aArchivo(o['archivo ' + n], n);
      if (a) archivos.push(a);
    });

    var numSesion = (o['sesion online'] || '').trim();

    semanas.push({
      numero: semanas.length + 1,
      fecha: fecha,
      hora: aHora(o['hora'], '19:00'),
      modulo: (o['modulo'] || '').trim(),
      etiqueta: (o['grabacion'] || '').trim(),
      titulo: (o['titulo'] || '').trim(),
      facilitador: (o['facilitador'] || '').trim(),
      texto: (o['texto'] || '').trim(),
      videos: videos,
      archivos: archivos,
      sesion: numSesion
        ? {
            numero: numSesion,
            fecha: fecha,
            facilitador: (o['facilitador'] || '').trim(),
            grabacion: aUrl(o['link sesion'])
          }
        : null
    });
  });

  return semanas;
}

/** Filas de la hoja Facilitadores -> lista por módulo. */
export function mapearFacilitadores(objetos) {
  return objetos
    .filter(function (o) {
      return (o['modulo'] || '').trim() && (o['nombre'] || '').trim();
    })
    .map(function (o) {
      var nombre = o['nombre'].trim();
      return {
        modulo: o['modulo'].trim(),
        nombre: nombre,
        rol: (o['rol'] || '').trim(),
        iniciales: (o['iniciales'] || '').trim() || iniciales(nombre),
        bio: (o['bio'] || '').trim(),
        linkedin: aUrl(o['linkedin']),
        cita: (o['cita'] || '').trim()
      };
    });
}

function iniciales(nombre) {
  return nombre
    .split(/\s+/)
    .slice(0, 2)
    .map(function (p) {
      return p[0] || '';
    })
    .join('')
    .toUpperCase();
}

/**
 * Bloqueo por fecha: una semana cuyo momento no llegó pierde los links, los
 * archivos y el texto. Conserva fecha, módulo y título — el alumno ve qué
 * viene y cuándo.
 *
 * OJO: cuando esto corre en el navegador, el CSV completo ya viajó hasta ahí.
 * El bloqueo evita mostrar el contenido, no que alguien lo busque a mano.
 * El bloqueo duro solo existe en la copia que arma el build.
 */
export function aplicarBloqueo(semanas, ahora) {
  var t = ahora instanceof Date ? ahora.getTime() : Date.now();

  return semanas.map(function (s) {
    var abierta = instanteAR(s.fecha, s.hora).getTime() <= t;
    var sesion = s.sesion
      ? {
          numero: s.sesion.numero,
          fecha: s.sesion.fecha,
          facilitador: s.sesion.facilitador,
          // La grabación del encuentro se libera junto con la semana siguiente.
          grabacion: abierta ? s.sesion.grabacion : ''
        }
      : null;

    return {
      numero: s.numero,
      fecha: s.fecha,
      hora: s.hora,
      modulo: s.modulo,
      etiqueta: s.etiqueta,
      titulo: s.titulo,
      facilitador: s.facilitador,
      abierta: abierta,
      texto: abierta ? s.texto : '',
      videos: abierta ? s.videos : [],
      archivos: abierta ? s.archivos : [],
      sesion: sesion
    };
  });
}

/** El módulo que se está cursando: el de la última semana ya liberada. */
export function moduloActual(semanas) {
  for (var i = semanas.length - 1; i >= 0; i--) {
    if (semanas[i].abierta && semanas[i].modulo) return semanas[i].modulo;
  }
  // Antes de que arranque el programa mostramos el primero.
  for (var j = 0; j < semanas.length; j++) {
    if (semanas[j].modulo) return semanas[j].modulo;
  }
  return '';
}
