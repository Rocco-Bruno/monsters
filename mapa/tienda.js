//=== TIENDA: cajas, huevos (con oro o con gemas) y cambio de gemas por oro ===
//el precio de los huevos comunes depende de la calidad (precioHuevo en calidades, datos-monstruos.js)
//los huevos exclusivos se pagan con gemas (precioGemas en datos-monstruos.js)
//(se carga despues de interfaz.js porque usa sus ventanas)

//=== CAJAS: CAMBIÁ ACÁ ===
//cada caja da un huevo al azar (va al inventario, de ahi se incuba)
//id = nombre interno (no cambiarlo, se usa para guardar la garantia)
//moneda = con que se paga ("oro" o "gemas"), precio = cuanto
//nivelRequerido = nivel del jugador que hace falta para abrirla (si no tiene, no pide nivel)
//probabilidades = % de que salga cada calidad (se reparten entre el total, aunque no sumen 100)
//    dentro de la calidad que sale, todos los huevos de esa calidad tienen la misma chance (los exclusivos no salen)
//garantia = cada cuantas cajas sin legendario sale uno seguro (si no tiene, no hay garantia)
//chanceGemas / gemasPremio = % de chance de que en vez de un huevo salgan gemas, y cuantas
//imagen: por ahora es un recuadro de color; despues se puede poner la imagen o animacion de la caja
let cajas = [
    {
        id: "misteriosa", nombre: "Caja misteriosa",
        moneda: "oro", precio: 500,
        probabilidades: { comun: 79.9, raro: 15, epico: 5, legendario: 25 },
        chanceGemas: 2, gemasPremio: 3,
    },
    {
        id: "premium", nombre: "Caja premium",
        moneda: "gemas", precio: 10, nivelRequerido: 3,
        probabilidades: { raro: 70, epico: 25, legendario: 5 },
        garantia: 20,
    },
];

//cuantas cajas seguidas se abrieron sin que salga un legendario (por id de caja; se guarda con la partida)
let garantias = {};

//=== CAMBIO DE GEMAS POR ORO: CAMBIÁ ACÁ ===
//a proposito no conviene mucho: las gemas valen mas usandolas en otras cosas
let cambiosGemas = [
    { gemas: 1, oro: 100 },
    { gemas: 10, oro: 1200 },
];

function ventanaTienda() {
    let contenido = crearDiv("ventana-tienda");
    contenido.innerHTML = '<p class="capacidad">Tenés 🪙 <b>' + recursos.oro + "</b> · 💎 <b>" + recursos.gemas + "</b></p>";

    //--- cajas ---
    contenido.insertAdjacentHTML("beforeend", "<h3>Cajas</h3>");
    cajas.forEach(function (caja, i) {
        contenido.appendChild(tarjetaCaja(caja, i));
    });

    //--- huevos con oro ---
    //CAMBIÁ ACÁ que calidades se venden (por ahora solo los comunes; los demas se consiguen de otra forma)
    let calidadesEnVenta = ["comun"];
    for (let calidad of calidadesEnVenta) {
        contenido.insertAdjacentHTML("beforeend", "<h3>Huevos " + calidades[calidad].nombre.toLowerCase() + "</h3>");
        for (let color in monstruos) {
            if (monstruos[color].calidad === calidad && !monstruos[color].exclusivo) {
                contenido.appendChild(filaHuevoEnVenta(color));
            }
        }
    }

    //--- huevos exclusivos (con gemas) ---
    contenido.insertAdjacentHTML("beforeend", "<h3>Huevos exclusivos</h3>"
        + '<p class="aclaracion">Solo se consiguen acá, no salen en las cajas.</p>');
    for (let color in monstruos) {
        if (monstruos[color].exclusivo) {
            contenido.appendChild(filaHuevoEnVenta(color));
        }
    }

    //--- cambiar gemas por oro ---
    contenido.insertAdjacentHTML("beforeend", "<h3>Cambiar gemas</h3>");
    for (let cambio of cambiosGemas) {
        let falta = recursos.gemas < cambio.gemas;
        let fila = crearDiv("fila-monstruo fila-cambio",
            '<span class="icono-cambio">💎</span><div class="texto"><b>💎 ' + cambio.gemas + " ➜ 🪙 " + cambio.oro + "</b></div>");
        let acciones = crearDiv("acciones");
        acciones.appendChild(crearBoton("Cambiar", function () { cambiarGemas(cambio); }, falta, falta ? "Faltan gemas" : ""));
        fila.appendChild(acciones);
        contenido.appendChild(fila);
    }
    return { titulo: "Tienda", contenido: contenido };
}

