//=== CRUCES (estructura "Reservados") ===
//se eligen 2 mounstruos, se cruzan durante un tiempo y al final dan un huevo
//mientras se cruzan no estan en el hábitat (no generan oro); al reclamar el huevo vuelven a su hábitat
//(se carga antes de mapa.js porque la info de la estructura usa nivelMinimoCruce; la estructura se define en "estructuras" en mapa.js)


//=== CAMBIÁ ACÁ: NIVEL MÍNIMO PARA CRUZAR ===
//los dos mounstruos tienen que tener este nivel o más (se suben con comida)
let nivelMinimoCruce = 3;


//=== CAMBIÁ ACÁ: LAS RECETAS DE CRUCE ===
//padres = los dos mounstruos que hay que cruzar (el orden no importa: rojo + azul es lo mismo que azul + rojo)
//resultado = el huevo que da (siempre, 100%)
//los nombres son los de "monstruos" en datos-monstruos.js: rojo, azul, amarillo, verde, naranja, negro, blanco,
//violeta, marron, rosa, celeste, lila, gris, rainbow, plateado, dorado
//para agregar una receta nueva copiá una línea y cambiale los colores
let recetasCruce = [
    //raros (2 comunes)
    { padres: ["rojo", "azul"], resultado: "violeta" },
    { padres: ["naranja", "verde"], resultado: "marron" },
    { padres: ["amarillo", "azul"], resultado: "blanco" },
    { padres: ["rojo", "verde"], resultado: "negro" },
    //epicos (un común + el blanco)
    { padres: ["rojo", "blanco"], resultado: "rosa" },
    { padres: ["azul", "blanco"], resultado: "celeste" },
    //legendarios (hace falta al menos un épico)
    { padres: ["rosa", "marron"], resultado: "dorado" },
    { padres: ["celeste", "negro"], resultado: "plateado" },
    { padres: ["rosa", "celeste"], resultado: "rainbow" },
];
//si cruzás dos que NO tienen receta: da el huevo de uno de los dos padres (al azar)
//si cruzás dos del mismo color: da un huevo de ese color


//=== CAMBIÁ ACÁ: CUÁNTO TARDA EL CRUCE ===
//segundos que tarda con Reservados a nivel 1, según la calidad del huevo que va a salir
let tiempoCruce = { comun: 120, raro: 300, epico: 900, legendario: 1800 };
//cuanto tiempo le saca cada mejora de Reservados: 0.15 = 15% menos por cada nivel
//(nivel 1 = 100% del tiempo, nivel 2 = 85%, nivel 3 = 70%, nivel 4 = 55%, nivel 5 = 40%)
//el precio de la mejora y el nivel máximo se cambian en "estructuras" (mapa.js)
let reduccionPorNivelCruce = 0.15;

//CAMBIÁ ACÁ cuanta XP da reclamar el huevo de un cruce (según la calidad del huevo)
let xpCruce = { comun: 10, raro: 25, epico: 50, legendario: 100 };


//=== CALCULOS ===

//la receta de esos dos colores (o null si no hay)
function recetaDe(color1, color2) {
    return recetasCruce.find(function (receta) {
        return (receta.padres[0] === color1 && receta.padres[1] === color2)
            || (receta.padres[0] === color2 && receta.padres[1] === color1);
    }) || null;
}

//que huevo da el cruce
function resultadoCruce(color1, color2) {
    let receta = recetaDe(color1, color2);
    if (receta) {
        return receta.resultado;
    }
    return Math.random() < 0.5 ? color1 : color2;
}

//texto de lo que va a salir (para mostrar antes de empezar)
function textoResultado(color1, color2) {
    let receta = recetaDe(color1, color2);
    if (receta) {
        return "Huevo " + monstruos[receta.resultado].nombre.toLowerCase() + " (" + nombreCalidad(receta.resultado) + ")";
    }
    if (color1 === color2) {
        return "Huevo " + monstruos[color1].nombre.toLowerCase();
    }
    return "No hay receta: huevo " + monstruos[color1].nombre.toLowerCase() + " o " + monstruos[color2].nombre.toLowerCase();
}

