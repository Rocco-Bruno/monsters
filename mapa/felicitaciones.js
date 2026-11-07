//=== PANTALLA DE FELICITACIONES ===
//aparece cuando conseguis un huevo (mision, tienda, caja), cuando nace un monstruo, cuando subis de nivel, etc.
//si llegan varias juntas se muestran una atras de otra
//(se carga despues de datos-monstruos.js e interfaz.js)

let pantallaFelicitaciones = document.getElementById("felicitaciones");
let colaFelicitaciones = []; //las que esperan su turno
let felicitacionAbierta = false;

//para huevos y monstruos:
//tipo = "huevo" o "monstruo", color = cual (ej: "rojo")
//origen = de donde vino, se muestra abajo (ej: "Premio de misión")
//botonesExtra = [{ texto, clase, accion, deshabilitado }] (opcional, ej: "Abrir otra" en las cajas)
//nota = texto extra resaltado (opcional, ej: "¡Monstruo nuevo para tu colección! +3 💎")
function felicitar(tipo, color, origen, botonesExtra, nota) {
    let monstruo = monstruos[color];
    let esHuevo = tipo === "huevo";
    felicitarEspecial({
        subtitulo: esHuevo ? "Conseguiste un huevo nuevo" : "¡Nació un monstruo!",
        dibujo: esHuevo ? spriteHuevo(color, 5) : spriteBebe(color, 5),
        nombre: (esHuevo ? "Huevo " : "Monstruo ") + monstruo.nombre.toLowerCase(),
        etiqueta: calidades[monstruo.calidad].nombre,
        color: monstruo.calidad,
        detalle: (origen ? origen + " · " : "") +
            (esHuevo ? "Está en tu inventario, incubalo para que nazca." : "Está en tu inventario, ponelo en un hábitat."),
        nota: nota,
        botonesExtra: botonesExtra,
    });
}

//para cualquier otra cosa (subir de nivel, gemas, coleccion completa...)
//datos = { subtitulo, dibujo (un elemento) o icono (un emoji), nombre, etiqueta, color, detalle, nota, botonesExtra }
//color = "comun", "raro", "epico", "legendario", "gemas" o "nivel" (cambia el color de los rayos y el borde)
function felicitarEspecial(datos) {
    colaFelicitaciones.push(datos);
    if (!felicitacionAbierta) {
        mostrarSiguienteFelicitacion();
    }
}

function mostrarSiguienteFelicitacion() {
    let datos = colaFelicitaciones.shift();
    if (!datos) {
        felicitacionAbierta = false;
        pantallaFelicitaciones.classList.remove("abierto");
        return;
    }
    felicitacionAbierta = true;

    pantallaFelicitaciones.className = "abierto color-" + (datos.color || "comun");
    pantallaFelicitaciones.innerHTML = "";

    let caja = crearDiv("caja-felicitaciones");
    caja.insertAdjacentHTML("beforeend",
        '<p class="titulo-felicitaciones">' + (datos.titulo || "¡Felicitaciones!") + "</p>" +
        '<p class="subtitulo-felicitaciones">' + datos.subtitulo + "</p>");

    //el dibujo grande con rayos girando atras
    let escenario = crearDiv("escenario-felicitaciones", '<div class="rayos"></div>');
    let dibujo = crearDiv("dibujo-felicitaciones");
    if (datos.dibujo) {
        dibujo.appendChild(datos.dibujo);
    } else {
        dibujo.innerHTML = '<span class="icono-felicitaciones">' + datos.icono + "</span>";
    }
    escenario.appendChild(dibujo);
    caja.appendChild(escenario);

    caja.insertAdjacentHTML("beforeend",
        '<p class="nombre-felicitaciones">' + datos.nombre + "</p>" +
        (datos.etiqueta ? '<p class="calidad-felicitaciones">' + datos.etiqueta + "</p>" : "") +
        (datos.nota ? '<p class="nota-felicitaciones">' + datos.nota + "</p>" : "") +
        (datos.detalle ? '<p class="detalle-felicitaciones">' + datos.detalle + "</p>" : ""));

    let botones = crearDiv("botones-ventana");
    for (let extra of datos.botonesExtra || []) {
        botones.appendChild(botonGrande(extra.texto, extra.clase, function () {
            cerrarFelicitacion();
            extra.accion();
        }, extra.deshabilitado));
    }
    botones.appendChild(botonGrande("¡Genial!", "", cerrarFelicitacion));
    caja.appendChild(botones);

    pantallaFelicitaciones.appendChild(caja);
}

function cerrarFelicitacion() {
    mostrarSiguienteFelicitacion(); //si no quedan, se cierra
}

//Enter o Escape la cierran (y no llegan al mapa, asi no se cierra tambien la ventana de atras)
window.addEventListener("keydown", function (evento) {
    if (!felicitacionAbierta) {
        return;
    }
    if (evento.key === "Enter" || evento.key === "Escape") {
        evento.preventDefault();
        evento.stopPropagation();
        cerrarFelicitacion();
    }
}, true);
