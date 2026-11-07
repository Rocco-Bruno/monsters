//guarda la partida mientras el juego esta abierto, para que no se pierda al ir al perfil y volver
//cuando cerras la pestaña (o lo volves a ejecutar desde Visual Studio) la partida empieza de cero
//(se carga despues de mapa.js y misiones.js porque usa cosas de los dos)

let claveGuardado = "monsters-city-partida";

//lo que se elige en el perfil: avatar = el color del monstruo que se usa de foto (null = ninguno)
//marco = el marco puesto, marcos = los marcos comprados con gemas (ver perfil jugador/perfil.js)
let perfilJugador = { avatar: null, marco: "basico", marcos: ["basico"] };

//pone el monstruo elegido como avatar adentro del boton del perfil
function mostrarAvatar() {
    let boton = document.getElementById("boton-perfil");
    if (perfilJugador.avatar && monstruos[perfilJugador.avatar]) {
        boton.innerHTML = "";
        boton.appendChild(spriteBebe(perfilJugador.avatar, 1.6));
    } else {
        boton.textContent = "👤";
    }
}

function guardarPartida() {
    let partida = {
        recursos: recursos,
        progreso: progreso,
        inventario: inventario,
        coleccion: coleccion,
        construidas: construidas.map(function (c) {
            return {
                nombre: c.tipo.nombre, x: c.x, y: c.y,
                extra: {
                    nivel: c.nivel, guardado: c.guardado, ultimoCalculo: c.ultimoCalculo,
                    huevos: c.huevos, monstruos: c.monstruos, calidad: c.calidad,
                },
            };
        }),
        jugador: jugador,
        misiones: misiones.map(function (m) {
            let copia = Object.assign({}, m);
            delete copia.fila; //es un pedazo de la pagina, no se guarda
            return copia;
        }),
        siguientePrincipal: siguientePrincipal,
        garantias: garantias, //tienda.js
        perfil: perfilJugador,
    };
    try {
        sessionStorage.setItem(claveGuardado, JSON.stringify(partida));
    } catch (error) {
        //si el navegador no deja guardar, el juego sigue andando igual
    }
}

//en partidas viejas los mounstruos eran solo el color ("rojo"), ahora son { color, nivel }
function comoMonstruo(monstruo) {
    return typeof monstruo === "string" ? { color: monstruo, nivel: 1 } : monstruo;
}

function cargarPartida() {
    let partida = null;
    try {
        partida = JSON.parse(sessionStorage.getItem(claveGuardado));
    } catch (error) {
        partida = null;
    }
    if (!partida) {
        return;
    }

    Object.assign(recursos, partida.recursos);
    Object.assign(progreso, partida.progreso);
    Object.assign(inventario, partida.inventario);
    inventario.monstruos = inventario.monstruos.map(comoMonstruo);
    Object.assign(coleccion, partida.coleccion);

    for (let guardada of partida.construidas || []) {
        let tipo = estructuras.find(function (e) { return e.nombre === guardada.nombre; });
        if (tipo) {
            let extra = guardada.extra || {};
            extra.monstruos = (extra.monstruos || []).map(comoMonstruo);
            delete extra.ultimoReclamo; //dato de partidas viejas que ya no se usa
            if (extra.huevo !== undefined) {
                //antes la incubadora tenia un solo huevo, ahora tiene una lista
                extra.huevos = extra.huevo ? [extra.huevo] : [];
                delete extra.huevo;
            }
            ponerEstructura(tipo, guardada.x, guardada.y, extra);
        }
    }

    Object.assign(jugador, partida.jugador);
    Object.assign(garantias, partida.garantias);
    Object.assign(perfilJugador, partida.perfil);
    if (partida.misiones) {
        misiones = partida.misiones;
        siguientePrincipal = partida.siguientePrincipal || 0;
        rellenarMisiones();
    }

    mostrarRecursos();
    mostrarMisiones();
    mostrarInventario();
    mostrarNivel(); //experiencia.js
    mostrarAvatar();
}

//para empezar de cero sin cerrar el juego: abrir la consola (F12) y escribir borrarPartida()
function borrarPartida() {
    window.removeEventListener("beforeunload", guardarPartida); //si no, se volveria a guardar al recargar
    sessionStorage.removeItem(claveGuardado);
    location.reload();
}

//antes se guardaba para siempre (localStorage): borramos esa partida vieja
try {
    localStorage.removeItem(claveGuardado);
} catch (error) {
}

cargarPartida();

//por las dudas tambien guardamos al salir de la pagina (asi el oro de la granja sigue contando)
window.addEventListener("beforeunload", guardarPartida);
