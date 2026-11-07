//estructuras que se pueden construir

//info = lo que se muestra al hacer click en la estructura
//=== PRECIOS: CAMBIÁ ACÁ cuanto oro cuesta cada estructura ===
//primeraGratis = la primera que construyas no cuesta nada, las siguientes cuestan "precio"
//maximo = cuantas se pueden construir como mucho (si no tiene, no hay límite)
//
//=== PRODUCCIÓN Y MEJORAS: CAMBIÁ ACÁ (ver produccion.js) ===
//produce = que recurso junta ("comida" la granja, "oro" el hábitat)
//produccionBase / produccionPorNivel = cuanto da por segundo a nivel 1 / cuanto suma cada nivel (solo granja,
//    el hábitat produce lo que generan sus mounstruos, ver "calidades" en monstruos.js)
//maximoBase / maximoPorNivel = cuanto puede guardar antes de llenarse a nivel 1 / cuanto suma cada nivel
//capacidadBase / capacidadPorNivel = cuantos mounstruos entran a nivel 1 / cuantos lugares suma cada nivel (solo hábitat)
//mejoraBase = cuanto oro cuesta mejorar de nivel 1 a 2; mejoraMultiplicador = cada mejora cuesta esto por la anterior
//nivelMaximo = hasta que nivel se puede mejorar
//nivelPrimero / nivelCadaOtro = nivel de jugador que hace falta para construir la primera / cuantos niveles mas para cada una de las siguientes
//    (ej: 1 y 3 = la primera a nivel 1, la segunda a nivel 4, la tercera a nivel 7...). Si no tiene, no pide nivel

//las estructuras que ya se construyeron en el mapa
let construidas = [];

//recursos del jugador
let recursos = { oro: 0, comida: 0, gemas: 0 };

//nivel y experiencia del jugador (como se gana y que da subir de nivel: experiencia.js)
let jugador = { nivel: 1, xp: 0 };

let estructuras = [
    {
        nombre: "Incubadora", imagen: "../estructuras/incubadora.png", ancho: 150,
        info: "Acá se ponen los huevos para que eclosionen. Cuando el tiempo termina, reclamá al monstruo y va a tu inventario. Mejorándola podés incubar más huevos al mismo tiempo.",
        precio: 0, primeraGratis: true, maximo: 1, //es gratis y solo se puede tener una
        capacidadBase: 1, capacidadPorNivel: 1, //huevos a la vez: 1 a nivel 1, 2 a nivel 2...
        mejoraBase: 200, mejoraMultiplicador: 2, nivelMaximo: 5,
    },
    {
        nombre: "Granja", imagen: "../estructuras/granja.png", ancho: 120,
        info: "Produce comida para mejorar a tus mounstruos. Se va guardando hasta llegar al máximo, así que pasá seguido a reclamarla.",
        precio: 100, primeraGratis: true,
        produce: "comida",
        produccionBase: 1, produccionPorNivel: 1,
        maximoBase: 100, maximoPorNivel: 100,
        mejoraBase: 100, mejoraMultiplicador: 1.8, nivelMaximo: 10,
    },
    {
        nombre: "Hábitat", imagen: "../estructuras/habitat_terminado.png", ancho: 200,
        info: "El hogar de tus mounstruos: ellos generan oro. Cada hábitat es de una calidad y solo pueden vivir ahí los mounstruos de esa misma calidad.",
        precio: 250, primeraGratis: true,
        produce: "oro",
        maximoBase: 200, maximoPorNivel: 200,
        capacidadBase: 2, capacidadPorNivel: 1,
        nivelPrimero: 1, nivelCadaOtro: 3,
        mejoraBase: 150, mejoraMultiplicador: 2, nivelMaximo: 5,
    },
    {
        nombre: "Reservados", imagen: "../estructuras/reservados.png", ancho: 120,
        info: "Acá se cruzan dos mounstruos para conseguir uno nuevo.",
        //todavia no tiene mejoras (no tiene mejoraBase)
        precio: 150, //esta nunca es gratis
    },
];

//cuantas estructuras de ese tipo hay construidas
function cantidadConstruidas(estructura) {
    return construidas.filter(function (c) { return c.tipo === estructura; }).length;
}

//lo que cuesta ahora (la primera es gratis si tiene primeraGratis)
function precioActual(estructura) {
    if (estructura.primeraGratis && cantidadConstruidas(estructura) === 0) {
        return 0;
    }
    return estructura.precio;
}

