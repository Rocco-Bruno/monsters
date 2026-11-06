//=== MONSTRUOS, HUEVOS, INVENTARIO, INCUBADORA Y HÁBITAT ===
//(se carga despues de mapa.js)

//=== CALIDADES: CAMBIÁ ACÁ ===
//tiempoEclosion = segundos que tarda el huevo, ventaHuevo = oro que da al venderlo, precioHuevo = oro que cuesta en la tienda
//oroPorSegundo = oro que genera el dragon en un hábitat a nivel 1 (a nivel 2 genera el doble, a nivel 3 el triple...)
//comidaMejora = comida para pasar de nivel 1 a 2 (de 2 a 3 cuesta el doble, de 3 a 4 el triple...)
let calidades = {
    comun: { nombre: "Común", tiempoEclosion: 10, ventaHuevo: 50, precioHuevo: 100, oroPorSegundo: 1, comidaMejora: 20 },
    raro: { nombre: "Raro", tiempoEclosion: 30, ventaHuevo: 200, precioHuevo: 400, oroPorSegundo: 3, comidaMejora: 50 },
    epico: { nombre: "Épico", tiempoEclosion: 60, ventaHuevo: 500, precioHuevo: 1000, oroPorSegundo: 6, comidaMejora: 100 },
    legendario: { nombre: "Legendario", tiempoEclosion: 120, ventaHuevo: 1000, precioHuevo: 2000, oroPorSegundo: 12, comidaMejora: 200 },
};

//CAMBIÁ ACÁ hasta que nivel se puede mejorar un dragon
let nivelMaximoDragon = 10;

//las animaciones son tiras horizontales de cuadros de 32x32 (frames = cuantos cuadros tiene)
//bebe: null = todavia no esta dibujado (se muestra el huevo en su lugar)
//faltan dibujar: lila y gris (épicos)
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
    //legendarios
    rainbow: { nombre: "Rainbow", calidad: "legendario", huevo: { src: "raimbow/huevo-raimbow.png", frames: 9 }, bebe: { src: "raimbow/rimbow-bebe.png", frames: 7, ancho: 29 } },
    plateado: { nombre: "Plateado", calidad: "legendario", huevo: { src: "plateado/huevo-plateado.png", frames: 9 }, bebe: { src: "plateado/plateado-bebe-quieto.png", frames: 7 } },
    dorado: { nombre: "Dorado", calidad: "legendario", huevo: { src: "gold/huevo-gold.png", frames: 9 }, bebe: { src: "gold/gold.png", frames: 5 } },
};

//CAMBIÁ ACÁ la velocidad de las animaciones (milisegundos que dura cada cuadro)
let velocidadSprites = 120;

//lo que tiene guardado el jugador
//huevos: el color de cada huevo (ej: "rojo")
//monstruos: cada dragon es { color: "rojo", nivel: 1 } (igual en los hábitats)
let inventario = { huevos: [], monstruos: [] };

//nombre que se muestra, ej: "Dragón rojo · Nv 2"
function nombreDragon(dragon) {
    return "Dragón " + monstruos[dragon.color].nombre.toLowerCase() + " · Nv " + dragon.nivel;
}

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

//una fila con dibujo, nombre y botones (se usa en el inventario y en los paneles)
function filaMonstruo(dibujo, titulo, subtitulo, botones) {
    let fila = document.createElement("div");
    fila.className = "fila-monstruo";
    fila.appendChild(dibujo);
    let texto = document.createElement("div");
    texto.className = "texto";
    texto.innerHTML = "<b>" + titulo + "</b><span>" + subtitulo + "</span>";
    fila.appendChild(texto);
    let acciones = document.createElement("div");
    acciones.className = "acciones"; //los botones van uno abajo del otro
    for (let boton of botones) {
        acciones.appendChild(boton);
    }
    fila.appendChild(acciones);
    return fila;
}

function crearBoton(texto, accion, deshabilitado, ayuda) {
    let boton = document.createElement("button");
    boton.textContent = texto;
    boton.onclick = accion;
    boton.disabled = !!deshabilitado;
    boton.title = ayuda || "";
    return boton;
}

//vuelve a dibujar todo lo que cambia al mover huevos y monstruos, y guarda
function refrescar() {
    mostrarInventario();
    mostrarRecursos();
    redibujarInterfaz(); //interfaz.js (botones y ventana de la estructura seleccionada)
    guardarPartida();
}

//=== INVENTARIO ===
let panelInventario = document.getElementById("inventario");
let botonInventario = document.getElementById("boton-inventario");

botonInventario.onclick = function () {
    panelInventario.classList.toggle("abierto");
    document.getElementById("lista-misiones").classList.remove("abierto"); //no se abren los dos juntos
};

function laIncubadora() {
    return construidas.find(function (c) { return c.tipo.nombre === "Incubadora"; });
}

