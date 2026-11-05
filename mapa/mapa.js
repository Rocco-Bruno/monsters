//estructuras que se pueden construir

let estructuras = [
    { nombre: "Granja", imagen: "../estructuras/granja.png", ancho: 120 },
    { nombre: "Incubadora", imagen: "../estructuras/incubadora.png", ancho: 150 },
    { nombre: "Reservados", imagen: "../estructuras/reservados.png", ancho: 120 },
];

//recursos del jugador
let recursos = { oro: 500, comida: 200, gemas: 5000 };

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

mapa.onmousedown = function (evento) {
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
    }
};
