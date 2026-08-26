/* ==========================================================================
   PoweRH — la portada.

   Dibuja el avance del workshop, la ruta de bloques (cada uno linkeando a su
   sub-página), los encuentros en vivo y quién acompaña.
   ========================================================================== */

(function () {
  "use strict";

  var RH = window.RH;
  var $ = RH.$;
  var el = RH.el;
  var DATOS = { bloques: [], encuentros: [], facilitadores: [], ajustes: {} };

  /* ------------------------------------------------------------------
     Avance del workshop
     ------------------------------------------------------------------ */

  /** Los encuentros marcan el pulso; si no hay, nos guiamos por los bloques. */
  function hitos() {
    if (DATOS.encuentros.length) {
      return {
        etiqueta: "Encuentro",
        fechas: DATOS.encuentros.map(function (e) {
          return e.fecha;
        }),
        pasados: DATOS.encuentros.filter(function (e) {
          return RH.diasHasta(e.fecha) <= 0;
        }).length
      };
    }
    var conFecha = DATOS.bloques.filter(function (b) {
      return b.fecha;
    });
    return {
      etiqueta: "Bloque",
      fechas: conFecha.map(function (b) {
        return b.fecha;
      }),
      pasados: conFecha.filter(function (b) {
        return b.abierto;
      }).length
    };
  }

  function pintarProgreso() {
    var barra = $("[data-progress-bar]");
    var relleno = $("[data-progress-fill]");
    var texto = $("[data-progress-week]");
    var h = hitos();
    if (!barra || !relleno || !texto || !h.fechas.length) return;

    var inicio = RH.fechaSimple(h.fechas[0]);
    var fin = RH.fechaSimple(h.fechas[h.fechas.length - 1]);
    var ahora = new Date();
    var pct = fin > inicio ? ((ahora - inicio) / (fin - inicio)) * 100 : 100;
    pct = Math.max(0, Math.min(100, pct));

    relleno.style.width = pct + "%";
    barra.setAttribute("aria-valuenow", String(Math.round(pct)));

    if (ahora < inicio) {
      var faltan = Math.ceil((inicio - ahora) / RH.MS_DIA);
      texto.textContent = faltan <= 1 ? "Arranca mañana" : "Arranca en " + faltan + " días";
    } else if (h.pasados >= h.fechas.length) {
      texto.textContent = "Workshop finalizado · ¡gracias por cursar!";
    } else {
      texto.textContent =
        h.etiqueta + " " + Math.max(1, h.pasados) + " de " + h.fechas.length;
    }
    barra.setAttribute("aria-valuetext", texto.textContent);

    var extremos = document.querySelectorAll("[data-progress-ends] span");
    if (extremos.length === 2) {
      extremos[0].textContent = RH.capitalizar(RH.fechaCorta(h.fechas[0]));
      extremos[1].textContent = RH.capitalizar(RH.fechaCorta(h.fechas[h.fechas.length - 1]));
    }
  }

  /* ------------------------------------------------------------------
     Ruta de bloques: cada fila lleva a su sub-página
     ------------------------------------------------------------------ */

  function icono(d, ancho) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", ancho || "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d);
    svg.appendChild(p);
    return svg;
  }

  function bloqueActual() {
    var actual = RH.S ? RH.S.bloqueActual(DATOS.bloques) : null;
    return actual ? actual.slug : "";
  }

  function cuentaDe(b) {
    var caja = el("p", "ruta-cuenta");
    var materiales = 0;
    var tareas = 0;
    b.tarjetas.forEach(function (t) {
      if (!t.abierta) return;
      materiales += t.archivos.length;
      if (t.tipo === "tarea") tareas++;
    });
    var grabaciones = b.encuentros.filter(function (e) {
      return e.grabacion;
    }).length;

    if (b.tarjetas.length) {
      caja.appendChild(el("span", null, "📄 " + b.tarjetas.length + " tarjetas"));
    }
    if (materiales) {
      caja.appendChild(
        el("span", null, "📎 " + materiales + (materiales === 1 ? " archivo" : " archivos"))
      );
    }
    if (grabaciones) {
      caja.appendChild(
        el("span", null, "🎥 " + grabaciones + (grabaciones === 1 ? " grabación" : " grabaciones"))
      );
    }
    if (tareas) caja.appendChild(el("span", null, "🎒 tarea"));
    return caja.childNodes.length ? caja : null;
  }

  function pintarRuta() {
    var lista = $("[data-ruta]");
    if (!lista) return;
    var actual = bloqueActual();
    lista.innerHTML = "";

    DATOS.bloques.forEach(function (b) {
      var li = el("li", "ruta-item");
      if (b.abierto) li.classList.add("is-open");
      else li.classList.add("is-locked");
      if (b.slug === actual) li.classList.add("is-current");

      var fila = el("div", "ruta-head-row");
      fila.appendChild(el("div", "ruta-num", String(b.numero).padStart(2, "0")));

      var main = el("div", "ruta-main");
      var top = el("div", "ruta-top");
      top.appendChild(el("h3", null, b.nombre));
      if (b.slug === actual && b.abierto) top.appendChild(el("span", "chip chip-now", "En curso"));
      if (b.encuentros.length) {
        top.appendChild(
          el("span", "chip chip-live",
            b.encuentros.length === 1 ? "1 encuentro" : b.encuentros.length + " encuentros")
        );
      }
      main.appendChild(top);

      if (b.bajada) main.appendChild(el("p", "ruta-bajada", b.bajada));

      var meta;
      if (b.abierto) {
        meta = b.fecha ? "Disponible desde el " + RH.fechaCorta(b.fecha) : "Disponible";
      } else {
        meta =
          "Se abre el " + RH.fechaCorta(b.fecha) +
          (b.hora ? " a las " + b.hora + " hs" : "") +
          " · " + RH.enDias(RH.diasHasta(b.fecha));
      }
      main.appendChild(el("p", "ruta-meta", meta));

      if (b.abierto) {
        var cuenta = cuentaDe(b);
        if (cuenta) main.appendChild(cuenta);
      }
      fila.appendChild(main);

      var acciones = el("div", "ruta-actions");
      if (b.abierto) {
        var flecha = el("span", "ruta-flecha");
        flecha.appendChild(el("span", null, "Entrar"));
        flecha.appendChild(icono("M5 12h14M13 6l6 6-6 6"));
        acciones.appendChild(flecha);
      } else {
        var lock = el("span", "lock");
        lock.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" aria-hidden="true"><rect x="4" y="10" width="16" height="10" ' +
          'rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
        lock.appendChild(el("span", null, "Se abre " + RH.enDias(RH.diasHasta(b.fecha))));
        acciones.appendChild(lock);
      }
      fila.appendChild(acciones);

      // Un bloque cerrado no lleva a ningún lado: su página todavía no tiene qué mostrar.
      if (b.abierto) {
        var link = el("a", "ruta-link");
        link.href = RH.urlBloque(b.slug);
        link.setAttribute("aria-label", "Entrar a " + b.nombre);
        link.appendChild(fila);
        li.appendChild(link);
      } else {
        li.appendChild(fila);
      }

      lista.appendChild(li);
    });

    if (!lista.children.length) {
      lista.appendChild(
        el("li", "ruta-vacio", "Todavía no hay bloques cargados. Volvé en un rato.")
      );
    }
  }

  /* ------------------------------------------------------------------
     Encuentros en vivo
     ------------------------------------------------------------------ */
  var enArgentina = new Date().getTimezoneOffset() === 180;

  function eventos() {
    var hora = RH.SITIO.horaArgentina || 19;
    return DATOS.encuentros.map(function (e) {
      var p = e.fecha.split("-");
      var hm = (e.hora || "19:00").split(":");
      // Argentina no aplica horario de verano: 19:00 ART es siempre 22:00 UTC.
      var inicio = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], +hm[0] + 3, +hm[1]));
      return {
        numero: e.numero,
        titulo: e.titulo,
        facilitador: e.facilitador,
        slugBloque: e.slugBloque,
        iso: e.fecha,
        inicio: inicio,
        fin: new Date(inicio.getTime() + (RH.SITIO.duracionHoras || 1) * 3600000)
      };
    });
  }

  function pintarEncuentros() {
    var lista = $("[data-agenda]");
    var evs = eventos();
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
        var fecha = el("span", "agenda-date", RH.capitalizar(RH.fechaCorta(e.iso)));
        li.appendChild(fecha);
        if (e.fin.getTime() <= ahora) {
          li.classList.add("is-past");
        } else if (e === proximo) {
          li.classList.add("is-next");
          li.appendChild(el("span", "agenda-tag", "Próximo"));
        } else if (!enArgentina) {
          li.appendChild(
            el("span", "agenda-local",
              RH.fmt(e.inicio, {
                weekday: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit", hour12: false
              })
            )
          );
        }
        lista.appendChild(li);
      });
      if (!evs.length) {
        lista.appendChild(el("li", null, "Todavía no cargamos las fechas."));
      }
    }

    var fechaEl = $("[data-next-date]");
    if (!fechaEl) return;

    if (!proximo) {
      fechaEl.textContent = evs.length
        ? "No quedan encuentros programados"
        : "Fechas por confirmar";
      var tEl = $(".next-time");
      if (tEl && evs.length) tEl.textContent = "Cerramos el ciclo de encuentros en vivo.";
      return;
    }

    fechaEl.textContent = RH.capitalizar(
      RH.fmt(proximo.inicio, {
        weekday: "long", day: "numeric", month: "long",
        timeZone: "America/Argentina/Buenos_Aires"
      })
    );

    var quien = $("[data-next-host]");
    if (quien) {
      var partes = [];
      if (proximo.numero) partes.push("Encuentro " + proximo.numero);
      if (proximo.titulo) partes.push(proximo.titulo);
      else if (proximo.facilitador) partes.push("con " + proximo.facilitador);
      quien.textContent = partes.join(" · ");
      quien.hidden = !partes.length;
    }

    if (!enArgentina) pintarHoraLocal(proximo);

    pintarCuenta(proximo);
    clearInterval(pintarEncuentros._t);
    pintarEncuentros._t = setInterval(function () {
      pintarCuenta(proximo);
    }, 60000);
  }

  function pintarHoraLocal(proximo) {
    var box = $("[data-local-box]");
    var tzEl = $("[data-local-tz]");
    var valEl = $("[data-local-value]");
    if (!box || !valEl) return;

    var zona = "";
    try {
      zona = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch (e) {
      zona = "";
    }
    if (tzEl && zona) tzEl.textContent = "(" + zona + ")";

    valEl.textContent =
      RH.capitalizar(
        RH.fmt(proximo.inicio, {
          weekday: "long", day: "numeric", month: "long",
          hour: "2-digit", minute: "2-digit", hour12: false
        })
      ) +
      " a " +
      RH.fmt(proximo.fin, { hour: "2-digit", minute: "2-digit", hour12: false }) +
      " hs";
    box.hidden = false;
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
    var d = Math.floor(faltan / RH.MS_DIA);
    var h = Math.floor((faltan % RH.MS_DIA) / 3600000);
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

  /* ------------------------------------------------------------------
     Quién te guía
     ------------------------------------------------------------------ */
  function pintarFacilitador() {
    var caja = $("[data-facilitador]");
    if (!caja) return;

    var actual = RH.S ? RH.S.bloqueActual(DATOS.bloques) : null;
    var f = RH.S ? RH.S.facilitadorDe(DATOS.facilitadores, actual) : null;

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
    if (f.linkedin) {
      var a = el("a", "profe-link", "Conectar en LinkedIn →");
      a.href = f.linkedin;
      a.target = "_blank";
      a.rel = "noopener";
      side.appendChild(a);
    }
    if (f.mail) {
      var m = el("a", "profe-link", f.mail);
      m.href = "mailto:" + f.mail;
      side.appendChild(m);
    }
    caja.appendChild(side);

    var bio = el("div", "profe-bio prosa");
    if (f.bio) bio.innerHTML = RH.markdown(f.bio);
    else bio.appendChild(el("p", null, "Estamos preparando la presentación de " + f.nombre + "."));
    if (f.cita) bio.appendChild(el("blockquote", "profe-quote", "🎙️ “" + f.cita + "”"));
    caja.appendChild(bio);
  }

  /* ------------------------------------------------------------------
     Zoom y .ics
     ------------------------------------------------------------------ */
  function linkZoom() {
    return (DATOS.ajustes && DATOS.ajustes.zoom) || "";
  }

  var btnCopiar = $("[data-copy-zoom]");
  if (btnCopiar) {
    btnCopiar.addEventListener("click", function () {
      var zoom = linkZoom();
      if (!zoom) return RH.toast("Todavía no cargamos el link del Zoom.");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(zoom).then(
          function () {
            RH.toast("Link de Zoom copiado ✓");
          },
          function () {
            RH.toast("No pudimos copiarlo. Copialo desde el link de abajo.");
          }
        );
      } else {
        RH.toast("No pudimos copiarlo. Copialo desde el link de abajo.");
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
    var nombre = (DATOS.ajustes && DATOS.ajustes.nombre) || "PoweRH";
    var zoom = linkZoom();
    var lineas = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//HACHE Consultora//" + nombre + "//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];
    var ahora = utcStamp(new Date());
    eventos().forEach(function (e) {
      lineas.push(
        "BEGIN:VEVENT",
        "UID:powerh-" + e.iso + "-" + (e.numero || "0") + "@hacheconsultora.com",
        "DTSTAMP:" + ahora,
        "DTSTART:" + utcStamp(e.inicio),
        "DTEND:" + utcStamp(e.fin),
        "SUMMARY:" +
          escapeIcs(
            nombre + " · Encuentro" + (e.numero ? " " + e.numero : "") +
              (e.titulo ? ": " + e.titulo : "")
          ),
        "DESCRIPTION:" +
          escapeIcs(
            "Encuentro en vivo de " + nombre +
              ".\nHorario: 19 a 20 hs de Argentina (GMT-3)." +
              (zoom ? "\nZoom: " + zoom : "")
          ),
        "LOCATION:" + escapeIcs(zoom),
        "URL:" + zoom,
        "BEGIN:VALARM",
        "TRIGGER:-PT30M",
        "ACTION:DISPLAY",
        "DESCRIPTION:" + escapeIcs("En 30 minutos empieza el encuentro de " + nombre),
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
      if (!DATOS.encuentros.length) return RH.toast("Todavía no cargamos las fechas.");
      var blob = new Blob([construirIcs()], { type: "text/calendar;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "powerh-encuentros.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
      RH.toast("Calendario descargado ✓ Importalo en tu agenda.");
    });
  }

  /* ------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------ */
  RH.arrancar(function (datos) {
    DATOS = datos;
    pintarProgreso();
    pintarRuta();
    pintarEncuentros();
    pintarFacilitador();
  });
})();
