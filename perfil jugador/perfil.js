//=== PERFIL: nombre, nivel, colección, avatar y marcos del jugador ===
//lee lo que guardaron la pantalla de inicio (nombre) y el mapa (partida, ver mapa/guardado.js)
//lo que se cambia acá (avatar, marcos) se guarda en la partida y se ve al volver al mapa
//(se carga despues de mapa/datos-monstruos.js y mapa/experiencia.js: usa los mounstruos, sprites, rangos y XP)

let clavePartida = "monsters-city-partida";

function leer(clave) {
    try {
        return JSON.parse(sessionStorage.getItem(clave));
    } catch (error) {
        return null;
    }
}

let datosJugador = leer("monsters-city-jugador") || {};
let partida = leer(clavePartida); //null si todavia no se jugo
let hayPartida = !!(partida && partida.recursos);
partida = partida || {};
let coleccion = partida.coleccion || {};
let perfil = Object.assign({ avatar: null, marco: "basico", marcos: ["basico"], colorNombre: "blanco", coloresNombre: ["blanco"] }, partida.perfil);

function guardarPerfil() {
    if (!hayPartida) {
        return;
    }
    partida.perfil = perfil;
    try {
        sessionStorage.setItem(clavePartida, JSON.stringify(partida));
    } catch (error) {
    }
}

//=== MARCOS: CAMBIÁ ACÁ ===
//precio en gemas (0 = gratis); clase = el estilo del borde en perfil.css (marco-...)
let marcos = [
    { id: "basico", nombre: "Básico", precio: 0 },
    { id: "bronce", nombre: "Bronce", precio: 5 },
    { id: "plata", nombre: "Plata", precio: 15 },
    { id: "oro", nombre: "Oro", precio: 30 },
    { id: "arcoiris", nombre: "Arcoíris", precio: 50 },
];

//=== COLORES DEL NOMBRE: CAMBIÁ ACÁ ===
//precio en gemas (0 = gratis); el color de cada uno está en perfil.css (color-nombre-...)
//para agregar uno: copiá una línea acá y agregá su clase en perfil.css
let coloresNombre = [
    { id: "blanco", nombre: "Blanco", precio: 0 },
    { id: "rojo", nombre: "Rojo", precio: 5 },
    { id: "verde", nombre: "Verde", precio: 5 },
    { id: "celeste", nombre: "Celeste", precio: 10 },
    { id: "rosa", nombre: "Rosa", precio: 10 },
    { id: "dorado", nombre: "Dorado", precio: 20 },
    { id: "arcoiris", nombre: "Arcoíris", precio: 40 },
];

//--- nombre ---
let nombre = datosJugador.nombre || "Sin nombre";
document.getElementById("nombre-jugador").textContent = nombre;

function mostrarColorNombre() {
    document.getElementById("nombre-jugador").className = "color-nombre-" + perfil.colorNombre;
}

//cada color es un cuadrito con "Aa" pintado; abajo dice el precio, "Usar" o "Puesto"
function mostrarColoresNombre() {
    let lista = document.getElementById("lista-colores");
    lista.innerHTML = "";
    let gemas = (partida.recursos || {}).gemas || 0;
    for (let color of coloresNombre) {
        let comprado = perfil.coloresNombre.indexOf(color.id) !== -1;
        let puesto = perfil.colorNombre === color.id;
        let boton = document.createElement("button");
        boton.className = "opcion-color" + (puesto ? " puesto" : "");
        boton.innerHTML = '<span class="muestra-color color-nombre-' + color.id + '">Aa</span>'
            + '<span class="nombre-color">' + color.nombre + "</span>"
            + '<span class="precio-color">' + (puesto ? "✔ Puesto" : comprado ? "Usar" : "💎 " + color.precio) + "</span>";
        if (puesto) {
            boton.disabled = true;
        } else if (comprado) {
            boton.onclick = function () { usarColorNombre(color); };
        } else {
            boton.disabled = !hayPartida || gemas < color.precio;
            boton.title = !hayPartida ? "Empezá a jugar primero" : gemas < color.precio ? "Faltan gemas" : "Comprar";
            boton.onclick = function () { comprarColorNombre(color); };
        }
        lista.appendChild(boton);
    }
}

function comprarColorNombre(color) {
    if (!hayPartida || partida.recursos.gemas < color.precio) {
        return;
    }
    partida.recursos.gemas -= color.precio;
    perfil.coloresNombre.push(color.id);
    usarColorNombre(color); //al comprarlo ya se lo pone
    mostrarGemas();
    mostrarMarcos(); //con menos gemas pueden quedar marcos sin poder comprarse
}

function usarColorNombre(color) {
    perfil.colorNombre = color.id;
    guardarPerfil();
    mostrarColorNombre();
    mostrarColoresNombre();
}

//--- nivel, rango y experiencia ---
let nivelJugador = (partida.jugador || {}).nivel || 1;
let xpJugador = (partida.jugador || {}).xp || 0;
let xpNecesaria = xpParaSubir(nivelJugador); //experiencia.js
document.getElementById("nivel-perfil").textContent = "NIVEL " + dosCifras(nivelJugador);
document.getElementById("rango-perfil").textContent = rangoDe(nivelJugador); //experiencia.js
document.getElementById("texto-xp-perfil").textContent = xpJugador + " / " + xpNecesaria + " XP";
document.getElementById("barra-xp-perfil").style.width = Math.min(xpJugador / xpNecesaria * 100, 100) + "%";

