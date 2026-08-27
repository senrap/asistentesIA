/* ==========================================================================
   La página de una cursada.

   El id que trae la URL busca su fila en la hoja Cursos y con eso se arma lo
   variable: el cliente, las fechas, la cantidad de encuentros, los links de
   Zoom y del calendario, y qué grabaciones hay cargadas.

   Todo lo demás —los bloques, el material, la ficha del facilitador— sale del
   currículo, que es igual para todas las cursadas.
   ========================================================================== */

(function () {
  "use strict";

  var RH = window.RH;
  var $ = RH.$;
  var el = RH.el;
  var C = RH.CURRICULO;

  /* ------------------------------------------------------------------
     Piezas sueltas
     ------------------------------------------------------------------ */
  function flecha() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", "M5 12h14M13 6l6 6-6 6");
    svg.appendChild(p);
    return svg;
  }

  /** Un link de video, con su botón de play. Sin fecha: no la registramos. */
  function linkVideo(titulo, url, clase) {
    var a = el("a", "video-link" + (clase ? " " + clase : ""));
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.innerHTML =
      '<span class="video-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M8 5.5v13l11-6.5z"/></svg></span>';
    var txt = el("span", "video-txt");
    txt.appendChild(el("span", "video-nombre", titulo));
    a.appendChild(txt);
    return a;
  }

  function mostrar(sel) {
    var n = $(sel);
    if (n) n.hidden = false;
  }

  /* ------------------------------------------------------------------
     Portada
     ------------------------------------------------------------------ */
  function pintarHero(c) {
    mostrar("[data-hero]");

    var cliente = $("[data-curso-cliente]");
    if (cliente) cliente.textContent = RH.nombreCliente(c);

    var datos = $("[data-curso-datos]");
    if (!datos) return;
    datos.innerHTML = "";

    function dato(valor, pie) {
      if (!valor) return;
      var li = el("li");
      li.appendChild(el("strong", null, valor));
      li.appendChild(el("span", null, pie));
      datos.appendChild(li);
    }

    if (c.sesiones) {
      dato(c.sesiones + (c.sesiones === 1 ? " encuentro" : " encuentros"), "en vivo");
    }
    if (c.bloques.length) {
      dato(c.bloques.length + (c.bloques.length === 1 ? " bloque" : " bloques"),
           "de contenido y práctica");
    }
    if (c.inicio) dato(RH.capitalizar(RH.fechaDia(c.inicio)), "arranca");
    if (c.fin) dato(RH.capitalizar(RH.fechaDia(c.fin)), "termina");
  }

  /* ------------------------------------------------------------------
     Antes de empezar
     ------------------------------------------------------------------ */
  function pintarAntes() {
    var caja = $("[data-antes]");
    if (!caja) return;
    var fichas = C.antes || [];
    caja.innerHTML = "";
    if (!fichas.length) {
      caja.hidden = true;
      return;
    }

    fichas.forEach(function (f) {
      var art = el("div", "prep-card" + (f.alerta ? " prep-card-alert" : ""));
      if (f.etiqueta) art.appendChild(el("p", "prep-tag", f.etiqueta));
      if (f.titulo) art.appendChild(el("h3", null, f.titulo));
      if (f.texto) {
        var prosa = el("div", "prosa");
        prosa.innerHTML = RH.markdown(f.texto);
        art.appendChild(prosa);
      }
      if (f.link && f.link.url) {
        var a = el("a", "btn btn-cta btn-sm", f.link.texto || "Abrir");
        if (RH.link(a, f.link.url)) art.appendChild(a);
      }
      caja.appendChild(art);
    });
  }

  /* ------------------------------------------------------------------
     Los bloques, cada uno linkeando a su sub-página

     Un bloque se abre cuando su grabación está cargada. Los que todavía no,
     se listan igual —para que se vea el recorrido completo— pero con candado.
     ------------------------------------------------------------------ */
  function cuentaDe(b) {
    var caja = el("p", "ruta-cuenta");
    var materiales = 0;
    var tareas = 0;
    b.tarjetas.forEach(function (t) {
      materiales += (t.archivos || []).length;
      if (t.tipo === "tarea") tareas++;
    });
    var grabaciones = b.grabaciones.filter(function (g) {
      return g.link;
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

  /**
   * Qué le falta a un bloque para abrirse. Nombra solo el primero de sus
   * encuentros porque alcanza con esa grabación para destrabarlo: decir "los
   * encuentros 5 y 6" haría pensar que hacen falta las dos.
   */
  function loQueFalta(b) {
    var primera = (b.sesiones || [])[0];
    return primera
      ? "Se abre cuando publiquemos la grabación del encuentro " + primera
      : "Se abre cuando publiquemos su grabación";
  }

  function pintarBloques(c) {
    var lista = $("[data-ruta]");
    if (!lista || !c.bloques.length) return;
    mostrar("[data-seccion-bloques]");

    var actual = RH.S ? RH.S.bloqueActual(c.bloques) : null;
    lista.innerHTML = "";

    c.bloques.forEach(function (b) {
      var li = el("li", "ruta-item");
      li.classList.add(b.abierto ? "is-open" : "is-locked");
      if (actual && b.slug === actual.slug) li.classList.add("is-current");

      var fila = el("div", "ruta-head-row");
      fila.appendChild(el("div", "ruta-num", String(b.numero).padStart(2, "0")));

      var main = el("div", "ruta-main");
      var top = el("div", "ruta-top");
      top.appendChild(el("h3", null, b.nombre));
      if (actual && b.slug === actual.slug) {
        top.appendChild(el("span", "chip chip-now", "En curso"));
      }
      main.appendChild(top);

      if (b.bajada) main.appendChild(el("p", "ruta-bajada", b.bajada));

      if (b.abierto) {
        var cuenta = cuentaDe(b);
        if (cuenta) main.appendChild(cuenta);
      } else {
        main.appendChild(el("p", "ruta-meta", loQueFalta(b)));
      }
      fila.appendChild(main);

      var acciones = el("div", "ruta-actions");
      if (b.abierto) {
        var f = el("span", "ruta-flecha");
        f.appendChild(el("span", null, "Entrar"));
        f.appendChild(flecha());
        acciones.appendChild(f);
      } else {
        var lock = el("span", "lock");
        lock.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" aria-hidden="true"><rect x="4" y="10" width="16" height="10" ' +
          'rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
        lock.appendChild(el("span", null, "Todavía no"));
        acciones.appendChild(lock);
      }
      fila.appendChild(acciones);

      // Un bloque cerrado no lleva a ningún lado: su página no tiene qué mostrar.
      if (b.abierto) {
        var link = el("a", "ruta-link");
        link.href = RH.rutaBloque(c.id, b.slug);
        link.setAttribute("aria-label", "Entrar a " + b.nombre);
        link.appendChild(fila);
        li.appendChild(link);
      } else {
        li.appendChild(fila);
      }

      lista.appendChild(li);
    });

    if (c.completo) lista.appendChild(itemCierre(c));
  }

  /** El último escalón de la ruta: la despedida, cuando ya está todo grabado. */
  function itemCierre(c) {
    var li = el("li", "ruta-item is-open is-final");
    var fila = el("div", "ruta-head-row");
    fila.appendChild(el("div", "ruta-num", "🎓"));

    var main = el("div", "ruta-main");
    var top = el("div", "ruta-top");
    top.appendChild(el("h3", null, "¡Terminaste el workshop!"));
    main.appendChild(top);
    main.appendChild(
      el("p", "ruta-bajada", "Tu certificado, la encuesta y cómo seguimos en contacto.")
    );
    fila.appendChild(main);

    var acciones = el("div", "ruta-actions");
    var f = el("span", "ruta-flecha");
    f.appendChild(el("span", null, "Entrar"));
    f.appendChild(flecha());
    acciones.appendChild(f);
    fila.appendChild(acciones);

    var link = el("a", "ruta-link");
    link.href = RH.rutaCierre(c.id);
    link.setAttribute("aria-label", "Ver el cierre del workshop");
    link.appendChild(fila);
    li.appendChild(link);
    return li;
  }

  /* ------------------------------------------------------------------
     Las grabaciones, una por encuentro
     ------------------------------------------------------------------ */
  function pintarGrabaciones(c) {
    var caja = $("[data-grabaciones]");
    if (!caja) return;

    var filas = RH.S ? RH.S.sesionesDe(c) : [];
    if (!filas.length) return;
    mostrar("[data-seccion-grabaciones]");
    caja.innerHTML = "";

    // Sin ninguna grabación cargada, listar los encuentros uno por uno es una
    // pared de "todavía no está". Alcanza con decirlo una vez.
    var hayAlguna = filas.some(function (g) {
      return g.link;
    });
    if (!hayAlguna) {
      var aviso = el("div", "grabacion-espera");
      aviso.appendChild(
        el("strong", null, filas.length + (filas.length === 1 ? " encuentro" : " encuentros"))
      );
      aviso.appendChild(el("span", null, "· las grabaciones aparecen acá apenas las subamos"));
      caja.appendChild(aviso);
      return;
    }

    filas.forEach(function (g) {
      var titulo = "Encuentro " + (g.sesion || g.numero) + (g.titulo ? " · " + g.titulo : "");
      if (g.link) {
        caja.appendChild(linkVideo(titulo, g.link, "video-link-enc"));
        return;
      }
      var espera = el("div", "grabacion-espera");
      espera.appendChild(el("strong", null, titulo));
      espera.appendChild(el("span", null, "· todavía no está"));
      caja.appendChild(espera);
    });
  }

  /* ------------------------------------------------------------------
     Quién te guía
     ------------------------------------------------------------------ */
  function pintarFacilitador(c) {
    var caja = $("[data-facilitador]");
    var f = C.facilitador;
    if (!caja || !f) return;
    mostrar("[data-seccion-facilitador]");
    caja.innerHTML = "";

    // Si la planilla nombra a otra persona para esta cursada, mostramos ese
    // nombre; la bio del currículo es la de quien lo diseñó.
    var nombre = c.facilitador || f.nombre;
    var propio = RH.S.normalizarClave(nombre) === RH.S.normalizarClave(f.nombre);

    var side = el("div", "profe-side");
    var avatar = el("div", "profe-avatar", propio ? f.iniciales : iniciales(nombre));
    if (f.foto && propio) {
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
    side.appendChild(el("p", "profe-nombre", nombre));
    if (propio && f.rol) side.appendChild(el("p", "profe-rol", f.rol));
    if (propio && f.linkedin) {
      var a = el("a", "profe-link", "Conectar en LinkedIn →");
      a.href = f.linkedin;
      a.target = "_blank";
      a.rel = "noopener";
      side.appendChild(a);
    }
    if (propio && f.mail) {
      var m = el("a", "profe-link", f.mail);
      m.href = "mailto:" + f.mail;
      side.appendChild(m);
    }
    caja.appendChild(side);

    var bio = el("div", "profe-bio prosa");
    if (propio && f.bio) bio.innerHTML = RH.markdown(f.bio);
    else bio.appendChild(el("p", null, "Te acompaña en este workshop."));
    if (propio && f.cita) bio.appendChild(el("blockquote", "profe-quote", "🎙️ “" + f.cita + "”"));
    caja.appendChild(bio);
  }

  function iniciales(nombre) {
    return String(nombre || "")
      .split(/\s+/)
      .slice(0, 2)
      .map(function (p) {
        return p.charAt(0);
      })
      .join("")
      .toUpperCase();
  }

  /* ------------------------------------------------------------------
     Ayuda y comunidad
     ------------------------------------------------------------------ */
  /** El mail de contacto aparece en dos lados, y uno es la página de "no lo
      encontramos" — así que se pinta siempre, exista o no la cursada. */
  function pintarMails() {
    var mail = (C.ayuda || {}).mail;
    RH.$$("[data-ayuda-mail]").forEach(function (a) {
      RH.link(a, mail, mail);
    });
  }

  function pintarRedes() {
    var caja = $("[data-redes]");
    if (!caja) return;
    var redes = C.redes || [];
    caja.innerHTML = "";

    redes.forEach(function (r) {
      var a = el("a", "red");
      if (!RH.link(a, r.url)) return;
      a.target = "_blank";
      a.rel = "noopener";
      var ico = el("span", "red-ico", r.emoji || "🔗");
      ico.setAttribute("aria-hidden", "true");
      a.appendChild(ico);
      var txt = el("span", "red-txt");
      txt.appendChild(el("strong", null, r.titulo || ""));
      if (r.bajada) txt.appendChild(el("span", null, r.bajada));
      a.appendChild(txt);
      caja.appendChild(a);
    });

    if (caja.childNodes.length) mostrar("[data-seccion-redes]");
  }

  /**
   * Los links del encabezado apuntan a secciones que no todas las cursadas
   * tienen. El que quedó sin destino se saca: un link que no lleva a ningún
   * lado es peor que no tenerlo.
   */
  function limpiarNav() {
    RH.$$(".header-links a[href^='#']").forEach(function (a) {
      var href = a.getAttribute("href");
      // Un "#" pelado no es un selector válido y hacía explotar querySelector.
      // Es el estado inicial del link al cierre, que se resuelve aparte.
      if (!href || href === "#") return;
      var destino = document.querySelector(href);
      // offsetParent en null = está escondido, por el atributo hidden o por CSS.
      if (!destino || destino.offsetParent === null) a.hidden = true;
    });
  }

  /* ------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------ */
  RH.arrancar(function (datos) {
    var cargando = $("[data-cargando]");
    if (cargando) cargando.hidden = true;

    var pide = RH.loQuePideLaUrl();
    var c = RH.S ? RH.S.cursoPorId(datos.cursos || [], pide.curso) : null;

    pintarMails();

    if (!c) {
      mostrar("[data-sin-curso]");
      var texto = $("[data-sin-curso-texto]");
      if (texto && !pide.curso) {
        texto.textContent = "Este link no dice a qué workshop entrar.";
      }
      // Sin cursada no hay ninguna de esas secciones: el menú sobra entero.
      limpiarNav();
      return;
    }

    document.title = RH.nombreCliente(c) + " · " + C.nombre + " · HACHE";

    pintarHero(c);
    pintarAntes();
    pintarBloques(c);
    pintarGrabaciones(c);
    pintarFacilitador(c);
    pintarRedes();

    RH.link($("[data-zoom]"), c.zoom);
    RH.link($("[data-calendario]"), c.calendario);

    var navCierre = $("[data-nav-cierre]");
    if (navCierre && c.completo) {
      navCierre.href = RH.rutaCierre(c.id);
      navCierre.hidden = false;
    }

    mostrar("[data-seccion-bienvenida]");
    mostrar("[data-seccion-ayuda]");
    limpiarNav();
  });
})();
