//=== WINI, LA GUÍA ===
//Wini le enseña a jugar al jugador paso a paso: habla en un diálogo a lo largo de la parte de abajo
//de la pantalla y él está parado arriba del diálogo, a la izquierda.
//Hay pasos que se pasan con un botón (solo explican) y pasos que esperan a que el jugador haga algo
//(ej: construir la incubadora): esos avanzan solos cuando lo hace. Una flecha señala lo que hay que tocar.
//Cuando termina la guía, Wini se queda en la esquina de abajo a la izquierda: tocándolo se pueden volver a leer las explicaciones.
//(se carga antes de guardado.js, que guarda en que paso va)

//en que paso va la guía (se guarda con la partida)
//minimizada = el jugador escondió el globo (Wini sigue ahí, tocándolo vuelve)
let guia = { paso: 0, terminada: false, minimizada: false };

//=== CAMBIÁ ACÁ EL DIBUJO DE WINI ===
//tira horizontal de cuadros de 32x32 en assets/png/guia/
let dibujoWini = { src: "../assets/png/guia/wini.png", frames: 11, porSegundo: 6, tamano: 128 };


//=== AYUDAS PARA LOS PASOS ===
function hayEstructura(nombre) {
    return construidas.some(function (c) { return c.tipo.nombre === nombre; });
}

function primeraEstructura(nombre) {
    return construidas.find(function (c) { return c.tipo.nombre === nombre; });
}

function botonEstructura(nombre) {
    return estructuras.find(function (e) { return e.nombre === nombre; }).boton;
}

//si el menú de herramientas está cerrado se marca "Herramientas", si está abierto el botón de esa estructura
function marcarParaConstruir(nombre) {
    return function () {
        return menu.classList.contains("abierto") ? botonEstructura(nombre) : document.getElementById("boton-herramientas");
    };
}

function construyendo(nombre) {
    return !!fantasma && fantasma.datos && fantasma.datos.nombre === nombre;
}

function cuantosMonstruos() {
    let total = inventario.monstruos.length;
    for (let c of construidas) {
        total += c.monstruos.length + (c.cruce ? 2 : 0);
    }
    return total;
}

function hayMonstruoEnHabitat() {
    return construidas.some(function (c) { return c.tipo.nombre === "Hábitat" && c.monstruos.length > 0; });
}

function incubando() {
    let incubadora = primeraEstructura("Incubadora");
    return !!incubadora && incubadora.huevos.length > 0;
}

function nombreDelJugador() {
    try {
        let datos = JSON.parse(sessionStorage.getItem("monsters-city-jugador"));
        if (datos && datos.nombre) {
            return datos.nombre;
        }
    } catch (error) {
    }
    return "";
}


