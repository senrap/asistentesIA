#!/usr/bin/env node
/**
 * Prepara los tres archivos que consume el sitio:
 *
 *   assets/sheet.js      El parseo del Sheet, empaquetado para el navegador.
 *                        Se genera desde lib/sheet.mjs para que no haya dos
 *                        copias del mismo código.
 *
 *   assets/config.js     La config que necesita el navegador, desde config.json.
 *
 *   assets/contenido.js  Copia de respaldo del Sheet, con el bloqueo por fecha
 *                        ya aplicado. El sitio la usa solo si no consigue leer
 *                        la planilla en vivo (Google caído, permisos mal, una
 *                        red corporativa que bloquea docs.google.com).
 *
 * Uso:
 *   node scripts/build.mjs                    lee el Sheet por red
 *   node scripts/build.mjs --local            lee fixtures/*.csv
 *   node scripts/build.mjs --ahora 2026-11-05T12:00
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  urlsHoja,
  pareceCsv,
  parseCsv,
  aObjetos,
  mapearProgramas,
  mapearBloques,
  mapearTarjetas,
  mapearGrabaciones,
  mapearFacilitadores,
  mapearAjustes,
  armar,
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
  AHORA = instanteAR(v.slice(0, 10));
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
  `/* Generado por scripts/build.mjs desde lib/sheet.mjs — no editar a mano. */
(function (global) {
  "use strict";
${fuenteLib.replace(/^export /gm, '')}
  global.RHSheet = { ${exportados.map((n) => `${n}: ${n}`).join(', ')} };
})(typeof window !== "undefined" ? window : this);
`
);

/* ------------------------------------------------------------------
   2. assets/config.js — la config que necesita el navegador
   ------------------------------------------------------------------ */
writeFileSync(
  join(root, 'assets', 'config.js'),
  `/* Generado por scripts/build.mjs desde config.json — no editar a mano. */
window.RHCONFIG = ${JSON.stringify({ sheet: cfg.sheet, sitio: cfg.sitio }, null, 2)};
`
);

/* ------------------------------------------------------------------
   3. assets/contenido.js — copia de respaldo
   ------------------------------------------------------------------ */
const ANIO = cfg.sitio.anioReferencia;

const HOJAS = [
  ['programas', 'workshops.csv', (o) => mapearProgramas(o, ANIO)],
  ['bloques', 'bloques.csv', (o) => mapearBloques(o, ANIO)],
  ['tarjetas', 'tarjetas.csv', (o) => mapearTarjetas(o, ANIO)],
  ['grabaciones', 'grabaciones.csv', (o) => mapearGrabaciones(o, ANIO)],
  ['facilitadores', 'facilitadores.csv', mapearFacilitadores],
  ['ajustes', 'ajustes.csv', mapearAjustes]
];

async function leerHoja(hoja, fixture) {
  // Sin id, el fetch igual sale y vuelve con un 403 que no explica nada.
  if (!local && (!cfg.sheet.id || /^PEGAR/.test(cfg.sheet.id))) {
    throw new Error('falta el id de la planilla en config.json');
  }
  if (local) {
    const ruta = join(root, 'fixtures', fixture);
    if (!existsSync(ruta)) throw new Error(`falta fixtures/${fixture}`);
    return readFileSync(ruta, 'utf8');
  }
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

function respaldoPrevio() {
  const ruta = join(root, 'assets', 'contenido.js');
  return existsSync(ruta) ? readFileSync(ruta, 'utf8') : null;
}

try {
  const crudo = {};
  // Una hoja por vez y no en paralelo: pedirle varias cosas a la vez a Google
  // desde el mismo cliente hace que a veces alguna vuelva redirigida.
  for (const [clave, fixture, mapear] of HOJAS) {
    const csv = await leerHoja(cfg.sheet.hojas[clave], fixture);
    crudo[clave] = mapear(aObjetos(parseCsv(csv)));
  }

  if (!crudo.programas.length) {
    throw new Error('la hoja de programas no tiene ninguna fila con ID');
  }

  const datos = armar(crudo, AHORA);

  writeFileSync(
    join(root, 'assets', 'contenido.js'),
    `/* Copia de respaldo del Google Sheet — no editar a mano.
   El sitio la usa solo si no consigue leer la planilla en vivo.
   Generada el ${AHORA.toISOString()}${local ? ' desde fixtures/ (--local)' : ''}.
   El contenido posterior a ese momento no está acá. */
window.PROGRAMA = ${JSON.stringify(
      { generado: AHORA.toISOString(), ...datos },
      null,
      2
    )};
`
  );

  const conBloques = datos.programas.filter((p) => p.bloques.length);
  const bloques = conBloques.reduce((n, p) => n + p.bloques.length, 0);
  const abiertos = conBloques.reduce((n, p) => n + p.bloques.filter((b) => b.abierto).length, 0);
  const tarjetas = conBloques.reduce(
    (n, p) => n + p.bloques.reduce((m, b) => m + b.tarjetas.length, 0), 0);
  const grabadas = datos.programas.reduce(
    (n, p) => n + p.grabaciones.filter((g) => g.link).length, 0);

  console.log(
    `OK — ${datos.programas.length} programas (${conBloques.length} con contenido), ` +
      `${bloques} bloques (${abiertos} liberados), ${tarjetas} tarjetas, ` +
      `${grabadas} grabaciones cargadas, ${datos.facilitadores.length} facilitadores` +
      `${local ? ' [fixtures]' : ' [Sheet en vivo]'}`
  );
  conBloques.forEach((p) => {
    console.log(`   /${p.id} — ` + p.bloques.map((b) => `/${p.id}/${b.slug}`).join('  '));
  });
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
