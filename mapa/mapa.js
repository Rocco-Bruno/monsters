//estructuras que se pueden construir

//info = lo que se muestra al hacer click en la estructura
//oroPorSegundo y maximoOro solo los usa la granja (CAMBIÁ ACÁ cuanto produce)
let estructuras = [
    {
        nombre: "Granja", imagen: "../estructuras/granja.png", ancho: 120,
        info: "Produce oro con el paso del tiempo. El oro se va guardando hasta llegar al máximo, así que pasá seguido a reclamarlo.",
        oroPorSegundo: 1, maximoOro: 300,
    },
    {
        nombre: "Incubadora", imagen: "../estructuras/incubadora.png", ancho: 150,
        info: "Acá se ponen los huevos para que eclosionen.",
    },
    {
        nombre: "Reservados", imagen: "../estructuras/reservados.png", ancho: 120,
        info: "Guarda a los monstruos que no están en ningún hábitat.",
    },
];

//las estructuras que ya se construyeron en el mapa
let construidas = [];

//recursos del jugador
let recursos = { oro: 0, comida: 0, gemas: 0 };

function mostrarRecursos() {
    document.getElementById("oro").textContent = recursos.oro;
    document.getElementById("comida").textContent = recursos.comida;
    document.getElementById("gemas").textContent = recursos.gemas;
}

mostrarRecursos();

let mapa = document.getElementById("mapa");
let menu = document.getElementById("menu-estructuras");
let fantasma = null; //la estructura que sigue al mouse antes de construirla

//armamos un boton por cada estructura
for (let estructura of estructuras) {
    let boton = document.createElement("button");
    boton.innerHTML = '<img src="' + estructura.imagen + '">' + estructura.nombre;
    boton.onclick = function () {
        elegirEstructura(estructura);
    };
    menu.appendChild(boton);
}

//abrir y cerrar el menu de estructuras
document.getElementById("boton-herramientas").onclick = function () {
    menu.classList.toggle("abierto");
};

function elegirEstructura(estructura) {
    if (fantasma) {
        fantasma.remove();
    }
    fantasma = document.createElement("img");
    fantasma.src = estructura.imagen;
    fantasma.style.width = estructura.ancho + "px";
    fantasma.className = "estructura fantasma";
    fantasma.dataset.nombre = estructura.nombre;
    fantasma.datos = estructura; //guardamos de que tipo es para usarlo al construir
    fantasma.style.left = "-1000px"; //escondido hasta que se mueva el mouse
    mapa.appendChild(fantasma);
    menu.classList.remove("abierto");
}

//el rombo donde se puede construir (medido sobre el mapa de 1200x902)
let rombo = { centroX: 604, centroY: 424, mitadAncho: 469, mitadAlto: 358 };

function dentroDelRombo(x, y) {
    let distanciaX = Math.abs(x - rombo.centroX) / rombo.mitadAncho;
    let distanciaY = Math.abs(y - rombo.centroY) / rombo.mitadAlto;
    return distanciaX + distanciaY <= 1;
}

//se puede construir si los 4 bordes de la estructura quedan adentro del rombo
function sePuedeConstruir(x, y) {
    let mitad = parseInt(fantasma.style.width) / 2;
    return dentroDelRombo(x - mitad, y) && dentroDelRombo(x + mitad, y)
        && dentroDelRombo(x, y - mitad) && dentroDelRombo(x, y + mitad);
}

//=== ZOOM: CAMBIÁ ACÁ los límites y la velocidad ===
let zoom = 1;          //zoom inicial (1 = tamaño normal)
let zoomMinimo = 0.5;  //lo más lejos que se puede alejar
let zoomMaximo = 2.5;  //lo más cerca que se puede acercar
let pasoZoom = 1.1;    //cuanto cambia con cada movimiento de la rueda

//con la rueda del mouse se hace zoom solo en el mapa (los botones y recursos no cambian)
window.addEventListener("wheel", function (evento) {
    if (evento.target.closest(".misiones")) {
        return; //sobre el panel de misiones la rueda baja la lista en vez de hacer zoom
    }
    evento.preventDefault(); //para que la rueda no mueva la pagina
    let punto = puntoEnElMapa(evento); //el punto del mapa que esta debajo del mouse

    if (evento.deltaY < 0) {
        zoom = zoom * pasoZoom;
    } else {
        zoom = zoom / pasoZoom;
    }
    zoom = Math.min(Math.max(zoom, zoomMinimo), zoomMaximo);
    mapa.style.zoom = zoom;

    //movemos la pantalla para que ese punto siga debajo del mouse
    let borde = mapa.getBoundingClientRect();
    window.scrollBy(borde.left + punto.x * zoom - evento.clientX, borde.top + punto.y * zoom - evento.clientY);
}, { passive: false });

//pasa la posicion del mouse en pantalla a una posicion dentro del mapa (sin zoom)
function puntoEnElMapa(evento) {
    let borde = mapa.getBoundingClientRect();
    return {
        x: (evento.clientX - borde.left) / zoom,
        y: (evento.clientY - borde.top) / zoom,
    };
}

