//=== PRODUCCIÓN Y MEJORAS ===
//la granja junta comida, el hábitat junta oro (lo generan los mounstruos que viven ahí)
//las estructuras se mejoran con oro y los mounstruos se mejoran con comida
//(se carga despues de mapa.js y monstruos.js; los numeros se cambian en "estructuras" (mapa.js) y "calidades" (monstruos.js))

let iconos = { oro: "🪙", comida: "🍖", gemas: "💎" };

//valor que empieza en "base" a nivel 1 y suma "porNivel" en cada nivel
function valorPorNivel(base, porNivel, nivel) {
    return base + porNivel * (nivel - 1);
}

//cuanto oro cuesta pasar al siguiente nivel (cada mejora es mas cara)
function costoMejora(construida) {
    let tipo = construida.tipo;
    return Math.round(tipo.mejoraBase * Math.pow(tipo.mejoraMultiplicador, construida.nivel - 1));
}

function maximoGuardado(construida, nivel) {
    return valorPorNivel(construida.tipo.maximoBase, construida.tipo.maximoPorNivel, nivel || construida.nivel);
}

//cuantos mounstruos entran en el habitat, o cuantos huevos se incuban a la vez en la incubadora
function capacidad(construida, nivel) {
    return valorPorNivel(construida.tipo.capacidadBase, construida.tipo.capacidadPorNivel, nivel || construida.nivel);
}

//oro por segundo que genera un monstruo (depende de su calidad y su nivel)
function oroDelMonstruo(monstruo) {
    return calidades[monstruos[monstruo.color].calidad].oroPorSegundo * monstruo.nivel;
}

//cuanto produce por segundo ahora mismo
function produccionPorSegundo(construida) {
    let tipo = construida.tipo;
    if (tipo.nombre === "Granja") {
        return valorPorNivel(tipo.produccionBase, tipo.produccionPorNivel, construida.nivel);
    }
    if (tipo.nombre === "Hábitat") {
        let total = 0;
        for (let monstruo of construida.monstruos) {
            total += oroDelMonstruo(monstruo); //mas mounstruos = mas oro
        }
        return total;
    }
    return 0;
}

//lo que tiene juntado ahora (sin tocar nada)
function guardadoAhora(construida) {
    let segundos = (Date.now() - construida.ultimoCalculo) / 1000;
    let total = construida.guardado + segundos * produccionPorSegundo(construida);
    return Math.min(total, Math.max(maximoGuardado(construida), construida.guardado));
}

//pasa lo juntado hasta ahora a "guardado"
//HAY QUE LLAMARLA ANTES de cambiar la produccion (mejorar, sumar o sacar mounstruos),
//asi lo que se junto antes se cuenta con la produccion vieja
function acumular(construida) {
    construida.guardado = guardadoAhora(construida);
    construida.ultimoCalculo = Date.now();
}

function reclamarProduccion(construida) {
    acumular(construida);
    let cantidad = Math.floor(construida.guardado);
    if (cantidad === 0) {
        return;
    }
    recursos[construida.tipo.produce] += cantidad;
    construida.guardado -= cantidad; //los decimales quedan para la proxima
    sumarProgreso(construida.tipo.produce === "oro" ? "oroReclamado" : "comidaReclamada", cantidad); //misiones.js
    refrescar();
}

//devuelve por que no se puede mejorar (o null si se puede)
function motivoNoMejora(construida) {
    if (construida.nivel >= construida.tipo.nivelMaximo) {
        return "Nivel máximo";
    }
    if (recursos.oro < costoMejora(construida)) {
        return "Falta oro";
    }
    return null;
}

function mejorarEstructura(construida) {
    if (motivoNoMejora(construida)) {
        return;
    }
    acumular(construida);
    recursos.oro -= costoMejora(construida);
    construida.nivel++;
    if (construida.tipo.nombre === "Granja") {
        sumarProgreso("mejorasGranja"); //misiones.js
    }
    sumarProgreso("mejorasEstructura");
    ganarXP(xpPor.mejorarEstructura * construida.nivel); //experiencia.js
    refrescar();
}

//=== mounstruos: se mejoran con comida ===
//cuanta comida cuesta subir al monstruo al siguiente nivel
function costoMejoraMonstruo(monstruo) {
    return calidades[monstruos[monstruo.color].calidad].comidaMejora * monstruo.nivel;
}