function mostrarInventario() {
    panelInventario.innerHTML = "<h2>Inventario</h2><h3>🥚 Huevos</h3>";
    if (inventario.huevos.length === 0) {
        panelInventario.innerHTML += '<p class="vacio">No tenés huevos.</p>';
    }
    inventario.huevos.forEach(function (color, i) {
        let motivo = motivoNoIncuba();
        panelInventario.appendChild(filaMonstruo(
            spriteHuevo(color, 1.5),
            "Huevo " + monstruos[color].nombre.toLowerCase(),
            nombreCalidad(color),
            [
                crearBoton("Incubar", function () { incubarHuevo(i); }, motivo, motivo),
                crearBoton("Vender 🪙 " + calidades[monstruos[color].calidad].ventaHuevo, function () { venderHuevo(i); }),
            ]
        ));
    });

    panelInventario.insertAdjacentHTML("beforeend", "<h3> Mounstros</h3>");
    if (inventario.monstruos.length === 0) {
        panelInventario.insertAdjacentHTML("beforeend", '<p class="vacio">No tenés mounstruos sin hábitat.</p>');
    }
    for (let dragon of inventario.monstruos) {
        panelInventario.appendChild(filaMonstruo(
            spriteBebe(dragon.color, 1.5),
            nombreDragon(dragon),
            nombreCalidad(dragon.color) + " · tocá un hábitat para ponerlo",
            [botonMejorarDragon(dragon, null)] //produccion.js
        ));
    }

    //el boton se marca si hay algo en el inventario
    botonInventario.classList.toggle("hay-algo", inventario.huevos.length + inventario.monstruos.length > 0);
}

function venderHuevo(i) {
    let color = inventario.huevos[i];
    recursos.oro += calidades[monstruos[color].calidad].ventaHuevo;
    inventario.huevos.splice(i, 1);
    refrescar();
}

//=== INCUBADORA ===
//incubadora.huevos = los huevos que se estan incubando, cada uno { color, fin }
//cuantos entran a la vez depende del nivel: capacidad(incubadora) en produccion.js

function lugaresLibres(incubadora) {
    return capacidad(incubadora) - incubadora.huevos.length;
}

//devuelve por que no se puede incubar (o null si se puede)
function motivoNoIncuba() {
    let incubadora = laIncubadora();
    if (!incubadora) {
        return "Primero construí la incubadora";
    }
    if (lugaresLibres(incubadora) <= 0) {
        return "La incubadora está llena";
    }
    return null;
}

function incubarHuevo(i) {
    if (motivoNoIncuba()) {
        return;
    }
    let incubadora = laIncubadora();
    let color = inventario.huevos[i];
    let segundos = calidades[monstruos[color].calidad].tiempoEclosion;
    incubadora.huevos.push({ color: color, fin: Date.now() + segundos * 1000 });
    inventario.huevos.splice(i, 1);
    dibujarMarcador(incubadora);
    refrescar();
}

function huevoListo(huevo) {
    return Date.now() >= huevo.fin;
}

function hayHuevoListo(incubadora) {
    return incubadora.huevos.some(huevoListo);
}

//segundos que le faltan a un huevo y cuanto va (de 0 a 1)
function faltaHuevo(huevo) {
    let total = calidades[monstruos[huevo.color].calidad].tiempoEclosion * 1000;
    let falta = Math.max(huevo.fin - Date.now(), 0);
    return { segundos: Math.ceil(falta / 1000), avance: 1 - falta / total };
}

//j = cual de los huevos de la incubadora
function reclamarBebe(incubadora, j) {
    let huevo = incubadora.huevos[j];
    if (!huevo || !huevoListo(huevo)) {
        return;
    }
    inventario.monstruos.push({ color: huevo.color, nivel: 1 });
    incubadora.huevos.splice(j, 1);
    dibujarMarcador(incubadora);
    sumarProgreso("huevos"); //misiones.js
    refrescar();
}

//se llama 4 veces por segundo (mapa.js): el ! aparece arriba de la incubadora cuando hay un dragon para reclamar
function actualizarIncubadoras() {
    for (let incubadora of construidas) {
        if (incubadora.tipo.nombre === "Incubadora" && incubadora.marcador) {
            incubadora.marcador.classList.toggle("listo", hayHuevoListo(incubadora));
        }
    }
}

//=== HÁBITAT ===
//el oro que generan los mounstruos se calcula en produccion.js
function ponerEnHabitat(habitat, i) {
    let dragon = inventario.monstruos[i];
    let calidad = monstruos[dragon.color].calidad;
    if (habitat.monstruos.length >= capacidad(habitat)) {
        return;
    }
    if (habitat.calidad && habitat.calidad !== calidad) {
        return;
    }
    acumular(habitat); //lo juntado hasta ahora se cuenta sin el dragon nuevo
    habitat.calidad = calidad; //el primero que entra decide la calidad del habitat
    habitat.monstruos.push(dragon);
    inventario.monstruos.splice(i, 1);
    dibujarMarcador(habitat);
    refrescar();
}

