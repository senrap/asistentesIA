#!/usr/bin/env node
/**
 * Genera index.html a partir de contenido.mjs.
 *
 * Esta web es una sola página estática: no lee ninguna planilla, no tiene
 * sub-páginas y no lleva una línea de JavaScript en el navegador. Todo lo que
 * cambia se edita en contenido.mjs y se vuelve a correr esto.
 *
 *   node scripts/build.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import C from '../contenido.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/* --------------------------------------------------------------------------
   Escape y markdown

   Mismo criterio que el otro sitio: se escapa SIEMPRE antes de convertir a
   HTML, así un texto del contenido nunca puede inyectar etiquetas, y de las
   URLs solo se aceptan http, https y mailto.
   -------------------------------------------------------------------------- */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function url(v) {
  const s = String(v || '').trim();
  return /^(https?:|mailto:)/i.test(s) ? s : '';
}

const ESCAPES = [
  ['\\*', '\u0001'],
  ['\\_', '\u0002'],
  ['\\`', '\u0003']
];

function enLinea(s) {
  return s
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/** Markdown mínimo, con una pila para que las listas anidadas cierren bien. */
function md(texto) {
  if (!texto) return '';
  let s = esc(texto);
  ESCAPES.forEach(([de, a]) => { s = s.split(de).join(a); });

  const lineas = s.replace(/\r/g, '').split('\n');
  let html = '';
  const abiertas = [];

  const cerrarHasta = (n) => {
    while (abiertas.length > n) html += `</${abiertas.pop()}>`;
  };
  const abrir = (tag, nivel) => {
    if (abiertas.length >= nivel && abiertas[nivel - 1] !== tag) cerrarHasta(nivel - 1);
    while (abiertas.length < nivel) {
      html += `<${tag}>`;
      abiertas.push(tag);
    }
  };

  for (const linea of lineas) {
    if (!linea.trim()) { cerrarHasta(0); continue; }

    const titulo = linea.match(/^(#{2,4})\s+(.*)$/);
    if (titulo) {
      cerrarHasta(0);
      const n = Math.min(titulo[1].length + 1, 5);
      html += `<h${n}>${enLinea(titulo[2])}</h${n}>`;
      continue;
    }

    const num = linea.match(/^(\s*)\d+[.)]\s+(.*)$/);
    if (num) {
      const n = Math.floor(num[1].length / 2) + 1;
      abrir('ol', n);
      cerrarHasta(n);
      html += `<li>${enLinea(num[2])}</li>`;
      continue;
    }

    const item = linea.match(/^(\s*)[-*•]\s+(.*)$/);
    if (item) {
      const n = Math.floor(item[1].length / 2) + 1;
      abrir('ul', n);
      cerrarHasta(n);
      html += `<li>${enLinea(item[2])}</li>`;
      continue;
    }

    cerrarHasta(0);
    html += `<p>${enLinea(linea.trim())}</p>`;
  }

  cerrarHasta(0);
  ESCAPES.forEach(([de, a]) => { html = html.split(a).join(de.charAt(1)); });
  return html;
}

/* --------------------------------------------------------------------------
   Piezas
   -------------------------------------------------------------------------- */
const ICONOS = {
  contenido: '<path d="M4 5h16M4 12h16M4 19h9"/>',
  material: '<path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M4 19h16"/>',
  tarea: '<path d="M9 11l2 2 4-4"/><rect x="4" y="4" width="16" height="16" rx="3"/>',
  enlace: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/>' +
    '<path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>'
};

function icono(tipo) {
  return `<span class="tarjeta-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
    `${ICONOS[tipo] || ICONOS.contenido}</svg></span>`;
}

function archivo(a) {
  const href = url(a.url);
  if (!href) return '';
  return `<a class="material-link" href="${esc(href)}" target="_blank" rel="noopener">` +
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ` +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
    `<path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M4 18h16"/></svg>` +
    `<span>${esc(a.nombre)}</span></a>`;
}

function tarjeta(t) {
  const tipo = t.tipo || 'contenido';
  const archivos = (t.archivos || []).map(archivo).join('');
  return `
        <article class="tarjeta es-${esc(tipo)}">
          <div class="tarjeta-cabeza">${icono(tipo)}<h3>${esc(t.titulo)}</h3></div>
          ${t.texto ? `<div class="prosa">${md(t.texto)}</div>` : ''}
          ${archivos ? `<div class="tarjeta-archivos">${archivos}</div>` : ''}
        </article>`;
}

function parte(p) {
  return `
      <section class="section${p.numero % 2 === 0 ? ' section-alt' : ''}" id="parte-${p.numero}">
        <div class="wrap">
          <p class="section-label">Parte ${p.numero}</p>
          <h2>${p.emoji ? `<span class="parte-emoji" aria-hidden="true">${esc(p.emoji)}</span> ` : ''}${esc(p.nombre)}</h2>
          <span class="accent-line" aria-hidden="true"></span>
          ${p.objetivo ? `
          <div class="objetivo">
            <p class="objetivo-label">El objetivo de esta parte</p>
            <div class="prosa">${md(p.objetivo)}</div>
          </div>` : ''}
          <div class="tarjetas">${p.tarjetas.map(tarjeta).join('')}
          </div>
        </div>
      </section>`;
}

function prep(f) {
  const link = url(f.link && f.link.url);
  return `
          <div class="prep-card${f.alerta ? ' prep-card-alert' : ''}">
            ${f.etiqueta ? `<p class="prep-tag">${esc(f.etiqueta)}</p>` : ''}
            <h3>${esc(f.titulo)}</h3>
            <div class="prosa">${md(f.texto)}</div>
            ${link ? `<a class="btn btn-cta btn-sm" href="${esc(link)}" target="_blank" rel="noopener">${esc(f.link.texto || 'Abrir')}</a>` : ''}
          </div>`;
}

function red(r) {
  const href = url(r.url);
  if (!href) return '';
  return `
            <a class="red" href="${esc(href)}" target="_blank" rel="noopener">
              <span class="red-ico" aria-hidden="true">${esc(r.emoji || '🔗')}</span>
              <span class="red-txt"><strong>${esc(r.titulo)}</strong><span>${esc(r.bajada || '')}</span></span>
            </a>`;
}

/* --------------------------------------------------------------------------
   La ficha de quién te guía
   -------------------------------------------------------------------------- */
function facilitador(f) {
  const li = url(f.linkedin);
  const mail = f.mail ? `mailto:${f.mail}` : '';
  return `
          <div class="profe">
            <div class="profe-side">
              <div class="profe-avatar${f.foto ? ' has-foto' : ''}">${
                f.foto
                  ? `<img src="${esc(f.foto)}" alt="" width="400" height="400" />`
                  : esc(f.iniciales || '')
              }</div>
              <p class="profe-nombre">${esc(f.nombre)}</p>
              ${f.rol ? `<p class="profe-rol">${esc(f.rol)}</p>` : ''}
              ${li ? `<a class="profe-link" href="${esc(li)}" target="_blank" rel="noopener">Conectar en LinkedIn →</a>` : ''}
              ${mail ? `<a class="profe-link" href="${esc(mail)}">${esc(f.mail)}</a>` : ''}
            </div>
            <div class="profe-bio prosa">
              ${md(f.bio)}
              ${f.cita ? `<blockquote class="profe-quote">🎙️ “${esc(f.cita)}”</blockquote>` : ''}
            </div>
          </div>`;
}

/* --------------------------------------------------------------------------
   La página
   -------------------------------------------------------------------------- */
const mailAyuda = C.ayuda && C.ayuda.mail ? C.ayuda.mail : '';

const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(C.marca)} · HACHE</title>
    <meta name="description" content="${esc(C.hero.bajada)}" />
    <meta name="theme-color" content="#00344D" />
    <!--
      GENERADO POR scripts/build.mjs — no editar a mano.
      El contenido se edita en contenido.mjs y se vuelve a correr el build.

      Una sola página: sin planilla, sin sub-páginas y sin JavaScript.
    -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(C.marca)} · HACHE" />
    <meta property="og:description" content="${esc(C.hero.titulo)}" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link
      rel="icon"
      href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%2300344D'/%3E%3Ctext x='16' y='23' font-family='Poppins,sans-serif' font-size='19' font-weight='800' fill='%2300FF90' text-anchor='middle'%3EH%3C/text%3E%3C/svg%3E"
    />
    <link rel="stylesheet" href="/assets/estilo.css" />
  </head>

  <body>
    <a class="skip" href="#contenido">Ir al contenido</a>

    <header class="site-header">
      <div class="wrap">
        <a class="brand" href="#top">
          <span class="brand-mark" aria-hidden="true">H</span>
          <span class="brand-text"><strong>${esc(C.marca)}</strong></span>
        </a>
        <nav class="header-links" aria-label="Secciones">
          <a href="#facilitador">Quién te guía</a>
          <a href="#antes">Antes de empezar</a>
