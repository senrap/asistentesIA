/* Generado por scripts/build.mjs desde lib/sheet.mjs — no editar a mano. */
(function (global) {
  "use strict";
/* ==========================================================================
   Lectura del Google Sheet de PoweRH.

   Este archivo es la ÚNICA fuente del parseo: corre en el navegador (el sitio
   lee la planilla en vivo) y en Node (el build guarda una copia de respaldo).
   scripts/build.mjs lo empaqueta a assets/sheet.js para el navegador.

   La planilla tiene cinco hojas:
     Bloques        una fila por bloque. El nombre del bloque ES la sub-página.
     Tarjetas       una fila por tarjeta, colgada de un bloque.
     Encuentros     una fila por sesión en vivo.
     Facilitadores  una fila por persona.
     Ajustes        clave/valor con los textos y links fijos del sitio.
   ========================================================================== */

/**
 * URLs candidatas para leer una hoja como CSV, en orden de preferencia.
 *
 * Google expone varios endpoints y no todos responden igual según cómo esté
 * compartida la planilla, así que probamos en orden y nos quedamos con el
 * primero que devuelva CSV de verdad.
 *
 *  1. "Publicar en la web" (/d/e/.../pub). Es el más confiable para acceso
 *     anónimo desde el navegador, pero necesita el id de publicación y el gid
 *     de cada hoja. Solo se usa si están en la config.
 *  2. gviz. Alcanza con "cualquiera con el enlace" y con el nombre de la hoja.
 *  3. /export. Necesita el gid; queda como último recurso.
 *
 * El parámetro _cb evita que el navegador o Google sirvan una copia cacheada:
 * sin él, un cambio recién hecho en la planilla puede tardar en aparecer.
 */
function urlsHoja(sheet, hoja) {
  var urls = [];
  var cb = '&_cb=' + Date.now();
  var gid = sheet.gids && sheet.gids[hoja];

  if (sheet.pubId && gid != null) {
    urls.push(
      'https://docs.google.com/spreadsheets/d/e/' + sheet.pubId +
        '/pub?gid=' + gid + '&single=true&output=csv' + cb
    );
  }

  urls.push(
    'https://docs.google.com/spreadsheets/d/' + sheet.id +
      '/gviz/tq?tqx=out:csv&headers=1&sheet=' + encodeURIComponent(hoja) + cb
  );

  if (gid != null) {
    urls.push(
      'https://docs.google.com/spreadsheets/d/' + sheet.id +
        '/export?format=csv&gid=' + gid + cb
    );
  }

  return urls;
}

/** true si la respuesta es CSV y no la página de login o de error de Google. */
function pareceCsv(texto) {
  if (!texto) return false;
  var t = texto.replace(/^\ufeff/, '').trimStart();
  if (t.charAt(0) === '<') return false;
  // gviz devuelve los errores como una llamada a google.visualization.
  if (/^\/\*O_o\*\//.test(t) || /google\.visualization/.test(t.slice(0, 200))) return false;
  return true;
}

/**
 * Parser de CSV (RFC 4180): respeta comillas, comas y saltos de línea dentro
 * de una celda — la columna Texto los va a tener.
 */
function parseCsv(texto) {
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
function aObjetos(filas) {
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
function normalizarClave(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * El nombre del bloque, convertido en la URL de su sub-página.
 *
 * "Bloque 1: Los datos pueden transformar HR 🚀" -> "bloque-1-los-datos-pueden-transformar-hr"
 *
 * Es lo que hace que la planilla pueda crear páginas nuevas: si mañana aparece
 * una fila con un nombre que no existía, aparece la sub-página que le
 * corresponde sin tocar el código ni volver a deployar.
 */
function aSlug(nombre) {
  var s = String(nombre || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    // Fuera todo lo que no sea letra, número o separador: emojis incluidos.
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s;
}

/**
 * Fechas: aceptamos todo lo que la planilla pueda escupir, porque depende de
 * cómo Google interprete la celda y de la configuración regional del archivo.
 * Devuelve "AAAA-MM-DD" o "".
 */
function aISO(valor) {
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
function aHora(valor, porDefecto) {
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
function aUrl(valor) {
  var v = String(valor || '').trim();
  if (!v || v === '-' || v === '—') return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (/^www\./i.test(v) || /^[a-z0-9-]+\.[a-z]{2,}\//i.test(v)) return 'https://' + v;
  return '';
}

/** "Nómina Panda | https://..." -> {nombre, url}. Sin nombre -> nombre por defecto. */
function aArchivo(valor, indice) {
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
function instanteAR(fecha, hora) {
  var f = fecha.split('-').map(Number);
  var h = (hora || '00:00').split(':').map(Number);
  return new Date(Date.UTC(f[0], f[1] - 1, f[2], h[0], h[1]) + 3 * 3600000);
}

/* --------------------------------------------------------------------------
   Mapeos: de filas de la planilla a lo que consume el sitio
   -------------------------------------------------------------------------- */

/**
 * Hoja Bloques -> las sub-páginas del sitio.
 *
 * El slug sale del nombre. Si dos filas normalizan al mismo slug (pasa cuando
 * el nombre solo cambia en un emoji) la segunda recibe un sufijo, así los
 * links nunca apuntan a dos bloques distintos.
 */
function mapearBloques(objetos) {
  var bloques = [];
  var vistos = {};

  objetos.forEach(function (o) {
    var nombre = (o['bloque'] || '').trim();
    if (!nombre) return; // fila vacía o basura: se ignora en silencio

    var slug = aSlug(nombre) || 'bloque';
    if (vistos[slug]) {
      vistos[slug]++;
      slug = slug + '-' + vistos[slug];
    } else {
      vistos[slug] = 1;
    }

    bloques.push({
      numero: bloques.length + 1,
      nombre: nombre,
      slug: slug,
      fecha: aISO(o['fecha']),
      hora: aHora(o['hora'], '19:00'),
      titulo: (o['titulo'] || '').trim(),
      emoji: (o['emoji'] || '').trim(),
      bajada: (o['bajada'] || '').trim(),
      objetivo: (o['objetivo'] || '').trim(),
      facilitador: (o['facilitador'] || '').trim(),
      tarjetas: [],
      encuentros: []
    });
  });

  return bloques;
}

/** Tipos de tarjeta que el sitio sabe dibujar. Cualquier otro cae en "contenido". */
var TIPOS = ['contenido', 'material', 'tarea', 'grabacion', 'enlace'];

/** Hoja Tarjetas -> las tarjetas de cada bloque. */
function mapearTarjetas(objetos) {
  return objetos
    .map(function (o, i) {
      var titulo = (o['titulo'] || '').trim();
      var texto = (o['texto'] || '').trim();
      var bloque = (o['bloque'] || '').trim();
      if (!bloque || (!titulo && !texto)) return null;

      var archivos = [];
      [1, 2, 3].forEach(function (n) {
        var a = aArchivo(o['archivo ' + n], n);
        if (a) archivos.push(a);
      });

      var tipo = normalizarClave(o['tipo']);
      if (TIPOS.indexOf(tipo) === -1) tipo = 'contenido';

      var orden = parseFloat(o['orden']);

      return {
        bloque: bloque,
        slugBloque: aSlug(bloque),
        tipo: tipo,
        titulo: titulo,
        texto: texto,
        imagen: aUrl(o['imagen']),
        link: aUrl(o['link']),
        archivos: archivos,
        fecha: aISO(o['fecha']),
        hora: aHora(o['hora'], '00:00'),
        orden: isNaN(orden) ? i : orden,
        // El orden de la planilla desempata cuando dos tarjetas comparten Orden.
        _fila: i
      };
    })
    .filter(Boolean)
    .sort(function (a, b) {
      return a.orden - b.orden || a._fila - b._fila;
    });
}

/** Hoja Encuentros -> las sesiones en vivo. */
function mapearEncuentros(objetos) {
  return objetos
    .map(function (o) {
      var fecha = aISO(o['fecha']);
      if (!fecha) return null;
      var bloque = (o['bloque'] || '').trim();
      return {
        // El encabezado suele escribirse "Nº", pero también aparece "N°", "Nro"
        // o "Número". Aceptamos todas para que nadie pierda el número por eso.
        numero: numeroDe(o),
        fecha: fecha,
        hora: aHora(o['hora'], '19:00'),
        titulo: (o['titulo'] || '').trim(),
        bloque: bloque,
        slugBloque: bloque ? aSlug(bloque) : '',
        facilitador: (o['facilitador'] || '').trim(),
        grabacion: aUrl(o['grabacion'])
      };
    })
    .filter(Boolean)
    .sort(function (a, b) {
      return a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0;
    });
}

function numeroDe(o) {
  var claves = ['n', 'n\u00ba', 'n\u00b0', 'no', 'nro', 'numero', 'orden', 'encuentro'];
  for (var i = 0; i < claves.length; i++) {
    var v = (o[claves[i]] || '').trim();
    if (v) return v;
  }
  return '';
}

/** Hoja Facilitadores -> lista de personas. */
function mapearFacilitadores(objetos) {
  return objetos
    .filter(function (o) {
      return (o['nombre'] || '').trim();
    })
    .map(function (o) {
      var nombre = o['nombre'].trim();
      // La columna Foto acepta las dos cosas: una o dos letras, o la URL de una
      // imagen. Las iniciales calculadas quedan igual como respaldo por si la
      // imagen no carga.
      var ini = (o['foto'] || o['iniciales'] || '').trim();
      var foto = /^(https?:\/\/|www\.)/i.test(ini) ? aUrl(ini) : '';
      return {
        bloque: (o['bloque'] || '').trim(),
        slugBloque: aSlug(o['bloque'] || ''),
        nombre: nombre,
        rol: (o['rol'] || '').trim(),
        foto: foto,
        iniciales: foto ? iniciales(nombre) : ini || iniciales(nombre),
        bio: (o['bio'] || '').trim(),
        linkedin: aUrl(o['linkedin']),
        mail: (o['mail'] || '').trim(),
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
 * Hoja Ajustes -> un objeto plano clave/valor.
 * Es lo que hace editables los textos fijos del sitio sin tocar el código.
 */
function mapearAjustes(objetos) {
  var ajustes = {};
  objetos.forEach(function (o) {
    var clave = (o['clave'] || '').trim();
    if (!clave) return;
    ajustes[clave] = (o['valor'] || '').trim();
  });
  return ajustes;
}

/**
 * Une todo: cada bloque se queda con sus tarjetas y sus encuentros, y se
 * aplica el bloqueo por fecha.
 *
 * Bloqueo: un bloque cuyo momento todavía no llegó se muestra con candado —
 * conserva nombre, fecha y bajada, pero pierde tarjetas, objetivo y links. Una
 * tarjeta con Fecha propia posterior se libera después que su bloque.
 *
 * OJO: cuando esto corre en el navegador, el CSV completo ya viajó hasta ahí.
 * El bloqueo evita mostrar el contenido, no que alguien lo busque a mano.
 * El bloqueo duro solo existe en la copia que arma el build.
 */
function armar(datos, ahora) {
  var t = ahora instanceof Date ? ahora.getTime() : Date.now();
  var bloques = datos.bloques || [];
  var porSlug = {};

  bloques.forEach(function (b) {
    porSlug[b.slug] = b;
    b.tarjetas = [];
    b.encuentros = [];
    // Sin fecha, el bloque está abierto: sirve para material permanente.
    b.abierto = !b.fecha || instanteAR(b.fecha, b.hora).getTime() <= t;
  });

  (datos.tarjetas || []).forEach(function (tar) {
    var b = porSlug[tar.slugBloque];
    if (!b) return; // tarjeta huérfana: su bloque no existe (todavía)
    var propia = tar.fecha ? instanteAR(tar.fecha, tar.hora).getTime() <= t : true;
    tar.abierta = b.abierto && propia;
    b.tarjetas.push(tar);
  });

  (datos.encuentros || []).forEach(function (e) {
    var b = e.slugBloque ? porSlug[e.slugBloque] : null;
    if (b) b.encuentros.push(e);
  });

  // El bloqueo se aplica recortando de verdad, no escondiendo con CSS: así la
  // copia de respaldo que guarda el build sale ya sin los links futuros.
  bloques.forEach(function (b) {
    if (b.abierto) {
      b.tarjetas = b.tarjetas.map(function (tar) {
        return tar.abierta ? tar : recortarTarjeta(tar);
      });
      return;
    }
    b.objetivo = '';
    b.tarjetas = [];
    b.encuentros = b.encuentros.map(function (e) {
      return {
        numero: e.numero, fecha: e.fecha, hora: e.hora, titulo: e.titulo,
        bloque: e.bloque, slugBloque: e.slugBloque, facilitador: e.facilitador,
        grabacion: ''
      };
    });
  });

  return {
    bloques: bloques,
    encuentros: (datos.encuentros || []).map(function (e) {
      var b = e.slugBloque ? porSlug[e.slugBloque] : null;
      // La grabación de un encuentro se libera con su bloque.
      return b && !b.abierto ? Object.assign({}, e, { grabacion: '' }) : e;
    }),
    facilitadores: datos.facilitadores || [],
    ajustes: datos.ajustes || {}
  };
}

function recortarTarjeta(tar) {
  return {
    bloque: tar.bloque, slugBloque: tar.slugBloque, tipo: tar.tipo,
    titulo: tar.titulo, texto: '', imagen: '', link: '', archivos: [],
    fecha: tar.fecha, hora: tar.hora, orden: tar.orden, abierta: false
  };
}

/** El bloque que se está cursando: el último ya liberado. */
function bloqueActual(bloques) {
  for (var i = bloques.length - 1; i >= 0; i--) {
    if (bloques[i].abierto) return bloques[i];
  }
  return bloques[0] || null;
}

/** El facilitador de un bloque, con el general (fila sin Bloque) como respaldo. */
function facilitadorDe(facilitadores, bloque) {
  var general = null;
  for (var i = 0; i < facilitadores.length; i++) {
    var f = facilitadores[i];
    if (bloque && f.slugBloque && f.slugBloque === bloque.slug) return f;
    if (bloque && bloque.facilitador && f.nombre === bloque.facilitador) return f;
    if (!f.bloque && !general) general = f;
  }
  return general || facilitadores[0] || null;
}

  global.RHSheet = { urlsHoja: urlsHoja, pareceCsv: pareceCsv, parseCsv: parseCsv, aObjetos: aObjetos, normalizarClave: normalizarClave, aSlug: aSlug, aISO: aISO, aHora: aHora, aUrl: aUrl, aArchivo: aArchivo, instanteAR: instanteAR, mapearBloques: mapearBloques, mapearTarjetas: mapearTarjetas, mapearEncuentros: mapearEncuentros, mapearFacilitadores: mapearFacilitadores, mapearAjustes: mapearAjustes, armar: armar, bloqueActual: bloqueActual, facilitadorDe: facilitadorDe };
})(typeof window !== "undefined" ? window : this);
