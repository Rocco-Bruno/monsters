//=== LO QUE APARECE AL TOCAR UNA ESTRUCTURA (como en Dragon City) ===
//al tocar una estructura aparece abajo su nombre y sus botones (cada tipo tiene los suyos)
//cada boton abre una ventanita en el medio de la pantalla
//(se carga despues de mapa.js, monstruos.js y produccion.js)

let barraSeleccion = document.getElementById("seleccion");
let fondoVentana = document.getElementById("ventana-fondo");
let cajaVentana = document.getElementById("ventana");

let seleccionada = null;   //la estructura que se toco
let ventanaAbierta = null; //la funcion que arma la ventana abierta (para poder volver a dibujarla)
let vivosBarra = [];       //funciones que actualizan numeros que cambian solos (4 veces por segundo)
let vivosVentana = [];
let firma = "";            //para darse cuenta si algo cambio solo (ej: un huevo eclosiono)

//=== SELECCIONAR ===
function seleccionar(construida) {
    if (seleccionada) {
        seleccionada.imagen.classList.remove("seleccionada");
    }
    seleccionada = construida;
    construida.imagen.classList.add("seleccionada");
    document.getElementById("menu-estructuras").classList.remove("abierto");
    cerrarVentana();
    redibujarInterfaz();
}

function deseleccionar() {
    cerrarVentana();
    if (seleccionada) {
        seleccionada.imagen.classList.remove("seleccionada");
    }
    seleccionada = null;
    vivosBarra = [];
    barraSeleccion.classList.remove("abierto");
}

//Escape: primero cierra la ventana, si no hay ventana deselecciona
function cerrarConEscape() {
    if (ventanaAbierta) {
        cerrarVentana();
    } else {
        deseleccionar();
    }
}

//al abrir el menu de construir se deselecciona (asi no se tapan)
let abrirHerramientas = document.getElementById("boton-herramientas").onclick;
document.getElementById("boton-herramientas").onclick = function () {
    deseleccionar();
    abrirHerramientas();
};

//vuelve a dibujar la barra y la ventana (se llama cuando cambia algo: refrescar() en monstruos.js)
function redibujarInterfaz() {
    if (!seleccionada) {
        return;
    }
    dibujarBarra();
    if (ventanaAbierta) {
        dibujarVentana();
    }
    firma = calcularFirma();
}

//cosas que cambian solas y necesitan redibujar (por ahora: cuando un huevo termina de incubarse)
function calcularFirma() {
    return seleccionada ? seleccionada.huevos.map(huevoListo).join(",") : "";
}

//se llama 4 veces por segundo (mapa.js)
function actualizarInterfaz() {
    if (!seleccionada) {
        return;
    }
    if (calcularFirma() !== firma) {
        redibujarInterfaz();
        return;
    }
    vivosBarra.forEach(function (actualizar) { actualizar(); });
    vivosVentana.forEach(function (actualizar) { actualizar(); });
}

function tieneMejoras(construida) {
    return !!construida.tipo.mejoraBase;
}

//=== BARRA DE ABAJO (nombre, mounstruos/huevos y botones) ===
function dibujarBarra() {
    vivosBarra = [];
    let construida = seleccionada;
    let tipo = construida.tipo;
    barraSeleccion.innerHTML = "";

    let titulo = document.createElement("div");
    titulo.className = "sel-titulo";
    titulo.innerHTML = "<b>" + tipo.nombre + "</b>"
        + (tieneMejoras(construida) ? '<span class="nivel">Nv ' + construida.nivel + "</span>" : "");
    barraSeleccion.appendChild(titulo);

    if (tipo.nombre === "Hábitat") {
        barraSeleccion.appendChild(tiramounstruos(construida));
    } else if (tipo.nombre === "Incubadora") {
        barraSeleccion.appendChild(tiraHuevos(construida));
    }

    let botones = document.createElement("div");
    botones.className = "sel-botones";
    botones.appendChild(botonAccion("ℹ️", "Info", function () { abrirVentana(ventanaInfo); }));

    if (tieneMejoras(construida)) {
        let alMaximo = construida.nivel >= tipo.nivelMaximo;
        let mejorar = botonAccion("⬆️", alMaximo ? "Máximo" : "Mejorar", function () { abrirVentana(ventanaMejorar); });
        mejorar.classList.toggle("apagado", alMaximo);
        botones.appendChild(mejorar);
    }

    if (tipo.nombre === "Granja") {
        let comida = botonAccion("🍖", "Comida", function () { abrirVentana(ventanaComida); });
        botones.appendChild(comida);
        vivo(vivosBarra, function () { ponerInsignia(comida, Math.floor(guardadoAhora(construida))); });
    }

    if (tipo.nombre === "Hábitat") {
        //el oro se junta directo, sin ventana
        let oro = botonAccion("🪙", "Reclamar", function () { reclamarConEfecto(construida); });
        botones.appendChild(oro);
        vivo(vivosBarra, function () {
            let cantidad = Math.floor(guardadoAhora(construida));
            ponerInsignia(oro, cantidad);
            oro.classList.toggle("apagado", cantidad === 0);
        });
        botones.appendChild(botonAccion("", "mounstruos", function () { abrirVentana(ventanamounstruos); }));
    }

    if (tipo.nombre === "Incubadora") {
        let huevos = botonAccion("🥚", "Huevos", function () { abrirVentana(ventanaHuevos); });
        botones.appendChild(huevos);
        vivo(vivosBarra, function () { ponerInsignia(huevos, hayHuevoListo(construida) ? "!" : 0); });
    }

    barraSeleccion.appendChild(botones);
    barraSeleccion.classList.add("abierto");
}

