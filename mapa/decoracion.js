//=== DECORACIÓN: árboles y piedras repartidos al azar alrededor del rombo ===
//son solo de adorno: no se pueden tocar y no ocupan lugar para construir (todo queda fuera del rombo)
//(se carga despues de mapa.js porque usa "mapa" y "rombo")

//=== CAMBIÁ ACÁ ===
//src = dibujo en assets/png/decoracion/ (32x32, un solo cuadro)
//tamano = de cuantos pixeles se dibuja en el mapa (puede variar un poco, ver "variacion")
//peso = que tan seguido sale comparado con los demas (2 = sale el doble que uno con 1)
let decoraciones = [
    { src: "arbol1.png", tamano: 80, peso: 3 },
    { src: "arbol2.png", tamano: 80, peso: 3 },
    { src: "arbol3.png", tamano: 80, peso: 3 },
    { src: "piedra1.png", tamano: 56, peso: 2 },
    { src: "piedra2.png", tamano: 56, peso: 2 },
];
let carpetaDecoracion = "../assets/png/decoracion/";
let cantidadDecoracion = 70;   //cuantos dibujos se intentan poner
let variacion = 0.25;          //0.25 = cada uno puede ser hasta 25% mas grande o mas chico
let separacionDecoracion = 0.7; //que tan juntos pueden estar (1 = sin pisarse nada, menos = se pisan un poco)
let margenRombo = 10;          //pixeles de aire entre los dibujos y el borde del rombo
//la "semilla": con el mismo numero siempre sale el mismo bosque. Cambialo para probar otra distribucion
let semillaDecoracion = 7;

