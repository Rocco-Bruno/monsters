//=== PRODUCCIÓN Y MEJORAS ===
//la granja junta comida, el hábitat junta oro (lo generan los dragones que viven ahí)
//las estructuras se mejoran con oro y los dragones se mejoran con comida
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

//cuantos dragones entran en el habitat, o cuantos huevos se incuban a la vez en la incubadora
function capacidad(construida, nivel) {
    return valorPorNivel(construida.tipo.capacidadBase, construida.tipo.capacidadPorNivel, nivel || construida.nivel);
}

//oro por segundo que genera un dragon (depende de su calidad y su nivel)
function oroDelDragon(dragon) {
    return calidades[monstruos[dragon.color].calidad].oroPorSegundo * dragon.nivel;
}

//cuanto produce por segundo ahora mismo
function produccionPorSegundo(construida) {
    let tipo = construida.tipo;
    if (tipo.nombre === "Granja") {
        return valorPorNivel(tipo.produccionBase, tipo.produccionPorNivel, construida.nivel);
    }
    if (tipo.nombre === "Hábitat") {
        let total = 0;
        for (let dragon of construida.monstruos) {
            total += oroDelDragon(dragon); //mas dragones = mas oro
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
//HAY QUE LLAMARLA ANTES de cambiar la produccion (mejorar, sumar o sacar dragones),
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
    refrescar();
}

//=== DRAGONES: se mejoran con comida ===
//cuanta comida cuesta subir al dragon al siguiente nivel
function costoMejoraDragon(dragon) {
    return calidades[monstruos[dragon.color].calidad].comidaMejora * dragon.nivel;
}

function motivoNoMejoraDragon(dragon) {
    if (dragon.nivel >= nivelMaximoDragon) {
        return "Nivel máximo";
    }
    if (recursos.comida < costoMejoraDragon(dragon)) {
        return "Falta comida";
    }
    return null;
}

//habitat = donde vive (o null si esta en el inventario)
function mejorarDragon(dragon, habitat) {
    if (motivoNoMejoraDragon(dragon)) {
        return;
    }
    if (habitat) {
        acumular(habitat); //el oro de antes se cuenta con el nivel viejo
    }
    recursos.comida -= costoMejoraDragon(dragon);
    dragon.nivel++;
    refrescar();
}

//boton "Mejorar" de un dragon (se usa en el inventario y en el habitat)
function botonMejorarDragon(dragon, habitat) {
    let motivo = motivoNoMejoraDragon(dragon);
    let texto = motivo === "Nivel máximo" ? "Nivel máx." : "Mejorar 🍖 " + costoMejoraDragon(dragon);
    return crearBoton(texto, function () { mejorarDragon(dragon, habitat); }, motivo, motivo);
}