//=== PRECIOS ===
let iconoMoneda = { oro: "🪙", gemas: "💎" };

//{ moneda, cantidad } que cuesta un huevo en la tienda
function precioHuevo(color) {
    let monstruo = monstruos[color];
    if (monstruo.exclusivo) {
        return { moneda: "gemas", cantidad: monstruo.precioGemas };
    }
    return { moneda: "oro", cantidad: calidades[monstruo.calidad].precioHuevo };
}

function filaHuevoEnVenta(color) {
    let precio = precioHuevo(color);
    let falta = recursos[precio.moneda] < precio.cantidad;
    return filaMonstruo(
        spriteHuevo(color, 1.5),
        "Huevo " + monstruos[color].nombre.toLowerCase(),
        nombreCalidad(color) + " · " + iconoMoneda[precio.moneda] + " " + precio.cantidad,
        [crearBoton("Comprar", function () { comprarHuevo(color); }, falta, falta ? "Falta " + precio.moneda : "")]
    );
}

//=== CAJAS ===
//devuelve por que no se puede abrir (o null si se puede)
function motivoNoAbre(caja) {
    if (caja.nivelRequerido && jugador.nivel < caja.nivelRequerido) {
        return "Desde nivel " + caja.nivelRequerido;
    }
    if (recursos[caja.moneda] < caja.precio) {
        return caja.moneda === "oro" ? "Falta oro" : "Faltan gemas";
    }
    return null;
}

//cuantas cajas faltan para el legendario seguro
function faltanParaGarantia(caja) {
    return caja.garantia - (garantias[caja.id] || 0);
}

//la tarjeta de una caja: imagen, nombre, probabilidades y boton para abrirla
function tarjetaCaja(caja, i) {
    let tarjeta = crearDiv("tarjeta-caja caja-" + caja.id);
    //ACÁ va a ir la imagen o animacion de la caja (por ahora un recuadro de color)
    tarjeta.appendChild(crearDiv("imagen-caja"));

    let texto = crearDiv("texto-caja", "<b>" + caja.nombre + "</b>");
    let lista = crearDiv("probabilidades");
    for (let calidad in caja.probabilidades) {
        lista.insertAdjacentHTML("beforeend",
            '<span class="calidad-' + calidad + '">' + calidades[calidad].nombre + " " +
            caja.probabilidades[calidad].toLocaleString("es-AR") + "%</span>");
    }
    if (caja.chanceGemas) {
        lista.insertAdjacentHTML("beforeend", '<span class="calidad-gemas">' + caja.gemasPremio + " gemas " +
            caja.chanceGemas.toLocaleString("es-AR") + "%</span>");
    }
    texto.appendChild(lista);
    if (caja.garantia) {
        texto.insertAdjacentHTML("beforeend", '<span class="garantia">Legendario seguro en <b>' + faltanParaGarantia(caja) + "</b> cajas</span>");
    }

    let motivo = motivoNoAbre(caja);
    let bloqueada = motivo && motivo.indexOf("Desde") === 0;
    let boton = crearBoton(bloqueada ? "🔒 " + motivo : "Abrir " + iconoMoneda[caja.moneda] + " " + caja.precio,
        function () { abrirCaja(i); }, motivo, motivo || "");
    tarjeta.classList.toggle("bloqueada", !!bloqueada);
    texto.appendChild(boton);
    tarjeta.appendChild(texto);
    return tarjeta;
}

