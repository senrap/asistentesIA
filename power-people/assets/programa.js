/* ==========================================================================
   Power People 2026 — HACHE Consultora
   Sin dependencias. Todo corre en el navegador del alumno.

   El contenido sale del Google Sheet, leído en vivo. Si no se puede leer
   (permisos, Google caído, una red corporativa que bloquea docs.google.com)
   se usa la copia de respaldo de assets/contenido.js, que arma el build.
   ========================================================================== */

(function () {
  "use strict";

  var S = window.PPSheet;
  var RESPALDO = window.PROGRAMA || { programa: {}, semanas: [], facilitadores: [] };
  var CFG = window.PPCONFIG || {};
  var PROG = CFG.programa || RESPALDO.programa || {};

  var MS_DIA = 86400000;
  var HOY = new Date().toISOString().slice(0, 10);
  var TIMEOUT_SHEET = 8000;

  var $ = function (sel) {
    return document.querySelector(sel);
  };

  function el(tag, cls, texto) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (texto != null) n.textContent = texto;
    return n;
  }

  /* ------------------------------------------------------------------
     Markdown mínimo para la columna Texto del Sheet.
     Escapamos primero: el texto viene de una planilla, no de acá.
     ------------------------------------------------------------------ */
  function escapar(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function enLinea(s) {
    return s
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function markdown(texto) {
    if (!texto) return "";
    var lineas = escapar(texto).replace(/\r/g, "").split("\n");
    var html = "";
    var listaAbierta = 0;

    function cerrarListas(hasta) {
      while (listaAbierta > hasta) {
        html += "</ul>";
        listaAbierta--;
      }
    }

    lineas.forEach(function (linea) {
      var vacia = !linea.trim();
      if (vacia) {
        cerrarListas(0);
        return;
      }

      var titulo = linea.match(/^(#{2,4})\s+(.*)$/);
      if (titulo) {
        cerrarListas(0);
        var nivel = Math.min(titulo[1].length + 1, 5);
        html += "<h" + nivel + ">" + enLinea(titulo[2]) + "</h" + nivel + ">";
        return;
      }

      var item = linea.match(/^(\s*)[-*•]\s+(.*)$/);
      if (item) {
        var nivelLista = Math.floor(item[1].length / 2) + 1;
        while (listaAbierta < nivelLista) {
          html += "<ul>";
          listaAbierta++;
        }
        cerrarListas(nivelLista);
        html += "<li>" + enLinea(item[2]) + "</li>";
        return;
      }

      cerrarListas(0);
      html += "<p>" + enLinea(linea.trim()) + "</p>";
    });

    cerrarListas(0);
    return html;
  }

  /* ------------------------------------------------------------------
     Fechas
     ------------------------------------------------------------------ */
  function fechaSimple(iso) {
    var p = iso.split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
  }

  function fmt(date, opts) {
    try {
      return new Intl.DateTimeFormat("es-AR", opts).format(date);
    } catch (e) {
      return date.toLocaleString();
    }
  }

  function capitalizar(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function fechaCorta(iso) {
    return fmt(fechaSimple(iso), {
      weekday: "short",
      day: "numeric",
      month: "long",
      timeZone: "UTC"
    });
  }

  function diasHasta(iso) {
    return Math.ceil((fechaSimple(iso) - fechaSimple(HOY)) / MS_DIA);
  }

  function enDias(dias) {
    if (dias <= 0) return "hoy";
    if (dias === 1) return "mañana";
    if (dias < 7) return "en " + dias + " días";
    var sem = Math.round(dias / 7);
    return "en " + sem + (sem === 1 ? " semana" : " semanas");
  }

  /* ------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------ */
  var toastEl = $("[data-toast]");
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ------------------------------------------------------------------
     Traer el Sheet
     ------------------------------------------------------------------ */
  var DIAG = [];

  function traerUrl(url) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var t = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, TIMEOUT_SHEET);

    var opciones = { cache: "no-store" };
    if (ctrl) opciones.signal = ctrl.signal;

    return fetch(url, opciones).then(
      function (res) {
        clearTimeout(t);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      },
      function (e) {
        clearTimeout(t);
        // Un fetch que falla sin status casi siempre es CORS o red.
        throw new Error(e && e.name === "AbortError" ? "timeout" : "red/CORS");
      }
    );
  }

  /** Prueba las URLs candidatas y devuelve el CSV de la primera que sirva. */
  function traerHoja(hoja) {
    var urls = S.urlsHoja(CFG.sheet, hoja);
    var i = -1;

    function siguiente(motivoPrevio) {
      i++;
      if (i >= urls.length) {
        return Promise.reject(new Error(hoja + ": " + (motivoPrevio || "sin endpoints")));
      }
      return traerUrl(urls[i]).then(
        function (txt) {
          if (!S.pareceCsv(txt)) {
            DIAG.push(hoja + " · endpoint " + (i + 1) + ": no devolvió CSV");
            return siguiente("Google no devolvió CSV (¿la planilla no es pública?)");
          }
          DIAG.push(hoja + " · endpoint " + (i + 1) + ": OK");
          return txt;
        },
        function (e) {
          DIAG.push(hoja + " · endpoint " + (i + 1) + ": " + e.message);
          return siguiente(e.message);
        }
      );
    }

    return siguiente();
  }

  function cargar() {
    if (!S || !CFG.sheet || !CFG.sheet.id) return Promise.reject(new Error("sin config"));
    return Promise.all([
      traerHoja(CFG.sheet.hojaContenido),
      traerHoja(CFG.sheet.hojaFacilitadores)
    ]).then(function (csvs) {
      var semanas = S.aplicarBloqueo(
        S.mapearSemanas(S.aObjetos(S.parseCsv(csvs[0]))),
        new Date()
      );
      if (!semanas.length) throw new Error("la hoja de contenido está vacía");
      return {
        semanas: semanas,
        facilitadores: S.mapearFacilitadores(S.aObjetos(S.parseCsv(csvs[1])))
      };
    });
  }

  /* ------------------------------------------------------------------
     Render
     ------------------------------------------------------------------ */
  var DATOS = { semanas: [], facilitadores: [] };

  function semanaActual() {
    for (var i = DATOS.semanas.length - 1; i >= 0; i--) {
      if (DATOS.semanas[i].abierta) return DATOS.semanas[i].numero;
    }
    return null;
  }

  function pintarProgreso() {
    var barra = $("[data-progress-bar]");
    var relleno = $("[data-progress-fill]");
    var texto = $("[data-progress-week]");
    if (!barra || !relleno || !texto || !DATOS.semanas.length) return;

    var inicio = fechaSimple(DATOS.semanas[0].fecha);
    var fin = fechaSimple(DATOS.semanas[DATOS.semanas.length - 1].fecha);
    var ahora = new Date();
    var total = DATOS.semanas.length;
    var pct = Math.max(0, Math.min(100, ((ahora - inicio) / (fin - inicio)) * 100));

    relleno.style.width = pct + "%";
    barra.setAttribute("aria-valuenow", String(Math.round(pct)));

    if (ahora < inicio) {
      var faltan = Math.ceil((inicio - ahora) / MS_DIA);
      texto.textContent = faltan <= 1 ? "Arranca mañana" : "Arranca en " + faltan + " días";
    } else if (ahora > fin) {
      texto.textContent = "Programa finalizado · ¡Gracias por cursar!";
    } else {
      texto.textContent = "Semana " + (semanaActual() || 1) + " de " + total;
    }
    barra.setAttribute("aria-valuetext", texto.textContent);

    var extremos = document.querySelectorAll("[data-progress-ends] span");
    if (extremos.length === 2) {
      extremos[0].textContent = capitalizar(fechaCorta(DATOS.semanas[0].fecha));
      extremos[1].textContent = capitalizar(
        fechaCorta(DATOS.semanas[DATOS.semanas.length - 1].fecha)
      );
    }
  }

  /* --- Encuentros sincrónicos --- */
  function encuentros() {
    var hora = PROG.horaArgentina || 19;
    return DATOS.semanas
      .filter(function (s) {
        return s.sesion;
      })
      .map(function (s) {
        var p = s.sesion.fecha.split("-");
        var inicio = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], hora + 3, 0));
        return {
          numero: s.sesion.numero,
          facilitador: s.sesion.facilitador,
          iso: s.sesion.fecha,
          inicio: inicio,
          fin: new Date(inicio.getTime() + (PROG.duracionHoras || 1) * 3600000)
        };
      });
  }

  var enArgentina = new Date().getTimezoneOffset() === 180;

  function pintarEncuentros() {
    var lista = $("[data-agenda]");
    var evs = encuentros();
    var ahora = Date.now();
    var proximo = null;
    for (var i = 0; i < evs.length; i++) {
      if (evs[i].fin.getTime() > ahora) {
        proximo = evs[i];
        break;
      }
    }

    if (lista) {
      lista.innerHTML = "";
      evs.forEach(function (e) {
        var li = el("li");
        li.appendChild(el("span", "agenda-date", capitalizar(fechaCorta(e.iso))));
        if (e.fin.getTime() <= ahora) {
          li.classList.add("is-past");
        } else if (e === proximo) {
          li.classList.add("is-next");
          li.appendChild(el("span", "agenda-tag", "Próximo"));
        } else if (!enArgentina) {
          li.appendChild(
            el("span", "agenda-local",
              fmt(e.inicio, {
                weekday: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
              })
            )
          );
        }
        lista.appendChild(li);
      });
    }

    var fechaEl = $("[data-next-date]");
    if (!fechaEl) return;

    if (!proximo) {
      fechaEl.textContent = "No quedan encuentros programados";
      var tEl = $(".next-time");
      if (tEl) tEl.textContent = "Cerramos el ciclo de encuentros en vivo.";
      return;
    }

    fechaEl.textContent = capitalizar(
      fmt(proximo.inicio, {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "America/Argentina/Buenos_Aires"
      })
    );

    var quien = $("[data-next-host]");
    if (quien) {
      var partes = [];
      if (proximo.numero) partes.push("Encuentro " + proximo.numero);
      if (proximo.facilitador) partes.push("con " + proximo.facilitador);
      quien.textContent = partes.join(" · ");
      quien.hidden = !partes.length;
    }

    if (!enArgentina) {
      var box = $("[data-local-box]");
      var tzEl = $("[data-local-tz]");
      var valEl = $("[data-local-value]");
      if (box && valEl) {
        var zona = "";
        try {
          zona = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        } catch (e) {
          zona = "";
        }
        if (tzEl && zona) tzEl.textContent = "(" + zona + ")";
        valEl.textContent =
          capitalizar(
            fmt(proximo.inicio, {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            })
          ) +
          " a " +
          fmt(proximo.fin, { hour: "2-digit", minute: "2-digit", hour12: false }) +
          " hs";
        box.hidden = false;
      }
    }

    pintarCuenta(proximo);
    clearInterval(pintarEncuentros._t);
    pintarEncuentros._t = setInterval(function () {
      pintarCuenta(proximo);
    }, 60000);
  }

  function pintarCuenta(proximo) {
    var e = $("[data-countdown]");
    if (!e || !proximo) return;
    var faltan = proximo.inicio.getTime() - Date.now();

    if (faltan <= 0) {
      e.textContent = "🟢 El encuentro está en curso — entrá cuando quieras.";
      e.hidden = false;
      return;
    }
    var d = Math.floor(faltan / MS_DIA);
    var h = Math.floor((faltan % MS_DIA) / 3600000);
    var m = Math.floor((faltan % 3600000) / 60000);

    if (d > 0) {
      e.textContent =
        "Faltan " + d + (d === 1 ? " día" : " días") +
        (h > 0 ? " y " + h + (h === 1 ? " hora" : " horas") : "");
    } else if (h > 0) {
      e.textContent = "Faltan " + h + (h === 1 ? " hora" : " horas") + " y " + m + " min";
    } else {
      e.textContent = "Faltan " + m + " min — te esperamos.";
    }
    e.hidden = false;
  }

  /* --- Ruta del programa --- */
  var soloDisponibles = false;

  function iconoLock() {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2"/>' +
      '<path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>'
    );
  }

  function linkVideo(titulo, url, nota, clase) {
    var a = el("a", "video-link" + (clase ? " " + clase : ""));
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.innerHTML =
      '<span class="video-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M8 5.5v13l11-6.5z"/></svg></span>';
    var txt = el("span", "video-txt");
    txt.appendChild(el("span", "video-nombre", titulo));
    if (nota) txt.appendChild(el("span", "video-nota", nota));
    a.appendChild(txt);
    return a;
  }

  function pintarRuta() {
    var lista = $("[data-ruta]");
    if (!lista) return;
    var actual = semanaActual();
    lista.innerHTML = "";

    DATOS.semanas.forEach(function (s) {
      var contenido = s.videos.length || s.texto || s.archivos.length;
      var tieneContenido = s.abierta && contenido;
      if (soloDisponibles && !tieneContenido) return;

      var li = el("li", "ruta-item");
      if (tieneContenido) li.classList.add("is-open");
      if (!s.abierta) li.classList.add("is-locked");
      if (s.numero === actual) li.classList.add("is-current");

      var cabeza = el("div", "ruta-head-row");
      cabeza.appendChild(el("div", "ruta-num", String(s.numero).padStart(2, "0")));

      var main = el("div", "ruta-main");
      var top = el("div", "ruta-top");
      top.appendChild(el("h3", null, s.titulo || s.etiqueta || "Semana " + s.numero));
      if (s.numero === actual) top.appendChild(el("span", "chip chip-now", "Semana actual"));
      if (s.sesion) top.appendChild(el("span", "chip chip-live", "Encuentro en vivo"));
      if (s.modulo) top.appendChild(el("span", "chip chip-mod", s.modulo));
      main.appendChild(top);

      var meta;
      if (tieneContenido) {
        meta = "Disponible desde el " + fechaCorta(s.fecha);
        if (s.videos.length > 1) meta += " · " + s.videos.length + " grabaciones";
      } else if (s.abierta) {
        meta = "Se libera el " + fechaCorta(s.fecha) + " · subiendo el contenido";
      } else {
        meta =
          "Se libera el " + fechaCorta(s.fecha) +
          (s.hora ? " a las " + s.hora + " hs" : "") +
          " · " + enDias(diasHasta(s.fecha));
      }
      main.appendChild(el("p", "ruta-meta", meta));
      cabeza.appendChild(main);

      var acciones = el("div", "ruta-actions");
      if (!tieneContenido) {
        var lock = el("span", "lock");
        lock.innerHTML = iconoLock();
        lock.appendChild(
          el("span", null, s.abierta ? "En camino" : "Se libera " + enDias(diasHasta(s.fecha)))
        );
        acciones.appendChild(lock);
      }
      cabeza.appendChild(acciones);

      if (!tieneContenido) {
        li.appendChild(cabeza);
        lista.appendChild(li);
        return;
      }

      var det = el("details", "ruta-det");
      if (s.numero === actual) det.open = true;
      var sum = el("summary", "ruta-sum");
      sum.appendChild(cabeza);
      sum.appendChild(el("span", "ruta-chevron"));
      det.appendChild(sum);

      var cuerpo = el("div", "ruta-cuerpo");

      if (s.videos.length || (s.sesion && s.sesion.grabacion)) {
        var vids = el("div", "ruta-videos");
        s.videos.forEach(function (v) {
          vids.appendChild(linkVideo(v.titulo, v.url, v.nota));
        });
        if (s.sesion && s.sesion.grabacion) {
          vids.appendChild(
            linkVideo(
              "Grabación del encuentro" + (s.sesion.numero ? " " + s.sesion.numero : ""),
              s.sesion.grabacion,
              "Sesión en vivo del " + fechaCorta(s.sesion.fecha),
              "video-link-enc"
            )
          );
        }
        cuerpo.appendChild(vids);
      }

      if (s.archivos.length) {
        var mat = el("div", "ruta-material");
        mat.appendChild(el("span", "ruta-material-label", "Material de práctica"));
        s.archivos.forEach(function (a) {
          var link = el("a", "material-link");
          link.href = a.url;
          link.target = "_blank";
          link.rel = "noopener";
          link.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M4 18h16"/></svg>';
          link.appendChild(el("span", null, a.nombre));
          mat.appendChild(link);
        });
        cuerpo.appendChild(mat);
      }

      if (s.texto) {
        var notas = el("div", "ruta-notas");
        notas.innerHTML = markdown(s.texto);
        cuerpo.appendChild(notas);
      }

      det.appendChild(cuerpo);
      li.appendChild(det);
      lista.appendChild(li);
    });

    if (!lista.children.length) {
      lista.appendChild(
        el("li", "ruta-vacio",
          "Todavía no hay contenido publicado. Volvé después del primer encuentro.")
      );
    }
  }

  /* --- Facilitador del módulo en curso --- */
  function pintarFacilitador() {
    var caja = $("[data-facilitador]");
    if (!caja) return;

    var modulo = S ? S.moduloActual(DATOS.semanas) : "";
    var f = null;
    for (var i = 0; i < DATOS.facilitadores.length; i++) {
      if (DATOS.facilitadores[i].modulo === modulo) {
        f = DATOS.facilitadores[i];
        break;
      }
    }
    if (!f && DATOS.facilitadores.length) f = DATOS.facilitadores[0];

    if (!f) {
      caja.hidden = true;
      return;
    }
    caja.hidden = false;
    caja.innerHTML = "";

    var side = el("div", "profe-side");
    var avatar = el("div", "profe-avatar", f.iniciales);
    if (f.foto) {
      var img = new Image();
      img.src = f.foto;
      img.alt = "";
      // Si la imagen no carga, quedan las iniciales que ya están debajo.
      img.onload = function () {
        avatar.textContent = "";
        avatar.classList.add("has-foto");
        avatar.appendChild(img);
      };
    }
    side.appendChild(avatar);
    side.appendChild(el("p", "profe-nombre", f.nombre));
    if (f.rol) side.appendChild(el("p", "profe-rol", f.rol));
    if (modulo) {
      var tags = el("ul", "profe-tags");
      tags.appendChild(el("li", null, "Módulo " + modulo));
      side.appendChild(tags);
    }
    if (f.linkedin) {
      var a = el("a", "profe-link", "Conectar en LinkedIn →");
      a.href = f.linkedin;
      a.target = "_blank";
      a.rel = "noopener";
      side.appendChild(a);
    }
    caja.appendChild(side);

    var bio = el("div", "profe-bio");
    if (f.bio) {
      bio.innerHTML = markdown(f.bio);
    } else {
      bio.appendChild(
        el("p", null, "Estamos preparando la presentación de " + f.nombre + ".")
      );
    }
    if (f.cita) {
      var q = el("blockquote", "profe-quote", "🎙️ “" + f.cita + "”");
      bio.appendChild(q);
    }
    caja.appendChild(bio);

  }

  /* ------------------------------------------------------------------
     Zoom, WhatsApp, .ics
     ------------------------------------------------------------------ */
  function pintarEnlacesFijos() {
    var zoomLink = $("[data-zoom-link]");
    if (zoomLink && PROG.zoom) zoomLink.href = PROG.zoom;
    var zoomTexto = $("[data-zoom-text]");
    if (zoomTexto && PROG.zoom) {
      zoomTexto.href = PROG.zoom;
      zoomTexto.textContent = PROG.zoom;
    }

    document.querySelectorAll("[data-whatsapp]").forEach(function (nodo) {
      if (!PROG.whatsapp) return;
      nodo.innerHTML = "";
      var a = el("a", nodo.getAttribute("data-whatsapp") || "", "Entrar al grupo de WhatsApp →");
      a.href = PROG.whatsapp;
      a.target = "_blank";
      a.rel = "noopener";
      nodo.appendChild(a);
    });
  }

  var btnCopiar = $("[data-copy-zoom]");
  if (btnCopiar) {
    btnCopiar.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(PROG.zoom).then(
          function () {
            toast("Link de Zoom copiado ✓");
          },
          function () {
            toast("No pudimos copiarlo. Copialo desde el link de abajo.");
          }
        );
      } else {
        toast("No pudimos copiarlo. Copialo desde el link de abajo.");
      }
    });
  }

  function utcStamp(d) {
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  function escapeIcs(s) {
    return String(s)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  }

  function construirIcs() {
    var lineas = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//HACHE Consultora//Power People 2026//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];
    var ahora = utcStamp(new Date());
    encuentros().forEach(function (e) {
      lineas.push(
        "BEGIN:VEVENT",
        "UID:power-people-2026-" + e.iso + "@hacheconsultora.com",
        "DTSTAMP:" + ahora,
        "DTSTART:" + utcStamp(e.inicio),
        "DTEND:" + utcStamp(e.fin),
        "SUMMARY:" +
          escapeIcs(
            PROG.nombre + " · Encuentro" + (e.numero ? " " + e.numero : "") +
              (e.facilitador ? " con " + e.facilitador : "")
          ),
        "DESCRIPTION:" +
          escapeIcs(
            "Sesión sincrónica de consultas de " + PROG.nombre +
              ".\nHorario: 19 a 20 hs de Argentina (GMT-3).\nZoom: " + PROG.zoom
          ),
        "LOCATION:" + escapeIcs(PROG.zoom),
        "URL:" + PROG.zoom,
        "BEGIN:VALARM",
        "TRIGGER:-PT30M",
        "ACTION:DISPLAY",
        "DESCRIPTION:" + escapeIcs("En 30 minutos empieza el encuentro de " + PROG.nombre),
        "END:VALARM",
        "END:VEVENT"
      );
    });
    lineas.push("END:VCALENDAR");
    return lineas.join("\r\n");
  }

  var btnIcs = $("[data-download-ics]");
  if (btnIcs) {
    btnIcs.addEventListener("click", function () {
      var blob = new Blob([construirIcs()], { type: "text/calendar;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "power-people-2026-encuentros.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
      toast("Calendario descargado ✓ Importalo en tu agenda.");
    });
  }

  var toggle = $("[data-solo-disponibles]");
  if (toggle) {
    toggle.addEventListener("change", function () {
      soloDisponibles = toggle.checked;
      pintarRuta();
    });
  }

  /* ------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------ */
  function render(fuente) {
    pintarEnlacesFijos();
    pintarProgreso();
    pintarEncuentros();
    pintarRuta();
    pintarFacilitador();

    var aviso = $("[data-fuente]");
    var debug = /[?&]debug\b/.test(location.search);

    if (aviso) {
      if (fuente === "respaldo") {
        aviso.classList.add("es-alerta");
        aviso.textContent =
          "No pudimos leer la planilla del programa: estás viendo la última copia guardada. " +
          "Si falta contenido, recargá en un rato.";
        aviso.hidden = false;
      } else if (debug) {
        aviso.classList.remove("es-alerta");
        aviso.textContent = "Leyendo la planilla en vivo · " + DIAG.join(" · ");
        aviso.hidden = false;
      } else {
        aviso.hidden = true;
      }
    }

    if (debug && window.console) {
      console.log("[Power People] fuente:", fuente);
      DIAG.forEach(function (d) {
        console.log("[Power People]", d);
      });
    }
  }

  cargar()
    .then(function (d) {
      DATOS = d;
      render("sheet");
    })
    .catch(function (e) {
      DATOS = { semanas: RESPALDO.semanas || [], facilitadores: RESPALDO.facilitadores || [] };
      if (window.console) {
        console.warn("[Power People] No se pudo leer el Sheet:", e.message);
        DIAG.forEach(function (d) {
          console.warn("[Power People]", d);
        });
      }
      render("respaldo");
    });
})();
