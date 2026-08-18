/* ==========================================================================
   Power People 2026 — HACHE Consultora
   Sin dependencias. Todo corre en el navegador del alumno.

   Los datos vienen de assets/contenido.js, que genera scripts/build.mjs a
   partir de contenido.json. Las grabaciones todavía no liberadas NO llegan
   hasta acá: el build las deja afuera.
   ========================================================================== */

(function () {
  "use strict";

  var DATOS = window.PROGRAMA || { programa: {}, semanas: [], generado: "" };
  var CONFIG = DATOS.programa || {};
  var SEMANAS = DATOS.semanas || [];

  // Argentina no aplica horario de verano: 19:00 ART === 22:00 UTC, siempre.
  var UTC_HOUR = (CONFIG.horaArgentina || 19) + 3;
  var MS_DIA = 86400000;
  var HOY = new Date().toISOString().slice(0, 10);

  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };

  /** "2026-08-26" -> Date del inicio del encuentro (19 hs ART), en UTC. */
  function fechaEncuentro(iso) {
    var p = iso.split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], UTC_HOUR, 0, 0));
  }

  /** "2026-08-19" -> Date a medianoche UTC (para cálculos de calendario). */
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

  function capitalizar(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /** "mié 26 de agosto" */
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
    var semanas = Math.round(dias / 7);
    return "en " + semanas + (semanas === 1 ? " semana" : " semanas");
  }

  function el(tag, cls, texto) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (texto != null) n.textContent = texto;
    return n;
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
     Barra de progreso del programa
     ------------------------------------------------------------------ */
  function pintarProgreso() {
    var barra = $("[data-progress-bar]");
    var relleno = $("[data-progress-fill]");
    var texto = $("[data-progress-week]");
    if (!barra || !relleno || !texto || !CONFIG.inicio) return;

    var inicio = fechaSimple(CONFIG.inicio);
    var fin = fechaSimple(CONFIG.fin);
    var ahora = new Date();

    var totalSemanas = SEMANAS.length || Math.round((fin - inicio) / (MS_DIA * 7)) + 1;
    var transcurrido = ahora - inicio;
    var pct = Math.max(0, Math.min(100, (transcurrido / (fin - inicio)) * 100));

    relleno.style.width = pct + "%";
    barra.setAttribute("aria-valuenow", String(Math.round(pct)));

    if (ahora < inicio) {
      var faltan = Math.ceil((inicio - ahora) / MS_DIA);
      texto.textContent = faltan <= 1 ? "Arranca mañana" : "Arranca en " + faltan + " días";
    } else if (ahora > fin) {
      texto.textContent = "Programa finalizado · ¡Gracias por cursar!";
    } else {
      var semana = Math.min(totalSemanas, Math.floor(transcurrido / (MS_DIA * 7)) + 1);
      texto.textContent = "Semana " + semana + " de " + totalSemanas;
    }
    barra.setAttribute("aria-valuetext", texto.textContent);
  }

  /** Número de la semana en curso, o null si el programa no arrancó / terminó. */
  function semanaActual() {
    for (var i = SEMANAS.length - 1; i >= 0; i--) {
      if (SEMANAS[i].libera <= HOY) return SEMANAS[i].numero;
    }
    return null;
  }

  /* ------------------------------------------------------------------
     Encuentros sincrónicos
     ------------------------------------------------------------------ */
  var encuentros = SEMANAS.filter(function (s) {
    return s.encuentro;
  }).map(function (s) {
    var inicio = fechaEncuentro(s.encuentro.fecha);
    return {
      semana: s.numero,
      iso: s.encuentro.fecha,
      inicio: inicio,
      fin: new Date(inicio.getTime() + (CONFIG.duracionHoras || 1) * 3600000)
    };
  });

  function proximoEncuentro() {
    var ahora = Date.now();
    for (var i = 0; i < encuentros.length; i++) {
      if (encuentros[i].fin.getTime() > ahora) return encuentros[i];
    }
    return null;
  }

  var enArgentina = new Date().getTimezoneOffset() === 180;

  function pintarAgenda(proximo) {
    var lista = $("[data-agenda]");
    if (!lista) return;
    lista.innerHTML = "";
    var ahora = Date.now();

    encuentros.forEach(function (e) {
      var li = el("li");
      li.appendChild(el("span", "agenda-date", capitalizar(fechaCorta(e.iso))));

      if (e.fin.getTime() <= ahora) {
        li.classList.add("is-past");
      } else if (proximo && e === proximo) {
        li.classList.add("is-next");
        li.appendChild(el("span", "agenda-tag", "Próximo"));
      } else if (!enArgentina) {
        // Fuera de Argentina mostramos la hora local: puede caer otro día.
        li.appendChild(
          el(
            "span",
            "agenda-local",
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

  function pintarProximo(proximo) {
    var fechaEl = $("[data-next-date]");
    if (!fechaEl) return;

    if (!proximo) {
      fechaEl.textContent = "No quedan encuentros programados";
      var timeEl = $(".next-time");
      if (timeEl) timeEl.textContent = "Cerramos el ciclo de encuentros en vivo.";
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

        var inicioLocal = fmt(proximo.inicio, {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });
        var finLocal = fmt(proximo.fin, { hour: "2-digit", minute: "2-digit", hour12: false });
        valEl.textContent = capitalizar(inicioLocal) + " a " + finLocal + " hs";
        box.hidden = false;
      }
    }

    pintarCuenta(proximo);
    setInterval(function () {
      pintarCuenta(proximo);
    }, 60000);
  }

  function pintarCuenta(proximo) {
    var elc = $("[data-countdown]");
    if (!elc || !proximo) return;

    var faltan = proximo.inicio.getTime() - Date.now();

    if (faltan <= 0) {
      elc.textContent = "🟢 El encuentro está en curso — entrá cuando quieras.";
      elc.hidden = false;
      return;
    }

    var dias = Math.floor(faltan / MS_DIA);
    var horas = Math.floor((faltan % MS_DIA) / 3600000);
    var minutos = Math.floor((faltan % 3600000) / 60000);

    if (dias > 0) {
      elc.textContent =
        "Faltan " + dias + (dias === 1 ? " día" : " días") +
        (horas > 0 ? " y " + horas + (horas === 1 ? " hora" : " horas") : "");
    } else if (horas > 0) {
      elc.textContent =
        "Faltan " + horas + (horas === 1 ? " hora" : " horas") + " y " + minutos + " min";
    } else {
      elc.textContent = "Faltan " + minutos + " min — te esperamos.";
    }
    elc.hidden = false;
  }

  /* ------------------------------------------------------------------
     Ruta del programa: las 16 semanas y sus grabaciones
     ------------------------------------------------------------------ */
  var soloDisponibles = false;

  function pintarRuta() {
    var lista = document.querySelector("[data-ruta]");
    if (!lista) return;

    var actual = semanaActual();
    lista.innerHTML = "";

    SEMANAS.forEach(function (s) {
      // El build puede ser más viejo que hoy: si la fecha ya pasó pero el dato
      // llegó cerrado, es que todavía no se rebuildeó.
      var yaEsFecha = s.libera <= HOY;
      var abierta = s.abierta || false;

      if (soloDisponibles && !(abierta && s.grabacion)) return;

      var li = el("li", "ruta-item");
      if (abierta && s.grabacion) li.classList.add("is-open");
      else if (!abierta) li.classList.add("is-locked");
      if (s.numero === actual) li.classList.add("is-current");

      li.appendChild(
        el("div", "ruta-num", String(s.numero).padStart(2, "0"))
      );

      var main = el("div", "ruta-main");
      var top = el("div", "ruta-top");
      top.appendChild(el("h3", null, s.titulo || "Semana " + s.numero));
      if (s.numero === actual) top.appendChild(el("span", "chip chip-now", "Semana actual"));
      if (s.encuentro) top.appendChild(el("span", "chip chip-live", "Encuentro en vivo"));
      main.appendChild(top);

      if (s.resumen) main.appendChild(el("p", "ruta-resumen", s.resumen));

      var meta;
      if (abierta && s.grabacion) {
        meta = "Disponible desde el " + fechaCorta(s.libera);
        if (s.duracion) meta += " · " + s.duracion;
      } else if (abierta || yaEsFecha) {
        meta = "Se libera el " + fechaCorta(s.libera) + " · subiendo la grabación";
      } else {
        meta = "Se libera el " + fechaCorta(s.libera) + " · " + enDias(diasHasta(s.libera));
      }
      main.appendChild(el("p", "ruta-meta", meta));

      if (s.material && s.material.length) {
        var mat = el("div", "ruta-material");
        mat.appendChild(el("span", "ruta-material-label", "Material"));
        s.material.forEach(function (m) {
          var a = el("a", null, m.nombre);
          a.href = m.url;
          a.target = "_blank";
          a.rel = "noopener";
          mat.appendChild(a);
        });
        main.appendChild(mat);
      }

      li.appendChild(main);

      var acciones = el("div", "ruta-actions");
      if (abierta && s.grabacion) {
        var ver = el("a", "btn btn-cta btn-sm", "Ver grabación");
        ver.href = s.grabacion;
        ver.target = "_blank";
        ver.rel = "noopener";
        acciones.appendChild(ver);
      } else {
        var lock = el("span", "lock");
        lock.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2"/>' +
          '<path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
        lock.appendChild(
          el(
            "span",
            null,
            abierta || yaEsFecha ? "En camino" : "Se libera " + enDias(diasHasta(s.libera))
          )
        );
        acciones.appendChild(lock);
      }

      if (s.encuentro && s.encuentro.abierta && s.encuentro.grabacion) {
        var verEnc = el("a", "btn btn-outline btn-sm", "Grabación del encuentro");
        verEnc.href = s.encuentro.grabacion;
        verEnc.target = "_blank";
        verEnc.rel = "noopener";
        acciones.appendChild(verEnc);
      }

      li.appendChild(acciones);
      lista.appendChild(li);
    });

    if (!lista.children.length) {
      lista.appendChild(
        el("li", "ruta-vacio", "Todavía no hay grabaciones publicadas. Volvé después del primer encuentro.")
      );
    }
  }

  var toggle = document.querySelector("[data-solo-disponibles]");
  if (toggle) {
    toggle.addEventListener("change", function () {
      soloDisponibles = toggle.checked;
      pintarRuta();
    });
  }

  /* ------------------------------------------------------------------
     Copiar link de Zoom
     ------------------------------------------------------------------ */
  var btnCopiar = document.querySelector("[data-copy-zoom]");
  if (btnCopiar) {
    btnCopiar.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(CONFIG.zoom).then(
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

  /* ------------------------------------------------------------------
     Descargar los encuentros como calendario (.ics)
     ------------------------------------------------------------------ */
  function utcStamp(date) {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  function escapeIcs(str) {
    return String(str)
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

    encuentros.forEach(function (e, i) {
      lineas.push(
        "BEGIN:VEVENT",
        "UID:power-people-2026-" + e.iso + "@hacheconsultora.com",
        "DTSTAMP:" + ahora,
        "DTSTART:" + utcStamp(e.inicio),
        "DTEND:" + utcStamp(e.fin),
        "SUMMARY:" + escapeIcs(CONFIG.nombre + " · Encuentro de consultas #" + (i + 1)),
        "DESCRIPTION:" +
          escapeIcs(
            "Sesión sincrónica de consultas de " + CONFIG.nombre +
              ".\nHorario: 19 a 20 hs de Argentina (GMT-3).\nZoom: " + CONFIG.zoom
          ),
        "LOCATION:" + escapeIcs(CONFIG.zoom),
        "URL:" + CONFIG.zoom,
        "BEGIN:VALARM",
        "TRIGGER:-PT30M",
        "ACTION:DISPLAY",
        "DESCRIPTION:" + escapeIcs("En 30 minutos empieza el encuentro de " + CONFIG.nombre),
        "END:VALARM",
        "END:VEVENT"
      );
    });

    lineas.push("END:VCALENDAR");
    return lineas.join("\r\n");
  }

  var btnIcs = document.querySelector("[data-download-ics]");
  if (btnIcs) {
    if (!encuentros.length) {
      btnIcs.hidden = true;
    } else {
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
  }

  /* ------------------------------------------------------------------
     WhatsApp — el botón aparece solo si hay link cargado
     ------------------------------------------------------------------ */
  var notaWsp = document.querySelector("[data-whatsapp-note]");
  if (notaWsp && CONFIG.whatsapp) {
    notaWsp.innerHTML = "";
    var aWsp = el("a", null, "Entrar al grupo de WhatsApp →");
    aWsp.href = CONFIG.whatsapp;
    aWsp.target = "_blank";
    aWsp.rel = "noopener";
    notaWsp.appendChild(aWsp);
  }

  /* ------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------ */
  var zoomLink = document.querySelector("[data-zoom-link]");
  if (zoomLink && CONFIG.zoom) zoomLink.href = CONFIG.zoom;
  var zoomTexto = document.querySelector("[data-zoom-text]");
  if (zoomTexto && CONFIG.zoom) {
    zoomTexto.href = CONFIG.zoom;
    zoomTexto.textContent = CONFIG.zoom;
  }

  pintarProgreso();
  var proximo = proximoEncuentro();
  pintarAgenda(proximo);
  pintarProximo(proximo);
  pintarRuta();
})();
