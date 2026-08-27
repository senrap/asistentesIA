/* ==========================================================================
   Lectura del Google Sheet de las cursadas de PoweRH.

   Este archivo es la ÚNICA fuente del parseo: corre en el navegador (el sitio
   lee la planilla en vivo) y en Node (el build guarda una copia de respaldo).
   scripts/build.mjs lo empaqueta a assets/sheet.js para el navegador.

   La planilla es chica a propósito. El contenido del programa —los bloques, el
   material, los textos— NO está acá: vive en lib/curriculo.mjs, versionado.
   La planilla solo tiene lo que cambia de una cursada a la otra.

     Cursos       una fila por cursada.
                  ID curso · Cliente · Sesiones · Inicio · Fin
                  y, opcionales: Link calendario · Link Zoom · Facilitador

     Grabaciones  una fila por sesión grabada.
                  ID curso · Sesión · Link
                  y, opcionales: Título · Bloque

   El "ID curso" es la dirección de su página: /powerh-acme. Y es lo que ata
   las dos pestañas.
   ========================================================================== */

/**
 * URLs candidatas para leer una hoja como CSV, en orden de preferencia.
 *
 *  1. "Publicar en la web" (/d/e/.../pub). Publica SOLO las pestañas elegidas,
 *     sin abrir el documento entero. Necesita el id de publicación y el gid de
 *     cada hoja, los dos en config.json.
 *  2. gviz. Alcanza con "cualquiera con el enlace".
 *  3. /export. Necesita el gid; queda como último recurso.
 *
 * El parámetro _cb evita que el navegador o Google sirvan una copia cacheada:
 * sin él, un cambio recién hecho en la planilla puede tardar en aparecer.
 */
