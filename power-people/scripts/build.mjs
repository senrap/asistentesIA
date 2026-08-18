#!/usr/bin/env node
/**
 * Genera power-people/assets/contenido.js a partir de contenido.json
 * y de las notas en power-people/semanas/*.md
 *
 * El punto de este build es el BLOQUEO REAL de las grabaciones: una semana
 * cuyo momento de liberación todavía no llegó sale del build SIN las URLs.
 * El link no está en el HTML publicado, así que no hay "ver código fuente"
 * que valga.
 *
 * Corolario: para que una grabación se libere sola hay que volver a buildear
 * después de ese momento. La precisión del desbloqueo es la frecuencia del
 * build programado (ver README).
 *
 * Uso:
 *   node power-people/scripts/build.mjs
 *   node power-people/scripts/build.mjs --ahora 2026-08-19T19:45
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Todo el programa se piensa en hora de Argentina (GMT-3, sin horario de verano).
const OFFSET_AR = 3 * 3600000;

/** "2026-08-19" + "19:30" -> instante real (Date), interpretando hora argentina. */
function instante(fecha, hora) {
  const [y, m, d] = fecha.split('-').map(Number);
  const [hh, mm] = (hora || '00:00').split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm) + OFFSET_AR);
}

// --ahora permite simular otro momento para probar el bloqueo sin esperar.
// Acepta "2026-10-20" (se toma el final del día) o "2026-10-20T19:45".
const argAhora = process.argv.indexOf('--ahora');
let AHORA = new Date();
if (argAhora > -1 && process.argv[argAhora + 1]) {
  const v = process.argv[argAhora + 1];
  AHORA = v.includes('T')
    ? instante(v.slice(0, 10), v.slice(11))
    : instante(v, '23:59');
}

const fuente = JSON.parse(readFileSync(join(root, 'contenido.json'), 'utf8'));
const errores = [];

const esFecha = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const esHora = (v) => !v || /^\d{2}:\d{2}$/.test(v);
const esUrl = (v) => /^(https?:\/\/|material\/)/.test(v);

const notasUsadas = new Set();
const numerosVistos = new Set();

function leerNotas(archivo, etiqueta) {
  if (!archivo) return '';
  const ruta = join(root, 'semanas', archivo);
  if (!existsSync(ruta)) {
    errores.push(`${etiqueta}: falta semanas/${archivo}`);
    return '';
  }
  notasUsadas.add(archivo);
  return marked.parse(readFileSync(ruta, 'utf8').trim(), { mangle: false, headerIds: false });
}

const semanas = fuente.semanas.map((s) => {
  const etiqueta = `semana ${s.numero}`;

  if (numerosVistos.has(s.numero)) errores.push(`${etiqueta}: número duplicado`);
  numerosVistos.add(s.numero);

  if (!esFecha(s.libera)) {
    errores.push(`${etiqueta}: "libera" tiene que ser YYYY-MM-DD, no "${s.libera}"`);
    return null;
  }
  if (!esHora(s.hora)) errores.push(`${etiqueta}: "hora" tiene que ser HH:MM, no "${s.hora}"`);

  for (const g of s.grabaciones || []) {
    if (!g.url || !esUrl(g.url)) errores.push(`${etiqueta}: grabación sin URL válida`);
  }
  for (const m of s.material || []) {
    if (!m.nombre || !m.url) errores.push(`${etiqueta}: material sin nombre o sin url`);
    if (m.url && m.url.startsWith('material/') && !existsSync(join(root, m.url))) {
      errores.push(`${etiqueta}: falta el archivo ${m.url}`);
    }
  }

  const momento = instante(s.libera, s.hora);
  const abierta = momento <= AHORA;

  // El título, el resumen y el momento siempre viajan: el alumno ve qué viene
  // y cuándo. Las URLs y las notas, solo si ya se liberó.
  const salida = {
    numero: s.numero,
    libera: s.libera,
    hora: s.hora || '',
    titulo: s.titulo || '',
    resumen: s.resumen || '',
    abierta,
    grabaciones: abierta ? s.grabaciones || [] : [],
    material: abierta ? s.material || [] : [],
    notas: abierta ? leerNotas(s.notas, etiqueta) : ''
  };

  // Marcar las notas como usadas aunque la semana esté cerrada, para que el
  // chequeo de archivos huérfanos no dé falsos positivos.
  if (!abierta && s.notas) notasUsadas.add(s.notas);

  // Una semana abierta sin grabaciones es "en preparación", no "bloqueada".
  salida.pendiente = abierta && !salida.grabaciones.length;

  if (s.encuentro) {
    if (!esFecha(s.encuentro.libera)) {
      errores.push(`${etiqueta}: encuentro.libera tiene que ser YYYY-MM-DD`);
    } else {
      const grabAbierta = instante(s.encuentro.libera, s.encuentro.hora) <= AHORA;
      salida.encuentro = {
        // El encuentro en vivo es el mismo miércoles que abre la semana.
        fecha: s.libera,
        libera: s.encuentro.libera,
        abierta: grabAbierta,
        grabacion: grabAbierta ? s.encuentro.grabacion || '' : '',
        pendiente: grabAbierta && !s.encuentro.grabacion
      };
    }
  }

  return salida;
});

// Un .md que nadie referencia es contenido que quedaría invisible.
if (existsSync(join(root, 'semanas'))) {
  for (const archivo of readdirSync(join(root, 'semanas'))) {
    if (archivo.endsWith('.md') && !notasUsadas.has(archivo)) {
      errores.push(`semanas/${archivo} no está referenciado en contenido.json`);
    }
  }
}

if (errores.length) {
  console.error('Build falló:\n' + errores.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}

semanas.sort((a, b) => a.numero - b.numero);

const sello = AHORA.toISOString();
const salida = `/* Generado por power-people/scripts/build.mjs — no editar a mano.
   Editá power-people/contenido.json o power-people/semanas/*.md
   y volvé a correr: npm run build:programa
   Build del ${sello}. Lo que se libera después de ese momento no está acá. */
window.PROGRAMA = ${JSON.stringify(
  { programa: fuente.programa, generado: sello, semanas },
  null,
  2
)};
`;

writeFileSync(join(root, 'assets', 'contenido.js'), salida);

const abiertas = semanas.filter((s) => s.abierta).length;
const conVideo = semanas.filter((s) => s.grabaciones.length).length;
console.log(
  `OK — ${semanas.length} semanas (${abiertas} liberadas, ${conVideo} con grabación), ` +
    `${semanas.filter((s) => s.encuentro).length} encuentros → assets/contenido.js`
);
console.log(`   Momento del build: ${sello}`);
