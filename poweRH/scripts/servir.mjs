#!/usr/bin/env node
/**
 * Servidor de desarrollo. Sirve la carpeta y hace la misma reescritura que
 * netlify.toml: /b/lo-que-sea -> bloque.html.
 *
 * Sin esto, un `python3 -m http.server` devuelve 404 en las sub-páginas y no
 * se puede probar en local lo mismo que se ve publicado.
 *
 *   node scripts/servir.mjs [puerto]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const puerto = Number(process.argv[2]) || 4173;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

createServer(async (req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

  // La reescritura de las sub-páginas, igual que en Netlify.
  if (ruta.startsWith('/b/')) ruta = '/bloque.html';
  if (ruta === '/' || ruta.endsWith('/')) ruta += 'index.html';

  // Nada de salir de la carpeta con "..".
  const archivo = join(root, normalize(ruta).replace(/^(\.\.[/\\])+/, ''));
  if (!archivo.startsWith(root)) {
    res.writeHead(403).end('403');
    return;
  }

  try {
    const info = await stat(archivo);
    if (!info.isFile()) throw new Error('no es un archivo');
    const cuerpo = await readFile(archivo);
    res.writeHead(200, {
      'Content-Type': TIPOS[extname(archivo)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(cuerpo);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404</h1><p>No existe <code>' + ruta + '</code>.</p>');
  }
}).listen(puerto, () => {
  console.log(`PoweRH en http://localhost:${puerto}/`);
});
