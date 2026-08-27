/* ==========================================================================
   La despedida: /idcurso/cierre

   Casi todo sale del currículo (curriculo.cierre). De la planilla solo se
   necesita el id de la cursada, para que los links de "volver al workshop"
   apunten a donde tienen que apuntar.

   La página se dibuja aunque la cursada no se encuentre: es una felicitación,
   no hay nada que proteger, y un link roto acá sería peor que un link genérico.
   ========================================================================== */

(function () {
  "use strict";

  var RH = window.RH;
  var $ = RH.$;
  var el = RH.el;
  var C = RH.CURRICULO;
  var CIERRE = C.cierre || {};

  /* ------------------------------------------------------------------
     El GIF de los aplausos
     ------------------------------------------------------------------ */
  function pintarGif() {
    var img = $("[data-cierre-gif]");
    if (!img || !CIERRE.gif) return;
    // Se muestra recién cuando carga: si la red del alumno bloquea Tenor,
    // en vez de un ícono roto no se ve nada.
    img.onload = function () {
      img.hidden = false;
    };
    img.src = CIERRE.gif;
  }

  /* ------------------------------------------------------------------
     Las acciones para seguir en contacto
     ------------------------------------------------------------------ */
  function pintarAcciones(curso) {
    var caja = $("[data-acciones]");
    if (!caja) return;
    caja.innerHTML = "";

    (CIERRE.acciones || []).forEach(function (a) {
      // "volverAlCurso" no trae URL en el currículo: depende de la cursada.
      var url = a.volverAlCurso ? (curso ? RH.rutaCurso(curso.id) : "") : a.url;
      if (a.volverAlCurso && !url) return;

      var art = el("article", "accion");
      var cabeza = el("div", "accion-cabeza");
      var ico = el("span", "accion-emoji", a.emoji || "✨");
      ico.setAttribute("aria-hidden", "true");
      cabeza.appendChild(ico);
      cabeza.appendChild(el("h3", null, a.titulo || ""));
      art.appendChild(cabeza);

      if (a.texto) {
        var prosa = el("div", "prosa");
        prosa.innerHTML = RH.markdown(a.texto);
        art.appendChild(prosa);
      }

      var boton = el("a", "btn btn-cta btn-sm", a.boton || "Abrir");
      if (a.volverAlCurso) {
        // Es una ruta interna, así que no pasa por RH.link (que solo acepta
        // http y mailto) ni se abre en otra pestaña.
        boton.href = url;
        art.appendChild(boton);
      } else {
        boton.target = "_blank";
        boton.rel = "noopener";
        if (RH.link(boton, url)) art.appendChild(boton);
      }

      caja.appendChild(art);
    });
  }

  /* ------------------------------------------------------------------
     El certificado
     ------------------------------------------------------------------ */
  function pintarCertificado() {
    var cert = CIERRE.certificado;
    var seccion = $("[data-seccion-certificado]");
    if (!cert || !seccion) return;

    var emoji = $("[data-certificado-emoji]");
    if (emoji && cert.emoji) emoji.textContent = cert.emoji;

    var titulo = $("[data-certificado-titulo]");
    if (titulo) titulo.textContent = cert.titulo || "Tu certificado";

    var texto = $("[data-certificado-texto]");
    if (texto) texto.innerHTML = RH.markdown(cert.texto || "");

    var boton = $("[data-certificado-boton]");
    if (boton && cert.boton) boton.textContent = cert.boton;
    var hayCert = RH.link(boton, cert.url);

    var li = cert.linkedin || {};
    var caja = $("[data-linkedin]");
    var botonLi = $("[data-linkedin-boton]");
    if (botonLi && li.boton) botonLi.textContent = li.boton;
    var hayLinkedin = RH.link(botonLi, li.url);

    if (caja) {
      var t = $("[data-linkedin-texto]");
      if (t) t.textContent = li.texto || "";
      caja.hidden = !hayLinkedin;
    }

    var campos = $("[data-campos]");
    if (campos) {
      campos.innerHTML = "";
      (cert.campos || []).forEach(function (campo) {
        campos.appendChild(el("dt", null, campo.etiqueta));
        // El campo marcado con "hoy" es la fecha de emisión: la de hoy, en el
        // formato dd/mm/aaaa que pide LinkedIn.
        campos.appendChild(el("dd", null, campo.hoy ? RH.hoyAR() : campo.valor));
      });
    }

    seccion.hidden = !(hayCert || hayLinkedin);
  }

  /* ------------------------------------------------------------------
     Comunidad
     ------------------------------------------------------------------ */
  function pintarRedes() {
    var caja = $("[data-redes]");
    if (!caja) return;
    caja.innerHTML = "";

    (C.redes || []).forEach(function (r) {
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

    if (caja.childNodes.length) $("[data-seccion-redes]").hidden = false;
  }

  /* ------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------ */
  pintarGif();
  pintarCertificado();
  pintarRedes();

  RH.arrancar(function (datos) {
    var pide = RH.loQuePideLaUrl();
    var curso = RH.S ? RH.S.cursoPorId(datos.cursos || [], pide.curso) : null;

    pintarAcciones(curso);

    var cliente = $("[data-curso-cliente]");
    if (cliente) cliente.textContent = RH.nombreCliente(curso);

    // Sin cursada los links de "volver" no tienen a dónde ir, así que se sacan
    // en vez de dejarlos apuntando a la portada, que no es de nadie.
    var destino = curso ? RH.rutaCurso(curso.id) : "";
    RH.$$("[data-volver]").forEach(function (a) {
      if (destino) a.href = destino;
      else a.hidden = true;
    });
    var marca = $("[data-volver-marca]");
    if (marca && destino) marca.href = destino;

    document.title = "¡Felicitaciones! · " + C.nombre;
  });
})();