function mostrarGemas() {
    document.getElementById("gemas-perfil").textContent = "💎 " + ((partida.recursos || {}).gemas || 0);
}
mostrarGemas();

//--- numeros de la tarjeta ---
function dosCifras(numero) {
    return String(numero).padStart(2, "0");
}

let totalMonstruos = Object.values(coleccion).reduce(function (suma, cantidad) { return suma + cantidad; }, 0);
document.getElementById("total-monstruos").textContent = dosCifras(totalMonstruos);
document.getElementById("total-huevos").textContent = dosCifras((partida.progreso || {}).huevos || 0);
//--- avatar (con el marco puesto) ---
function mostrarAvatar() {
    let avatar = document.getElementById("avatar");
    avatar.innerHTML = "";
    avatar.className = "avatar marco-" + perfil.marco;
    if (perfil.avatar && monstruos[perfil.avatar]) {
        avatar.appendChild(spriteBebe(perfil.avatar, 3.5));
    } else {
        avatar.innerHTML = '<span class="sin-avatar">👤</span>';
    }
}

//--- marcos ---
function mostrarMarcos() {
    let lista = document.getElementById("lista-marcos");
    lista.innerHTML = "";
    let gemas = (partida.recursos || {}).gemas || 0;
    for (let marco of marcos) {
        let fila = document.createElement("div");
        fila.className = "fila-marco";
        fila.innerHTML = '<span class="muestra-marco marco-' + marco.id + '"></span><span class="nombre-marco">' + marco.nombre + "</span>";
        let boton = document.createElement("button");
        boton.className = "boton boton-marco";
        if (perfil.marco === marco.id) {
            boton.textContent = "Puesto";
            boton.disabled = true;
        } else if (perfil.marcos.indexOf(marco.id) !== -1) {
            boton.textContent = "Usar";
            boton.onclick = function () { usarMarco(marco); };
        } else {
            boton.textContent = "💎 " + marco.precio;
            boton.disabled = !hayPartida || gemas < marco.precio;
            boton.title = !hayPartida ? "Empezá a jugar primero" : gemas < marco.precio ? "Faltan gemas" : "Comprar";
            boton.onclick = function () { comprarMarco(marco); };
        }
        fila.appendChild(boton);
        lista.appendChild(fila);
    }
}

function comprarMarco(marco) {
    if (!hayPartida || partida.recursos.gemas < marco.precio) {
        return;
    }
    partida.recursos.gemas -= marco.precio;
    perfil.marcos.push(marco.id);
    perfil.marco = marco.id; //al comprarlo ya se lo pone
    guardarPerfil();
    mostrarGemas();
    mostrarMarcos();
    mostrarColoresNombre(); //con menos gemas pueden quedar colores sin poder comprarse
    mostrarAvatar();
}

function usarMarco(marco) {
    perfil.marco = marco.id;
    guardarPerfil();
    mostrarMarcos();
    mostrarAvatar();
}

//--- coleccion: todos los mounstruos del juego, ordenados por calidad ---
let contenedor = document.getElementById("contenedor-monstruos");
let colores = Object.keys(monstruos);
let descubiertos = colores.filter(function (color) { return coleccion[color] > 0; }).length;
document.getElementById("contador-coleccion").textContent = descubiertos + " / " + colores.length;

function mostrarColeccion() {
    contenedor.innerHTML = "";
    for (let color of colores) {
        let datos = monstruos[color];
        let cantidad = coleccion[color] || 0;
        let tarjeta = document.createElement("article");
        tarjeta.className = "monstruo " + (cantidad > 0 ? "conseguido" : "bloqueado");

        let imagen = document.createElement("div");
        imagen.className = "imagen fondo-" + datos.calidad;
        imagen.appendChild(spriteBebe(color, 3));
        tarjeta.appendChild(imagen);

        let calidad = '<p class="calidad-' + datos.calidad + '">' + calidades[datos.calidad].nombre
            + (datos.exclusivo ? " · exclusivo" : "") + "</p>";
        if (cantidad > 0) {
            tarjeta.insertAdjacentHTML("beforeend",
                "<h3>MONSTRUO " + datos.nombre.toUpperCase() + "</h3>" + calidad +
                '<p class="cantidad">Conseguidos: ' + cantidad + "</p>");
            let boton = document.createElement("button");
            boton.className = "boton boton-avatar";
            if (perfil.avatar === color) {
                boton.textContent = "Tu avatar";
                boton.disabled = true;
            } else {
                boton.textContent = "Usar de avatar";
                boton.onclick = function () {
                    perfil.avatar = color;
                    guardarPerfil();
                    mostrarAvatar();
                    mostrarColeccion();
                };
            }
            tarjeta.appendChild(boton);
        } else {
            tarjeta.insertAdjacentHTML("beforeend", "<h3>???</h3>" + calidad + '<p class="cantidad">Sin descubrir</p>');
        }
        contenedor.appendChild(tarjeta);
    }
}

mostrarAvatar();
mostrarMarcos();
mostrarColorNombre();
mostrarColoresNombre();
mostrarColeccion();
