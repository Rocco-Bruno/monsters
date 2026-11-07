//=== EXPERIENCIA Y NIVEL DEL JUGADOR ===
//casi todo lo que hacés da experiencia (XP); al juntar suficiente subís de nivel y ganás gemas
//cada nivel pide mas XP que el anterior, asi que cuanto mas alto, mas cuesta subir
//(el nivel y la XP estan en "jugador", mapa.js; se carga despues de felicitaciones.js)

//=== CAMBIÁ ACÁ cuanta XP da cada cosa ===
let xpPor = {
    eclosionar: { comun: 10, raro: 25, epico: 50, legendario: 100 }, //segun la calidad del huevo
    descubrir: 50,          //extra la primera vez que conseguis un monstruo
    construir: 10,
    mejorarEstructura: 15,  //por el nivel nuevo (mejorar a nivel 3 da 45)
    mejorarMonstruo: 5,     //por el nivel nuevo
    mision: 25,
};

//=== CAMBIÁ ACÁ cuanto cuesta subir ===
//para pasar de nivel 1 a 2 hacen falta xpBase; cada nivel siguiente pide xpMultiplicador veces mas
//(100, 150, 225, 338, 506...)
let xpBase = 100;
let xpMultiplicador = 1.5;

//=== CAMBIÁ ACÁ que da subir de nivel ===
let gemasPorNivel = 2;
let gemasCadaCincoNiveles = 5; //en los niveles 5, 10, 15... da esto en vez de gemasPorNivel

//nombre del rango segun el nivel (se ve en el perfil)
let rangos = [
    { desde: 1, nombre: "Principiante" },
    { desde: 5, nombre: "Explorador" },
    { desde: 10, nombre: "Domador" },
    { desde: 20, nombre: "Maestro" },
    { desde: 30, nombre: "Leyenda" },
];

//=== CAMBIÁ ACÁ las gemas que da la colección ===
//la primera vez que conseguis cada monstruo (segun su calidad)
let gemasPorDescubrir = { comun: 1, raro: 3, epico: 5, legendario: 10 };
//cuando conseguis todos los monstruos de una calidad
let gemasPorCompletar = { comun: 10, raro: 20, epico: 30, legendario: 50 };

function xpParaSubir(nivel) {
    return Math.round(xpBase * Math.pow(xpMultiplicador, nivel - 1));
}

function rangoDe(nivel) {
    let rango = rangos[0].nombre;
    for (let r of rangos) {
        if (nivel >= r.desde) {
            rango = r.nombre;
        }
    }
    return rango;
}

function gemasDelNivel(nivel) {
    return nivel % 5 === 0 ? gemasCadaCincoNiveles : gemasPorNivel;
}

//lo que se desbloquea al llegar a ese nivel (para mostrarlo al subir)
function desbloqueosDelNivel(nivel) {
    let lista = [];
    for (let caja of cajas) { //tienda.js
        if (caja.nivelRequerido === nivel) {
            lista.push(caja.nombre + " en la tienda");
        }
    }
    for (let estructura of estructuras) { //mapa.js
        if (!estructura.nivelPrimero) {
            continue;
        }
        let pasos = (nivel - estructura.nivelPrimero) / estructura.nivelCadaOtro;
        if (pasos >= 1 && Number.isInteger(pasos)) {
            lista.push("Construir otro " + estructura.nombre.toLowerCase());
        }
    }
    return lista;
}

//sumar experiencia; si alcanza, sube de nivel (una o varias veces)
function ganarXP(cantidad) {
    if (!cantidad) {
        return;
    }
    jugador.xp += cantidad;
    mostrarXPGanada(cantidad);
    while (jugador.xp >= xpParaSubir(jugador.nivel)) {
        jugador.xp -= xpParaSubir(jugador.nivel);
        jugador.nivel++;
        subirDeNivel(jugador.nivel);
    }
    mostrarNivel();
    mostrarRecursos(); //mapa.js (el menu de construir cambia con el nivel)
}

function subirDeNivel(nivel) {
    let gemas = gemasDelNivel(nivel);
    recursos.gemas += gemas;
    let desbloqueos = desbloqueosDelNivel(nivel);
    let rangoNuevo = rangoDe(nivel) !== rangoDe(nivel - 1);
    felicitarEspecial({ //felicitaciones.js
        subtitulo: "¡Subiste de nivel!",
        icono: "⭐",
        nombre: "Nivel " + nivel,
        etiqueta: rangoNuevo ? "Nuevo rango: " + rangoDe(nivel) : rangoDe(nivel),
        color: "nivel",
        nota: "Ganaste 💎 " + gemas,
        detalle: desbloqueos.length ? "Desbloqueaste: " + desbloqueos.join(" · ") : "",
    });
}

//=== GEMAS DE LA COLECCIÓN ===
//texto para la felicitacion del monstruo nuevo (se muestra antes de dar el premio, asi sale primero)
function textoDescubrimiento(color) {
    return "¡Monstruo nuevo para tu colección! 💎 +" + gemasPorDescubrir[monstruos[color].calidad];
}

//se llama cuando un monstruo nace por primera vez
function premiarDescubrimiento(color) {
    let calidad = monstruos[color].calidad;
    let gemas = gemasPorDescubrir[calidad];
    recursos.gemas += gemas;
    ganarXP(xpPor.descubrir);

    //¿completo todos los de esa calidad?
    let deEsaCalidad = Object.keys(monstruos).filter(function (c) { return monstruos[c].calidad === calidad; });
    let completa = deEsaCalidad.every(function (c) { return coleccion[c] > 0; });
    if (completa) {
        let premio = gemasPorCompletar[calidad];
        recursos.gemas += premio;
        felicitarEspecial({
            subtitulo: "¡Completaste una parte de la colección!",
            icono: "🏆",
            nombre: "Todos los " + calidades[calidad].nombre.toLowerCase() + "s",
            etiqueta: deEsaCalidad.length + " de " + deEsaCalidad.length,
            color: calidad,
            nota: "Ganaste 💎 " + premio,
        });
    }
}

//=== LO QUE SE VE ARRIBA A LA IZQUIERDA (al lado del perfil) ===
function mostrarNivel() {
    if (!document.getElementById("nivel-jugador")) {
        return; //el perfil tambien carga este archivo (para las formulas) y no tiene esta parte
    }
    let necesaria = xpParaSubir(jugador.nivel);
    document.getElementById("nivel-jugador").textContent = "Nv " + jugador.nivel;
    document.getElementById("texto-xp").textContent = jugador.xp + " / " + necesaria + " XP";
    document.getElementById("relleno-xp").style.width = Math.min(jugador.xp / necesaria * 100, 100) + "%";
}

//el "+10 XP" que sube al lado de la barra
function mostrarXPGanada(cantidad) {
    let flotante = document.createElement("div");
    flotante.className = "flotante-xp";
    flotante.textContent = "+" + cantidad + " XP";
    document.getElementById("hud-nivel").appendChild(flotante);
    setTimeout(function () { flotante.remove(); }, 1300);
}

mostrarNivel();