//=== CAMBIÁ ACÁ LO QUE DICE WINI ===
//texto = lo que dice (puede ser una función si cambia, ej: para poner el nombre del jugador)
//marcar = qué brilla en la pantalla para que el jugador sepa dónde tocar (un selector, o una función que devuelve el elemento)
//listo = función que dice si el jugador ya hizo lo que se pidió (si no tiene, se pasa con el botón)
//boton = texto del botón para pasar (solo en los pasos sin "listo")
//volver = { si: función, a: número de paso } para volver atrás (ej: si canceló la construcción)
let pasosGuia = [
    { //0
        texto: function () {
            let nombre = nombreDelJugador();
            return "¡Hola" + (nombre ? ", " + nombre : "") + "! Soy <b>Wini</b> y voy a ser tu guía en Monsters city. "
                + "Te voy a enseñar a criar mounstruos, construir tu ciudad y llenarte de oro. ¿Arrancamos?";
        },
        boton: "¡Dale!",
    },
    { //1
        texto: "Arriba están tus recursos: 🪙 <b>oro</b> para construir y comprar, 🍖 <b>comida</b> para subir de nivel a tus mounstruos "
            + "y 💎 <b>gemas</b>, que son difíciles de conseguir y sirven para acelerar cosas y comprar huevos exclusivos.",
        marcar: ".recursos",
        boton: "Entendido",
    },
    { //2
        texto: "Todo empieza con una <b>incubadora</b>, que es donde nacen los mounstruos. Tocá <b>Herramientas</b> para ver lo que podés construir.",
        marcar: "#boton-herramientas",
        listo: function () { return menu.classList.contains("abierto") || construyendo("Incubadora") || hayEstructura("Incubadora"); },
    },
    { //3
        texto: "Elegí la <b>Incubadora</b>. ¡La primera es gratis!",
        marcar: marcarParaConstruir("Incubadora"),
        listo: function () { return construyendo("Incubadora") || hayEstructura("Incubadora"); },
    },
    { //4
        texto: "Ahora tocá <b>adentro del rombo</b> del mapa para ponerla. Fuera del rombo no se puede construir. Si te arrepentís, apretá <b>Escape</b>.",
        listo: function () { return hayEstructura("Incubadora"); },
        volver: { si: function () { return !fantasma; }, a: 3 },
    },
    { //5
        texto: "¡Muy bien! 🎉 Construir te da <b>experiencia</b> y te sube de nivel: con más nivel desbloqueás más cosas. "
            + "Además ya cumpliste unas <b>misiones</b>: abrí Misiones y reclamá los premios. ¡Una te regala un huevo!",
        marcar: "#boton-misiones",
        listo: function () { return inventario.huevos.length > 0 || incubando() || cuantosMonstruos() > 0; },
    },
    { //6
        texto: "¡Un huevo! 🥚 Abrí el <b>Inventario</b> y tocá <b>Incubar</b> para ponerlo en la incubadora.",
        marcar: "#boton-inventario",
        listo: function () { return incubando() || cuantosMonstruos() > 0; },
    },
    { //7
        texto: "El huevo tarda un ratito en nacer (se puede acelerar con 💎). Mientras tanto construí una <b>Granja</b>: "
            + "también es gratis y produce 🍖 comida.",
        marcar: marcarParaConstruir("Granja"),
        listo: function () { return hayEstructura("Granja"); },
    },
    { //8
        texto: "Ahora un <b>Hábitat</b> (¡el primero también es gratis!). Ahí viven tus mounstruos y generan 🪙 oro. "
            + "Cada hábitat es de una sola calidad: común, raro, épico o legendario.",
        marcar: marcarParaConstruir("Hábitat"),
        listo: function () { return hayEstructura("Hábitat"); },
    },
    { //9
        texto: "Cuando el huevo esté listo aparece un <b>!</b> arriba de la incubadora. Tocala, después <b>🥚 Huevos</b> y reclamá a tu mounstruo.",
        marcar: function () { let i = primeraEstructura("Incubadora"); return i && i.imagen; },
        listo: function () { return cuantosMonstruos() > 0; },
    },
    { //10
        texto: "¡Nació tu primer mounstruo! 👾 Cada uno nace <b>macho ♂</b> o <b>hembra ♀</b>. Para que genere oro tiene que vivir en un hábitat: "
            + "tocá el <b>Hábitat</b>, después el botón de <b>mounstruos</b> y tocá <b>Añadir</b>.",
        marcar: function () { let h = primeraEstructura("Hábitat"); return h && h.imagen; },
        listo: hayMonstruoEnHabitat,
    },
    { //11
        texto: "¡Ya está generando oro! La granja y el hábitat van guardando lo que producen hasta llenarse. "
            + "Cuando aparece un cuadrito con 🍖 o 🪙 arriba, tocalo para juntarlo. ¡Pasá seguido así no se desperdicia nada!",
        boton: "Siguiente",
    },
    { //12
        texto: "Con 🍖 comida podés subir de nivel a tus mounstruos (tocá el hábitat → mounstruos → Mejorar): a más nivel, más oro. "
            + "Las estructuras también se mejoran con <b>⬆️ Mejorar</b>.",
        boton: "Siguiente",
    },
    { //13
        texto: "Cuando tengas un <b>macho ♂</b> y una <b>hembra ♀</b> de nivel " + nivelMinimoCruce + ", construí <b>Reservados</b> y crucelos 💞. "
            + "Algunas mezclas dan mounstruos raros… ¡y hasta legendarios! Las recetas están adentro de Reservados.",
        boton: "Siguiente",
    },
    { //14
        texto: "En la <b>Tienda</b> podés comprar huevos, abrir <b>cajas sorpresa</b> con huevos al azar y cambiar gemas por oro.",
        marcar: "#boton-tienda",
        boton: "Siguiente",
    },
    { //15
        texto: "¡Eso es todo por ahora! Seguí las <b>misiones</b> para saber qué hacer y ganar premios. "
            + "Si te olvidás de algo, tocame acá en la esquina. ¡A criar mounstruos!",
        boton: "¡Gracias, Wini!",
    },
];

//lo que se puede volver a leer tocando a Wini cuando ya terminó la guía (son los mismos textos de los pasos)
let temasGuia = [
    { titulo: "Recursos", pasos: [1] },
    { titulo: "Construir", pasos: [2, 4] },
    { titulo: "Huevos", pasos: [6, 9] },
    { titulo: "Hábitat y oro", pasos: [8, 10, 11] },
    { titulo: "Mejorar", pasos: [12] },
    { titulo: "Cruces", pasos: [13] },
    { titulo: "Tienda", pasos: [14] },
    { titulo: "Misiones", pasos: [15] },
];


