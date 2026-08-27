/* ==========================================================================
   Workshops HACHE
   Lo que comparten la portada, la página de cada programa y la de cada bloque.

   Sin dependencias. Todo corre en el navegador del alumno: el contenido sale
   del Google Sheet, leído en vivo. Si no se puede leer (permisos, Google
   caído, una red corporativa que bloquea docs.google.com) se usa la copia de
   respaldo de assets/contenido.js, que arma el build.
   ========================================================================== */

window.RH = (function () {
  "use strict";

  var S = window.RHSheet;
  var RESPALDO = window.PROGRAMA || { programas: [], facilitadores: [], ajustes: {} };
  var CFG = window.RHCONFIG || {};
  var SITIO = CFG.sitio || {};

  var MS_DIA = 86400000;
  var HOY = new Date().toISOString().slice(0, 10);
  var TIMEOUT_SHEET = 20000;
  var DIAG = [];
  var MOTIVO = "";

  function $(sel, raiz) {
    return (raiz || document).querySelector(sel);
  }

  function $$(sel, raiz) {
    return Array.prototype.slice.call((raiz || document).querySelectorAll(sel));
  }

  function el(tag, cls, texto) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (texto != null) n.textContent = texto;
    return n;
  }

  /* ------------------------------------------------------------------
     Markdown mínimo para las columnas de texto del Sheet.
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

  /*
   * Un asterisco escapado (\*) es un asterisco de verdad, no marca de negrita.
   * Hace falta: el contenido habla de cardinalidades (*:1) y de fórmulas DAX,
   * y sin esto un "(\*:1)" adentro de una negrita rompía toda la línea.
   * Se guardan como caracteres de control, que no pueden venir del texto.
   */
  var ESCAPES = [["\\*", "\u0001"], ["\\_", "\u0002"], ["\\`", "\u0003"]];

  function guardarEscapes(s) {
    ESCAPES.forEach(function (par) {
      s = s.split(par[0]).join(par[1]);
    });
    return s;
  }

  function devolverEscapes(s) {
    ESCAPES.forEach(function (par) {
      s = s.split(par[1]).join(par[0].charAt(1));
    });
    return s;
  }

  function markdown(texto) {
    if (!texto) return "";
    var lineas = guardarEscapes(escapar(texto)).replace(/\r/g, "").split("\n");
    var html = "";
    var listaAbierta = 0;
    var numerada = false;

    function cerrarListas(hasta) {
      while (listaAbierta > hasta) {
        html += numerada ? "</ol>" : "</ul>";
        listaAbierta--;
      }
      if (!listaAbierta) numerada = false;
    }

    lineas.forEach(function (linea) {
      if (!linea.trim()) {
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

      // Listas numeradas: "1. Paso uno"
      var num = linea.match(/^(\s*)\d+[.)]\s+(.*)$/);
      if (num) {
        if (!listaAbierta) {
          numerada = true;
          html += "<ol>";
          listaAbierta = 1;
        }
        html += "<li>" + enLinea(num[2]) + "</li>";
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
    return devolverEscapes(html);
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
    if (!iso) return "";
    return fmt(fechaSimple(iso), {
      weekday: "short",
      day: "numeric",
      month: "long",
      timeZone: "UTC"
    });
  }

  /** "10 de marzo". Sin día de la semana, que en "mar, 10 de marzo" confunde. */
  function fechaDia(iso) {
    if (!iso) return "";
    return fmt(fechaSimple(iso), { day: "numeric", month: "long", timeZone: "UTC" });
  }

  function fechaLarga(iso) {
    if (!iso) return "";
    return capitalizar(
      fmt(fechaSimple(iso), {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC"
      })
    );
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
  var toastTimer = null;

  function toast(msg) {
    var caja = $("[data-toast]");
    if (!caja) return;
    caja.textContent = msg;
    caja.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      caja.classList.remove("is-visible");
    }, 2600);
  }

  /* ------------------------------------------------------------------
     Traer el Sheet
     ------------------------------------------------------------------ */
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

  /**
   * Las hojas se piden una después de la otra, no en paralelo: pedirle varias
   * cosas a la vez a Google desde el mismo cliente hace que a veces alguna
   * vuelva redirigida, y eso tiraba abajo la carga entera.
   *
   * Bloques y Tarjetas son obligatorias — sin ellas no hay sitio. Encuentros,
   * Facilitadores y Ajustes son opcionales: si una falla se usa la del
   * respaldo, porque que falte una bio no justifica mandar al alumno a la
   * copia vieja del programa entero.
   */
  var HOJAS = [
    { clave: "programas", mapear: "mapearProgramas", conAnio: true, obligatoria: true },
    { clave: "bloques", mapear: "mapearBloques", conAnio: true, obligatoria: false },
    { clave: "tarjetas", mapear: "mapearTarjetas", conAnio: true, obligatoria: false },
    { clave: "grabaciones", mapear: "mapearGrabaciones", conAnio: true, obligatoria: false },
    { clave: "facilitadores", mapear: "mapearFacilitadores", conAnio: false, obligatoria: false },
    { clave: "ajustes", mapear: "mapearAjustes", conAnio: false, obligatoria: false }
  ];

  function vacio(clave) {
    return clave === "ajustes" ? { generales: {}, porPrograma: {} } : [];
  }

  function cargar() {
    if (!S || !CFG.sheet || !CFG.sheet.id || /^PEGAR/.test(CFG.sheet.id)) {
      return Promise.reject(new Error("falta el id de la planilla en config.json"));
    }

    var crudo = {};
    var i = -1;

    function siguiente() {
      i++;
      if (i >= HOJAS.length) return Promise.resolve(S.armar(crudo, new Date()));

      var h = HOJAS[i];
      var nombreHoja = (CFG.sheet.hojas || {})[h.clave] || h.clave;

      return traerHoja(nombreHoja).then(
        function (csv) {
          var objetos = S.aObjetos(S.parseCsv(csv));
          crudo[h.clave] = h.conAnio
            ? S[h.mapear](objetos, SITIO.anioReferencia)
            : S[h.mapear](objetos);
          if (h.obligatoria && !crudo[h.clave].length) {
            throw new Error(
              "leí la hoja " + nombreHoja + " pero no tiene ninguna fila utilizable"
            );
          }
          return siguiente();
        },
        function (e) {
          if (h.obligatoria) throw e;
          DIAG.push(h.clave + ": se usa el respaldo (" + e.message + ")");
          crudo[h.clave] = vacio(h.clave);
          return siguiente();
        }
      );
    }

    return siguiente();
  }

  /* ------------------------------------------------------------------
     Ajustes: los textos y links editables desde la planilla
     ------------------------------------------------------------------ */

  /**
   * Rellena el HTML con lo que dice la hoja Ajustes:
   *
   *   data-ajuste="clave"        reemplaza el texto del elemento
   *   data-ajuste-md="clave"     lo mismo, pero interpretando markdown
   *   data-ajuste-href="clave"   reemplaza el href (y esconde el link si está vacío)
   *   data-ajuste-si="clave"     esconde el elemento entero si la clave está vacía
   *
   * Una clave que la planilla no trae deja el texto que ya estaba en el HTML:
   * así el sitio nunca queda en blanco por una fila borrada de más.
   */
  function aplicarAjustes(ajustes) {
    ajustes = ajustes || {};

    $$("[data-ajuste-si]").forEach(function (nodo) {
      var v = ajustes[nodo.getAttribute("data-ajuste-si")];
      if (v !== undefined && !v) nodo.hidden = true;
    });

    $$("[data-ajuste]").forEach(function (nodo) {
      var v = ajustes[nodo.getAttribute("data-ajuste")];
      if (v) nodo.textContent = v;
    });

    $$("[data-ajuste-md]").forEach(function (nodo) {
      var v = ajustes[nodo.getAttribute("data-ajuste-md")];
      if (v) nodo.innerHTML = markdown(v);
    });

    $$("[data-ajuste-href]").forEach(function (nodo) {
      var clave = nodo.getAttribute("data-ajuste-href");
      var v = ajustes[clave];
      if (v === undefined) return;
      if (!v) {
        nodo.hidden = true;
        return;
      }
      nodo.hidden = false;
      nodo.href = /@/.test(v) && !/^https?:|^mailto:/i.test(v) ? "mailto:" + v : v;
      if (nodo.hasAttribute("data-ajuste-href-texto")) nodo.textContent = v;
    });
  }

  /* ------------------------------------------------------------------
     Direcciones

     El id del programa en Workshops es su dirección, y el nombre del bloque
     es el tramo que sigue:

       /powerh_1                              la página del programa
       /powerh_1/bloque-1-los-datos-...       la de uno de sus bloques

     No hay un archivo por programa ni por bloque: la reescritura de
     netlify.toml manda todo a programa.html o bloque.html, y el JS decide qué
     mostrar con lo que dice la planilla.
     ------------------------------------------------------------------ */

  function rutaPrograma(id) {
    return "/" + encodeURIComponent(id);
  }

  function rutaBloque(id, slug) {
    return "/" + encodeURIComponent(id) + "/" + slug;
  }

  /**
   * Qué pide la URL actual. Sale de la ruta linda (/powerh_1/mi-bloque) o de
   * los parámetros (?p=powerh_1&b=mi-bloque), que son los que sirven cuando el
   * sitio se abre sin un servidor que haga la reescritura.
   */
  function loQuePideLaUrl() {
    var q = function (n) {
      var m = new RegExp("[?&]" + n + "=([^&]+)").exec(location.search);
      return m ? decodeURIComponent(m[1]) : "";
    };
    var programa = q("p");
    var bloque = q("b");
    if (programa) return { programa: programa, bloque: bloque };

    var partes = location.pathname.replace(/^\/+|\/+$/g, "").split("/");
    // Un .html en el último tramo es la página en crudo, sin programa.
    if (partes.length && /\.html?$/i.test(partes[partes.length - 1])) partes.pop();
    return {
      programa: partes[0] ? decodeURIComponent(partes[0]) : "",
      bloque: partes[1] ? decodeURIComponent(partes[1]) : ""
    };
  }

  /* ------------------------------------------------------------------
     Aviso de qué fuente se usó
     ------------------------------------------------------------------ */
  function avisoFuente(fuente) {
    var aviso = $("[data-fuente]");
    var debug = /[?&]debug\b/.test(location.search);

    if (aviso) {
      if (fuente === "respaldo") {
        aviso.classList.add("es-alerta");
        aviso.textContent =
          "No pudimos leer la planilla del workshop: estás viendo la última copia guardada. " +
          "Si falta contenido, recargá en un rato." +
          (debug && MOTIVO ? " · Motivo: " + MOTIVO : "");
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
      console.log("[PoweRH] fuente:", fuente);
      DIAG.forEach(function (d) {
        console.log("[PoweRH]", d);
      });
    }
  }

  /**
   * Arranque común: lee el Sheet, cae al respaldo si no puede, aplica los
   * ajustes y le pasa los datos a la página para que dibuje lo suyo.
   */
  function arrancar(pintar) {
    function conDatos(datos, fuente) {
      aplicarAjustes(datos.ajustes);
      try {
        pintar(datos, fuente);
      } finally {
        avisoFuente(fuente);
      }
    }

    return cargar().then(
      function (datos) {
        conDatos(datos, "sheet");
      },
      function (e) {
        MOTIVO = e.message;
        if (window.console) {
          console.warn("[PoweRH] No se pudo leer el Sheet:", e.message);
          DIAG.forEach(function (d) {
            console.warn("[PoweRH]", d);
          });
        }
        conDatos(RESPALDO, "respaldo");
      }
    );
  }

  return {
    S: S, CFG: CFG, SITIO: SITIO, MS_DIA: MS_DIA,
    $: $, $$: $$, el: el,
    markdown: markdown, escapar: escapar,
    fmt: fmt, fechaSimple: fechaSimple, fechaCorta: fechaCorta, fechaDia: fechaDia,
    fechaLarga: fechaLarga,
    capitalizar: capitalizar, diasHasta: diasHasta, enDias: enDias,
    toast: toast,
    aplicarAjustes: aplicarAjustes,
    rutaPrograma: rutaPrograma, rutaBloque: rutaBloque, loQuePideLaUrl: loQuePideLaUrl,
    arrancar: arrancar
  };
})();
