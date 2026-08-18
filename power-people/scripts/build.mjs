#!/usr/bin/env node
/**
 * Genera power-people/assets/contenido.js a partir de contenido.json.
 *
 * El punto de este build es el BLOQUEO REAL de las grabaciones: una semana
 * cuya fecha de liberación todavía no llegó sale del build SIN la URL. El link
 * no está en el HTML publicado, así que no hay "ver código fuente" que valga.
 *
 * Corolario: para que una grabación se libere sola hay que volver a buildear
 * ese día. Netlify buildea en cada push; para el desbloqueo automático hace
 * falta además un build programado diario (ver README).
 *
 * Uso: node power-people/scripts/build.mjs [--fecha 2026-09-15]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// --fecha permite simular otro día para probar el bloqueo sin esperar.
const argFecha = process.argv.indexOf('--fecha');
const hoy =
  argFecha > -1 && process.argv[argFecha + 1]
    ? process.argv[argFecha + 1]
    : new Date().toISOString().slice(0, 10);

const fuente = JSON.parse(readFileSync(join(root, 'contenido.json'), 'utf8'));
const errores = [];

const esFecha = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const liberada = (fecha) => fecha <= hoy;

const numerosVistos = new Set();

const semanas = fuente.semanas.map((s) => {
  const etiqueta = `semana ${s.numero}`;

  if (numerosVistos.has(s.numero)) errores.push(`${etiqueta}: número duplicado`);
  numerosVistos.add(s.numero);

  if (!esFecha(s.libera)) {
    errores.push(`${etiqueta}: "libera" tiene que ser YYYY-MM-DD, no "${s.libera}"`);
  }
  if (s.grabacion && !/^https?:\/\//.test(s.grabacion)) {
    errores.push(`${etiqueta}: "grabacion" no parece una URL`);
  }
  for (const m of s.material || []) {
    if (!m.nombre || !m.url) errores.push(`${etiqueta}: material sin nombre o sin url`);
  }

  const abierta = liberada(s.libera);

  // El título y la fecha siempre viajan: el alumno ve qué viene y cuándo.
  // La URL de la grabación y el material, solo si ya se liberó.
  const salida = {
    numero: s.numero,
    libera: s.libera,
    titulo: s.titulo || '',
    resumen: s.resumen || '',
    duracion: abierta ? s.duracion || '' : '',
    abierta,
    grabacion: abierta ? s.grabacion || '' : '',
    material: abierta ? s.material || [] : [],
    // Una semana abierta sin link todavía es "en preparación", no "bloqueada".
    pendiente: abierta && !s.grabacion
  };

  if (s.encuentro) {
    if (!esFecha(s.encuentro.libera)) {
      errores.push(`${etiqueta}: encuentro.libera tiene que ser YYYY-MM-DD`);
    }
    const grabAbierta = liberada(s.encuentro.libera);
    salida.encuentro = {
      // El encuentro en vivo es el mismo miércoles que abre la semana.
      fecha: s.libera,
      libera: s.encuentro.libera,
      abierta: grabAbierta,
      grabacion: grabAbierta ? s.encuentro.grabacion || '' : '',
      pendiente: grabAbierta && !s.encuentro.grabacion
    };
  }

  return salida;
});

semanas.sort((a, b) => a.numero - b.numero);

if (errores.length) {
  console.error('Build falló:\n' + errores.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}

const salida = `/* Generado por power-people/scripts/build.mjs — no editar a mano.
   Editá power-people/contenido.json y volvé a correr: npm run build:programa
   Build del ${hoy}. Las grabaciones posteriores a esa fecha no están acá. */
window.PROGRAMA = ${JSON.stringify(
  { programa: fuente.programa, generado: hoy, semanas },
  null,
  2
)};
`;

writeFileSync(join(root, 'assets', 'contenido.js'), salida);

const abiertas = semanas.filter((s) => s.abierta).length;
const conLink = semanas.filter((s) => s.grabacion).length;
const encuentros = semanas.filter((s) => s.encuentro).length;
console.log(
  `OK — ${semanas.length} semanas (${abiertas} liberadas, ${conLink} con grabación cargada), ` +
    `${encuentros} encuentros → assets/contenido.js  [build del ${hoy}]`
);