//arrastrando el mapa con el mouse se mueve la pantalla
let arrastrando = false;
let seMovio = false; //para no abrir la info de una estructura si en realidad se arrastro el mapa

mapa.onmousedown = function (evento) {
    seMovio = false;
    if (!fantasma) {
        arrastrando = true;
        evento.preventDefault(); //para que no se seleccione la imagen
    }
};

document.onmouseup = function () {
    arrastrando = false;
};

document.addEventListener("mousemove", function (evento) {
    if (arrastrando) {
        if (Math.abs(evento.movementX) + Math.abs(evento.movementY) > 2) {
            seMovio = true;
        }
        window.scrollBy(-evento.movementX, -evento.movementY);
    }
});

//el fantasma sigue al mouse
mapa.onmousemove = function (evento) {
    if (fantasma) {
        let punto = puntoEnElMapa(evento);
        let x = punto.x;
        let y = punto.y;
        fantasma.style.left = x + "px";
        fantasma.style.top = y + "px";
        //si esta afuera del rombo se pone en rojo
        fantasma.classList.toggle("bloqueado", !sePuedeConstruir(x, y));
    }
};

//al hacer click en el mapa se construye
mapa.onclick = function (evento) {
    if (fantasma) {
        mapa.onmousemove(evento);
        if (fantasma.classList.contains("bloqueado")) {
            return; //afuera del rombo no se construye
        }
        fantasma.className = "estructura";
        fantasma.style.zIndex = parseInt(fantasma.style.top); //las de mas abajo se dibujan adelante

        //la guardamos en la lista de construidas y al hacerle click se abre su info
        let construida = { tipo: fantasma.datos, imagen: fantasma, ultimoReclamo: Date.now() };
        construidas.push(construida);
        fantasma.onclick = function (evento) {
            if (!fantasma && !seMovio) {
                evento.stopPropagation();
                abrirInfo(construida);
            }
        };

        //avisamos a las misiones (misiones.js)
        sumarProgreso("estructuras");
        if (fantasma.dataset.nombre === "Incubadora") {
            sumarProgreso("incubadoras");
        }
        fantasma = null;
    }
};

//con Escape se cancela la construccion
document.onkeydown = function (evento) {
    if (evento.key === "Escape" && fantasma) {
        fantasma.remove();
        fantasma = null;
    } else if (evento.key === "Escape") {
        cerrarInfo();
    }
};

//=== PANEL DE INFORMACION DE LAS ESTRUCTURAS ===
let panelInfo = document.getElementById("info-estructura");
let abierta = null; //la estructura que se esta mirando

//cuanto oro junto la granja desde la ultima vez que se reclamo
function oroGuardado(construida) {
    let segundos = (Date.now() - construida.ultimoReclamo) / 1000;
    return Math.min(Math.floor(segundos * construida.tipo.oroPorSegundo), construida.tipo.maximoOro);
}

function abrirInfo(construida) {
    abierta = construida;
    let tipo = construida.tipo;
    panelInfo.innerHTML = '<button class="cerrar" title="Cerrar">✕</button>'
        + '<img src="' + tipo.imagen + '">'
        + "<h2>" + tipo.nombre + "</h2>"
        + "<p>" + tipo.info + "</p>";
    panelInfo.querySelector(".cerrar").onclick = cerrarInfo;

    //cosas especiales de cada estructura
    if (tipo.nombre === "Granja") {
        let datos = document.createElement("div");
        datos.className = "datos-granja";
        datos.innerHTML = "<span>🪙 " + tipo.oroPorSegundo + " oro por segundo</span>"
            + "<span>Máximo: 🪙 " + tipo.maximoOro + "</span>"
            + '<span>Guardado: 🪙 <b id="oro-guardado"></b></span>';
        let boton = document.createElement("button");
        boton.className = "reclamar";
        boton.id = "boton-reclamar";
        boton.onclick = function () {
            reclamarOro(construida);
        };
        panelInfo.appendChild(datos);
        panelInfo.appendChild(boton);
    }

    panelInfo.classList.add("abierto");
    actualizarInfo();
}

function cerrarInfo() {
    abierta = null;
    panelInfo.classList.remove("abierto");
}

function reclamarOro(construida) {
    let oro = oroGuardado(construida);
    if (oro === 0) {
        return;
    }
    recursos.oro += oro;
    construida.ultimoReclamo = Date.now(); //empieza a juntar de nuevo desde cero
    mostrarRecursos();
    actualizarInfo();
}

//actualiza los numeros del panel (el oro de la granja va subiendo solo)
function actualizarInfo() {
    if (!abierta || abierta.tipo.nombre !== "Granja") {
        return;
    }
    let oro = oroGuardado(abierta);
    let lleno = oro >= abierta.tipo.maximoOro;
    document.getElementById("oro-guardado").textContent = oro + (lleno ? " (¡lleno!)" : "");
    let boton = document.getElementById("boton-reclamar");
    boton.textContent = "Reclamar 🪙 " + oro;
    boton.disabled = oro === 0;
}

setInterval(actualizarInfo, 250);
