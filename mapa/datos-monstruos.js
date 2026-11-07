//=== DATOS DE LOS MOUNSTRUOS: calidades, lista de mounstruos y sus dibujos ===
//lo usan el mapa y el perfil (por eso esta en un archivo aparte, sin nada del mapa)

//=== CALIDADES: CAMBIÁ ACÁ ===
//tiempoEclosion = segundos que tarda el huevo, ventaHuevo = oro que da al venderlo, precioHuevo = oro que cuesta en la tienda
//oroPorSegundo = oro que genera el monstruo en un hábitat a nivel 1 (a nivel 2 genera el doble, a nivel 3 el triple...)
//comidaMejora = comida para pasar de nivel 1 a 2 (de 2 a 3 cuesta el doble, de 3 a 4 el triple...)
let calidades = {
    comun: { nombre: "Común", tiempoEclosion: 10, ventaHuevo: 50, precioHuevo: 100, oroPorSegundo: 1, comidaMejora: 20 },
    raro: { nombre: "Raro", tiempoEclosion: 30, ventaHuevo: 200, precioHuevo: 400, oroPorSegundo: 3, comidaMejora: 50 },
    epico: { nombre: "Épico", tiempoEclosion: 60, ventaHuevo: 500, precioHuevo: 1000, oroPorSegundo: 6, comidaMejora: 100 },
    legendario: { nombre: "Legendario", tiempoEclosion: 120, ventaHuevo: 1000, precioHuevo: 2000, oroPorSegundo: 12, comidaMejora: 200 },
};

//CAMBIÁ ACÁ hasta que nivel se puede mejorar un monstruo
let nivelMaximoMonstruo = 10;

//las animaciones son tiras horizontales de cuadros de 32x32 (frames = cuantos cuadros tiene)
//bebe: null = todavia no esta dibujado (se muestra el huevo en su lugar)
//filtro = efecto de color sobre el dibujo (se usa para los que todavia no estan dibujados: lila y gris)
//exclusivo = solo se compra con gemas en la tienda (no sale en las cajas), precioGemas = cuanto cuesta
let carpeta = "../assets/png/mounstruos/";
let monstruos = {
    //comunes
    rojo: { nombre: "Rojo", calidad: "comun", huevo: { src: "red/red-huevo.png", frames: 9 }, bebe: { src: "red/red-bebe-quieto.png", frames: 8 } },
    azul: { nombre: "Azul", calidad: "comun", huevo: { src: "blue/huevo-blue.png", frames: 9 }, bebe: { src: "blue/blue.png", frames: 5 } },
    amarillo: { nombre: "Amarillo", calidad: "comun", huevo: { src: "yellow/amarillo-huevo.png", frames: 9 }, bebe: { src: "yellow/yellow-bebe.png", frames: 8 } },
    verde: { nombre: "Verde", calidad: "comun", huevo: { src: "green/huevo-green.png", frames: 9 }, bebe: null },
    naranja: { nombre: "Naranja", calidad: "comun", huevo: { src: "orange/huevo-orange.png", frames: 9 }, bebe: null },
    //raros
    negro: { nombre: "Negro", calidad: "raro", huevo: { src: "black/huevo-black.png", frames: 9 }, bebe: { src: "black/black.png", frames: 5 } },
    blanco: { nombre: "Blanco", calidad: "raro", huevo: { src: "white/white-huevo.png", frames: 9 }, bebe: { src: "white/blanco-bebe.png", frames: 8 } },
    violeta: { nombre: "Violeta", calidad: "raro", huevo: { src: "violet/violet-huevo.png", frames: 9 }, bebe: { src: "violet/Violet-bebe-quieto.png", frames: 8 } },
    marron: { nombre: "Marrón", calidad: "raro", huevo: { src: "brown/brown-huevo.png", frames: 9 }, bebe: { src: "brown/brown-bebe-quieto.png", frames: 8 } },
    //epicos
    rosa: { nombre: "Rosa", calidad: "epico", huevo: { src: "pink/huevo-pink.png", frames: 9 }, bebe: { src: "pink/pinnk.png", frames: 6 } },
    celeste: { nombre: "Celeste", calidad: "epico", huevo: { src: "cian/huevo-cian.png", frames: 9 }, bebe: { src: "cian/cian-bebe-quieto.png", frames: 7 } },
    //epicos exclusivos (solo con gemas). TODAVIA NO ESTAN DIBUJADOS: usan el dibujo del violeta y el blanco con otro color
    lila: { nombre: "Lila", calidad: "epico", exclusivo: true, precioGemas: 15, huevo: { src: "violet/violet-huevo.png", frames: 9, filtro: "hue-rotate(35deg) saturate(0.7) brightness(1.35)" }, bebe: { src: "violet/Violet-bebe-quieto.png", frames: 8, filtro: "hue-rotate(35deg) saturate(0.7) brightness(1.35)" } },
    gris: { nombre: "Gris", calidad: "epico", exclusivo: true, precioGemas: 15, huevo: { src: "white/white-huevo.png", frames: 9, filtro: "grayscale(1) brightness(0.75)" }, bebe: { src: "white/blanco-bebe.png", frames: 8, filtro: "grayscale(1) brightness(0.75)" } },
    //legendarios
    rainbow: { nombre: "Rainbow", calidad: "legendario", huevo: { src: "raimbow/huevo-raimbow.png", frames: 9 }, bebe: { src: "raimbow/rimbow-bebe.png", frames: 7, ancho: 29 } },
    plateado: { nombre: "Plateado", calidad: "legendario", huevo: { src: "plateado/huevo-plateado.png", frames: 9 }, bebe: { src: "plateado/plateado-bebe-quieto.png", frames: 7 } },
    dorado: { nombre: "Dorado", calidad: "legendario", huevo: { src: "gold/huevo-gold.png", frames: 9 }, bebe: { src: "gold/gold.png", frames: 5 } },
};

//CAMBIÁ ACÁ la velocidad de las animaciones (milisegundos que dura cada cuadro)
let velocidadSprites = 120;

//arma un cuadrito animado con la tira de imagenes
function sprite(animacion, escala) {
    let ancho = (animacion.ancho || 32) * escala;
    let alto = (animacion.alto || 32) * escala;
    let div = document.createElement("div");
    div.className = "sprite";
    div.style.width = ancho + "px";
    div.style.height = alto + "px";
    div.style.backgroundImage = 'url("' + carpeta + animacion.src + '")';
    div.style.backgroundSize = (animacion.frames * ancho) + "px " + alto + "px";
    div.style.setProperty("--fin", (-animacion.frames * ancho) + "px");
    div.style.animationDuration = (animacion.frames * velocidadSprites) + "ms";
    div.style.animationTimingFunction = "steps(" + animacion.frames + ")";
    if (animacion.filtro) {
        div.style.filter = animacion.filtro;
    }
    return div;
}

function spriteHuevo(color, escala) {
    return sprite(monstruos[color].huevo, escala);
}

function spriteBebe(color, escala) {
    return sprite(monstruos[color].bebe || monstruos[color].huevo, escala);
}

function nombreCalidad(color) {
    return calidades[monstruos[color].calidad].nombre;
}