function sacarDelHabitat(habitat, i) {
    acumular(habitat); //lo juntado hasta ahora se cuenta con el dragon todavia adentro
    inventario.monstruos.push(habitat.monstruos[i]);
    habitat.monstruos.splice(i, 1);
    if (habitat.monstruos.length === 0) {
        habitat.calidad = null; //vacio vuelve a aceptar cualquier calidad
    }
    dibujarMarcador(habitat);
    refrescar();
}

//=== LO QUE SE VE ARRIBA DE LAS ESTRUCTURAS EN EL MAPA ===

//CAMBIÁ ACÁ como se acomodan los mounstruos en el hábitat (todo medido desde el centro de la imagen del hábitat)
//para que NO se pisen, la separacion entre mounstruos (de costado y entre filas) siempre es mayor que su tamaño
//pocos (hasta 3): una fila, mas grandes
let pocosmounstruos = { maximo: 3, y: 14, separacion: 44, escala: 1.2 }; //escala 1.2 = 38px, separacion 44 > 38
//mas de 3: filas en el pasto de adelante; y = altura de la fila, lugares = cuantos entran
let filasHabitat = [
    { y: 4, lugares: 4 },
    { y: 40, lugares: 2 },
];
let muchosmounstruos = { separacion: 36, escala: 1 }; //escala 1 = 32px, separacion 36 > 32 (y las filas estan a 36)

//devuelve donde va cada dragon: [{ x, y, escala }], sin que se pisen
function lugaresmounstruos(cantidad) {
    let lugares = [];
    if (cantidad <= pocosmounstruos.maximo) {
        agregarFila(lugares, cantidad, pocosmounstruos.y, pocosmounstruos.separacion, pocosmounstruos.escala);
        return lugares;
    }
    let total = filasHabitat.reduce(function (suma, fila) { return suma + fila.lugares; }, 0);
    if (cantidad <= total) {
        let quedan = cantidad;
        for (let fila of filasHabitat) {
            let enEsta = Math.min(quedan, fila.lugares);
            agregarFila(lugares, enEsta, fila.y, muchosmounstruos.separacion, muchosmounstruos.escala);
            quedan -= enEsta;
        }
        return lugares;
    }
    //muchisimos (si se sube el nivel maximo del hábitat): mas chiquitos, de a 4 por fila
    let escala = 0.8; //26px
    let separacion = 30;
    let filas = Math.ceil(cantidad / 4);
    for (let f = 0; f < filas; f++) {
        let enEsta = Math.min(4, cantidad - f * 4);
        agregarFila(lugares, enEsta, -14 + f * separacion, separacion, escala);
    }
    return lugares;
}

//pone "cantidad" lugares en una fila centrada
function agregarFila(lugares, cantidad, y, separacion, escala) {
    for (let i = 0; i < cantidad; i++) {
        let x = (i - (cantidad - 1) / 2) * separacion;
        lugares.push({ x: x, y: y, escala: escala });
    }
}

function dibujarMarcador(construida) {
    if (construida.tipo.nombre !== "Incubadora" && construida.tipo.nombre !== "Hábitat") {
        return;
    }
    if (!construida.marcador) {
        construida.marcador = document.createElement("div");
        construida.marcador.className = "marcador";
        mapa.appendChild(construida.marcador);
    }
    let marcador = construida.marcador;
    marcador.style.left = construida.x + "px";
    marcador.style.top = construida.y + "px";
    marcador.style.zIndex = Math.round(construida.y) + 1;
    marcador.innerHTML = "";

    //incubadora: los huevos uno al lado del otro en la entrada
    if (construida.tipo.nombre === "Incubadora" && construida.huevos.length > 0) {
        let lugares = [];
        agregarFila(lugares, construida.huevos.length, 48, 30, 1.2);
        construida.huevos.forEach(function (huevo, i) {
            let dibujo = spriteHuevo(huevo.color, lugares[i].escala);
            dibujo.style.left = lugares[i].x + "px";
            dibujo.style.top = lugares[i].y + "px";
            marcador.appendChild(dibujo);
        });
        marcador.insertAdjacentHTML("beforeend", '<div class="aviso">!</div>');
    }

    //habitat: cada dragon en su lugar, sin pisarse
    if (construida.tipo.nombre === "Hábitat") {
        let lugares = lugaresmounstruos(construida.monstruos.length);
        construida.monstruos.forEach(function (dragon, i) {
            let lugar = lugares[i];
            let dibujo = spriteBebe(dragon.color, lugar.escala);
            dibujo.style.left = lugar.x + "px";
            dibujo.style.top = lugar.y + "px";
            dibujo.style.zIndex = Math.round(lugar.y + 100); //los de adelante tapan a los de atras
            marcador.appendChild(dibujo);
        });
    }
}

mostrarInventario();
