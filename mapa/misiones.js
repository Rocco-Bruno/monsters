//=== MISIONES ===
//siempre hay algunas misiones activas. Arriba quedan las que faltan y abajo las que ya reclamaste;
//las reclamadas se van despues de un rato y entra una nueva en su lugar.
//Primero salen las misiones principales (como un tutorial) y cuando se terminan el juego arma misiones
//nuevas segun tu nivel: cuanto mas alto, mas dificiles y con mejores premios.

//cuanto hizo el jugador de cada cosa (lo usan las misiones para saber si se cumplieron)
let progreso = {
    estructuras: 0, incubadoras: 0, huevos: 0, mejorasGranja: 0, mejorasEstructura: 0,
    mejorasMonstruo: 0, compras: 0, cajas: 0, oroReclamado: 0, comidaReclamada: 0, misiones: 0,
};

//=== CAMBIÁ ACÁ ===
let cantidadMisiones = 4;       //cuantas misiones hay a la vez (contando las reclamadas que todavia no se fueron)
let segundosAntesDeIrse = 90;   //cuanto tarda en irse una mision reclamada

//misiones principales (salen en este orden, una sola vez)
//tipo = que cosa del progreso cuenta, meta = cuanto hay que hacer (contando todo lo que hiciste desde el principio)
//premio = "oro" o "gemas" (las dificiles dan gemas), cantidad = cuanto se gana
//premio = "huevo" da un huevo al inventario, cantidad = el color del huevo (ver datos-monstruos.js)
let misionesPrincipales = [
    { texto: "Construí tu primera estructura", tipo: "estructuras", meta: 1, premio: "oro", cantidad: 100 },
    { texto: "Construí una incubadora", tipo: "incubadoras", meta: 1, premio: "huevo", cantidad: "rojo" },
    { texto: "Eclosioná 1 huevo", tipo: "huevos", meta: 1, premio: "oro", cantidad: 200 },
    { texto: "Eclosioná 3 huevos", tipo: "huevos", meta: 3, premio: "oro", cantidad: 500 },
    { texto: "Mejorá 1 vez la granja", tipo: "mejorasGranja", meta: 1, premio: "oro", cantidad: 300 },
    { texto: "Construí 10 estructuras", tipo: "estructuras", meta: 10, premio: "gemas", cantidad: 3 },
    { texto: "Eclosioná 10 huevos", tipo: "huevos", meta: 10, premio: "gemas", cantidad: 5 },
    { texto: "Mejorá 5 veces la granja", tipo: "mejorasGranja", meta: 5, premio: "gemas", cantidad: 10 },
];

//moldes para armar misiones nuevas cuando se terminan las principales
//{n} se reemplaza por la meta: base a nivel 1, y suma porNivel por cada nivel del jugador
//(estas cuentan desde que aparece la mision, no desde el principio del juego)
let moldesMisiones = [
    { tipo: "huevos", texto: "Eclosioná {n} huevos", base: 2, porNivel: 0.5 },
    { tipo: "compras", texto: "Comprá {n} huevos en la tienda", base: 2, porNivel: 0.4 },
    { tipo: "cajas", texto: "Abrí {n} cajas", base: 1, porNivel: 0.3 },
    { tipo: "mejorasMonstruo", texto: "Mejorá {n} veces a tus monstruos", base: 2, porNivel: 0.5 },
    { tipo: "mejorasEstructura", texto: "Mejorá {n} veces tus estructuras", base: 1, porNivel: 0.25 },
    { tipo: "oroReclamado", texto: "Juntá 🪙 {n} de tus hábitats", base: 200, porNivel: 150 },
    { tipo: "comidaReclamada", texto: "Juntá 🍖 {n} de tus granjas", base: 100, porNivel: 80 },
];

//premios de las misiones armadas (chance en %; el resto da oro)
let chanceMisionGemas = 20;   //da 1 gema + 1 cada 3 niveles
let chanceMisionHuevo = 15;   //da un huevo común o raro al azar
function oroDeMisionArmada(nivel) {
    return 150 + 75 * (nivel - 1);
}

//las misiones activas (se guardan con la partida)
//cada una: { texto, tipo, meta, inicio, premio, cantidad, reclamada, reclamadaEn }
let misiones = [];
let siguientePrincipal = 0; //cual de las principales sale despues

let listaMisiones = document.getElementById("lista-misiones");
let botonMisiones = document.getElementById("boton-misiones");

//abrir y cerrar el panel de misiones
botonMisiones.onclick = function () {
    listaMisiones.classList.toggle("abierto");
    document.getElementById("inventario").classList.remove("abierto"); //no se abren los dos juntos
};

//llamar a esta funcion cada vez que el jugador hace algo
//ejemplo: sumarProgreso("huevos") cuando eclosiona un huevo, sumarProgreso("oroReclamado", 50)
function sumarProgreso(tipo, cantidad) {
    progreso[tipo] = (progreso[tipo] || 0) + (cantidad || 1);
    mostrarMisiones();
}

//cuanto lleva hecho de esa mision
function hechoDe(mision) {
    return Math.min(progreso[mision.tipo] - mision.inicio, mision.meta);
}

function estaCumplida(mision) {
    return hechoDe(mision) >= mision.meta;
}

//=== ARMAR MISIONES NUEVAS ===
function nuevaMision() {
    if (siguientePrincipal < misionesPrincipales.length) {
        let principal = misionesPrincipales[siguientePrincipal];
        siguientePrincipal++;
        return Object.assign({ inicio: 0, reclamada: false }, principal); //cuentan desde el principio
    }
    return misionArmada();
}