//agrega una funcion que se actualiza sola y la llama una vez para que arranque con el valor correcto
function vivo(lista, actualizar) {
    lista.push(actualizar);
    actualizar();
}

//boton redondo con icono y texto abajo
function botonAccion(icono, texto, accion) {
    let accionDiv = document.createElement("div");
    accionDiv.className = "accion";
    let boton = document.createElement("button");
    boton.className = "circulo";
    boton.textContent = icono;
    boton.title = texto;
    boton.onclick = accion;
    accionDiv.appendChild(boton);
    accionDiv.insertAdjacentHTML("beforeend", '<span class="texto-accion">' + texto + '</span><span class="insignia"></span>');
    return accionDiv;
}

//numerito rojo arriba del boton (0 = no se muestra)
function ponerInsignia(accionDiv, valor) {
    let insignia = accionDiv.querySelector(".insignia");
    insignia.textContent = valor;
    insignia.style.display = valor ? "block" : "none";
}

//los mounstruos del habitat uno al lado del otro, y los lugares libres
function tiramounstruos(habitat) {
    let tira = document.createElement("div");
    tira.className = "tira";
    let total = capacidad(habitat);
    for (let i = 0; i < total; i++) {
        let dragon = habitat.monstruos[i];
        let hueco = document.createElement("div");
        hueco.className = "hueco";
        if (dragon) {
            hueco.appendChild(spriteBebe(dragon.color, 1.2));
            hueco.insertAdjacentHTML("beforeend", "<small>Nv " + dragon.nivel + "</small>");
            hueco.title = nombreDragon(dragon);
        } else {
            hueco.classList.add("vacio");
            hueco.textContent = "+";
            hueco.title = "Lugar libre: añadir un mounstro";
        }
        hueco.onclick = function () { abrirVentana(ventanamounstruos); };
        tira.appendChild(hueco);
    }
    return envolverTira(tira, "mounstruos " + habitat.monstruos.length + "/" + total);
}

//los huevos que se estan incubando y los lugares libres
function tiraHuevos(incubadora) {
    let tira = document.createElement("div");
    tira.className = "tira";
    let total = capacidad(incubadora);
    for (let i = 0; i < total; i++) {
        let huevo = incubadora.huevos[i];
        let hueco = document.createElement("div");
        hueco.className = "hueco";
        if (huevo) {
            hueco.appendChild(spriteHuevo(huevo.color, 1.2));
            let tiempo = document.createElement("small");
            hueco.appendChild(tiempo);
            vivo(vivosBarra, function () {
                tiempo.textContent = huevoListo(huevo) ? "¡Listo!" : faltaHuevo(huevo).segundos + "s";
                hueco.classList.toggle("listo", huevoListo(huevo));
            });
        } else {
            hueco.classList.add("vacio");
            hueco.textContent = "+";
            hueco.title = "Lugar libre: incubar un huevo";
        }
        hueco.onclick = function () { abrirVentana(ventanaHuevos); };
        tira.appendChild(hueco);
    }
    return envolverTira(tira, "Incubando " + incubadora.huevos.length + "/" + total);
}

