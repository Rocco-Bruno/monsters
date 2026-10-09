let animaciones ={//acá cargamos todas las "stats" de cada animacion
    //ROJO
    rojohuevo:{
        imagen: new Image(), frameactual: 0, totalframes: 8,
        tiempo: 0, velocidad: 55, anchoframe: 0, altoframe: 0, loop: true
        //Imagen: cargamos la animacion en PNG
        //frameactual: desde donde comienza
        //totalframes: cantidad de frames para recorrer
        //tiempo: siempre 0
        //velocidad: 5velocidad con la que se reproduce la animacion
        //anchoframe: siempre 0 (ancho de cada frame, siempre es el mismo en toda la animacion)
        //altoframe: siempre 0 (alto de cada frame)
        //loop: para que se reproduzca infinitamente o no
    },
    rojobebe:{
        imagen: new Image(), frameactual: 0, totalframes: 9,
        tiempo: 0, velocidad: 55, anchoframe: 0, altoframe: 0, loop: true
    },
    rojoadulto:{
        imagen: new Image(), frameactual: 0, totalframes: 10,
        tiempo: 0, velocidad: 55, anchoframe: 0, altoframe: 0, loop: true
    },
    //AZUL/////////////////////////////////////////////////////////////////////////////////////
    azulhuevo:{
        imagen: new Image(), frameactual: 0, totalframes: 8,
        tiempo: 0, velocidad: 55, anchoframe: 0, altoframe: 0, loop: true
    },
    azulbebe:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 55, anchoframe: 0, altoframe: 0, loop: true
    },
    //AMARILLO/////////////////////////////////////////////////////////////////////////////////////
    amarillohuevo:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    amarillobebe:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    //VERDE/////////////////////////////////////////////////////////////////////////////////////
    verdehuevo:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    verdebebe:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    //NARANJA/////////////////////////////////////////////////////////////////////////////////////
    naranjahuevo:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    naranjabebe:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    //ROSA/////////////////////////////////////////////////////////////////////////////////////
    rosahuevo:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    rosabebe:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    //BLANCO/////////////////////////////////////////////////////////////////////////////////////
    blancohuevo:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    blancobebe:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    //NEGRO/////////////////////////////////////////////////////////////////////////////////////
    negrohuevo:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    negrobebe:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    //VIOLETA/////////////////////////////////////////////////////////////////////////////////////
    violetahuevo:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    violetabebe:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    //MARRON/////////////////////////////////////////////////////////////////////////////////////
    marronhuevo:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    marronbebe:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    //PLATEADO/////////////////////////////////////////////////////////////////////////////////////
    plateadohuevo:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    plateadobebe:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    //DORADO/////////////////////////////////////////////////////////////////////////////////////
    doradohuevo:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    doradobebe:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    //RAINBOW/////////////////////////////////////////////////////////////////////////////////////
    rainbowhuevo:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },
    rainbowbebe:{
        imagen: new Image(), frameactual: 0, totalframes: ,
        tiempo: 0, velocidad: 5, anchoframe: 0, altoframe: 0, loop: true
    },

};
//Acá asignamos cada (png) a las animaciones
//Rojo
animaciones.rojohuevo.imagen.src = "assets/png/mounstruos/red/red-huevo.png";
animaciones.rojobebe.imagen.src = "assets/png/mounstruos/red/red-bebe-quieto.png";
animaciones.rojoadulto.imagen.src = "assets/png/mounstruos/red/rojo-joven.png";
//Azul
animaciones.azulhuevo.imagen.src = "";
animaciones.azulbebe.imagen.src = "";
//Amarillo
animaciones.amarillohuevo.imagen.src = "";
animaciones.amarillobebe.imagen.src = "assets/png/mounstruos/yellow/yellow-bebe.png";
//Verde
animaciones.verdehuevo.imagen.src = "";
animaciones.verdebebe.imagen.src = "";
//Naranja
animaciones.naranjahuevo.imagen.src = "";
animaciones.naranjabebe.imagen.src = "";
//Rosa
animaciones.rosahuevo.imagen.src = "";
animaciones.rosabebe.imagen.src = "";
//Blanco
animaciones.blancohuevo.imagen.src = "";
animaciones.blancobebe.imagen.src = "";
//Negro
animaciones.negrohuevo.imagen.src = "";
animaciones.negrobebe.imagen.src = "";
//Violeta
animaciones.violetahuevo.imagen.src = "";
animaciones.violetabebe.imagen.src = "";
//Marron
animaciones.marronhuevo.imagen.src = "";
animaciones.marronbebe.imagen.src = "";
//Plateado
animaciones.plateadohuevo.imagen.src = "";
animaciones.plateadobebe.imagen.src = "";
//Dorado
animaciones.doradohuevo.imagen.src = "";
animaciones.doradobebe.imagen.src = "";
//Rainbow
animaciones.rainbowhuevo.imagen.src = "";
animaciones.rainbowbebe.imagen.src = "";






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