//cuanto se multiplica el tiempo segun el nivel de Reservados (1 = todo el tiempo)
function factorTiempoCruce(nivel) {
    return Math.max(0.1, 1 - reduccionPorNivelCruce * (nivel - 1));
}

//segundos que tarda un cruce que da ese huevo, con Reservados a ese nivel
function segundosCruce(colorResultado, nivel) {
    return Math.round(tiempoCruce[monstruos[colorResultado].calidad] * factorTiempoCruce(nivel));
}

//"90s", "5m", "1m 30s"...
function textoTiempo(segundos) {
    let minutos = Math.floor(segundos / 60);
    let resto = segundos % 60;
    if (minutos === 0) {
        return resto + "s";
    }
    return minutos + "m" + (resto ? " " + resto + "s" : "");
}


//=== ELEGIR LOS MOUNSTRUOS ===
//los que se pueden cruzar: los de los hábitats y los del inventario
//cada uno es { monstruo, habitat } (habitat = null si esta en el inventario)
function monstruosParaCruzar() {
    let lista = [];
    for (let construida of construidas) {
        if (construida.tipo.nombre === "Hábitat") {
            for (let monstruo of construida.monstruos) {
                lista.push({ monstruo: monstruo, habitat: construida });
            }
        }
    }
    for (let monstruo of inventario.monstruos) {
        lista.push({ monstruo: monstruo, habitat: null });
    }
    return lista;
}

//los elegidos en la ventana de Reservados (todavia no empezo el cruce)
let elegidosCruce = [];

function motivoNoPuedeCruzar(monstruo) {
    if (monstruo.nivel < nivelMinimoCruce) {
        return "Necesita nivel " + nivelMinimoCruce;
    }
    return null;
}

function elegirParaCruce(monstruo) {
    if (elegidosCruce.length >= 2 || motivoNoPuedeCruzar(monstruo) || elegidosCruce.indexOf(monstruo) !== -1) {
        return;
    }
    elegidosCruce.push(monstruo);
    redibujarInterfaz();
}

function quitarDeCruce(monstruo) {
    elegidosCruce = elegidosCruce.filter(function (m) { return m !== monstruo; });
    redibujarInterfaz();
}

//saca al monstruo de donde este (hábitat o inventario) y devuelve el numero del hábitat (o -1 si estaba en el inventario)
function sacarParaCruce(monstruo) {
    for (let i = 0; i < construidas.length; i++) {
        let habitat = construidas[i];
        let lugar = habitat.monstruos.indexOf(monstruo);
        if (habitat.tipo.nombre === "Hábitat" && lugar !== -1) {
            acumular(habitat); //el oro de antes se cuenta con el monstruo todavia adentro
            habitat.monstruos.splice(lugar, 1);
            if (habitat.monstruos.length === 0) {
                habitat.calidad = null;
            }
            dibujarMarcador(habitat);
            return i;
        }
    }
    inventario.monstruos.splice(inventario.monstruos.indexOf(monstruo), 1);
    return -1;
}


//=== CRUZAR ===
//reservados.cruce = { padres: [monstruo, monstruo], origen: [numero de hábitat o -1], resultado: "violeta", fin }
function empezarCruce(reservados) {
    let disponibles = monstruosParaCruzar().map(function (d) { return d.monstruo; });
    elegidosCruce = elegidosCruce.filter(function (m) { return disponibles.indexOf(m) !== -1; });
    if (reservados.cruce || elegidosCruce.length !== 2) {
        return;
    }
    let padres = elegidosCruce;
    let origen = padres.map(sacarParaCruce);
    let resultado = resultadoCruce(padres[0].color, padres[1].color);
    reservados.cruce = {
        padres: padres, origen: origen, resultado: resultado,
        fin: Date.now() + segundosCruce(resultado, reservados.nivel) * 1000,
    };
    elegidosCruce = [];
    dibujarMarcador(reservados);
    refrescar();
}