function envolverTira(tira, texto) {
    let caja = document.createElement("div");
    caja.className = "sel-tira";
    caja.innerHTML = "<span>" + texto + "</span>";
    caja.appendChild(tira);
    return caja;
}

//=== VENTANAS ===
//cada ventana es una funcion que recibe la estructura y devuelve { titulo, contenido }
function abrirVentana(armar) {
    ventanaAbierta = armar;
    dibujarVentana();
}

function dibujarVentana() {
    vivosVentana = [];
    let scroll = cajaVentana.scrollTop; //para que no salte arriba al redibujar
    let ventana = ventanaAbierta(seleccionada);
    cajaVentana.innerHTML = '<button class="cerrar" title="Cerrar">✕</button><h2>' + ventana.titulo + "</h2>";
    cajaVentana.querySelector(".cerrar").onclick = cerrarVentana;
    cajaVentana.appendChild(ventana.contenido);
    fondoVentana.classList.add("abierto");
    cajaVentana.scrollTop = scroll;
}

function cerrarVentana() {
    ventanaAbierta = null;
    vivosVentana = [];
    fondoVentana.classList.remove("abierto");
}

//click afuera de la ventana la cierra
fondoVentana.onclick = function (evento) {
    if (evento.target === fondoVentana) {
        cerrarVentana();
    }
};

function crearDiv(clase, html) {
    let div = document.createElement("div");
    div.className = clase;
    div.innerHTML = html || "";
    return div;
}

function botonGrande(texto, clase, accion, deshabilitado) {
    let boton = crearBoton(texto, accion, deshabilitado);
    boton.className = "boton-grande " + (clase || "");
    return boton;
}

//--- INFO: nombre, descripcion y datos ---
function ventanaInfo(construida) {
    let tipo = construida.tipo;
    let contenido = crearDiv("ventana-info");
    contenido.innerHTML = '<img class="imagen-ventana" src="' + tipo.imagen + '">'
        + (tieneMejoras(construida) ? '<p class="nivel-grande">Nivel ' + construida.nivel + " / " + tipo.nivelMaximo + "</p>" : "")
        + "<p>" + tipo.info + "</p>";

    let datos = [];
    if (tipo.nombre === "Granja") {
        datos.push("🍖 " + produccionPorSegundo(construida) + " comida por segundo");
        datos.push("Guarda hasta 🍖 " + maximoGuardado(construida));
    } else if (tipo.nombre === "Hábitat") {
        datos.push("Calidad: " + (construida.calidad ? calidades[construida.calidad].nombre : "ninguna todavía"));
        datos.push("mounstruos: " + construida.monstruos.length + "/" + capacidad(construida));
        datos.push("🪙 " + produccionPorSegundo(construida) + " oro por segundo");
        datos.push("Guarda hasta 🪙 " + maximoGuardado(construida));
    } else if (tipo.nombre === "Incubadora") {
        datos.push("🥚 Incuba " + capacidad(construida) + (capacidad(construida) === 1 ? " huevo" : " huevos") + " a la vez");
        datos.push("Ocupados: " + construida.huevos.length + "/" + capacidad(construida));
    }
    if (datos.length > 0) {
        contenido.appendChild(crearDiv("lista-datos", datos.map(function (d) { return "<span>" + d + "</span>"; }).join("")));
    }
    return { titulo: tipo.nombre, contenido: contenido };
}