${C.partes.map((p) => `          <a href="#parte-${p.numero}">Parte ${p.numero}</a>`).join('\n')}
        </nav>
      </div>
    </header>

    <main id="top">
      <section class="hero on-dark">
        <div class="wrap hero-inner">
          <p class="section-label">${esc(C.hero.etiqueta)}</p>
          <h1>${esc(C.hero.titulo)}</h1>
          <p class="hero-lead">${esc(C.hero.bajada)}</p>
        </div>
      </section>

      <section class="section" id="facilitador">
        <div class="wrap" id="contenido">
          <p class="section-label">Quién te acompaña</p>
          <h2>¿Quién va a guiarte en este viaje?</h2>
          <span class="accent-line" aria-hidden="true"></span>
${facilitador(C.facilitador)}
        </div>
      </section>

      <section class="section section-alt" id="antes">
        <div class="wrap">
          <p class="section-label">Para arrancar</p>
          <h2>Antes de empezar</h2>
          <span class="accent-line" aria-hidden="true"></span>
          <div class="prep">${C.antes.map(prep).join('')}
          </div>
        </div>
      </section>
${C.partes.map(parte).join('\n')}

      <section class="section section-alt" id="ayuda">
        <div class="wrap">
          <div class="ayuda">
            <p class="section-label">Soporte</p>
            <h2>${esc(C.ayuda.titulo)}</h2>
            <span class="accent-line" aria-hidden="true"></span>
            <p class="ayuda-texto">${esc(C.ayuda.texto)}</p>
            ${mailAyuda ? `<a class="btn btn-cta" href="mailto:${esc(mailAyuda)}">${esc(mailAyuda)}</a>` : ''}
          </div>
        </div>
      </section>

      <section class="redes on-dark" id="comunidad">
        <div class="wrap">
          <p class="section-label">Comunidad</p>
          <h2>Ya nos conocimos… ¡ahora que no se corte! 😄</h2>
          <p class="redes-lead">Te dejamos algunas propuestas para seguir en contacto.</p>
          <div class="redes-grid">${C.redes.map(red).join('')}
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="wrap">
        <div class="footer-bottom">
          <span>HACHE Consultora · Formación en People Analytics</span>
          <span><a href="${esc(url(C.web))}" target="_blank" rel="noopener">www.hacheconsultora.com</a></span>
        </div>
      </div>
    </footer>
  </body>
</html>
`;

writeFileSync(join(root, 'index.html'), html);

const tarjetas = C.partes.reduce((n, p) => n + p.tarjetas.length, 0);
console.log(
  `OK — index.html generado · ${C.partes.length} partes · ${tarjetas} tarjetas · ` +
    `${C.redes.length} links de comunidad · ${Math.round(html.length / 1024)} KB`
);
