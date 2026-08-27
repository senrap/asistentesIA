#!/usr/bin/env node
/**
 * Prepara los cuatro archivos que consume el sitio:
 *
 *   assets/sheet.js      El parseo del Sheet, empaquetado para el navegador.
 *                        Se genera desde lib/sheet.mjs para que no haya dos
 *                        copias del mismo código.
 *
 *   assets/curriculo.js  El contenido del programa, desde lib/curriculo.mjs.
 *                        Es lo fijo: los bloques, el material, los textos.
 *
 *   assets/config.js     La config que necesita el navegador, desde config.json.
 *
 *   assets/cursos.js     Copia de respaldo de la planilla, ya cruzada con el
 *                        currículo. El sitio la usa solo si no consigue leer el
 *                        Sheet en vivo (Google caído, permisos mal, una red
 *                        corporativa que bloquea docs.google.com).
 *
 * Uso:
 *   node scripts/build.mjs                    lee el Sheet por red
 *   node scripts/build.mjs --local            lee fixtures/*.csv
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  urlsHoja,
  pareceCsv,
  parseCsv,
  aObjetos,
  mapearCursos,
  mapearGrabaciones,
  armar
} from '../lib/sheet.mjs';
import CURRICULO from '../lib/curriculo.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(root, 'config.json'), 'utf8'));
const local = process.argv.slice(2).includes('--local');

/* ------------------------------------------------------------------
   1. assets/sheet.js — mismo código de parseo, para el navegador
   ------------------------------------------------------------------ */
const fuenteLib = readFileSync(join(root, 'lib', 'sheet.mjs'), 'utf8');
const exportados = [...fuenteLib.matchAll(/^export function (\w+)/gm)].map((m) => m[1]);

if (!exportados.length) {
  console.error('Build falló: lib/sheet.mjs no exporta ninguna función.');
  process.exit(1);
}

writeFileSync(
  join(root, 'assets', 'sheet.js'),
  `/* Generado por scripts/build.mjs desde lib/sheet.mjs — no editar a mano. */
(function (global) {
  "use strict";
${fuenteLib.replace(/^export /gm, '')}
  global.RHSheet = { ${exportados.map((n) => `${n}: ${n}`).join(', ')} };
})(typeof window !== "undefined" ? window : this);
`
);

/* ------------------------------------------------------------------
   2. assets/curriculo.js — el contenido del programa
   ------------------------------------------------------------------ */
if (!Array.isArray(CURRICULO.bloques) || !CURRICULO.bloques.length) {
  console.error('Build falló: lib/curriculo.mjs no define ningún bloque.');
  process.exit(1);
}

writeFileSync(
  join(root, 'assets', 'curriculo.js'),
  `/* Generado por scripts/build.mjs desde lib/curriculo.mjs — no editar a mano.
   El contenido del programa se edita en lib/curriculo.mjs. */
window.CURRICULO = ${JSON.stringify(CURRICULO, null, 2)};
`
);

/* ------------------------------------------------------------------
   3. assets/config.js — la config que necesita el navegador
   ------------------------------------------------------------------ */
writeFileSync(
  join(root, 'assets', 'config.js'),
  `/* Generado por scripts/build.mjs desde config.json — no editar a mano. */
window.RHCONFIG = ${JSON.stringify({ sheet: cfg.sheet, sitio: cfg.sitio }, null, 2)};
`
);

/* ------------------------------------------------------------------
   4. assets/cursos.js — copia de respaldo de la planilla
   ------------------------------------------------------------------ */
const ANIO = cfg.sitio.anioReferencia;
const rutaRespaldo = join(root, 'assets', 'cursos.js');

const HOJAS = [
  ['cursos', 'cursos.csv', (o) => mapearCursos(o, ANIO)],
  ['grabaciones', 'grabaciones.csv', mapearGrabaciones]
];

const sinConfigurar = !cfg.sheet.id || /^PEGAR/.test(cfg.sheet.id);