//--- MEJORAR: que cambia, cuanto cuesta y boton para confirmar ---
function ventanaMejorar(construida) {
    let tipo = construida.tipo;
    let contenido = crearDiv("ventana-mejora");
    contenido.innerHTML = '<img class="imagen-ventana" src="' + tipo.imagen + '">';

    if (construida.nivel >= tipo.nivelMaximo) {
        contenido.insertAdjacentHTML("beforeend", '<p class="nivel-grande">Nivel ' + construida.nivel + "</p><p>¡Ya está en el nivel máximo!</p>");
        return { titulo: "Mejorar " + tipo.nombre, contenido: contenido };
    }

    let ahora = construida.nivel;
    let despues = ahora + 1;
    contenido.insertAdjacentHTML("beforeend",
        '<p class="nivel-grande">Nivel ' + ahora + ' <span class="flecha">➜</span> ' + despues + "</p>");

    //lo que mejora: [texto, valor ahora, valor despues]
    let cambios = [];
    if (tipo.nombre === "Granja") {
        cambios.push(["🍖 Comida por segundo", produccionPorSegundo(construida), valorPorNivel(tipo.produccionBase, tipo.produccionPorNivel, despues)]);
    }
    if (tipo.nombre === "Hábitat") {
        cambios.push(["🐲 mounstruos", capacidad(construida), capacidad(construida, despues)]);
    }
    if (tipo.nombre === "Incubadora") {
        cambios.push(["🥚 Huevos a la vez", capacidad(construida), capacidad(construida, despues)]);
    }
    if (tipo.maximoBase) {
        cambios.push([iconos[tipo.produce] + " Máximo guardado", maximoGuardado(construida), maximoGuardado(construida, despues)]);
    }
    let lista = crearDiv("lista-cambios");
    for (let cambio of cambios) {
        lista.insertAdjacentHTML("beforeend", "<div><span>" + cambio[0] + "</span><b>" + cambio[1]
            + ' <span class="flecha">➜</span> ' + cambio[2] + "</b></div>");
    }
    contenido.appendChild(lista);

    //costo
    let costo = costoMejora(construida);
    let falta = costo - recursos.oro;
    contenido.appendChild(crearDiv("costo", "Costo: 🪙 " + costo
        + (falta > 0 ? '<span class="falta">Te faltan 🪙 ' + falta + "</span>" : '<span class="alcanza">Tenés 🪙 ' + recursos.oro + "</span>")));

    let botones = crearDiv("botones-ventana");
    botones.appendChild(botonGrande("Cancelar", "gris", cerrarVentana));
    botones.appendChild(botonGrande("Confirmar mejora", "verde", function () {
        mejorarEstructura(construida); //produccion.js
        cerrarVentana();
        mostrarFlotante(construida, "¡Nivel " + construida.nivel + "!");
    }, falta > 0));
    contenido.appendChild(botones);
    return { titulo: "Mejorar " + tipo.nombre, contenido: contenido };
}

//--- COMIDA (granja) ---
function ventanaComida(granja) {
    let contenido = crearDiv("ventana-recurso");
    let maximo = maximoGuardado(granja);
    contenido.innerHTML = '<div class="icono-grande">🍖</div>'
        + '<p class="cantidad-grande"><b></b> / ' + maximo + "</p>"
        + '<div class="barra-tiempo"><div class="relleno"></div></div>'
        + "<p>Produce 🍖 " + produccionPorSegundo(granja) + " por segundo</p>";
    let boton = botonGrande("", "", function () { reclamarConEfecto(granja); });
    contenido.appendChild(crearDiv("botones-ventana")).appendChild(boton);

    vivo(vivosVentana, function () {
        let cantidad = Math.floor(guardadoAhora(granja));
        contenido.querySelector(".cantidad-grande b").textContent = cantidad;
        contenido.querySelector(".relleno").style.width = Math.min(cantidad / maximo * 100, 100) + "%";
        boton.textContent = cantidad >= maximo ? "Reclamar 🍖 " + cantidad + " (¡lleno!)" : "Reclamar 🍖 " + cantidad;
        boton.disabled = cantidad === 0;
    });
    return { titulo: "Comida de la granja", contenido: contenido };
}

//junta la comida/oro y muestra "+25 🪙" subiendo arriba de la estructura
function reclamarConEfecto(construida) {
    let cantidad = Math.floor(guardadoAhora(construida));
    if (cantidad === 0) {
        return;
    }
    reclamarProduccion(construida); //produccion.js
    mostrarFlotante(construida, "+" + cantidad + " " + iconos[construida.tipo.produce]);
}

function mostrarFlotante(construida, texto) {
    let flotante = document.createElement("div");
    flotante.className = "flotante";
    flotante.textContent = texto;
    flotante.style.left = construida.x + "px";
    flotante.style.top = (construida.y - 50) + "px";
    mapa.appendChild(flotante);
    setTimeout(function () { flotante.remove(); }, 1300);
}