function motivoNoMejoraMonstruo(monstruo) {
    if (monstruo.nivel >= nivelMaximoMonstruo) {
        return "Nivel máximo";
    }
    if (recursos.comida < costoMejoraMonstruo(monstruo)) {
        return "Falta comida";
    }
    return null;
}

//habitat = donde vive (o null si esta en el inventario)
function mejorarMonstruo(monstruo, habitat) {
    if (motivoNoMejoraMonstruo(monstruo)) {
        return;
    }
    if (habitat) {
        acumular(habitat); //el oro de antes se cuenta con el nivel viejo
    }
    recursos.comida -= costoMejoraMonstruo(monstruo);
    monstruo.nivel++;
    sumarProgreso("mejorasMonstruo"); //misiones.js
    ganarXP(xpPor.mejorarMonstruo * monstruo.nivel); //experiencia.js
    refrescar();
}

//boton "Mejorar" de un monstruo (se usa en el inventario y en el habitat)
function botonMejorarMonstruo(monstruo, habitat) {
    let motivo = motivoNoMejoraMonstruo(monstruo);
    let texto = motivo === "Nivel máximo" ? "Nivel máx." : "Mejorar 🍖 " + costoMejoraMonstruo(monstruo);
    return crearBoton(texto, function () { mejorarMonstruo(monstruo, habitat); }, motivo, motivo);
}


//=== CUADRITO PARA RECLAMAR (arriba de la granja y del hábitat) ===
//aparece cuando ya se junto bastante; al tocarlo se reclama la comida/oro sin abrir ninguna ventana

//CAMBIÁ ACÁ desde cuanto aparece el cuadrito: 0.25 = cuando lo guardado llega al 25% del maximo
//(asi no aparece por 1 de comida)
let porcentajeAviso = 0.25;

function hayBastante(construida) {
    let guardado = Math.floor(guardadoAhora(construida));
    return guardado > 0 && guardado >= maximoGuardado(construida) * porcentajeAviso;
}

function estaLleno(construida) {
    return guardadoAhora(construida) >= maximoGuardado(construida);
}

//se llama desde dibujarMarcador (monstruos.js)
function crearBurbuja(construida) {
    let burbuja = document.createElement("div");
    burbuja.className = "burbuja";
    burbuja.textContent = iconos[construida.tipo.produce];
    burbuja.title = "Reclamar";
    burbuja.onclick = function (evento) {
        evento.stopPropagation(); //que no deseleccione ni construya en el mapa
        if (seMovio) {
            return; //se estaba arrastrando el mapa, no fue un click
        }
        reclamarConEfecto(construida); //interfaz.js
        actualizarBurbujas();
    };
    construida.burbuja = burbuja;
    return burbuja;
}

//se llama 4 veces por segundo (mapa.js): muestra u oculta los cuadritos
function actualizarBurbujas() {
    for (let construida of construidas) {
        if (!construida.burbuja) {
            continue;
        }
        //arriba de la imagen de la estructura (la imagen esta centrada en x, y)
        construida.burbuja.style.top = (-construida.imagen.offsetHeight / 2 - 30) + "px";
        construida.burbuja.classList.toggle("visible", hayBastante(construida));
        construida.burbuja.classList.toggle("lleno", estaLleno(construida));
    }
}

//=== LLENAR AL INSTANTE CON GEMAS (granja y hábitat) ===
//CAMBIÁ ACÁ: 1 gema por cada "segundosPorGemaLlenar" segundos de produccion que falten (60 = 1 gema por minuto)
let segundosPorGemaLlenar = 60;

//cuanto le falta para llenarse
function faltaParaLlenar(construida) {
    return Math.max(0, maximoGuardado(construida) - guardadoAhora(construida));
}

//gemas que cuesta llenarla ya (0 = no se puede: ya esta llena o no produce nada)
function costoLlenar(construida) {
    let porSegundo = produccionPorSegundo(construida);
    let falta = faltaParaLlenar(construida);
    if (porSegundo <= 0 || falta < 1) {
        return 0;
    }
    return Math.max(1, Math.ceil(falta / porSegundo / segundosPorGemaLlenar));
}

function llenarConGemas(construida) {
    let costo = costoLlenar(construida);
    if (costo === 0 || recursos.gemas < costo) {
        return;
    }
    recursos.gemas -= costo;
    construida.guardado = maximoGuardado(construida);
    construida.ultimoCalculo = Date.now();
    refrescar();
}