function cruceListo(reservados) {
    return !!reservados.cruce && Date.now() >= reservados.cruce.fin;
}

//segundos que faltan y cuanto va (de 0 a 1)
function faltaCruce(reservados) {
    let cruce = reservados.cruce;
    let total = segundosCruce(cruce.resultado, reservados.nivel) * 1000;
    let falta = Math.max(cruce.fin - Date.now(), 0);
    return { segundos: Math.ceil(falta / 1000), avance: Math.min(1, 1 - falta / total) };
}

//gemas para terminarlo ya (usa segundosPorGema de monstruos.js, igual que los huevos)
function costoAcelerarCruce(reservados) {
    return Math.max(1, Math.ceil(faltaCruce(reservados).segundos / segundosPorGema));
}

function acelerarCruce(reservados) {
    let costo = costoAcelerarCruce(reservados);
    if (cruceListo(reservados) || recursos.gemas < costo) {
        return;
    }
    recursos.gemas -= costo;
    reservados.cruce.fin = Date.now();
    refrescar();
}

//al mejorar Reservados el cruce que se esta haciendo tambien se acorta:
//lo que le falta se multiplica por (tiempo del nivel nuevo / tiempo del nivel viejo)
//ej: le faltaban 100s, de nivel 1 (100%) a nivel 2 (85%) => ahora le faltan 85s
function acortarCruceEnCurso(reservados, nivelViejo) {
    if (!reservados.cruce || cruceListo(reservados)) {
        return;
    }
    let falta = reservados.cruce.fin - Date.now();
    let proporcion = factorTiempoCruce(reservados.nivel) / factorTiempoCruce(nivelViejo);
    reservados.cruce.fin = Date.now() + falta * proporcion;
}

//devuelve al monstruo a su hábitat (si todavia entra) o al inventario
//devuelve true si volvio al hábitat
function devolverDelCruce(monstruo, numeroHabitat) {
    let habitat = construidas[numeroHabitat];
    let calidad = monstruos[monstruo.color].calidad;
    if (habitat && habitat.tipo.nombre === "Hábitat" && habitat.monstruos.length < capacidad(habitat)
        && (!habitat.calidad || habitat.calidad === calidad)) {
        acumular(habitat);
        habitat.calidad = calidad;
        habitat.monstruos.push(monstruo);
        dibujarMarcador(habitat);
        return true;
    }
    inventario.monstruos.push(monstruo);
    return false;
}

function reclamarCruce(reservados) {
    if (!cruceListo(reservados)) {
        return;
    }
    let cruce = reservados.cruce;
    let alInventario = 0;
    cruce.padres.forEach(function (monstruo, i) {
        if (!devolverDelCruce(monstruo, cruce.origen[i])) {
            alInventario++;
        }
    });
    inventario.huevos.push(cruce.resultado);
    reservados.cruce = null;
    dibujarMarcador(reservados);

    let calidad = monstruos[cruce.resultado].calidad;
    let nota = "+" + xpCruce[calidad] + " XP"
        + (alInventario > 0 ? " · su hábitat estaba lleno, así que " + (alInventario === 1 ? "un padre volvió" : "los padres volvieron") + " al inventario" : "");
    felicitar("huevo", cruce.resultado, "Salió del cruce", [], nota); //felicitaciones.js
    ganarXP(xpCruce[calidad]); //experiencia.js
    refrescar();
}

//se llama 4 veces por segundo (mapa.js): el ! aparece arriba de Reservados cuando el huevo esta listo
function actualizarReservados() {
    for (let reservados of construidas) {
        if (reservados.tipo.nombre === "Reservados" && reservados.marcador) {
            reservados.marcador.classList.toggle("listo", cruceListo(reservados));
        }
    }
}
