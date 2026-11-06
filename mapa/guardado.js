//guarda la partida mientras el juego esta abierto, para que no se pierda al ir al perfil y volver
//cuando cerras la pestaña (o lo volves a ejecutar desde Visual Studio) la partida empieza de cero
//(se carga despues de mapa.js y misiones.js porque usa cosas de los dos)

let claveGuardado = "monsters-city-partida";

function guardarPartida() {
    let partida = {
        recursos: recursos,
        progreso: progreso,
        inventario: inventario,
        construidas: construidas.map(function (c) {
            return {
                nombre: c.tipo.nombre, x: c.x, y: c.y,
                extra: {
                    nivel: c.nivel, guardado: c.guardado, ultimoCalculo: c.ultimoCalculo,
                    huevos: c.huevos, monstruos: c.monstruos, calidad: c.calidad,
                },
            };
        }),
        misionesReclamadas: misiones.filter(function (m) { return m.reclamada; }).map(function (m) { return m.texto; }),
    };
    try {
        sessionStorage.setItem(claveGuardado, JSON.stringify(partida));
    } catch (error) {
        //si el navegador no deja guardar, el juego sigue andando igual
    }
}

//en partidas viejas los mounstruos eran solo el color ("rojo"), ahora son { color, nivel }
function comoDragon(dragon) {
    return typeof dragon === "string" ? { color: dragon, nivel: 1 } : dragon;
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
    inventario.monstruos = inventario.monstruos.map(comoDragon);

    for (let guardada of partida.construidas || []) {
        let tipo = estructuras.find(function (e) { return e.nombre === guardada.nombre; });
        if (tipo) {
            let extra = guardada.extra || {};
            extra.monstruos = (extra.monstruos || []).map(comoDragon);
            delete extra.ultimoReclamo; //dato de partidas viejas que ya no se usa
            if (extra.huevo !== undefined) {
                //antes la incubadora tenia un solo huevo, ahora tiene una lista
                extra.huevos = extra.huevo ? [extra.huevo] : [];
                delete extra.huevo;
            }
            ponerEstructura(tipo, guardada.x, guardada.y, extra);
        }
    }

    for (let mision of misiones) {
        mision.reclamada = (partida.misionesReclamadas || []).includes(mision.texto);
    }

    mostrarRecursos();
    mostrarMisiones();
    mostrarInventario();
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