async function leerHoja(hoja, fixture) {
  if (local) {
    const ruta = join(root, 'fixtures', fixture);
    if (!existsSync(ruta)) throw new Error(`falta fixtures/${fixture}`);
    return readFileSync(ruta, 'utf8');
  }
  // Sin id, el fetch igual sale y vuelve con un 403 que no explica nada.
  if (sinConfigurar) throw new Error('falta el id de la planilla en config.json');

  let ultimo = 'sin endpoints';
  for (const url of urlsHoja(cfg.sheet, hoja)) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) {
        ultimo = `HTTP ${res.status}`;
        continue;
      }
      const texto = await res.text();
      // Si la planilla no es pública, Google devuelve el HTML del login con un 200.
      if (!pareceCsv(texto)) {
        ultimo = 'Google devolvió HTML en vez de CSV (¿la planilla no es pública?)';
        continue;
      }
      return texto;
    } catch (e) {
      ultimo = e.message;
    }
  }
  throw new Error(`${hoja}: ${ultimo}`);
}

try {
  const crudo = {};
  // Una hoja por vez y no en paralelo: pedirle varias cosas a la vez a Google
  // desde el mismo cliente hace que a veces alguna vuelva redirigida.
  for (const [clave, fixture, mapear] of HOJAS) {
    const nombreHoja = (cfg.sheet.hojas || {})[clave];
    if (!nombreHoja) throw new Error(`config.json no dice qué hoja es "${clave}"`);
    crudo[clave] = mapear(aObjetos(parseCsv(await leerHoja(nombreHoja, fixture))));
  }

  if (!crudo.cursos.length) {
    throw new Error('la hoja de Cursos no tiene ninguna fila con ID curso');
  }

  const datos = armar(CURRICULO, crudo);
  const generado = new Date().toISOString();

  writeFileSync(
    rutaRespaldo,
    `/* Copia de respaldo del Google Sheet — no editar a mano.
   El sitio la usa solo si no consigue leer la planilla en vivo.
   Generada el ${generado}${local ? ' desde fixtures/ (--local)' : ''}.
   Las grabaciones cargadas después de ese momento no están acá. */
window.CURSOS = ${JSON.stringify({ generado, ...datos }, null, 2)};
`
  );

  const abiertos = datos.cursos.reduce(
    (n, c) => n + c.bloques.filter((b) => b.abierto).length, 0);
  const grabadas = datos.cursos.reduce(
    (n, c) => n + c.grabaciones.filter((g) => g.link).length, 0);

  console.log(
    `OK — ${datos.cursos.length} cursadas, ${CURRICULO.bloques.length} bloques por cursada ` +
      `(${abiertos} abiertos en total), ${grabadas} grabaciones cargadas` +
      `${local ? ' [fixtures]' : ' [Sheet en vivo]'}`
  );
  datos.cursos.forEach((c) => {
    const rutas = c.bloques.filter((b) => b.abierto).map((b) => `/${c.id}/${b.slug}`);
    if (c.completo) rutas.push(`/${c.id}/cierre`);
    console.log(`   /${c.id} — ${rutas.length ? rutas.join('  ') : 'sin bloques abiertos todavía'}`);
  });
} catch (e) {
  // Un id sin configurar es un error de config, no un problema de red: el sitio
  // tampoco va a poder leer la planilla desde el navegador, así que mejor que el
  // deploy se caiga acá y no que salga publicado sin ninguna cursada.
  if (sinConfigurar && !local) {
    console.error(`Build falló: ${e.message}`);
    console.error('       Poné el id de la planilla en config.json y volvé a deployar.');
    process.exit(1);
  }

  // Un problema de red o de permisos no rompe el deploy: el sitio lee el Sheet
  // en vivo igual, y el respaldo viejo sigue sirviendo como red de contención.
  console.warn(`AVISO — no se pudo leer el Sheet: ${e.message}`);
  if (existsSync(rutaRespaldo)) {
    console.warn('       Se conserva la copia de respaldo anterior.');
  } else {
    // Sin respaldo previo dejamos uno vacío: es preferible a que el navegador
    // se coma un 404 en /assets/cursos.js.
    writeFileSync(
      rutaRespaldo,
      '/* Respaldo vacío: el build no pudo leer la planilla. */\n' +
        'window.CURSOS = { cursos: [] };\n'
    );
    console.warn('       Se dejó un respaldo vacío.');
  }
}
