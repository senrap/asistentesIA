/* ==========================================================================
   PoweRH
   Lo que comparten la portada, la página de cada cursada, la de cada bloque y
   la de cierre.

   Sin dependencias. Dos fuentes:

     window.CURRICULO   el contenido del programa. Fijo, viene con el sitio.
     el Google Sheet    lo que cambia en cada cursada, leído en vivo. Si no se
                        puede leer (permisos, Google caído, una red corporativa
                        que bloquea docs.google.com) se usa la copia de
                        respaldo de assets/cursos.js, que arma el build.
   ========================================================================== */

window.RH = (function () {
  "use strict";

  var S = window.RHSheet;
  var CURRICULO = window.CURRICULO || { bloques: [] };
  var RESPALDO = window.CURSOS || { cursos: [] };
  var CFG = window.RHCONFIG || {};
  var SITIO = CFG.sitio || {};

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
     Markdown mínimo para los textos del currículo.
     Escapamos primero, siempre: es más barato que acordarse de cuándo hace
     falta.
     ------------------------------------------------------------------ */
  function escapar(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Las comillas importan: el href de los links se arma interpolando, y
      // sin esto una URL con comillas se escapaba del atributo.
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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
    // Una pila con la etiqueta de cada nivel abierto: así una lista con guiones
    // anidada bajo una numerada se cierra con la etiqueta que le corresponde.
    var abiertas = [];

    function cerrarHasta(n) {
      while (abiertas.length > n) html += "</" + abiertas.pop() + ">";
    }

    function abrir(tag, nivel) {
      // Si el nivel ya está abierto con otra etiqueta, se cierra y se rehace.
      if (abiertas.length >= nivel && abiertas[nivel - 1] !== tag) cerrarHasta(nivel - 1);
      while (abiertas.length < nivel) {
        html += "<" + tag + ">";
        abiertas.push(tag);
      }
    }

    lineas.forEach(function (linea) {
      if (!linea.trim()) {
        cerrarHasta(0);
        return;
      }

      var titulo = linea.match(/^(#{2,4})\s+(.*)$/);
      if (titulo) {
        cerrarHasta(0);
        var nivel = Math.min(titulo[1].length + 1, 5);
        html += "<h" + nivel + ">" + enLinea(titulo[2]) + "</h" + nivel + ">";
        return;
      }

      var num = linea.match(/^(\s*)\d+[.)]\s+(.*)$/);
      if (num) {
        var nOl = Math.floor(num[1].length / 2) + 1;
        abrir("ol", nOl);
        cerrarHasta(nOl);
        html += "<li>" + enLinea(num[2]) + "</li>";
        return;
      }

      var item = linea.match(/^(\s*)[-*•]\s+(.*)$/);
      if (item) {
        var nUl = Math.floor(item[1].length / 2) + 1;
        abrir("ul", nUl);
        cerrarHasta(nUl);
        html += "<li>" + enLinea(item[2]) + "</li>";
        return;
      }

      cerrarHasta(0);
      html += "<p>" + enLinea(linea.trim()) + "</p>";
    });

    cerrarHasta(0);
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

  /**
   * Hoy en dd/mm/aaaa, hora de Argentina — es el formato que pide LinkedIn en
   * la fecha de emisión del certificado. En UTC, pasadas las 21 hs de acá ya
   * sería mañana.
   */
  function hoyAR() {
    var d = new Date(Date.now() - 3 * 3600000);
    return (
      String(d.getUTCDate()).padStart(2, "0") + "/" +
      String(d.getUTCMonth() + 1).padStart(2, "0") + "/" +
      d.getUTCFullYear()
    );
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
     El currículo en el HTML

       data-c="hero.titulo"        reemplaza el texto del elemento
       data-c-md="bienvenida.lead" lo mismo, interpretando markdown

     Es la contracara de los viejos data-ajuste: ahora estos textos no salen de
     la planilla sino de lib/curriculo.mjs, que se edita y se commitea.
     ------------------------------------------------------------------ */
  function valorDe(ruta) {
    var partes = String(ruta || "").split(".");
    var v = CURRICULO;
    for (var i = 0; i < partes.length; i++) {
      if (v == null) return "";
      v = v[partes[i]];
    }
    return v == null ? "" : v;
  }

  function aplicarCurriculo(raiz) {
    $$("[data-c]", raiz).forEach(function (nodo) {
      var v = valorDe(nodo.getAttribute("data-c"));
      if (v) nodo.textContent = v;
    });
    $$("[data-c-md]", raiz).forEach(function (nodo) {
      var v = valorDe(nodo.getAttribute("data-c-md"));
      if (v) nodo.innerHTML = markdown(v);
    });
  }

  /**
   * Un link que puede no existir: con URL se muestra y apunta ahí, sin URL se
   * esconde. Dejar el "#" que viene por defecto sería un link muerto.
   * Solo se aceptan protocolos que son links: una celda de la planilla no
   * puede convertirse en "javascript:…".
   */
  function link(nodo, url, texto) {
    if (!nodo) return false;
    var destino = String(url || "").trim();
    if (destino && /@/.test(destino) && !/^https?:|^mailto:/i.test(destino)) {
      destino = "mailto:" + destino;
    }
    if (!destino || !/^(https?:|mailto:)/i.test(destino)) {
      nodo.hidden = true;
      return false;
    }
    nodo.href = destino;
    if (texto) nodo.textContent = texto;
    nodo.hidden = false;
    return true;
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
   * Las dos hojas se piden una después de la otra, no en paralelo: pedirle
   * varias cosas a la vez a Google desde el mismo cliente hace que a veces
   * alguna vuelva redirigida.
   *
   * Cursos es obligatoria — sin ella no se sabe qué cursada mostrar.
   * Grabaciones no: una cursada recién empezada no tiene ninguna, y eso es un
   * estado normal, no un error.
   */
  function cargar() {
    if (!S || !CFG.sheet || !CFG.sheet.id || /^PEGAR/.test(CFG.sheet.id)) {
      return Promise.reject(new Error("falta el id de la planilla en config.json"));
    }

    var hojas = CFG.sheet.hojas || {};

    return traerHoja(hojas.cursos || "Cursos")
      .then(function (csv) {
        var cursos = S.mapearCursos(S.aObjetos(S.parseCsv(csv)), SITIO.anioReferencia);
        if (!cursos.length) {
          throw new Error("leí la hoja de Cursos pero no tiene ninguna fila con ID curso");
        }
        return traerHoja(hojas.grabaciones || "Grabaciones").then(
          function (csvG) {
            return { cursos: cursos, grabaciones: S.mapearGrabaciones(S.aObjetos(S.parseCsv(csvG))) };
          },
          function (e) {
            DIAG.push("grabaciones: sin datos (" + e.message + ")");
            return { cursos: cursos, grabaciones: [] };
          }
        );
      })
      .then(function (crudo) {
        return S.armar(CURRICULO, crudo);
      });
  }

  /* ------------------------------------------------------------------
     Direcciones

       /powerh-acme                            la página de la cursada
       /powerh-acme/bloque-1-los-datos-...     la de uno de sus bloques
       /powerh-acme/cierre                     la despedida

     No hay un archivo por cursada: la reescritura de netlify.toml manda todo a
     curso.html, bloque.html o cierre.html, y el JS decide qué mostrar.
     ------------------------------------------------------------------ */
  var RUTA_CIERRE = "cierre";

  function rutaCurso(id) {
    return "/" + encodeURIComponent(id);
  }

  function rutaBloque(id, slug) {
    return "/" + encodeURIComponent(id) + "/" + slug;
  }

  function rutaCierre(id) {
    return "/" + encodeURIComponent(id) + "/" + RUTA_CIERRE;
  }

  /** decodeURIComponent explota con un "%" suelto; acá eso no puede tirar la página. */
  function decodificar(s) {
    try {
      return decodeURIComponent(s);
    } catch (e) {
      return s;
    }
  }

  /**
   * Qué pide la URL actual. Sale de la ruta linda (/powerh-acme/mi-bloque) o de
   * los parámetros (?c=powerh-acme&b=mi-bloque), que son los que sirven cuando
   * el sitio se abre sin un servidor que haga la reescritura.
   */
  function loQuePideLaUrl() {
    var q = function (n) {
      var m = new RegExp("[?&]" + n + "=([^&]+)").exec(location.search);
      return m ? decodificar(m[1]) : "";
    };
    var curso = q("c") || q("p");
    var bloque = q("b");
    if (curso) return { curso: curso, bloque: bloque };

    var partes = location.pathname.replace(/^\/+|\/+$/g, "").split("/");
    // Un .html en el último tramo es la página en crudo, sin cursada.
    if (partes.length && /\.html?$/i.test(partes[partes.length - 1])) partes.pop();
    return {
      curso: partes[0] ? decodificar(partes[0]) : "",
      bloque: partes[1] ? decodificar(partes[1]) : ""
    };
  }

  /* ------------------------------------------------------------------
     Aviso de qué fuente se usó
     ------------------------------------------------------------------ */
  function avisoFuente(fuente) {
    var debug = /[?&]debug\b/.test(location.search);

    // Puede haber más de un lugar donde mostrarlo: el de la portada queda
    // escondido justo cuando la cursada no se encuentra, que es cuando más
    // importa saber que se está mirando una copia vieja.
    $$("[data-fuente]").forEach(function (aviso) {
      if (fuente === "respaldo") {
        aviso.classList.add("es-alerta");
        aviso.textContent =
          "No pudimos leer la planilla: estás viendo la última copia guardada. " +
          "Si falta alguna grabación, recargá en un rato." +
          (debug && MOTIVO ? " · Motivo: " + MOTIVO : "");
        aviso.hidden = false;
      } else if (debug) {
        aviso.classList.remove("es-alerta");
        aviso.textContent = "Leyendo la planilla en vivo · " + DIAG.join(" · ");
        aviso.hidden = false;
      } else {
        aviso.hidden = true;
      }
    });

    if (debug && window.console) {
      console.log("[PoweRH] fuente:", fuente);
      DIAG.forEach(function (d) {
        console.log("[PoweRH]", d);
      });
    }
  }

  /**
   * Arranque común: pinta lo que es fijo, lee el Sheet, cae al respaldo si no
   * puede, y le pasa las cursadas a la página para que dibuje lo suyo.
   */
  function arrancar(pintar) {
    aplicarCurriculo();

    function conDatos(datos, fuente) {
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

  /**
   * El nombre que va arriba de todo. "General" en la columna Cliente significa
   * abierto al público, no un cliente.
   */
  function nombreCliente(c) {
    if (!c || !c.cliente || S.normalizarClave(c.cliente) === "general") return "Workshop";
    return c.cliente;
  }

  return {
    S: S, CFG: CFG, SITIO: SITIO, CURRICULO: CURRICULO, RUTA_CIERRE: RUTA_CIERRE,
    $: $, $$: $$, el: el,
    markdown: markdown, escapar: escapar,
    fmt: fmt, fechaSimple: fechaSimple, fechaDia: fechaDia, fechaLarga: fechaLarga,
    capitalizar: capitalizar, hoyAR: hoyAR,
    toast: toast,
    aplicarCurriculo: aplicarCurriculo, valorDe: valorDe, link: link,
    nombreCliente: nombreCliente,
    rutaCurso: rutaCurso, rutaBloque: rutaBloque, rutaCierre: rutaCierre,
    loQuePideLaUrl: loQuePideLaUrl,
    arrancar: arrancar
  };
})();
