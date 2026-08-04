/* Biblioteca de Asistentes de HACHE
   Los datos vienen de assets/data.js (window.BIBLIOTECA), generado por scripts/build.mjs. */
(() => {
  'use strict';

  const { meta, etapas, asistentes } = window.BIBLIOTECA;
  const etapaPorId = Object.fromEntries(etapas.map((e) => [e.id, e]));

  const $ = (sel) => document.querySelector(sel);
  const elChips = $('#chips');
  const elStages = $('#stages');
  const elSearch = $('#q');
  const elPanel = $('#panel');
  const elBackdrop = $('#backdrop');
  const elToast = $('#toast');

  let filtroEtapa = 'todas';
  let consulta = '';
  let ultimoFoco = null;

  /* ── Utilidades ────────────────────────────────────────────────── */

  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );

  // Sin acentos ni mayúsculas, para que "definicion" encuentre "Definición".
  const normalizar = (s) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  function toast(mensaje) {
    elToast.textContent = mensaje;
    elToast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => elToast.classList.remove('show'), 3200);
  }

  async function copiar(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // Safari sin permisos y contextos no seguros (http://) caen acá.
      const ta = document.createElement('textarea');
      ta.value = texto;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
      return ok;
    }
  }

  function descargar(asistente) {
    const encabezado =
      `# ${asistente.nombre}\n` +
      `> ${asistente.resumen}\n` +
      `> Etapa: ${etapaPorId[asistente.etapa].nombre} · Biblioteca de Asistentes de HACHE\n\n` +
      `---\n\n`;
    const blob = new Blob([encabezado + asistente.prompt + '\n'], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asistente.slug}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Prompt descargado');
  }

  /* Abrir en una IA externa.
     El prompt viaja en la query string, pero una URL demasiado larga la rechaza
     el servidor. Por eso copiamos siempre al portapapeles: si el prompt no llega
     precargado, alcanza con pegarlo. */
  const LIMITE_URL = 6000;

  const DESTINOS = {
    chatgpt: { nombre: 'ChatGPT', base: 'https://chatgpt.com/', param: 'prompt' },
    claude: { nombre: 'Claude', base: 'https://claude.ai/new', param: 'q' },
    gemini: { nombre: 'Gemini', base: 'https://gemini.google.com/app', param: null },
  };

  async function abrirEn(destinoId, asistente) {
    const destino = DESTINOS[destinoId];
    const copiado = await copiar(asistente.prompt);

    let url = destino.base;
    let precargado = false;
    if (destino.param && asistente.prompt.length <= LIMITE_URL) {
      url = `${destino.base}?${destino.param}=${encodeURIComponent(asistente.prompt)}`;
      precargado = true;
    }

    window.open(url, '_blank', 'noopener');

    if (precargado) {
      toast(`Abriendo ${destino.nombre}. También te lo copiamos por las dudas.`);
    } else if (copiado) {
      toast(`Prompt copiado. Pegalo en ${destino.nombre} con Ctrl/Cmd + V.`);
    } else {
      toast(`Abriendo ${destino.nombre}. Copiá el prompt desde el bloque de abajo.`);
    }
  }

  /* ── Filtros ───────────────────────────────────────────────────── */

  function coincide(a) {
    if (filtroEtapa !== 'todas' && a.etapa !== filtroEtapa) return false;
    if (!consulta) return true;
    const heno = normalizar(
      [a.nombre, a.resumen, a.para_que_sirve, a.entrega, ...(a.tags || [])].join(' ')
    );
    return normalizar(consulta)
      .split(/\s+/)
      .filter(Boolean)
      .every((t) => heno.includes(t));
  }

  function renderChips() {
    const opciones = [{ id: 'todas', nombre: 'Todas' }, ...etapas];
    elChips.innerHTML = opciones
      .map((o) => {
        const n = o.id === 'todas' ? asistentes.length : asistentes.filter((a) => a.etapa === o.id).length;
        return `<button class="chip" type="button" data-etapa="${o.id}" aria-pressed="${
          o.id === filtroEtapa
        }">${esc(o.nombre)} <span aria-hidden="true">·</span> ${n}</button>`;
      })
      .join('');
  }

  function renderBiblioteca() {
    const visibles = asistentes.filter(coincide);

    if (!visibles.length) {
      elStages.innerHTML = `
        <div class="empty">
          <strong>Ningún asistente coincide con esa búsqueda</strong>
          <p>Probá con otra palabra o volvé a “Todas”.</p>
        </div>`;
      return;
    }

    elStages.innerHTML = etapas
      .map((etapa) => {
        const items = visibles.filter((a) => a.etapa === etapa.id);
        if (!items.length) return '';
        return `
          <section class="stage" id="etapa-${etapa.id}">
            <div class="stage-head">
              <h2>${esc(etapa.nombre)}</h2>
              <span class="badge">${items.length} asistente${items.length > 1 ? 's' : ''}</span>
            </div>
            <p class="stage-desc">${esc(etapa.descripcion)}</p>
            <div class="grid">
              ${items.map(tarjeta).join('')}
            </div>
          </section>`;
      })
      .join('');
  }

  function tarjeta(a) {
    return `
      <button class="card" type="button" data-slug="${esc(a.slug)}"
              aria-label="Ver el asistente ${esc(a.nombre)}">
        <div class="card-top">
          <span class="badge badge-navy">${esc(etapaPorId[a.etapa].nombre)}</span>
          ${a.destacado ? '<span class="badge badge-green">Destacado</span>' : ''}
        </div>
        <h3>${esc(a.nombre)}</h3>
        <p>${esc(a.resumen)}</p>
        <div class="card-foot">
          <span>⏱ ${esc(a.tiempo)}</span>
          <span class="card-cta">Ver prompt →</span>
        </div>
      </button>`;
  }

  /* ── Panel de detalle ──────────────────────────────────────────── */

  function resaltarVariables(prompt) {
    return esc(prompt).replace(/\{\{[A-Z0-9_]+\}\}/g, (m) => `<mark>${m}</mark>`);
  }

  function abrirPanel(slug) {
    const a = asistentes.find((x) => x.slug === slug);
    if (!a) return;

    ultimoFoco = document.activeElement;

    $('#panel-stage').textContent = etapaPorId[a.etapa].nombre;
    $('#panel-title').textContent = a.nombre;
    $('#panel-summary').textContent = a.resumen;

    $('#panel-body').innerHTML = `
      <div class="panel-section">
        <div class="actions">
          <button class="btn btn-cta" data-accion="chatgpt">Probar en ChatGPT</button>
          <button class="btn btn-primary" data-accion="claude">Probar en Claude</button>
          <button class="btn btn-ghost" data-accion="copiar">Copiar prompt</button>
          <button class="btn btn-ghost" data-accion="descargar">Descargar .md</button>
        </div>
        <p class="actions-note">
          Al abrir ChatGPT o Claude el prompt también se copia al portapapeles. Si no aparece
          cargado, pegalo con Ctrl/Cmd&nbsp;+&nbsp;V.
        </p>
      </div>

      <div class="panel-section">
        <h3>Para qué sirve</h3>
        <p>${esc(a.para_que_sirve)}</p>
      </div>

      <div class="panel-section">
        <h3>Qué necesitás tener a mano</h3>
        <ul class="checklist">
          ${a.necesitas.map((n) => `<li>${esc(n)}</li>`).join('')}
        </ul>
      </div>

      <div class="panel-section">
        <h3>Qué te devuelve</h3>
        <div class="callout">${esc(a.entrega)}</div>
      </div>

      ${
        a.variables.length
          ? `<div class="panel-section">
               <h3>Variables a completar (${a.variables.length})</h3>
               <div class="var-list">
                 ${a.variables.map((v) => `<code>{{${esc(v)}}}</code>`).join('')}
               </div>
             </div>`
          : ''
      }

      <div class="panel-section">
        <div class="prompt-head">
          <h3 style="margin:0">El prompt</h3>
          <button class="btn btn-ghost btn-sm" data-accion="copiar">Copiar</button>
        </div>
        <div class="prompt-box"><pre>${resaltarVariables(a.prompt)}</pre></div>
      </div>`;

    $('#panel-body').dataset.slug = a.slug;
    $('#panel-body').scrollTop = 0;

    elPanel.hidden = false;
    elBackdrop.hidden = false;
    requestAnimationFrame(() => {
      elPanel.classList.add('open');
      elBackdrop.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
    $('#panel-close').focus();

    if (location.hash !== `#/${a.slug}`) history.pushState(null, '', `#/${a.slug}`);
  }

  function cerrarPanel({ limpiarHash = true } = {}) {
    if (elPanel.hidden) return;
    elPanel.classList.remove('open');
    elBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      elPanel.hidden = true;
      elBackdrop.hidden = true;
    }, 260);
    if (ultimoFoco) ultimoFoco.focus();
    if (limpiarHash && location.hash.startsWith('#/')) {
      history.pushState(null, '', location.pathname + location.search);
    }
  }

  /* ── Eventos ───────────────────────────────────────────────────── */

  elChips.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-etapa]');
    if (!chip) return;
    filtroEtapa = chip.dataset.etapa;
    renderChips();
    renderBiblioteca();
  });

  let debounce;
  elSearch.addEventListener('input', (e) => {
    clearTimeout(debounce);
    const valor = e.target.value;
    debounce = setTimeout(() => {
      consulta = valor.trim();
      renderBiblioteca();
    }, 140);
  });

  elStages.addEventListener('click', (e) => {
    const card = e.target.closest('[data-slug]');
    if (card) abrirPanel(card.dataset.slug);
  });

  $('#panel-body').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-accion]');
    if (!btn) return;
    const a = asistentes.find((x) => x.slug === $('#panel-body').dataset.slug);
    if (!a) return;

    switch (btn.dataset.accion) {
      case 'copiar':
        toast((await copiar(a.prompt)) ? 'Prompt copiado' : 'No pudimos copiar: seleccionalo a mano');
        break;
      case 'descargar':
        descargar(a);
        break;
      default:
        abrirEn(btn.dataset.accion, a);
    }
  });

  $('#panel-close').addEventListener('click', () => cerrarPanel());
  elBackdrop.addEventListener('click', () => cerrarPanel());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarPanel();
    // "/" enfoca la búsqueda, salvo que ya estés escribiendo en algún campo.
    if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      elSearch.focus();
    }
  });

  // El panel es modal: el foco no debe escaparse mientras está abierto.
  elPanel.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = elPanel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const primero = focusables[0];
    const ultimo = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  });

  // Enlaces directos: /#/cv-scanner abre ese asistente.
  function sincronizarDesdeHash() {
    const slug = location.hash.startsWith('#/') ? location.hash.slice(2) : '';
    if (slug && asistentes.some((a) => a.slug === slug)) abrirPanel(slug);
    else cerrarPanel({ limpiarHash: false });
  }
  window.addEventListener('popstate', sincronizarDesdeHash);

  /* ── Arranque ──────────────────────────────────────────────────── */

  $('[data-stat="asistentes"]').textContent = asistentes.length;
  $('[data-stat="etapas"]').textContent = etapas.length;
  $('[data-stat="version"]').textContent = `v${meta.version}`;

  renderChips();
  renderBiblioteca();
  sincronizarDesdeHash();
})();