function misionArmada() {
    let nivel = jugador.nivel;
    //que no se repita el tipo de una que ya esta activa
    let usados = misiones.map(function (m) { return m.tipo; });
    let posibles = moldesMisiones.filter(function (m) { return usados.indexOf(m.tipo) === -1; });
    if (posibles.length === 0) {
        posibles = moldesMisiones;
    }
    let molde = posibles[Math.floor(Math.random() * posibles.length)];
    let meta = Math.max(1, Math.round(molde.base + molde.porNivel * (nivel - 1)));

    let mision = {
        texto: molde.texto.replace("{n}", meta), tipo: molde.tipo, meta: meta,
        inicio: progreso[molde.tipo] || 0, reclamada: false,
    };
    let tirada = Math.random() * 100;
    if (tirada < chanceMisionGemas) {
        mision.premio = "gemas";
        mision.cantidad = 1 + Math.floor(nivel / 3);
    } else if (tirada < chanceMisionGemas + chanceMisionHuevo) {
        let huevos = Object.keys(monstruos).filter(function (c) {
            let calidad = monstruos[c].calidad;
            return !monstruos[c].exclusivo && (calidad === "comun" || calidad === "raro");
        });
        mision.premio = "huevo";
        mision.cantidad = huevos[Math.floor(Math.random() * huevos.length)];
    } else {
        mision.premio = "oro";
        mision.cantidad = oroDeMisionArmada(nivel);
    }
    return mision;
}

//completa la lista hasta tener "cantidadMisiones"
function rellenarMisiones() {
    while (misiones.length < cantidadMisiones) {
        misiones.push(nuevaMision());
    }
}

//=== RECLAMAR ===
function reclamar(mision) {
    if (mision.reclamada || !estaCumplida(mision)) {
        return;
    }
    if (mision.premio === "huevo") {
        inventario.huevos.push(mision.cantidad); //el huevo va al inventario (monstruos.js)
        felicitar("huevo", mision.cantidad, "Premio de misión"); //felicitaciones.js
    } else {
        recursos[mision.premio] += mision.cantidad;
    }
    mision.reclamada = true;
    mision.reclamadaEn = Date.now();
    sumarProgreso("misiones");
    ganarXP(xpPor.mision); //experiencia.js
    mostrarMisiones();
    refrescar(); //redibuja recursos, inventario y guarda
}

//lo que se muestra como premio en la lista
function textoPremio(mision) {
    if (mision.premio === "huevo") {
        return "🥚 Huevo " + monstruos[mision.cantidad].nombre.toLowerCase();
    }
    return (mision.premio === "oro" ? "🪙 " : "💎 ") + mision.cantidad;
}

//"1:05" = segundos que le quedan a una mision reclamada antes de irse
function textoSeVa(mision) {
    let quedan = Math.max(0, Math.ceil((mision.reclamadaEn + segundosAntesDeIrse * 1000 - Date.now()) / 1000));
    return Math.floor(quedan / 60) + ":" + String(quedan % 60).padStart(2, "0");
}

//=== DIBUJAR LA LISTA ===
//orden: primero las que se pueden reclamar, despues las que faltan, abajo de todo las reclamadas
function ordenDe(mision) {
    if (mision.reclamada) {
        return 2;
    }
    return estaCumplida(mision) ? 0 : 1;
}

function mostrarMisiones() {
    listaMisiones.innerHTML = "<h2>Misiones</h2>";
    let hayPremio = false;
    let ordenadas = misiones.slice().sort(function (a, b) { return ordenDe(a) - ordenDe(b); });
    let yaPusoSeparador = false;

    for (let mision of ordenadas) {
        if (mision.reclamada && !yaPusoSeparador) {
            listaMisiones.insertAdjacentHTML("beforeend", '<p class="separador-misiones">Completadas</p>');
            yaPusoSeparador = true;
        }
        let fila = document.createElement("div");
        fila.className = "mision";
        fila.innerHTML = "<p>" + mision.texto + "</p>"
            + "<span>" + Math.max(hechoDe(mision), 0) + "/" + mision.meta + "</span> "
            + "<span>" + textoPremio(mision) + "</span>";

        if (mision.reclamada) {
            fila.classList.add("reclamada");
            fila.insertAdjacentHTML("beforeend", '<span class="se-va">✔ Se va en <b>' + textoSeVa(mision) + "</b></span>");
            mision.fila = fila; //para actualizar la cuenta regresiva sin redibujar todo
        } else if (estaCumplida(mision)) {
            fila.classList.add("cumplida");
            let boton = document.createElement("button");
            boton.textContent = "Reclamar";
            boton.onclick = function () {
                reclamar(mision);
            };
            fila.appendChild(boton);
            hayPremio = true;
        }
        listaMisiones.appendChild(fila);
    }

    //el boton se pone amarillo si hay algun premio para reclamar
    botonMisiones.classList.toggle("hay-premio", hayPremio);
}

//cada segundo: las reclamadas que ya cumplieron su tiempo se van y entran nuevas
function actualizarMisiones() {
    let antes = misiones.length;
    misiones = misiones.filter(function (m) {
        return !(m.reclamada && Date.now() - m.reclamadaEn >= segundosAntesDeIrse * 1000);
    });
    if (misiones.length !== antes) {
        rellenarMisiones();
        mostrarMisiones();
        guardarPartida(); //guardado.js
        return;
    }
    for (let mision of misiones) {
        if (mision.reclamada && mision.fila) {
            mision.fila.querySelector(".se-va b").textContent = textoSeVa(mision);
        }
    }
}

rellenarMisiones();
mostrarMisiones();
setInterval(actualizarMisiones, 1000);
