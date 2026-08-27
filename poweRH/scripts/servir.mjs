#!/usr/bin/env node
/**
 * Servidor de desarrollo. Sirve la carpeta y hace la misma reescritura que
 * netlify.toml: /curso -> curso.html, /curso/bloque -> bloque.html,
 * /curso/cierre -> cierre.html.
 *
 * Sin esto, un `python3 -m http.server` devuelve 404 en las sub-páginas y no
 * se puede probar en local lo mismo que se ve publicado.
 *
 *   node scripts/servir.mjs [puerto]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
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
  let ruta;
  try {
    ruta = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    // Un "%" suelto en la URL hacía explotar decodeURIComponent y, sin nadie
    // que lo atajara, se llevaba puesto el servidor entero.
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>400</h1><p>La dirección está mal escrita.</p>');
    return;
  }

  if (ruta === '/' || ruta.endsWith('/')) ruta += 'index.html';

  // La reescritura de cursadas, bloques y cierre, igual que en Netlify: los
  // archivos que existen de verdad ganan, y lo que queda cae en una de las tres
  // páginas. El orden es el mismo que en netlify.toml: /cierre primero.
  const tramos = ruta.replace(/^\/+/, '').split('/');
  if (!existsSync(join(root, ruta))) {
    if (tramos.length === 1 && tramos[0]) ruta = '/curso.html';
    else if (tramos.length === 2 && tramos[1] === 'cierre') ruta = '/cierre.html';
    else if (tramos.length === 2) ruta = '/bloque.html';
  }

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
