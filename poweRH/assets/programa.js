/* ==========================================================================
   La página de un programa.

   El id que trae la URL busca su fila en la hoja Workshops y con eso se arma
   todo: el nombre, las fechas, el facilitador, los bloques, las grabaciones y
   los links de Zoom y del calendario.

   Cuando en Workshops aparece un programa nuevo, su página existe sola.
   ========================================================================== */

(function () {
  "use strict";

  var RH = window.RH;
  var $ = RH.$;
  var el = RH.el;
  var PROGRAMA = null;

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

  function mostrar(sel) {
    var n = $(sel);
    if (n) n.hidden = false;
  }

  /* ------------------------------------------------------------------
     Portada del programa
     ------------------------------------------------------------------ */
  function pintarHero(p) {
    mostrar("[data-hero]");

    var nombre = $("[data-programa-nombre]");
    if (nombre) nombre.textContent = p.ajustes["hero.titulo"] || p.nombre;

    var marca = $("[data-programa-marca]");
    if (marca) marca.textContent = p.nombre;

    var cliente = $("[data-programa-cliente]");
    if (cliente) cliente.textContent = p.cliente || "Workshop";

    var pie = $("[data-programa-pie]");
    if (pie) pie.textContent = p.nombre;

    var datos = $("[data-programa-datos]");
    if (datos) {
      datos.innerHTML = "";
      function dato(valor, pieDeDato) {
        if (!valor) return;
        var li = el("li");
        li.appendChild(el("strong", null, valor));
        li.appendChild(el("span", null, pieDeDato));
        datos.appendChild(li);
      }
      if (p.sesiones) {
        dato(p.sesiones + (p.sesiones === 1 ? " encuentro" : " encuentros"), "en vivo");
      }
      if (p.bloques.length) {
        dato(p.bloques.length + (p.bloques.length === 1 ? " bloque" : " bloques"),
             "de contenido y práctica");
      }
      if (p.inicio) dato(RH.capitalizar(RH.fechaDia(p.inicio)), "arranca");
      if (p.fin) dato(RH.capitalizar(RH.fechaDia(p.fin)), "termina");
    }
  }

  /* ------------------------------------------------------------------
     Los bloques, cada uno linkeando a su sub-página
     ------------------------------------------------------------------ */
  function cuentaDe(b) {
    var caja = el("p", "ruta-cuenta");
    var materiales = 0;
    var tareas = 0;
    b.tarjetas.forEach(function (t) {
      if (!t.abierta) return;
      materiales += t.archivos.length;
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

  function pintarBloques(p) {
    var lista = $("[data-ruta]");
    if (!lista || !p.bloques.length) return;
    mostrar("[data-seccion-bloques]");

    var actual = RH.S ? RH.S.bloqueActual(p.bloques) : null;
    lista.innerHTML = "";

    p.bloques.forEach(function (b) {
      var li = el("li", "ruta-item");
      li.classList.add(b.abierto ? "is-open" : "is-locked");
      if (actual && b.slug === actual.slug) li.classList.add("is-current");

      var fila = el("div", "ruta-head-row");
      fila.appendChild(el("div", "ruta-num", String(b.numero).padStart(2, "0")));

      var main = el("div", "ruta-main");
      var top = el("div", "ruta-top");
      top.appendChild(el("h3", null, b.nombre));
      if (actual && b.slug === actual.slug && b.abierto) {
        top.appendChild(el("span", "chip chip-now", "En curso"));
      }
      main.appendChild(top);

      if (b.bajada) main.appendChild(el("p", "ruta-bajada", b.bajada));

      if (b.abierto) {
        if (b.fecha) {
          main.appendChild(
            el("p", "ruta-meta", "Disponible desde el " + RH.fechaCorta(b.fecha))
          );
        }
        var cuenta = cuentaDe(b);
        if (cuenta) main.appendChild(cuenta);
      } else {
        main.appendChild(
          el("p", "ruta-meta",
            "Se abre el " + RH.fechaCorta(b.fecha) + " · " +
              RH.enDias(RH.diasHasta(b.fecha)))
        );
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
        lock.appendChild(el("span", null, "Se abre " + RH.enDias(RH.diasHasta(b.fecha))));
        acciones.appendChild(lock);
      }
      fila.appendChild(acciones);

      // Un bloque cerrado no lleva a ningún lado: su página no tiene qué mostrar.
      if (b.abierto) {
        var link = el("a", "ruta-link");
        link.href = RH.rutaBloque(p.id, b.slug);
        link.setAttribute("aria-label", "Entrar a " + b.nombre);
        link.appendChild(fila);
        li.appendChild(link);
      } else {
        li.appendChild(fila);
      }

      lista.appendChild(li);
    });
  }

  /* ------------------------------------------------------------------
     Las grabaciones, una por sesión
     ------------------------------------------------------------------ */
  function pintarGrabaciones(p) {
    var caja = $("[data-grabaciones]");
    if (!caja) return;

    // Las sesiones son las que dice Workshops; las grabaciones se les enganchan
    // por número, así que una sesión sin fila cargada igual aparece en la lista.
    var porNumero = {};
    p.grabaciones.forEach(function (g) {
      if (g.numero) porNumero[g.numero] = g;
    });

    var filas = [];
    for (var n = 1; n <= p.sesiones; n++) {
      filas.push(porNumero[n] || { numero: n, sesion: String(n), titulo: "", link: "" });
    }
    // Las que traen un número fuera de rango se suman igual: mejor mostrarlas
    // que perderlas por un error de tipeo en la planilla.
    p.grabaciones.forEach(function (g) {
      if (!g.numero || g.numero > p.sesiones) filas.push(g);
    });

    if (!filas.length) return;
    mostrar("[data-seccion-grabaciones]");
    caja.innerHTML = "";

    filas.forEach(function (g) {
      var titulo =
        "Encuentro " + (g.sesion || g.numero) + (g.titulo ? " · " + g.titulo : "");
      if (g.link) {
        caja.appendChild(
          linkVideo(titulo, g.link, g.fecha ? "Sesión del " + RH.fechaCorta(g.fecha) : "",
            "video-link-enc")
        );
        return;
      }
      var espera = el("div", "grabacion-espera");
      espera.appendChild(el("strong", null, titulo));
      espera.appendChild(
        el("span", null,
          g.fecha ? "· " + RH.capitalizar(RH.fechaCorta(g.fecha)) : "· todavía no está")
      );
      caja.appendChild(espera);
    });
  }

  /* ------------------------------------------------------------------
     Quién te guía — la ficha del nombre que dice Workshops
     ------------------------------------------------------------------ */
  function pintarFacilitador(f) {
    var caja = $("[data-facilitador]");
    if (!caja || !f) return;
    mostrar("[data-seccion-facilitador]");
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
    else bio.appendChild(el("p", null, "Te acompaña en este workshop."));
    if (f.cita) bio.appendChild(el("blockquote", "profe-quote", "🎙️ “" + f.cita + "”"));
    caja.appendChild(bio);
  }

  /* ------------------------------------------------------------------
     Copiar el Zoom
     ------------------------------------------------------------------ */
  var btnCopiar = $("[data-copy-zoom]");
  if (btnCopiar) {
    btnCopiar.addEventListener("click", function () {
      var zoom = PROGRAMA && PROGRAMA.ajustes.zoom;
      if (!zoom) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(zoom).then(
          function () {
            RH.toast("Link de Zoom copiado ✓");
          },
          function () {
            RH.toast("No pudimos copiarlo. Abrí el botón de Zoom y copialo de ahí.");
          }
        );
      } else {
        RH.toast("No pudimos copiarlo. Abrí el botón de Zoom y copialo de ahí.");
      }
    });
  }

  /* ------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------ */
  RH.arrancar(function (datos) {
    var cargando = $("[data-cargando]");
    if (cargando) cargando.hidden = true;

    var pide = RH.loQuePideLaUrl();
    var p = RH.S ? RH.S.programaPorId(datos.programas || [], pide.programa) : null;

    if (!p) {
      mostrar("[data-sin-programa]");
      var texto = $("[data-sin-programa-texto]");
      if (texto && !pide.programa) {
        texto.textContent = "Este link no dice a qué workshop entrar.";
      }
      return;
    }

    PROGRAMA = p;
    document.title = p.nombre + " · HACHE";

    // Los ajustes del programa pisan a los generales: el Zoom y el título de
    // portada son de cada workshop, los textos comunes se cargan una sola vez.
    RH.aplicarAjustes(p.ajustes);

    var facilitador = RH.S ? RH.S.facilitadorDe(datos.facilitadores || [], p.facilitador) : null;

    pintarHero(p);
    pintarBloques(p);
    pintarGrabaciones(p);
    pintarFacilitador(facilitador);

    if (p.ajustes.zoom && btnCopiar) btnCopiar.hidden = false;
    mostrar("[data-seccion-bienvenida]");
    mostrar("[data-seccion-ayuda]");
    mostrar("[data-seccion-redes]");
  });
})();
