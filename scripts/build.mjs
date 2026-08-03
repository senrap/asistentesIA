#!/usr/bin/env node
/**
 * Combina catalogo.json + prompts/*.md en assets/data.js
 *
 * Se genera un archivo .js (no .json) para que index.html funcione
 * abriéndolo directo desde el disco, sin servidor: fetch() sobre file://
 * lo bloquea el navegador, un <script src> no.
 *
 * Uso: node scripts/build.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const catalogo = JSON.parse(readFileSync(join(root, 'catalogo.json'), 'utf8'));
const etapasValidas = new Set(catalogo.etapas.map((e) => e.id));
const errores = [];
const slugsVistos = new Set();

const asistentes = catalogo.asistentes.map((a) => {
  if (slugsVistos.has(a.slug)) errores.push(`slug duplicado: ${a.slug}`);
  slugsVistos.add(a.slug);

  if (!etapasValidas.has(a.etapa)) {
    errores.push(`${a.slug}: etapa desconocida "${a.etapa}"`);
  }

  const ruta = join(root, 'prompts', `${a.slug}.md`);
  if (!existsSync(ruta)) {
    errores.push(`${a.slug}: falta prompts/${a.slug}.md`);
    return { ...a, prompt: '', variables: [] };
  }

  const prompt = readFileSync(ruta, 'utf8').trim();

  // Variables {{ASI}} en orden de aparición, sin repetir.
  const variables = [...new Set(prompt.match(/\{\{[A-Z0-9_]+\}\}/g) || [])].map((v) =>
    v.slice(2, -2)
  );

  return { ...a, prompt, variables };
});

// Los archivos de prompt sin entrada en el catálogo son un error: quedarían invisibles.
for (const archivo of readdirSync(join(root, 'prompts'))) {
  if (!archivo.endsWith('.md')) continue;
  const slug = archivo.slice(0, -3);
  if (!slugsVistos.has(slug)) {
    errores.push(`prompts/${archivo} no está listado en catalogo.json`);
  }
}

if (errores.length) {
  console.error('Build falló:\n' + errores.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}

const orden = Object.fromEntries(catalogo.etapas.map((e) => [e.id, e.orden]));
asistentes.sort((a, b) => orden[a.etapa] - orden[b.etapa] || a.orden - b.orden);

const salida = `/* Generado por scripts/build.mjs — no editar a mano.
   Editá prompts/*.md o catalogo.json y volvé a correr: npm run build */
window.BIBLIOTECA = ${JSON.stringify(
  { meta: catalogo.meta, etapas: catalogo.etapas, asistentes },
  null,
  2
)};
`;

writeFileSync(join(root, 'assets', 'data.js'), salida);

const totalVars = new Set(asistentes.flatMap((a) => a.variables)).size;
console.log(
  `OK — ${asistentes.length} asistentes en ${catalogo.etapas.length} etapas, ` +
    `${totalVars} variables distintas → assets/data.js`
);
