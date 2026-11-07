//=== MONSTRUOS, HUEVOS, INVENTARIO, INCUBADORA Y HÁBITAT ===
//(se carga despues de mapa.js y datos-monstruos.js)

//lo que tiene guardado el jugador
//huevos: el color de cada huevo (ej: "rojo")
//monstruos: cada monstruo es { color: "rojo", nivel: 1 } (igual en los hábitats)
let inventario = { huevos: [], monstruos: [] };

//todos los mounstruos que consiguio el jugador en la partida (se ven en el perfil)
//ej: { rojo: 2, dorado: 1 } = consiguio 2 rojos y 1 dorado
let coleccion = {};

//llamar cada vez que nace un monstruo; devuelve true si es la primera vez que lo consigue
function registrarMonstruo(color) {
    let esNuevo = !coleccion[color];
    coleccion[color] = (coleccion[color] || 0) + 1;
    return esNuevo;
}

//nombre que se muestra, ej: "Monstruo rojo · Nv 2"
function nombreMonstruo(monstruo) {
    return "Monstruo " + monstruos[monstruo.color].nombre.toLowerCase() + " · Nv " + monstruo.nivel;
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
    for (let monstruo of inventario.monstruos) {
        panelInventario.appendChild(filaMonstruo(
            spriteBebe(monstruo.color, 1.5),
            nombreMonstruo(monstruo),
            nombreCalidad(monstruo.color) + " · tocá un hábitat para ponerlo",
            [botonMejorarMonstruo(monstruo, null)] //produccion.js
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

//=== ACELERAR CON GEMAS ===
//CAMBIÁ ACÁ cuantos segundos se saltean por cada gema (10 = 1 gema cada 10 segundos que falten)
let segundosPorGema = 10;

//gemas que cuesta terminar ya el huevo (minimo 1)
function costoAcelerar(huevo) {
    return Math.max(1, Math.ceil(faltaHuevo(huevo).segundos / segundosPorGema));
}

function acelerarHuevo(huevo) {
    let costo = costoAcelerar(huevo);
    if (huevoListo(huevo) || recursos.gemas < costo) {
        return;
    }
    recursos.gemas -= costo;
    huevo.fin = Date.now(); //eclosiona ya
    refrescar();
}

//j = cual de los huevos de la incubadora
function reclamarBebe(incubadora, j) {
    let huevo = incubadora.huevos[j];
    if (!huevo || !huevoListo(huevo)) {
        return;
    }
    inventario.monstruos.push({ color: huevo.color, nivel: 1 });
    let esNuevo = registrarMonstruo(huevo.color);
    incubadora.huevos.splice(j, 1);
    dibujarMarcador(incubadora);
    sumarProgreso("huevos"); //misiones.js

    //primero la felicitacion del monstruo, despues (si hay) la de subir de nivel o completar la coleccion
    let xp = xpPor.eclosionar[monstruos[huevo.color].calidad];
    let xpTotal = xp + (esNuevo ? xpPor.descubrir : 0); //nacer + (si es nuevo) descubrirlo
    let nota = (esNuevo ? textoDescubrimiento(huevo.color) + " · " : "") + "+" + xpTotal + " XP"; //experiencia.js
    felicitar("monstruo", huevo.color, "Nació en la incubadora", [], nota); //felicitaciones.js
    if (esNuevo) {
        premiarDescubrimiento(huevo.color);
    }
    ganarXP(xp);
    refrescar();
}

//se llama 4 veces por segundo (mapa.js): el ! aparece arriba de la incubadora cuando hay un monstruo para reclamar
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
    let monstruo = inventario.monstruos[i];
    let calidad = monstruos[monstruo.color].calidad;
    if (habitat.monstruos.length >= capacidad(habitat)) {
        return;
    }
    if (habitat.calidad && habitat.calidad !== calidad) {
        return;
    }
    acumular(habitat); //lo juntado hasta ahora se cuenta sin el monstruo nuevo
    habitat.calidad = calidad; //el primero que entra decide la calidad del habitat
    habitat.monstruos.push(monstruo);
    inventario.monstruos.splice(i, 1);
    dibujarMarcador(habitat);
    refrescar();
}

function sacarDelHabitat(habitat, i) {
    acumular(habitat); //lo juntado hasta ahora se cuenta con el monstruo todavia adentro
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

//devuelve donde va cada monstruo: [{ x, y, escala }], sin que se pisen
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
    if (construida.tipo.nombre !== "Incubadora" && !construida.tipo.produce) {
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

    //habitat: cada monstruo en su lugar, sin pisarse
    if (construida.tipo.nombre === "Hábitat") {
        let lugares = lugaresmounstruos(construida.monstruos.length);
        construida.monstruos.forEach(function (monstruo, i) {
            let lugar = lugares[i];
            let dibujo = spriteBebe(monstruo.color, lugar.escala);
            dibujo.style.left = lugar.x + "px";
            dibujo.style.top = lugar.y + "px";
            dibujo.style.zIndex = Math.round(lugar.y + 100); //los de adelante tapan a los de atras
            marcador.appendChild(dibujo);
        });
    }

    //granja y habitat: el cuadrito con 🍖/🪙 para reclamar sin abrir nada (produccion.js)
    if (construida.tipo.produce) {
        marcador.appendChild(crearBurbuja(construida));
    }
}

mostrarInventario();