//=== DIBUJAR A WINI ===
let cajaGuia = document.createElement("div");
cajaGuia.id = "guia";
cajaGuia.innerHTML = '<div class="globo-guia"></div><button class="wini" title="Wini"></button>';
document.body.appendChild(cajaGuia);
let globoGuia = cajaGuia.querySelector(".globo-guia");
let botonWini = cajaGuia.querySelector(".wini");

botonWini.style.width = dibujoWini.tamano + "px";
botonWini.style.height = dibujoWini.tamano + "px";
botonWini.style.backgroundImage = 'url("' + dibujoWini.src + '")';
botonWini.style.backgroundSize = (dibujoWini.frames * dibujoWini.tamano) + "px " + dibujoWini.tamano + "px";
botonWini.style.setProperty("--fin", (-dibujoWini.frames * dibujoWini.tamano) + "px");
botonWini.style.animationDuration = (dibujoWini.frames / dibujoWini.porSegundo) + "s";
botonWini.style.animationTimingFunction = "steps(" + dibujoWini.frames + ")";

//tocar a Wini muestra o esconde el globo (y si ya terminó la guía, muestra los temas)
botonWini.onclick = function () {
    if (guia.terminada) {
        temaAbierto = temaAbierto === null ? -1 : null;
    } else {
        guia.minimizada = !guia.minimizada;
    }
    dibujarGuia();
};

let temaAbierto = null; //con la guía terminada: null = globo cerrado, -1 = lista de temas, 0.. = un tema
let elementoMarcado = null;

function textoDePaso(i) {
    let texto = pasosGuia[i].texto;
    return typeof texto === "function" ? texto() : texto;
}

function marcar(elemento) {
    if (elemento === elementoMarcado) {
        return;
    }
    if (elementoMarcado) {
        elementoMarcado.classList.remove("guia-marcado");
    }
    elementoMarcado = elemento || null;
    if (elementoMarcado) {
        elementoMarcado.classList.add("guia-marcado");
    }
}

function elementoAMarcar(paso) {
    if (!paso.marcar || guia.minimizada) {
        return null;
    }
    return typeof paso.marcar === "function" ? paso.marcar() : document.querySelector(paso.marcar);
}

function botonGuia(texto, clase, accion) {
    let boton = document.createElement("button");
    boton.className = "boton-guia " + (clase || "");
    boton.textContent = texto;
    boton.onclick = accion;
    return boton;
}

//el texto va a la izquierda y los botones a la derecha del diálogo
function cajaDeTexto(html) {
    let caja = document.createElement("div");
    caja.className = "texto-guia";
    caja.innerHTML = html;
    globoGuia.appendChild(caja);
    return caja;
}

function dibujarGuia() {
    globoGuia.innerHTML = "";
    dibujarGuiaAdentro();
    //Wini se para arriba del diálogo, y la ventana y la barra de la estructura se corren para que no los tape
    let abierto = globoGuia.classList.contains("abierto");
    cajaGuia.classList.toggle("con-dialogo", abierto);
    acomodarAlDialogo();
}

function acomodarAlDialogo() {
    let abierto = globoGuia.classList.contains("abierto");
    let alto = abierto ? globoGuia.offsetHeight : 0;
    cajaGuia.style.setProperty("--alto-dialogo", alto + "px");
    document.documentElement.style.setProperty("--alto-guia", (abierto ? alto + 10 : 0) + "px");
}
window.addEventListener("resize", acomodarAlDialogo);

