#!/usr/bin/env node
/**
 * Prepara los dos archivos que consume el sitio:
 *
 *   assets/sheet.js      El parseo del Sheet, empaquetado para el navegador.
 *                        Se genera desde lib/sheet.mjs para que no haya dos
 *                        copias del mismo código.
 *
 *   assets/contenido.js  Copia de respaldo del Sheet, con el bloqueo por fecha
 *                        ya aplicado. El sitio la usa solo si no consigue leer
 *                        la planilla en vivo (Google caído, permisos mal, red
 *                        corporativa que bloquea docs.google.com).
 *
 * Uso:
 *   node power-people/scripts/build.mjs                 lee el Sheet por red
 *   node power-people/scripts/build.mjs --local         lee fixtures/*.csv
 *   node power-people/scripts/build.mjs --ahora 2026-09-20T12:00
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  urlHoja,
  parseCsv,
  aObjetos,
  mapearSemanas,
  mapearFacilitadores,
  aplicarBloqueo,
  instanteAR
} from '../lib/sheet.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(root, 'config.json'), 'utf8'));

const args = process.argv.slice(2);
const local = args.includes('--local');
const iAhora = args.indexOf('--ahora');
let AHORA = new Date();
if (iAhora > -1 && args[iAhora + 1]) {
  const v = args[iAhora + 1];
  AHORA = v.includes('T') ? instanteAR(v.slice(0, 10), v.slice(11)) : instanteAR(v, '23:59');
}

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
  `/* Generado por power-people/scripts/build.mjs desde lib/sheet.mjs — no editar a mano. */
(function (global) {
  "use strict";
${fuenteLib.replace(/^export /gm, '')}
  global.PPSheet = { ${exportados.map((n) => `${n}: ${n}`).join(', ')} };
})(typeof window !== "undefined" ? window : this);
`
);

/* ------------------------------------------------------------------
   2. assets/config.js — la config que necesita el navegador
   ------------------------------------------------------------------ */
writeFileSync(
  join(root, 'assets', 'config.js'),
  `/* Generado por power-people/scripts/build.mjs desde config.json — no editar a mano. */
window.PPCONFIG = ${JSON.stringify({ sheet: cfg.sheet, programa: cfg.programa }, null, 2)};
`
);

/* ------------------------------------------------------------------
   3. assets/contenido.js — copia de respaldo
   ------------------------------------------------------------------ */
async function leerHoja(hoja, fixture) {
  if (local) {
    const ruta = join(root, 'fixtures', fixture);
    if (!existsSync(ruta)) throw new Error(`falta fixtures/${fixture}`);
    return readFileSync(ruta, 'utf8');
  }
  const res = await fetch(urlHoja(cfg.sheet.id, hoja), { redirect: 'follow' });
  if (!res.ok) throw new Error(`${hoja}: HTTP ${res.status}`);
  const texto = await res.text();
  // Si la planilla no es pública, Google devuelve el HTML del login con un 200.
  if (/^\s*</.test(texto)) {
    throw new Error(
      `${hoja}: Google devolvió HTML en vez de CSV. ` +
        `Revisá que la planilla esté compartida como "cualquiera con el enlace".`
    );
  }
  return texto;
}

function respaldoPrevio() {
  const ruta = join(root, 'assets', 'contenido.js');
  return existsSync(ruta) ? readFileSync(ruta, 'utf8') : null;
}

try {
  const [csvContenido, csvFacil] = await Promise.all([
    leerHoja(cfg.sheet.hojaContenido, 'contenido.csv'),
    leerHoja(cfg.sheet.hojaFacilitadores, 'facilitadores.csv')
  ]);

  const semanas = aplicarBloqueo(mapearSemanas(aObjetos(parseCsv(csvContenido))), AHORA);
  const facilitadores = mapearFacilitadores(aObjetos(parseCsv(csvFacil)));

  if (!semanas.length) throw new Error('la hoja de contenido no tiene ninguna fila con Fecha');

  writeFileSync(
    join(root, 'assets', 'contenido.js'),
    `/* Copia de respaldo del Google Sheet — no editar a mano.
   El sitio la usa solo si no consigue leer la planilla en vivo.
   Generada el ${AHORA.toISOString()}${local ? ' desde fixtures/ (--local)' : ''}.
   Las grabaciones posteriores a ese momento no están acá. */
window.PROGRAMA = ${JSON.stringify(
      { programa: cfg.programa, generado: AHORA.toISOString(), semanas, facilitadores },
      null,
      2
    )};
`
  );

  const abiertas = semanas.filter((s) => s.abierta).length;
  const conVideo = semanas.filter((s) => s.videos.length).length;
  const sesiones = semanas.filter((s) => s.sesion).length;
  console.log(
    `OK — ${semanas.length} semanas (${abiertas} liberadas, ${conVideo} con grabación), ` +
      `${sesiones} encuentros, ${facilitadores.length} facilitadores` +
      `${local ? ' [fixtures]' : ' [Sheet en vivo]'}`
  );
} catch (e) {
  // No romper el deploy por un problema de red o de permisos: el sitio lee el
  // Sheet en vivo igual, y el respaldo viejo sigue sirviendo como red de contención.
  const previo = respaldoPrevio();
  console.warn(`AVISO — no se pudo leer el Sheet: ${e.message}`);
  if (previo) {
    console.warn('       Se conserva la copia de respaldo anterior.');
  } else {
    console.error('Build falló: no hay Sheet ni copia de respaldo previa.');
    process.exit(1);
  }
}