//--- HUEVOS (incubadora): lugares de incubacion y huevos del inventario ---
function ventanaHuevos(incubadora) {
    let contenido = crearDiv("ventana-huevos");
    let total = capacidad(incubadora);
    contenido.innerHTML = '<p class="capacidad">Incubando <b>' + incubadora.huevos.length + "/" + total + "</b>"
        + (incubadora.nivel < incubadora.tipo.nivelMaximo ? " · mejorá la incubadora para incubar más a la vez" : "") + "</p>";

    for (let j = 0; j < total; j++) {
        let huevo = incubadora.huevos[j];
        if (!huevo) {
            contenido.appendChild(crearDiv("fila-monstruo lugar-libre", "Lugar libre"));
            continue;
        }
        let nombre = "Huevo " + monstruos[huevo.color].nombre.toLowerCase();
        if (huevoListo(huevo)) {
            contenido.appendChild(filaMonstruo(spriteHuevo(huevo.color, 1.5), nombre, "¡Eclosionó!",
                [crearBoton("Reclamar dragón 🐲", function () { reclamarBebe(incubadora, j); })]));
        } else {
            let fila = filaMonstruo(spriteHuevo(huevo.color, 1.5), nombre,
                '<span class="cuenta"></span><span class="barra-tiempo"><span class="relleno"></span></span>', []);
            contenido.appendChild(fila);
            vivo(vivosVentana, function () {
                let falta = faltaHuevo(huevo);
                fila.querySelector(".cuenta").textContent = "Eclosiona en " + falta.segundos + "s";
                fila.querySelector(".relleno").style.width = (falta.avance * 100) + "%";
            });
        }
    }

    contenido.insertAdjacentHTML("beforeend", "<h3>Huevos en tu inventario</h3>");
    if (inventario.huevos.length === 0) {
        contenido.insertAdjacentHTML("beforeend", '<p class="vacio">No tenés huevos. Conseguilos en las misiones.</p>');
    }
    let motivo = motivoNoIncuba();
    inventario.huevos.forEach(function (color, i) {
        contenido.appendChild(filaMonstruo(
            spriteHuevo(color, 1.5),
            "Huevo " + monstruos[color].nombre.toLowerCase(),
            nombreCalidad(color) + " · " + calidades[monstruos[color].calidad].tiempoEclosion + "s",
            [crearBoton("Incubar", function () { incubarHuevo(i); }, motivo, motivo)]
        ));
    });
    return { titulo: "Incubadora", contenido: contenido };
}

//--- mounstruos (habitat): los que viven acá y los del inventario que se pueden poner ---
function ventanamounstruos(habitat) {
    let contenido = crearDiv("ventana-mounstruos");
    let total = capacidad(habitat);
    let calidad = habitat.calidad ? calidades[habitat.calidad].nombre : "ninguna todavía (la decide el primer dragón)";
    contenido.innerHTML = '<p class="capacidad">mounstruos <b>' + habitat.monstruos.length + "/" + total + "</b> · Calidad: " + calidad + "</p>";

    habitat.monstruos.forEach(function (dragon, i) {
        contenido.appendChild(filaMonstruo(
            spriteBebe(dragon.color, 1.5),
            nombreDragon(dragon),
            nombreCalidad(dragon.color) + " · 🪙 " + oroDelDragon(dragon) + "/s",
            [botonMejorarDragon(dragon, habitat), crearBoton("Sacar", function () { sacarDelHabitat(habitat, i); })]
        ));
    });
    for (let i = habitat.monstruos.length; i < total; i++) {
        contenido.appendChild(crearDiv("fila-monstruo lugar-libre", "Lugar libre"));
    }

    let lleno = habitat.monstruos.length >= total;
    let compatibles = inventario.monstruos.filter(function (dragon) {
        return !habitat.calidad || habitat.calidad === monstruos[dragon.color].calidad;
    });
    contenido.insertAdjacentHTML("beforeend", "<h3>Añadir desde el inventario</h3>");
    if (compatibles.length === 0) {
        contenido.insertAdjacentHTML("beforeend", '<p class="vacio">No tenés mounstruos '
            + (habitat.calidad ? "de calidad " + calidades[habitat.calidad].nombre.toLowerCase() + " " : "")
            + "en el inventario.</p>");
    }
    inventario.monstruos.forEach(function (dragon, i) {
        if (compatibles.indexOf(dragon) === -1) {
            return; //otra calidad no puede vivir acá
        }
        let ayuda = lleno ? "El hábitat está lleno, mejoralo para que entren más" : "";
        contenido.appendChild(filaMonstruo(
            spriteBebe(dragon.color, 1.5),
            nombreDragon(dragon),
            nombreCalidad(dragon.color) + " · 🪙 " + oroDelDragon(dragon) + "/s",
            [crearBoton("Añadir", function () { ponerEnHabitat(habitat, i); }, lleno, ayuda)]
        ));
    });
    return { titulo: "mounstruos del hábitat", contenido: contenido };
}