//numeros al azar que siempre salen iguales con la misma semilla (asi el mapa no cambia cada vez que entrás)
function azarConSemilla(semilla) {
    return function () {
        semilla = (semilla + 0x6D2B79F5) | 0;
        let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

//true si el punto esta adentro del rombo agrandado "margen" pixeles
function cercaDelRombo(x, y, margen) {
    let distanciaX = Math.abs(x - rombo.centroX) / (rombo.mitadAncho + margen);
    let distanciaY = Math.abs(y - rombo.centroY) / (rombo.mitadAlto + margen);
    return distanciaX + distanciaY <= 1;
}

function elegirDecoracion(azar) {
    let total = decoraciones.reduce(function (suma, d) { return suma + d.peso; }, 0);
    let tirada = azar() * total;
    for (let decoracion of decoraciones) {
        tirada -= decoracion.peso;
        if (tirada < 0) {
            return decoracion;
        }
    }
    return decoraciones[0];
}

function ponerDecoracion() {
    let azar = azarConSemilla(semillaDecoracion);
    let ancho = mapa.offsetWidth;
    let alto = mapa.offsetHeight;
    let puestas = []; //{ x, y, tamano } (x, y = centro del dibujo)
    for (let intento = 0; intento < cantidadDecoracion * 20 && puestas.length < cantidadDecoracion; intento++) {
        let decoracion = elegirDecoracion(azar);
        let tamano = Math.round(decoracion.tamano * (1 - variacion + azar() * variacion * 2));
        let mitad = tamano / 2;
        let x = mitad + azar() * (ancho - tamano);
        let y = mitad + azar() * (alto - tamano);

        //ninguna esquina del dibujo puede tocar el rombo
        let tocaRombo = [[-1, -1], [1, -1], [-1, 1], [1, 1]].some(function (esquina) {
            return cercaDelRombo(x + esquina[0] * mitad, y + esquina[1] * mitad, margenRombo);
        });
        let muyCerca = puestas.some(function (otra) {
            let distancia = Math.hypot(x - otra.x, y - otra.y);
            return distancia < (tamano + otra.tamano) / 2 * separacionDecoracion;
        });
        if (tocaRombo || muyCerca) {
            continue;
        }
        puestas.push({ x: x, y: y, tamano: tamano });

        let imagen = document.createElement("img");
        imagen.className = "decoracion";
        imagen.src = carpetaDecoracion + decoracion.src;
        imagen.style.width = tamano + "px";
        imagen.style.left = (x - mitad) + "px";
        imagen.style.top = (y - mitad) + "px";
        imagen.style.zIndex = Math.round(y + mitad); //igual que las estructuras: las de mas abajo van adelante
        if (azar() < 0.5) {
            imagen.style.transform = "scaleX(-1)"; //algunas dadas vuelta para que no se vean todas iguales
        }
        mapa.appendChild(imagen);
    }
}

ponerDecoracion();


//=== BOSQUE ALREDEDOR DEL MAPA ===
//lo que queda afuera del mapa (se ve al alejar con la rueda) tambien se llena de árboles y piedras.
//se dibuja en un canvas detras del mapa que sigue el zoom y el arrastre, y nunca se termina para ningun lado.
//el bosque se arma en una grilla: en cada cuadrito puede haber un dibujo (siempre el mismo en el mismo lugar)

//CAMBIÁ ACÁ
let cuadritoBosque = 70;      //tamaño de cada cuadrito de la grilla (mas chico = bosque mas tupido)
let chanceBosque = 0.75;      //chance de que un cuadrito tenga dibujo (1 = todos)

let imagenesDecoracion = decoraciones.map(function (decoracion) {
    let imagen = new Image();
    imagen.onload = function () { ultimoDibujo = ""; }; //cuando carga se vuelve a dibujar
    imagen.src = carpetaDecoracion + decoracion.src;
    return imagen;
});

let bosque = document.createElement("canvas");
bosque.className = "bosque";
document.body.insertBefore(bosque, document.body.firstChild);

//un numero al azar fijo para cada cuadrito (cx, cy) y cada "cosa" n que se sortea
function azarDeCuadrito(cx, cy, n) {
    let h = Math.imul(cx, 374761393) + Math.imul(cy, 668265263) + Math.imul(n + semillaDecoracion, 2246822519);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296;
}

//el dibujo de un cuadrito (o null si queda vacio o pisaria el mapa)
function dibujoDeCuadrito(cx, cy, anchoMapa, altoMapa) {
    if (azarDeCuadrito(cx, cy, 0) > chanceBosque) {
        return null;
    }
    let total = decoraciones.reduce(function (suma, d) { return suma + d.peso; }, 0);
    let tirada = azarDeCuadrito(cx, cy, 1) * total;
    let cual = 0;
    while (tirada >= decoraciones[cual].peso && cual < decoraciones.length - 1) {
        tirada -= decoraciones[cual].peso;
        cual++;
    }
    let tamano = decoraciones[cual].tamano * (1 - variacion + azarDeCuadrito(cx, cy, 2) * variacion * 2);
    let x = (cx + azarDeCuadrito(cx, cy, 3)) * cuadritoBosque - tamano / 2;
    let y = (cy + azarDeCuadrito(cx, cy, 4)) * cuadritoBosque - tamano / 2;
    //si toca el mapa no se dibuja (adentro del mapa ya estan los de ponerDecoracion)
    if (x + tamano > 0 && x < anchoMapa && y + tamano > 0 && y < altoMapa) {
        return null;
    }
    return { cual: cual, x: x, y: y, tamano: tamano, darVuelta: azarDeCuadrito(cx, cy, 5) < 0.5 };
}

let ultimoDibujo = "";

function dibujarBosque() {
    let borde = mapa.getBoundingClientRect();
    let ancho = window.innerWidth;
    let alto = window.innerHeight;
    let escalaPantalla = window.devicePixelRatio || 1;
    //solo se vuelve a dibujar si algo cambio (zoom, arrastre o tamaño de la ventana)
    let estado = [borde.left, borde.top, zoom, ancho, alto, escalaPantalla].join(",");
    if (estado === ultimoDibujo) {
        return;
    }
    ultimoDibujo = estado;

    bosque.width = Math.round(ancho * escalaPantalla);
    bosque.height = Math.round(alto * escalaPantalla);
    let pincel = bosque.getContext("2d");
    pincel.imageSmoothingEnabled = false; //pixel art nitido
    pincel.setTransform(escalaPantalla, 0, 0, escalaPantalla, 0, 0);

    //que parte del mundo (en pixeles del mapa) se ve en pantalla
    let desdeX = Math.floor((-borde.left / zoom) / cuadritoBosque) - 2;
    let hastaX = Math.ceil(((ancho - borde.left) / zoom) / cuadritoBosque) + 1;
    let desdeY = Math.floor((-borde.top / zoom) / cuadritoBosque) - 2;
    let hastaY = Math.ceil(((alto - borde.top) / zoom) / cuadritoBosque) + 1;

    let dibujos = [];
    for (let cy = desdeY; cy <= hastaY; cy++) {
        for (let cx = desdeX; cx <= hastaX; cx++) {
            let dibujo = dibujoDeCuadrito(cx, cy, borde.width / zoom, borde.height / zoom);
            if (dibujo) {
                dibujos.push(dibujo);
            }
        }
    }
    //los de mas abajo se dibujan despues (adelante)
    dibujos.sort(function (a, b) { return (a.y + a.tamano) - (b.y + b.tamano); });
    for (let dibujo of dibujos) {
        let imagen = imagenesDecoracion[dibujo.cual];
        if (!imagen.complete || !imagen.naturalWidth) {
            continue;
        }
        let x = borde.left + dibujo.x * zoom;
        let y = borde.top + dibujo.y * zoom;
        let lado = dibujo.tamano * zoom;
        if (dibujo.darVuelta) {
            pincel.save();
            pincel.translate(x + lado, y);
            pincel.scale(-1, 1);
            pincel.drawImage(imagen, 0, 0, lado, lado);
            pincel.restore();
        } else {
            pincel.drawImage(imagen, x, y, lado, lado);
        }
    }
}

//se revisa en cada cuadro de animacion (es barato: solo dibuja si algo se movio)
(function seguirBosque() {
    dibujarBosque();
    requestAnimationFrame(seguirBosque);
})();