function dibujarGuiaAdentro() {
    //guía terminada: Wini en la esquina; al tocarlo, los temas para volver a leer
    if (guia.terminada) {
        cajaGuia.classList.add("terminada");
        marcar(null);
        globoGuia.classList.toggle("abierto", temaAbierto !== null);
        let botones = document.createElement("div");
        botones.className = "botones-guia";
        if (temaAbierto === -1) {
            let texto = cajaDeTexto("<p>¿Qué querés que te explique?</p>");
            let lista = document.createElement("div");
            lista.className = "temas-guia";
            temasGuia.forEach(function (tema, i) {
                lista.appendChild(botonGuia(tema.titulo, "", function () { temaAbierto = i; dibujarGuia(); }));
            });
            texto.appendChild(lista);
            botones.appendChild(botonGuia("Cerrar", "gris", function () { temaAbierto = null; dibujarGuia(); }));
            globoGuia.appendChild(botones);
        } else if (temaAbierto !== null) {
            cajaDeTexto(temasGuia[temaAbierto].pasos.map(function (i) { return "<p>" + textoDePaso(i) + "</p>"; }).join(""));
            botones.appendChild(botonGuia("Otros temas", "gris", function () { temaAbierto = -1; dibujarGuia(); }));
            botones.appendChild(botonGuia("Gracias", "", function () { temaAbierto = null; dibujarGuia(); }));
            globoGuia.appendChild(botones);
        }
        return;
    }

    cajaGuia.classList.remove("terminada");
    globoGuia.classList.toggle("abierto", !guia.minimizada);
    let paso = pasosGuia[guia.paso];
    globoGuia.insertAdjacentHTML("beforeend", '<span class="cuenta-guia">' + (guia.paso + 1) + "/" + pasosGuia.length + "</span>"
        + '<button class="minimizar-guia" title="Esconder">—</button>');
    cajaDeTexto("<p>" + textoDePaso(guia.paso) + "</p>");
    globoGuia.querySelector(".minimizar-guia").onclick = function () {
        guia.minimizada = true;
        dibujarGuia();
    };

    let botones = document.createElement("div");
    botones.className = "botones-guia";
    if (guia.paso === 0) {
        botones.appendChild(botonGuia("Saltar guía", "gris", terminarGuia));
    }
    if (paso.listo) {
        botones.insertAdjacentHTML("beforeend", '<span class="esperando-guia">Te espero…</span>');
    } else {
        botones.appendChild(botonGuia(paso.boton || "Siguiente", "",
            guia.paso === pasosGuia.length - 1 ? terminarGuia : function () { irAPaso(guia.paso + 1); }));
    }
    globoGuia.appendChild(botones);
    marcar(elementoAMarcar(paso));
}


//=== FLECHA QUE SEÑALA LO QUE HAY QUE TOCAR ===
//se pone al lado de lo marcado: a la derecha si está pegado a la izquierda de la pantalla, a la izquierda si está
//pegado a la derecha, abajo si está muy arriba y si no arriba. Se acomoda en cada cuadro (por si se mueve el mapa)
let flechaGuia = document.createElement("div");
flechaGuia.className = "flecha-guia";
document.body.appendChild(flechaGuia);

(function seguirMarcado() {
    requestAnimationFrame(seguirMarcado);
    let borde = elementoMarcado && elementoMarcado.isConnected ? elementoMarcado.getBoundingClientRect() : null;
    if (!borde || borde.width === 0 || borde.height === 0) {
        flechaGuia.classList.remove("visible");
        return;
    }
    let separacion = 14;
    let x, y, giro;
    if (borde.right < 260) {
        x = borde.right + separacion; y = borde.top + borde.height / 2; giro = 90;
    } else if (borde.left > window.innerWidth - 260) {
        x = borde.left - separacion; y = borde.top + borde.height / 2; giro = -90;
    } else if (borde.top < 120) {
        x = borde.left + borde.width / 2; y = borde.bottom + separacion; giro = 180;
    } else {
        x = borde.left + borde.width / 2; y = borde.top - separacion; giro = 0;
    }
    flechaGuia.style.left = x + "px";
    flechaGuia.style.top = y + "px";
    flechaGuia.style.setProperty("--giro", giro + "deg");
    flechaGuia.classList.add("visible");
})();

function irAPaso(numero) {
    guia.paso = numero;
    guia.minimizada = false;
    //un saltito cada vez que cambia de paso
    botonWini.animate([{ translate: "0 0" }, { translate: "0 -16px" }, { translate: "0 0" }], { duration: 450, easing: "ease-out" });
    dibujarGuia();
}

function terminarGuia() {
    guia.terminada = true;
    temaAbierto = null;
    dibujarGuia();
}

//por si se quiere ver la guía de nuevo: abrir la consola (F12) y escribir reiniciarGuia()
function reiniciarGuia() {
    guia.paso = 0;
    guia.terminada = false;
    guia.minimizada = false;
    dibujarGuia();
}

//4 veces por segundo se fija si el jugador ya hizo lo que pedía el paso
setInterval(function () {
    if (guia.terminada) {
        return;
    }
    let paso = pasosGuia[guia.paso];
    if (paso.listo && paso.listo()) {
        //puede que ya haya hecho varios pasos de una (ej: una partida que ya tenía cosas): se saltan todos
        let siguiente = guia.paso + 1;
        while (siguiente < pasosGuia.length && pasosGuia[siguiente].listo && pasosGuia[siguiente].listo()) {
            siguiente++;
        }
        irAPaso(siguiente);
        return;
    }
    if (paso.volver && paso.volver.si()) {
        irAPaso(paso.volver.a);
        return;
    }
    marcar(elementoAMarcar(paso)); //lo que se marca puede cambiar (ej: al abrir Herramientas)
}, 250);

//se dibuja despues de cargar la partida (guardado.js se carga despues de este archivo)
window.addEventListener("load", dibujarGuia);
