/* ==========================================================================
   Power People 2026 — HACHE Consultora
   Sin dependencias. Todo corre en el navegador del alumno.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIG — lo único que hay que tocar para actualizar el programa
     ------------------------------------------------------------------ */
  var CONFIG = {
    nombre: "Power People 2026",
    // Link fijo de Zoom para todos los encuentros sincrónicos.
    zoom: "https://us02web.zoom.us/j/84283169271",
    // Grupo de WhatsApp. Poné la URL de invitación y el botón aparece solo.
    whatsapp: null,
    // Inicio y fin del programa (YYYY-MM-DD).
    inicio: "2026-08-19",
    fin: "2026-12-02",
    // Los encuentros son a esta hora de Argentina (GMT-3, sin horario de verano).
    horaArgentina: 19,
    duracionHoras: 1
  };

  // Argentina no aplica horario de verano: 19:00 ART === 22:00 UTC, siempre.
  var UTC_HOUR = CONFIG.horaArgentina + 3;
  var MS_DIA = 86400000;

  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /** "2026-08-26" -> Date del inicio del encuentro, en UTC. */
  function fechaEncuentro(iso) {
    var p = iso.split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], UTC_HOUR, 0, 0));
  }

  /** "2026-08-19" -> Date a medianoche UTC (para cálculos de calendario). */
  function fechaSimple(iso) {
    var p = iso.split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
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
    if (!barra || !relleno || !texto) return;

    var inicio = fechaSimple(CONFIG.inicio);
    var fin = fechaSimple(CONFIG.fin);
    var ahora = new Date();

    var totalSemanas = Math.round((fin - inicio) / (MS_DIA * 7)) + 1;
    var transcurrido = ahora - inicio;
    var pct = Math.max(0, Math.min(100, (transcurrido / (fin - inicio)) * 100));

    relleno.style.width = pct + "%";
    barra.setAttribute("aria-valuenow", String(Math.round(pct)));

    if (ahora < inicio) {
      var faltan = Math.ceil((inicio - ahora) / MS_DIA);
      texto.textContent =
        faltan <= 1 ? "Arranca mañana" : "Arranca en " + faltan + " días";
      barra.setAttribute("aria-valuetext", texto.textContent);
      return;
    }

    if (ahora > fin) {
      texto.textContent = "Programa finalizado · ¡Gracias por cursar!";
      barra.setAttribute("aria-valuetext", texto.textContent);
      return;
    }

    var semana = Math.min(
      totalSemanas,
      Math.floor(transcurrido / (MS_DIA * 7)) + 1
    );
    texto.textContent = "Semana " + semana + " de " + totalSemanas;
    barra.setAttribute("aria-valuetext", texto.textContent);
  }

  /* ------------------------------------------------------------------
     Encuentros sincrónicos
     ------------------------------------------------------------------ */
  var items = $$("[data-agenda] li[data-date]");
  var encuentros = items.map(function (li) {
    var inicio = fechaEncuentro(li.getAttribute("data-date"));
    return {
      li: li,
      iso: li.getAttribute("data-date"),
      inicio: inicio,
      fin: new Date(inicio.getTime() + CONFIG.duracionHoras * 3600000)
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

  function pintarAgenda(proximo) {
    var ahora = Date.now();
    encuentros.forEach(function (e) {
      if (e.fin.getTime() <= ahora) {
        e.li.classList.add("is-past");
        return;
      }
      if (proximo && e === proximo) {
        e.li.classList.add("is-next");
        var tag = document.createElement("span");
        tag.className = "agenda-tag";
        tag.textContent = "Próximo";
        e.li.appendChild(tag);
        return;
      }
      // Para el resto, si el alumno está fuera de Argentina mostramos su hora local.
      if (!enArgentina) {
        var local = document.createElement("span");
        local.className = "agenda-local";
        local.textContent = fmt(e.inicio, {
          weekday: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });
        e.li.appendChild(local);
      }
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

    // Hora local del alumno, solo si no está en horario de Argentina.
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
        var finLocal = fmt(proximo.fin, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });
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
    var el = $("[data-countdown]");
    if (!el || !proximo) return;

    var ahora = Date.now();
    var faltan = proximo.inicio.getTime() - ahora;

    if (faltan <= 0) {
      el.textContent = "🟢 El encuentro está en curso — entrá cuando quieras.";
      el.hidden = false;
      return;
    }

    var dias = Math.floor(faltan / MS_DIA);
    var horas = Math.floor((faltan % MS_DIA) / 3600000);
    var minutos = Math.floor((faltan % 3600000) / 60000);

    if (dias > 0) {
      el.textContent =
        "Faltan " + dias + (dias === 1 ? " día" : " días") +
        (horas > 0 ? " y " + horas + (horas === 1 ? " hora" : " horas") : "");
    } else if (horas > 0) {
      el.textContent = "Faltan " + horas + (horas === 1 ? " hora" : " horas") +
        " y " + minutos + " min";
    } else {
      el.textContent = "Faltan " + minutos + " min — te esperamos.";
    }
    el.hidden = false;
  }

  /* ------------------------------------------------------------------
     Copiar link de Zoom
     ------------------------------------------------------------------ */
  var btnCopiar = $("[data-copy-zoom]");
  if (btnCopiar) {
    btnCopiar.addEventListener("click", function () {
      var texto = CONFIG.zoom;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(
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

  var btnIcs = $("[data-download-ics]");
  if (btnIcs) {
    if (!encuentros.length) {
      btnIcs.hidden = true;
    } else {
      btnIcs.addEventListener("click", function () {
        var blob = new Blob([construirIcs()], {
          type: "text/calendar;charset=utf-8"
        });
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
     WhatsApp — el botón aparece solo si hay link cargado en CONFIG
     ------------------------------------------------------------------ */
  var notaWsp = $("[data-whatsapp-note]");
  if (notaWsp && CONFIG.whatsapp) {
    notaWsp.innerHTML = "";
    var aWsp = document.createElement("a");
    aWsp.href = CONFIG.whatsapp;
    aWsp.target = "_blank";
    aWsp.rel = "noopener";
    aWsp.textContent = "Entrar al grupo de WhatsApp →";
    notaWsp.appendChild(aWsp);
  }

  /* ------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------ */
  var zoomLink = $("[data-zoom-link]");
  if (zoomLink) zoomLink.href = CONFIG.zoom;

  pintarProgreso();
  var proximo = proximoEncuentro();
  pintarAgenda(proximo);
  pintarProximo(proximo);
})();
