/* ==========================================================================
   La sub-página de un bloque.

   La URL trae dos cosas: la cursada y el bloque. Con la primera se busca la
   fila de la hoja Cursos, con el segundo el bloque del currículo, y de ahí sale
   toda la página: el objetivo, las tarjetas, las grabaciones de sus encuentros
   y los links al bloque anterior y al siguiente.

   Un bloque solo tiene página si está abierto, y lo que lo abre es que su
   grabación esté cargada en la planilla.
   ========================================================================== */

(function () {
  "use strict";

  var RH = window.RH;
  var $ = RH.$;
  var el = RH.el;
  var C = RH.CURRICULO;

  /* ------------------------------------------------------------------
     Íconos por tipo de tarjeta
     ------------------------------------------------------------------ */
  var ICONOS = {
    contenido: '<path d="M4 5h16M4 12h16M4 19h9"/>',
    material: '<path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M4 19h16"/>',
    tarea: '<path d="M9 11l2 2 4-4"/><rect x="4" y="4" width="16" height="16" rx="3"/>',
    grabacion: '<rect x="2" y="6" width="13" height="12" rx="3"/><path d="m15 11 7-3v8l-7-3z"/>',
    enlace: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/>' +
      '<path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>'
  };

  function svg(d, clase) {
    var caja = el("span", clase);
    caja.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
    return caja;
  }

  /* ------------------------------------------------------------------
     Piezas sueltas
     ------------------------------------------------------------------ */

  /** Un link de archivo descargable. */
  function linkArchivo(a) {
    var link = el("a", "material-link");
    link.href = a.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M4 18h16"/></svg>';
    link.appendChild(el("span", null, a.nombre));
    return link;
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

  /* ------------------------------------------------------------------
     Las tarjetas del bloque
     ------------------------------------------------------------------ */
  function pintarTarjetas(bloque) {
    var caja = $("[data-tarjetas]");
    var seccion = $("[data-seccion-tarjetas]");
    if (!caja || !seccion) return;

    caja.innerHTML = "";
    if (!bloque.tarjetas.length) {
      seccion.hidden = true;
      return;
    }
    seccion.hidden = false;

    bloque.tarjetas.forEach(function (t) {
      var art = el("article", "tarjeta es-" + t.tipo);

      var cabeza = el("div", "tarjeta-cabeza");
      cabeza.appendChild(svg(ICONOS[t.tipo] || ICONOS.contenido, "tarjeta-ico"));
      cabeza.appendChild(el("h3", null, t.titulo || "Sin título"));
      art.appendChild(cabeza);

      // Adentro de la tarjeta el texto va primero, porque es el que presenta la
      // descarga ("acá está la base que vamos a usar" y abajo el botón). Lo que
      // va al final es la tarjeta de texto largo respecto de las de material, y
      // ese orden lo define el currículo.
      if (t.texto) {
        var prosa = el("div", "prosa");
        prosa.innerHTML = RH.markdown(t.texto);
        art.appendChild(prosa);
      }

      if (t.imagen) {
        var img = new Image();
        img.className = "tarjeta-img";
        img.src = t.imagen;
        img.alt = t.titulo || "";
        img.loading = "lazy";
        art.appendChild(img);
      }

      if (t.archivos && t.archivos.length) {
        var mat = el("div", "tarjeta-archivos");
        t.archivos.forEach(function (a) {
          mat.appendChild(linkArchivo(a));
        });
        art.appendChild(mat);
      }

      if (t.link) {
        var cajaLink = el("div", "tarjeta-link");
        cajaLink.appendChild(
          t.tipo === "grabacion"
            ? linkVideo("Ver la grabación", t.link)
            : linkVideo("Abrir", t.link)
        );
        art.appendChild(cajaLink);
      }

      caja.appendChild(art);
    });
  }

  /* ------------------------------------------------------------------
     Las grabaciones de los encuentros del bloque
     ------------------------------------------------------------------ */
  function pintarGrabaciones(bloque) {
    var caja = $("[data-grabaciones]");
    var seccion = $("[data-seccion-grabaciones]");
    if (!caja || !seccion) return;

    var conLink = bloque.grabaciones.filter(function (g) {
      return g.link;
    });

    caja.innerHTML = "";
    if (!conLink.length) {
      seccion.hidden = true;
      return;
    }
    seccion.hidden = false;

    conLink.forEach(function (g) {
      var titulo = "Encuentro " + (g.sesion || g.numero) + (g.titulo ? " · " + g.titulo : "");
      caja.appendChild(linkVideo(titulo, g.link, "video-link-enc"));
    });
  }

  /* ------------------------------------------------------------------
     Bloque anterior / siguiente
     ------------------------------------------------------------------ */
  function pintarNav(curso, bloques, i) {
    var caja = $("[data-bloque-nav]");
    var seccion = $("[data-seccion-nav]");
    if (!caja || !seccion) return;

    caja.innerHTML = "";
    var anterior = null;
    var siguiente = null;
    for (var a = i - 1; a >= 0; a--) {
      if (bloques[a].abierto) { anterior = bloques[a]; break; }
    }
    for (var s = i + 1; s < bloques.length; s++) {
      if (bloques[s].abierto) { siguiente = bloques[s]; break; }
    }

    if (anterior) {
      var la = el("a", "nav-anterior");
      la.href = RH.rutaBloque(curso.id, anterior.slug);
      la.appendChild(el("span", "nav-label", "← Bloque anterior"));
      la.appendChild(el("span", null, anterior.nombre));
      caja.appendChild(la);
    }

    if (siguiente) {
      var ls = el("a", "nav-siguiente");
      ls.href = RH.rutaBloque(curso.id, siguiente.slug);
      ls.appendChild(el("span", "nav-label", "Bloque siguiente →"));
      ls.appendChild(el("span", null, siguiente.nombre));
      caja.appendChild(ls);
    } else if (curso.completo) {
      // Después del último bloque viene la despedida.
      var lc = el("a", "nav-siguiente");
      lc.href = RH.rutaCierre(curso.id);
      lc.appendChild(el("span", "nav-label", "Para cerrar →"));
      lc.appendChild(el("span", null, "🎓 ¡Terminaste el workshop!"));
      caja.appendChild(lc);
    }

    seccion.hidden = !caja.childNodes.length;
  }

  /* ------------------------------------------------------------------
     La portada del bloque
     ------------------------------------------------------------------ */
  function pintarHero(bloque, facilitador) {
    var hero = $("[data-bloque-hero]");
    if (!hero) return;
    hero.hidden = false;

    var emoji = $("[data-bloque-emoji]");
    if (emoji && bloque.emoji) {
      emoji.textContent = bloque.emoji;
      emoji.hidden = false;
    }

    var orden = $("[data-bloque-orden]");
    if (orden) orden.textContent = "Bloque " + bloque.numero + " de " + bloque.total;

    var titulo = $("[data-bloque-titulo]");
    if (titulo) titulo.textContent = bloque.titulo || bloque.nombre;

    var meta = $("[data-bloque-meta]");
    if (meta) {
      var partes = [];
      var grabadas = bloque.grabaciones.filter(function (g) {
        return g.link;
      }).length;
      if (grabadas) {
        partes.push(grabadas === 1 ? "1 grabación" : grabadas + " grabaciones");
      }
      if (facilitador) partes.push("con " + facilitador);
      meta.textContent = partes.join(" · ");
      meta.hidden = !partes.length;
    }

    var obj = $("[data-bloque-objetivo]");
    var objTexto = $("[data-bloque-objetivo-texto]");
    if (obj && objTexto) {
      if (bloque.objetivo) {
        objTexto.innerHTML = RH.markdown(bloque.objetivo);
        obj.hidden = false;
      } else {
        obj.hidden = true;
      }
    }
  }

  /* ------------------------------------------------------------------
     Cuando la URL pide un bloque que no está
     ------------------------------------------------------------------ */
  function sinBloque(slug, bloques) {
    var caja = $("[data-sin-bloque]");
    if (!caja) return;
    caja.hidden = false;

    var texto = $("[data-sin-bloque-texto]");
    var titulo = $("[data-sin-bloque-titulo]");
    if (!texto) return;

    // Si existe pero todavía está cerrado, lo decimos: no es lo mismo que un
    // link roto, y saber qué falta es justo lo que se quiere saber.
    var cerrado = null;
    for (var i = 0; i < bloques.length; i++) {
      if (bloques[i].slug === slug) { cerrado = bloques[i]; break; }
    }

    if (cerrado) {
      if (titulo) titulo.textContent = "🔒 Este bloque todavía no se abrió";
      // Alcanza con la grabación del primero de sus encuentros para destrabarlo.
      var primera = (cerrado.sesiones || [])[0];
      texto.textContent =
        "«" + cerrado.nombre + "» se abre en cuanto publiquemos la grabación " +
        (primera ? "del encuentro " + primera + "." : "de su encuentro.");
    } else if (!slug) {
      texto.textContent = "Este link no dice a qué bloque entrar.";
    } else {
      texto.textContent =
        "Puede que el link haya cambiado de nombre, o que este bloque no sea de este workshop.";
    }
  }

  /** Los links que vuelven a la cursada, que no se conocen hasta tener el id. */
  function pintarVuelta(curso) {
    var destino = RH.rutaCurso(curso.id);
    RH.$$("[data-volver]").forEach(function (a) {
      a.href = destino;
    });
    var marca = $("[data-volver-marca]");
    if (marca) marca.href = destino;
    [["[data-volver-bloques]", "#bloques"],
     ["[data-volver-grabaciones]", "#grabaciones"],
     ["[data-volver-ayuda]", "#ayuda"]].forEach(function (par) {
      var a = $(par[0]);
      if (a) a.href = destino + par[1];
    });
    var texto = $("[data-volver-texto]");
    if (texto) texto.textContent = "Volver al workshop";

    var cliente = $("[data-curso-cliente]");
    if (cliente) cliente.textContent = RH.nombreCliente(curso);
  }

  /* ------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------ */
  RH.arrancar(function (datos) {
    var cargando = $("[data-cargando]");
    if (cargando) cargando.hidden = true;

    var pide = RH.loQuePideLaUrl();
    var curso = RH.S ? RH.S.cursoPorId(datos.cursos || [], pide.curso) : null;

    if (!curso) {
      sinBloque("", []);
      var t = $("[data-sin-bloque-texto]");
      if (t) t.textContent = "No encontramos el workshop de este link.";
      return;
    }

    pintarVuelta(curso);

    var bloques = curso.bloques || [];
    var i = -1;
    for (var k = 0; k < bloques.length; k++) {
      if (bloques[k].slug === pide.bloque && bloques[k].abierto) { i = k; break; }
    }

    if (i === -1) {
      sinBloque(pide.bloque, bloques);
      return;
    }

    var bloque = bloques[i];
    document.title = bloque.nombre + " · " + C.nombre;

    pintarHero(bloque, curso.facilitador || (C.facilitador || {}).nombre);
    pintarTarjetas(bloque);
    pintarGrabaciones(bloque);
    pintarNav(curso, bloques, i);
  });
})();