export function urlsHoja(sheet, hoja) {
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
export function pareceCsv(texto) {
  if (!texto) return false;
  var t = texto.replace(/^\ufeff/, '').trimStart();
  if (t.charAt(0) === '<') return false;
  // gviz devuelve los errores como una llamada a google.visualization.
  if (/^\/\*O_o\*\//.test(t) || /google\.visualization/.test(t.slice(0, 200))) return false;
  return true;
}

/**
 * Parser de CSV (RFC 4180): respeta comillas, comas y saltos de línea dentro
 * de una celda.
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

/** "ID curso" -> "id curso". Sin tildes, sin mayúsculas. */
export function normalizarClave(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Busca el primer valor no vacío entre varios nombres de columna posibles. */
function campo(o, nombres) {
  for (var i = 0; i < nombres.length; i++) {
    var v = (o[nombres[i]] || '').trim();
    if (v) return v;
  }
  return '';
}

/** La columna que asocia una fila a una cursada, en sus formas habituales. */
function idCurso(o) {
  return campo(o, ['id curso', 'idcurso', 'id', 'curso', 'id programa', 'programa']);
}

/**
 * El nombre de un bloque, convertido en el último tramo de su dirección.
 *
 * "Bloque 1: Los datos pueden transformar HR 🚀"
 *   -> "bloque-1-los-datos-pueden-transformar-hr"
 */
export function aSlug(nombre) {
  return String(nombre || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    // Fuera todo lo que no sea letra, número o separador: emojis incluidos.
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Fechas. Acepta "AAAA-MM-DD", "D/M/AAAA", "D/M/AA" y "D/M" (a esta última le
 * pone el año de referencia de config.json). Devuelve "AAAA-MM-DD" o "".
 */
export function aISO(valor, anioRef) {
  var v = String(valor || '').trim();
  if (!v) return '';

  // gviz a veces devuelve Date(2026,7,19): el mes viene en base 0.
  var g = v.match(/^Date\((\d+),(\d+),(\d+)/);
  if (g) return dosPuntos(+g[1], +g[2] + 1, +g[3]);

  // AAAA-MM-DD
  var iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return dosPuntos(+iso[1], +iso[2], +iso[3]);

  // D/M/AAAA
  var conAnio = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (conAnio) return dosPuntos(+conAnio[3], +conAnio[2], +conAnio[1]);

  // D/M/AA
  var cortito = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/);
  if (cortito) return dosPuntos(2000 + +cortito[3], +cortito[2], +cortito[1]);

  // D/M — sin año.
  var sinAnio = v.match(/^(\d{1,2})[/-](\d{1,2})$/);
  if (sinAnio) {
    var anio = anioRef || new Date().getFullYear();
    return dosPuntos(anio, +sinAnio[2], +sinAnio[1]);
  }

  return '';
}

function dosPuntos(y, m, d) {
  return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}

/** Le pone https:// a "youtube.com/watch?v=..." y descarta "-" o vacío. */
export function aUrl(valor) {
  var v = String(valor || '').trim();
  if (!v || v === '-' || v === '—') return '';
  // Una celda de la planilla no puede convertirse en "javascript:…".
  if (/^mailto:/i.test(v)) return v;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^www\./i.test(v) || /^[a-z0-9-]+\.[a-z]{2,}\//i.test(v)) return 'https://' + v;
  return '';
}

/* --------------------------------------------------------------------------
   Mapeos: de filas de la planilla a lo que consume el sitio
   -------------------------------------------------------------------------- */

/**
 * Hoja Cursos -> una cursada por fila.
 *
 *   ID curso         obligatoria. Es la dirección de la página: /powerh-acme
 *   Cliente          el nombre que se muestra arriba de todo
 *   Sesiones         cuántos encuentros tiene
 *   Inicio · Fin     las fechas de la portada
 *   Link calendario  opcional; sin él no aparece el botón
 *   Link Zoom        opcional; sin él no aparece el botón
 *   Facilitador      opcional; sin él va el del currículo
 */
export function mapearCursos(objetos, anioRef) {
  var cursos = [];

  objetos.forEach(function (o) {
    var id = idCurso(o);
    if (!id) return; // fila vacía o de totales: se ignora en silencio

    var inicio = aISO(campo(o, ['inicio', 'fecha de inicio', 'desde']), anioRef);
    var fin = aISO(campo(o, ['fin', 'fecha de fin', 'hasta']), anioRef);
    // Un fin anterior al inicio significa que la cursada cruza el año.
    if (inicio && fin && fin < inicio) {
      fin = aISO(campo(o, ['fin', 'fecha de fin', 'hasta']),
        (anioRef || new Date().getFullYear()) + 1);
    }

    var sesiones = parseInt(campo(o, ['sesiones', 'encuentros', 'cantidad de sesiones']), 10);

    cursos.push({
      id: id,
      cliente: campo(o, ['cliente', 'nombre del cliente', 'empresa']),
      sesiones: isNaN(sesiones) ? 0 : sesiones,
      inicio: inicio,
      fin: fin,
      calendario: aUrl(campo(o, ['link calendario', 'link al calendario', 'calendario',
        'calendar', 'link calendar'])),
      zoom: aUrl(campo(o, ['link zoom', 'zoom', 'link de zoom'])),
      facilitador: campo(o, ['facilitador', 'facilitadora', 'quien lo dicta']),
      bloques: [],
      grabaciones: []
    });
  });

  return cursos;
}

/**
 * Hoja Grabaciones -> una fila por sesión grabada.
 *
 *   ID curso   obligatoria, la ata a su cursada
 *   Sesión     el número de encuentro
 *   Link       la grabación. Es lo que abre el bloque.
 *   Título     opcional, para nombrar el encuentro
 *   Bloque     opcional. Solo hace falta si una cursada agrupa las sesiones
 *              distinto de lo que dice el currículo. Acepta el número (3) o el
 *              nombre del bloque.
 *
 * Sin fecha a propósito: no llevamos registro de cuándo fue cada encuentro.
 */
export function mapearGrabaciones(objetos) {
  return objetos
    .map(function (o) {
      var curso = idCurso(o);
      if (!curso) return null;

      var link = aUrl(campo(o, ['link de la grabacion', 'link', 'grabacion', 'url', 'video']));
      var sesion = campo(o, ['sesion', 'sesion n', 'n', 'nro', 'numero', 'encuentro', 'orden']);
      if (!link && !sesion) return null;

      var n = parseInt(sesion, 10);
      var bloque = campo(o, ['bloque', 'nro bloque', 'numero de bloque']);
      var nBloque = parseInt(bloque, 10);

      return {
        curso: curso,
        sesion: sesion,
        numero: isNaN(n) ? 0 : n,
        titulo: (o['titulo'] || '').trim(),
        // El bloque se puede indicar por número o por nombre; guardamos las dos
        // lecturas y armar() usa la que sirva.
        bloqueNumero: isNaN(nBloque) ? 0 : nBloque,
        bloqueSlug: bloque && isNaN(nBloque) ? aSlug(bloque) : '',
        link: link
      };
    })
    .filter(Boolean)
    .sort(function (a, b) {
      return a.numero - b.numero;
    });
}

/* --------------------------------------------------------------------------
   Unir el currículo (fijo) con la planilla (variable)
   -------------------------------------------------------------------------- */

/**
 * Cada cursada se queda con sus grabaciones y con una copia propia de los
 * bloques del currículo.
 *
 * LO QUE ABRE UN BLOQUE ES LA GRABACIÓN, no una fecha: un bloque está abierto
 * cuando alguna de las sesiones que cubre ya tiene link cargado. Un bloque
 * cerrado se lista igual —para que se vea el recorrido completo— pero sin
 * objetivo, sin tarjetas y sin link a su página.
 *
 * El recorte es de verdad, no un "display: none": así la copia de respaldo que
 * guarda el build sale sin el material que todavía no corresponde. En el
 * navegador el currículo entero ya viajó igual, así que esto ordena la
 * experiencia, no protege un secreto.
 */
export function armar(curriculo, datos) {
  var cursos = (datos.cursos || []).slice();
  var porId = {};

  cursos.forEach(function (c) {
    porId[String(c.id).toLowerCase()] = c;
    c.grabaciones = [];
  });

  (datos.grabaciones || []).forEach(function (g) {
    var c = porId[String(g.curso).toLowerCase()];
    if (c) c.grabaciones.push(g);
  });

  var plantilla = curriculo.bloques || [];

  cursos.forEach(function (c) {
    var vistos = {};

    c.bloques = plantilla.map(function (b, i) {
      var numero = i + 1;
      var base = aSlug(b.nombre) || 'bloque-' + numero;
      // Dos bloques que normalizan igual no pueden compartir dirección.
      var slug = base;
      if (vistos[base]) {
        vistos[base]++;
        slug = base + '-' + vistos[base];
      } else {
        vistos[base] = 1;
      }

      var sesiones = b.sesiones || [];
      var suyas = c.grabaciones.filter(function (g) {
        if (g.bloqueNumero) return g.bloqueNumero === numero;
        if (g.bloqueSlug) return g.bloqueSlug === base;
        return sesiones.indexOf(g.numero) > -1;
      });

      var abierto = suyas.some(function (g) {
        return !!g.link;
      });

      return {
        numero: numero,
        total: plantilla.length,
        nombre: b.nombre,
        slug: slug,
        titulo: b.titulo || '',
        emoji: b.emoji || '',
        bajada: b.bajada || '',
        sesiones: sesiones,
        abierto: abierto,
        objetivo: abierto ? b.objetivo || '' : '',
        tarjetas: abierto ? (b.tarjetas || []).map(copiarTarjeta) : [],
        grabaciones: suyas
      };
    });

    // La despedida se ofrece cuando ya está todo grabado.
    c.completo = c.bloques.length > 0 && c.bloques.every(function (b) {
      return b.abierto;
    });

    c.facilitador = c.facilitador || (curriculo.facilitador || {}).nombre || '';
  });

  return { cursos: cursos };
}

function copiarTarjeta(t) {
  return {
    tipo: t.tipo || 'contenido',
    titulo: t.titulo || '',
    texto: t.texto || '',
    imagen: t.imagen || '',
    link: t.link || '',
    archivos: (t.archivos || []).slice()
  };
}

/** La cursada que pide una dirección, comparando sin distinguir mayúsculas. */
export function cursoPorId(cursos, id) {
  if (!id) return null;
  var buscado = String(id).toLowerCase();
  for (var i = 0; i < cursos.length; i++) {
    if (String(cursos[i].id).toLowerCase() === buscado) return cursos[i];
  }
  return null;
}

/** El bloque que se está cursando: el último ya abierto. */
export function bloqueActual(bloques) {
  for (var i = bloques.length - 1; i >= 0; i--) {
    if (bloques[i].abierto) return bloques[i];
  }
  return null;
}

/**
 * Las sesiones de una cursada, con su grabación si ya está cargada. Sale de la
 * columna Sesiones, así que una sesión sin fila en Grabaciones aparece igual.
 */
export function sesionesDe(curso) {
  var porNumero = {};
  curso.grabaciones.forEach(function (g) {
    if (g.numero) porNumero[g.numero] = g;
  });

  var filas = [];
  for (var n = 1; n <= curso.sesiones; n++) {
    filas.push(porNumero[n] || { numero: n, sesion: String(n), titulo: '', link: '' });
  }
  // Una grabación con un número fuera de rango se suma igual: mejor mostrarla
  // que perderla por un error de tipeo en la planilla.
  curso.grabaciones.forEach(function (g) {
    if (!g.numero || g.numero > curso.sesiones) filas.push(g);
  });

  return filas;
}