//devuelve por que no se puede comprar (o null si se puede)
function motivoNoSePuede(estructura) {
    if (estructura.maximo && cantidadConstruidas(estructura) >= estructura.maximo) {
        return "Ya construida";
    }
    let nivelNecesario = nivelParaConstruir(estructura);
    if (jugador.nivel < nivelNecesario) {
        return "Nivel " + nivelNecesario;
    }
    if (recursos.oro < precioActual(estructura)) {
        return "Falta oro";
    }
    return null;
}

//nivel de jugador que hace falta para construir la proxima de este tipo (1 = no pide nada)
function nivelParaConstruir(estructura) {
    if (!estructura.nivelPrimero) {
        return 1;
    }
    return estructura.nivelPrimero + estructura.nivelCadaOtro * cantidadConstruidas(estructura);
}

function textoPrecio(estructura) {
    let precio = precioActual(estructura);
    return precio === 0 ? "Gratis" : "🪙 " + precio;
}



function mostrarRecursos() {
    document.getElementById("oro").textContent = recursos.oro;
    document.getElementById("comida").textContent = recursos.comida;
    document.getElementById("gemas").textContent = recursos.gemas;
    actualizarMenu(); //con mas o menos oro cambia lo que se puede comprar
}

let mapa = document.getElementById("mapa");
let menu = document.getElementById("menu-estructuras");
let fantasma = null; //la estructura que sigue al mouse antes de construirla

//armamos un boton por cada estructura (con su precio abajo)
for (let estructura of estructuras) {
    let boton = document.createElement("button");
    boton.innerHTML = '<img src="' + estructura.imagen + '">' + estructura.nombre
        + '<span class="precio"></span>';
    boton.onclick = function () {
        elegirEstructura(estructura);
    };
    estructura.boton = boton;
    menu.appendChild(boton);
}

//pone el precio en cada boton y apaga los que no se pueden comprar
function actualizarMenu() {
    for (let estructura of estructuras) {
        let motivo = motivoNoSePuede(estructura);
        let precio = estructura.boton.querySelector(".precio");
        let pideNivel = motivo && motivo.indexOf("Nivel") === 0;
        precio.textContent = motivo === "Ya construida" ? "Ya construida" : pideNivel ? "🔒 Desde " + motivo.toLowerCase() : textoPrecio(estructura);
        precio.classList.toggle("gratis", precioActual(estructura) === 0 && !motivo);
        estructura.boton.disabled = motivo !== null;
        estructura.boton.title = motivo || "";
    }
}

mostrarRecursos();

//abrir y cerrar el menu de estructuras
document.getElementById("boton-herramientas").onclick = function () {
    menu.classList.toggle("abierto");
};

