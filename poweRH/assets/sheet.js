/* Generado por scripts/build.mjs desde lib/sheet.mjs — no editar a mano. */
(function (global) {
  "use strict";
/* ==========================================================================
   Lectura del Google Sheet "Asistencia HACHE".

   Este archivo es la ÚNICA fuente del parseo: corre en el navegador (el sitio
   lee la planilla en vivo) y en Node (el build guarda una copia de respaldo).
   scripts/build.mjs lo empaqueta a assets/sheet.js para el navegador.

   La planilla ya existía y la usa otro desarrollo. De sus pestañas, el sitio
   SOLO LEE — nunca escribe, y no depende de ninguna columna nueva en ellas:

     Workshops      una fila por programa. Define el id, el nombre, las fechas,
                    la cantidad de sesiones y el facilitador. NO SE TOCA.

   Y suma estas, que son del sitio:

     Bloques        una fila por bloque. El nombre del bloque es su sub-página.
     Tarjetas       una fila por tarjeta, colgada de un bloque.
     Grabaciones    una fila por sesión grabada.
     Facilitadores  una fila por persona, buscada por el nombre de Workshops.
     Ajustes        clave/valor con los textos y links del sitio.

   Todo lo del sitio se asocia a un programa por su "ID programa", que es el
   ID de Workshops y también la dirección de su página: /Pope17.
   ========================================================================== */

/**
 * URLs candidatas para leer una hoja como CSV, en orden de preferencia.
 *
 *  1. "Publicar en la web" (/d/e/.../pub). Es el camino recomendado para esta
 *     planilla: publica SOLO las pestañas elegidas, sin abrir el documento
 *     entero — que tiene mails de participantes en otras hojas. Necesita el id
 *     de publicación y el gid de cada hoja, los dos en config.json.
 *  2. gviz. Alcanza con "cualquiera con el enlace", pero eso abre el documento
 *     completo: sirve para una planilla que no tenga datos personales.
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

/** "ID programa" -> "id programa". Sin tildes, sin mayúsculas. */
function normalizarClave(s) {
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

/** La columna que asocia una fila a un programa, en sus formas habituales. */
function idPrograma(o) {
  return campo(o, ['id programa', 'idprograma', 'id', 'programa', 'workshop id', 'workshop_id']);
}

/**
 * El nombre de un bloque, convertido en el último tramo de su dirección.
 *
 * "Bloque 1: Los datos pueden transformar HR 🚀"
 *   -> "bloque-1-los-datos-pueden-transformar-hr"
 *
 * Es lo que hace que la planilla pueda crear páginas nuevas: si mañana aparece
 * una fila con un nombre que no existía, aparece la sub-página que le
 * corresponde sin tocar el código ni volver a deployar.
 */
function aSlug(nombre) {
  return String(nombre || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    // Fuera todo lo que no sea letra, número o separador: emojis incluidos.
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Fechas. En Workshops vienen como "20/01" o "8/4": día y mes, sin año. Se le
 * pone el año de referencia, y si el resultado queda muy en el pasado se
 * asume el que viene (una planilla que se sigue usando habla del año en curso).
 * También acepta "AAAA-MM-DD" y "D/M/AAAA" por si alguna fila trae el año.
 * Devuelve "AAAA-MM-DD" o "".
 */
function aISO(valor, anioRef) {
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

  // D/M — el caso de Workshops.
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

/** Medianoche de un "AAAA-MM-DD" en hora de Argentina (GMT-3). */
function instanteAR(fecha) {
  var f = fecha.split('-').map(Number);
  return new Date(Date.UTC(f[0], f[1] - 1, f[2]) + 3 * 3600000);
}

/* --------------------------------------------------------------------------
   Mapeos: de filas de la planilla a lo que consume el sitio
   -------------------------------------------------------------------------- */

/**
 * Hoja Workshops -> los programas del sitio. Es de otro desarrollo, así que
 * acá solo se lee, y solo las columnas que hacen falta:
 *
 *   A ID           el id del programa. Es su dirección: /Pope17
 *   B Actividad    el nombre que se muestra
 *   C Inicio       fecha de inicio
 *   D Sesiones     cuántos encuentros tiene
 *   G Fin          fecha de fin
 *   M FACILITADOR  el nombre, que se busca en la hoja Facilitadores
 *
 * Cliente, Logo y COMENTARIOS se leen si están, para la portada del programa.
 */
function mapearProgramas(objetos, anioRef) {
  var programas = [];

  objetos.forEach(function (o) {
    var id = (o['id'] || '').trim();
    if (!id) return; // fila vacía o de totales: se ignora en silencio

    var inicio = aISO(o['inicio'], anioRef);
    var fin = aISO(o['fin'], anioRef);
    // Un fin anterior al inicio significa que el programa cruza el año.
    if (inicio && fin && fin < inicio) {
      fin = aISO(o['fin'], (anioRef || new Date().getFullYear()) + 1);
    }

    var sesiones = parseInt(o['sesiones'], 10);

    programas.push({
      id: id,
      slug: id,
      nombre: (o['actividad'] || '').trim() || id,
      inicio: inicio,
      fin: fin,
      sesiones: isNaN(sesiones) ? 0 : sesiones,
      facilitador: (o['facilitador'] || '').trim(),
      cliente: (o['cliente'] || '').trim(),
      logo: aUrl(o['logo']),
      comentarios: (o['comentarios'] || '').trim(),
      bloques: [],
      grabaciones: [],
      ajustes: {}
    });
  });

  return programas;
}

/** Hoja Bloques -> las sub-páginas de cada programa. */
function mapearBloques(objetos, anioRef) {
  var vistos = {};

  return objetos
    .map(function (o, i) {
      var nombre = campo(o, ['bloque', 'nombre']);
      var programa = idPrograma(o);
      if (!nombre || !programa) return null;

      // El slug es único dentro de su programa: dos programas pueden tener
      // un "Bloque 1" cada uno sin pisarse, porque la dirección los separa.
      var base = aSlug(nombre) || 'bloque';
      var clave = programa + '/' + base;
      var slug = base;
      if (vistos[clave]) {
        vistos[clave]++;
        slug = base + '-' + vistos[clave];
      } else {
        vistos[clave] = 1;
      }

      var orden = parseFloat(o['orden']);

      return {
        programa: programa,
        nombre: nombre,
        slug: slug,
        titulo: (o['titulo'] || '').trim(),
        emoji: (o['emoji'] || '').trim(),
        bajada: (o['bajada'] || '').trim(),
        objetivo: (o['objetivo'] || '').trim(),
        fecha: aISO(o['fecha'], anioRef),
        orden: isNaN(orden) ? i : orden,
        _fila: i,
        tarjetas: [],
        grabaciones: []
      };
    })
    .filter(Boolean)
    .sort(function (a, b) {
      return a.orden - b.orden || a._fila - b._fila;
    });
}

/**
 * Tipos de tarjeta que el sitio sabe dibujar, en el orden en que se muestran.
 * El texto largo va al final: primero lo que el alumno viene a buscar
 * —el material, la presentación, la tarea— y después la explicación.
 * La columna Orden pisa este orden cuando hace falta.
 */
var ORDEN_TIPO = { material: 0, enlace: 1, grabacion: 2, tarea: 3, contenido: 4 };

/** Hoja Tarjetas -> las tarjetas de cada bloque. */
function mapearTarjetas(objetos, anioRef) {
  return objetos
    .map(function (o, i) {
      var titulo = (o['titulo'] || '').trim();
      var texto = (o['texto'] || '').trim();
      var bloque = (o['bloque'] || '').trim();
      var programa = idPrograma(o);
      if (!bloque || !programa || (!titulo && !texto)) return null;

      var archivos = [];
      [1, 2, 3].forEach(function (n) {
        var a = aArchivo(o['archivo ' + n], n);
        if (a) archivos.push(a);
      });

      var tipo = normalizarClave(o['tipo']);
      if (!(tipo in ORDEN_TIPO)) tipo = 'contenido';

      var orden = parseFloat(o['orden']);

      return {
        programa: programa,
        bloque: bloque,
        slugBloque: aSlug(bloque),
        tipo: tipo,
        titulo: titulo,
        texto: texto,
        imagen: aUrl(o['imagen']),
        link: aUrl(o['link']),
        archivos: archivos,
        fecha: aISO(o['fecha'], anioRef),
        // Sin Orden manda el tipo: el texto queda debajo del material y la tarea.
        orden: isNaN(orden) ? ORDEN_TIPO[tipo] : orden,
        _fila: i
      };
    })
    .filter(Boolean)
    .sort(function (a, b) {
      return a.orden - b.orden || a._fila - b._fila;
    });
}

/** Hoja Grabaciones -> una fila por sesión grabada. */
function mapearGrabaciones(objetos, anioRef) {
  return objetos
    .map(function (o) {
      var programa = idPrograma(o);
      if (!programa) return null;
      var link = aUrl(campo(o, ['link de la grabacion', 'link', 'grabacion', 'url']));
      var sesion = campo(o, ['sesion', 'sesion n', 'n', 'nro', 'numero', 'encuentro']);
      if (!link && !sesion) return null;

      var bloque = (o['bloque'] || '').trim();
      var n = parseInt(sesion, 10);

      return {
        programa: programa,
        sesion: sesion,
        numero: isNaN(n) ? 0 : n,
        titulo: (o['titulo'] || '').trim(),
        fecha: aISO(o['fecha'], anioRef),
        bloque: bloque,
        slugBloque: bloque ? aSlug(bloque) : '',
        link: link
      };
    })
    .filter(Boolean)
    .sort(function (a, b) {
      return a.numero - b.numero;
    });
}

/**
 * Hoja Facilitadores -> las personas.
 * Se buscan por el nombre que aparece en la columna FACILITADOR de Workshops,
 * así que la clave es el nombre y no hace falta repetirlo por programa.
 */
function mapearFacilitadores(objetos) {
  return objetos
    .filter(function (o) {
      return (o['nombre'] || '').trim();
    })
    .map(function (o) {
      var nombre = o['nombre'].trim();
      // La columna Foto acepta las dos cosas: una o dos letras, o la URL de una
      // imagen. Las iniciales calculadas quedan como respaldo por si no carga.
      var ini = campo(o, ['foto', 'iniciales']);
      var foto = /^(https?:\/\/|www\.)/i.test(ini) ? aUrl(ini) : '';
      return {
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
 * Hoja Ajustes -> los textos y links del sitio, por programa.
 *
 * Una fila sin "ID programa" vale para todos; una con id pisa ese valor para
 * ese programa. Así el Zoom de cada workshop se carga una vez y los textos
 * comunes no se repiten fila por fila.
 */
function mapearAjustes(objetos) {
  var generales = {};
  var porPrograma = {};

  objetos.forEach(function (o) {
    var clave = campo(o, ['clave', 'key']);
    if (!clave) return;
    var valor = (o['valor'] || '').trim();
    var programa = idPrograma(o);

    if (!programa) {
      generales[clave] = valor;
      return;
    }
    if (!porPrograma[programa]) porPrograma[programa] = {};
    porPrograma[programa][clave] = valor;
  });

  return { generales: generales, porPrograma: porPrograma };
}

/**
 * Une todo: cada programa se queda con sus bloques, sus tarjetas, sus
 * grabaciones y sus ajustes, y se aplica el bloqueo por fecha.
 *
 * Bloqueo: un bloque cuya fecha todavía no llegó se muestra con candado —
 * conserva nombre, fecha y bajada, pero pierde tarjetas, objetivo y links. Una
 * tarjeta con Fecha propia posterior se libera después que su bloque.
 *
 * OJO: cuando esto corre en el navegador, el CSV completo ya viajó hasta ahí.
 * El bloqueo evita mostrar el contenido, no que alguien lo busque a mano.
 * El bloqueo duro solo existe en la copia que arma el build.
 */
function armar(datos, ahora) {
  var t = ahora instanceof Date ? ahora.getTime() : Date.now();
  var programas = datos.programas || [];
  var porId = {};
  var ajustes = datos.ajustes || { generales: {}, porPrograma: {} };

  programas.forEach(function (p) {
    porId[p.id] = p;
    p.bloques = [];
    p.grabaciones = [];
    p.ajustes = Object.assign({}, ajustes.generales, (ajustes.porPrograma || {})[p.id] || {});
  });

  var bloquePorClave = {};

  (datos.bloques || []).forEach(function (b) {
    var p = porId[b.programa];
    if (!p) return; // bloque de un programa que no está en Workshops
    b.numero = p.bloques.length + 1;
    // Sin fecha, el bloque está abierto: sirve para material permanente.
    b.abierto = !b.fecha || instanteAR(b.fecha).getTime() <= t;
    b.tarjetas = [];
    b.grabaciones = [];
    bloquePorClave[b.programa + '/' + aSlug(b.nombre)] = b;
    p.bloques.push(b);
  });

  (datos.tarjetas || []).forEach(function (tar) {
    var b = bloquePorClave[tar.programa + '/' + tar.slugBloque];
    if (!b) return; // tarjeta huérfana: su bloque no existe (todavía)
    var propia = tar.fecha ? instanteAR(tar.fecha).getTime() <= t : true;
    tar.abierta = b.abierto && propia;
    b.tarjetas.push(tar);
  });

  (datos.grabaciones || []).forEach(function (g) {
    var p = porId[g.programa];
    if (!p) return;
    p.grabaciones.push(g);
    var b = g.slugBloque ? bloquePorClave[g.programa + '/' + g.slugBloque] : null;
    if (b) b.grabaciones.push(g);
  });

  // El bloqueo se aplica recortando de verdad, no escondiendo con CSS: así la
  // copia de respaldo que guarda el build sale ya sin los links futuros.
  programas.forEach(function (p) {
    p.bloques.forEach(function (b) {
      if (b.abierto) {
        b.tarjetas = b.tarjetas.map(function (tar) {
          return tar.abierta ? tar : recortarTarjeta(tar);
        });
        return;
      }
      b.objetivo = '';
      b.tarjetas = [];
      b.grabaciones = [];
    });
    // Una grabación de un bloque cerrado tampoco se lista en el programa.
    p.grabaciones = p.grabaciones.map(function (g) {
      var b = g.slugBloque ? bloquePorClave[g.programa + '/' + g.slugBloque] : null;
      if (b && !b.abierto) {
        return { programa: g.programa, sesion: g.sesion, numero: g.numero,
                 titulo: g.titulo, fecha: g.fecha, bloque: g.bloque,
                 slugBloque: g.slugBloque, link: '' };
      }
      return g;
    });
  });

  return {
    programas: programas,
    facilitadores: datos.facilitadores || [],
    ajustes: ajustes.generales
  };
}

function recortarTarjeta(tar) {
  return {
    programa: tar.programa, bloque: tar.bloque, slugBloque: tar.slugBloque,
    tipo: tar.tipo, titulo: tar.titulo, texto: '', imagen: '', link: '',
    archivos: [], fecha: tar.fecha, orden: tar.orden, abierta: false
  };
}

/** El programa que pide una dirección, comparando sin distinguir mayúsculas. */
function programaPorId(programas, id) {
  if (!id) return null;
  var buscado = String(id).toLowerCase();
  for (var i = 0; i < programas.length; i++) {
    if (String(programas[i].id).toLowerCase() === buscado) return programas[i];
  }
  return null;
}

/** El bloque que se está cursando: el último ya liberado. */
function bloqueActual(bloques) {
  for (var i = bloques.length - 1; i >= 0; i--) {
    if (bloques[i].abierto) return bloques[i];
  }
  return bloques[0] || null;
}

/** La ficha del facilitador cuyo nombre figura en Workshops. */
function facilitadorDe(facilitadores, nombre) {
  if (!nombre) return null;
  var buscado = normalizarClave(nombre);
  for (var i = 0; i < facilitadores.length; i++) {
    if (normalizarClave(facilitadores[i].nombre) === buscado) return facilitadores[i];
  }
  // Sin ficha cargada, al menos mostramos el nombre que dice Workshops.
  return { nombre: nombre, rol: '', foto: '', iniciales: iniciales(nombre),
           bio: '', linkedin: '', mail: '', cita: '' };
}

  global.RHSheet = { urlsHoja: urlsHoja, pareceCsv: pareceCsv, parseCsv: parseCsv, aObjetos: aObjetos, normalizarClave: normalizarClave, aSlug: aSlug, aISO: aISO, aUrl: aUrl, aArchivo: aArchivo, instanteAR: instanteAR, mapearProgramas: mapearProgramas, mapearBloques: mapearBloques, mapearTarjetas: mapearTarjetas, mapearGrabaciones: mapearGrabaciones, mapearFacilitadores: mapearFacilitadores, mapearAjustes: mapearAjustes, armar: armar, programaPorId: programaPorId, bloqueActual: bloqueActual, facilitadorDe: facilitadorDe };
})(typeof window !== "undefined" ? window : this);
