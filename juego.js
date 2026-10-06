let animaciones ={
    redhuevo:{
        imagen: new Image(), frameactual: 0, totalframes: 8,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    redbebe:{
        imagen: new Image(), frameactual: 0, totalframes: 9,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    }
};
animaciones.redhuevo.imagen.src = "assets/png/mounstruos/red/red-huevo.png";
animaciones.redbebe.imagen.src = "assets/png/mounstruos/red/red-bebe-quieto.png";

let mounstruos ={
    id, nombre, nivel, etapa de crecimiento,color, calidad, tiempo eclosion, oro xSegundo, info, tiempo de cruce (puede ser null), experiencia que da, prestigio
}
//los monsters solo pueden estar en el habitat de su misma calidad ej: comunes = comunes, comunes != legendarios
let habitats ={
    id, nivel "capacidad", calidad, precio, tiempo de construccion, tiempo de mejora, maximo de oro producido, posicion en mapa,tamaño, info
}

let jugador = [id, nombre, nivel, coleccion, prestigio];

let recursos = [oro, comida, gemas, info];

let granja = [id, nivel, velocidad de produccion, maximo, tiempo construccion, posicion en mapa,tamaño, precio info];

let arbol = [nivel "tiempo de cruce", mounstruo1, mountruo2, resultado cruce,posicion en mapa,tamaño, info];

let incubadora = [nivel "capacidad de huevos", mountruo1-5, posicion en mapa,tamaño, info];//nivel 1 = 1 huevo, lv 2 = 2 huevos...

let tienda = [habitats, mountruos, recursos];



/*NOTAS///////////////////
animaciones listas:
rojo = bebe/huevo
naranja = bebe/huevo
blanco = bebe/huevo x2
azul = bebe
dorado = bebe
negro = bebe
verde = bebe/huevo
rosa = bebe
amarillo = bebe/huevo
celeste = bebe/huevo
violeta = bebe/huevo
plateado =
marron =
rainbow = 

//CALIDADES/RAREZAS
*comunes (rojo, azul, amarillo, verde, naranja)//se pueden comprar por oro, gemas, cruce
*raros (negro, blanco, violeta, marron)//gemas, cruce, misiones
*epico("lila", rosa, celeste, gris)//cruce, gemas, misiones
*legendario (rainbow, plateado, dorado)//gemas, misiones, cruce
*/