function elegirEstructura(estructura) {
    if (motivoNoSePuede(estructura)) {
        return;
    }
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

//alto de la estructura en el mapa (segun el tamaño real de su imagen)
function altoDe(imagen, ancho) {
    if (!imagen.naturalWidth) {
        return ancho; //si la imagen todavia no cargo la tomamos cuadrada
    }
    return ancho * imagen.naturalHeight / imagen.naturalWidth;
}

//dos estructuras se pisan si sus rombos se tocan
//(como el mapa es isometrico usamos rombos en vez de rectangulos, asi se pueden poner mas juntas)
//CAMBIÁ ACÁ el 0.85 si queres que se puedan poner mas pegadas (mas chico) o mas separadas (mas grande)
let separacion = 0.85;
function sePisan(x1, y1, ancho1, alto1, x2, y2, ancho2, alto2) {
    let distanciaX = Math.abs(x1 - x2) / ((ancho1 + ancho2) / 2 * separacion);
    let distanciaY = Math.abs(y1 - y2) / ((alto1 + alto2) / 2 * separacion);
    return distanciaX + distanciaY < 1;
}

//se puede construir si los 4 bordes de la estructura quedan adentro del rombo
//y no queda encima de otra estructura
function sePuedeConstruir(x, y) {
    let ancho = parseInt(fantasma.style.width);
    let alto = altoDe(fantasma, ancho);
    let mitad = ancho / 2;
    let adentro = dentroDelRombo(x - mitad, y) && dentroDelRombo(x + mitad, y)
        && dentroDelRombo(x, y - mitad) && dentroDelRombo(x, y + mitad);
    if (!adentro) {
        return false;
    }
    for (let otra of construidas) {
        if (sePisan(x, y, ancho, alto, otra.x, otra.y, otra.tipo.ancho, altoDe(otra.imagen, otra.tipo.ancho))) {
            return false;
        }
    }
    return true;
}

//=== ZOOM: CAMBIÁ ACÁ los límites y la velocidad ===
let zoom = 1;          //zoom inicial (1 = tamaño normal)
let zoomMinimo = 0.5;  //lo más lejos que se puede alejar
let zoomMaximo = 2.5;  //lo más cerca que se puede acercar
let pasoZoom = 1.1;    //cuanto cambia con cada movimiento de la rueda

//con la rueda del mouse se hace zoom solo en el mapa (los botones y recursos no cambian)
window.addEventListener("wheel", function (evento) {
    if (evento.target.closest(".misiones, #seleccion, #ventana-fondo")) {
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
        //si esta afuera del rombo o encima de otra estructura se pone en rojo
        fantasma.classList.toggle("bloqueado", !sePuedeConstruir(x, y));
    }
};

//pone una estructura en el mapa (se usa al construir y al cargar la partida guardada)
//extra = datos que se guardan con la estructura (oro de la granja, huevo de la incubadora, monstruos del habitat)
function ponerEstructura(tipo, x, y, extra, imagen) {
    if (!imagen) {
        imagen = document.createElement("img");
        imagen.src = tipo.imagen;
        imagen.style.width = tipo.ancho + "px";
        mapa.appendChild(imagen);
    }
    imagen.className = "estructura";
    imagen.style.left = x + "px";
    imagen.style.top = y + "px";
    imagen.style.zIndex = Math.round(y); //las de mas abajo se dibujan adelante

    //la guardamos en la lista de construidas y al hacerle click se abre su info
    //nivel = nivel de mejora, guardado = comida/oro juntado sin reclamar, ultimoCalculo = desde cuando se cuenta
    let construida = {
        tipo: tipo, imagen: imagen, x: x, y: y,
        nivel: 1, guardado: 0, ultimoCalculo: Date.now(),
        huevos: [], monstruos: [], calidad: null, //huevos: los que se estan incubando { color, fin }
    };
    Object.assign(construida, extra);
    construidas.push(construida);
    imagen.onclick = function (evento) {
        if (!fantasma && !seMovio) {
            evento.stopPropagation();
            seleccionar(construida); //interfaz.js
        }
    };
    dibujarMarcador(construida); //el huevo o los monstruos que se ven arriba (monstruos.js)
    return construida;
}

//al hacer click en el mapa se construye (o, si no se esta construyendo, se deselecciona la estructura)
mapa.onclick = function (evento) {
    if (!fantasma && !seMovio) {
        deseleccionar(); //interfaz.js
    }
    if (fantasma) {
        mapa.onmousemove(evento);
        let tipo = fantasma.datos;
        if (fantasma.classList.contains("bloqueado") || motivoNoSePuede(tipo)) {
            return; //afuera del rombo, encima de otra o sin oro no se construye
        }
        recursos.oro -= precioActual(tipo); //se cobra la estructura (antes de ponerla, si no la primera dejaria de ser gratis)
        ponerEstructura(tipo, parseFloat(fantasma.style.left), parseFloat(fantasma.style.top), {}, fantasma);
        fantasma = null;

        //avisamos a las misiones (misiones.js)
        sumarProgreso("estructuras");
        ganarXP(xpPor.construir); //experiencia.js
        if (tipo.nombre === "Incubadora") {
            sumarProgreso("incubadoras");
        }
        mostrarRecursos();
        guardarPartida();
    }
};

//con Escape se cancela la construccion
document.onkeydown = function (evento) {
    if (evento.key === "Escape" && fantasma) {
        fantasma.remove();
        fantasma = null;
    } else if (evento.key === "Escape") {
        cerrarConEscape(); //interfaz.js (primero la ventana, despues la seleccion)
    }
};

//=== LO QUE APARECE AL TOCAR UNA ESTRUCTURA (botones y ventanas) ESTÁ EN interfaz.js ===

//4 veces por segundo: los huevos van contando y la comida/oro va subiendo
setInterval(function () {
    actualizarIncubadoras(); //monstruos.js
    actualizarBurbujas(); //produccion.js
    actualizarInterfaz(); //interfaz.js
}, 250);