//elige una calidad segun las probabilidades (o la que se pida) y despues un huevo de esa calidad
function sortearHuevo(caja, calidadForzada) {
    let calidadElegida = calidadForzada;
    if (!calidadElegida) {
        let total = 0;
        for (let calidad in caja.probabilidades) {
            total += caja.probabilidades[calidad];
        }
        let tirada = Math.random() * total;
        for (let calidad in caja.probabilidades) {
            calidadElegida = calidad;
            tirada -= caja.probabilidades[calidad];
            if (tirada < 0) {
                break;
            }
        }
    }
    let posibles = Object.keys(monstruos).filter(function (color) {
        return monstruos[color].calidad === calidadElegida && !monstruos[color].exclusivo;
    });
    return posibles[Math.floor(Math.random() * posibles.length)];
}

function abrirCaja(i) {
    let caja = cajas[i];
    if (motivoNoAbre(caja)) {
        return;
    }
    recursos[caja.moneda] -= caja.precio;
    sumarProgreso("cajas"); //misiones.js
    let otraVez = [{
        texto: "Abrir otra " + iconoMoneda[caja.moneda] + " " + caja.precio, clase: "verde",
        accion: function () { abrirCaja(i); }, deshabilitado: false,
    }];

    //a veces salen gemas en vez de un huevo
    if (caja.chanceGemas && Math.random() * 100 < caja.chanceGemas) {
        recursos.gemas += caja.gemasPremio;
        refrescar();
        dibujarVentana(); //actualiza la tienda que queda abierta atras
        otraVez[0].deshabilitado = !!motivoNoAbre(caja);
        felicitarEspecial({ //felicitaciones.js
            subtitulo: "¡Qué suerte! En vez de un huevo salieron gemas",
            icono: "💎", nombre: "+" + caja.gemasPremio + " gemas", color: "gemas",
            detalle: caja.nombre, botonesExtra: otraVez,
        });
        return;
    }

    //garantia: si ya se abrieron muchas sin legendario, este es legendario seguro
    let nota = "";
    let forzada = null;
    if (caja.garantia) {
        garantias[caja.id] = (garantias[caja.id] || 0) + 1;
        if (garantias[caja.id] >= caja.garantia) {
            forzada = "legendario";
            nota = "¡Legendario seguro por la garantía!";
        }
    }
    let color = sortearHuevo(caja, forzada);
    if (caja.garantia && monstruos[color].calidad === "legendario") {
        garantias[caja.id] = 0; //vuelve a empezar la cuenta
    }

    inventario.huevos.push(color); //cuando eclosione se suma a la coleccion
    refrescar();
    dibujarVentana(); //actualiza la tienda que queda abierta atras
    otraVez[0].deshabilitado = !!motivoNoAbre(caja);
    felicitar("huevo", color, caja.nombre, otraVez, nota); //felicitaciones.js
}

//=== COMPRAR HUEVOS Y CAMBIAR GEMAS ===
function comprarHuevo(color) {
    let precio = precioHuevo(color);
    if (recursos[precio.moneda] < precio.cantidad) {
        return;
    }
    recursos[precio.moneda] -= precio.cantidad;
    inventario.huevos.push(color); //va al inventario, de ahi se incuba
    sumarProgreso("compras"); //misiones.js
    refrescar();
    dibujarVentana(); //actualiza el oro y los botones de la tienda
    felicitar("huevo", color, "Comprado en la tienda"); //felicitaciones.js
}

function cambiarGemas(cambio) {
    if (recursos.gemas < cambio.gemas) {
        return;
    }
    recursos.gemas -= cambio.gemas;
    recursos.oro += cambio.oro;
    refrescar();
    dibujarVentana();
}

document.getElementById("boton-tienda").onclick = function () {
    deseleccionar(); //asi no queda abierta la barra de otra estructura
    abrirVentana(ventanaTienda);
};
