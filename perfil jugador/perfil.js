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
let perfil = Object.assign({ avatar: null, marco: "basico", marcos: ["basico"] }, partida.perfil);

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

//--- nombre ---
let nombre = datosJugador.nombre || "Sin nombre";
document.getElementById("nombre-jugador").textContent = nombre;
document.getElementById("dato-usuario").textContent = nombre;

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
document.getElementById("total-logros").textContent = dosCifras((partida.progreso || {}).misiones || 0);

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
mostrarColeccion();
