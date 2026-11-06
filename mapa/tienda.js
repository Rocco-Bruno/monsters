//=== TIENDA: comprar huevos con oro ===
//el precio depende de la calidad del huevo (precioHuevo en calidades, monstruos.js)
//(se carga despues de interfaz.js porque usa sus ventanas)

function ventanaTienda() {
    let contenido = crearDiv("ventana-tienda");
    contenido.innerHTML = '<p class="capacidad">Tenés 🪙 <b>' + recursos.oro + "</b></p>";

    //CAMBIÁ ACÁ que calidades se venden (por ahora solo los comunes; los demas se consiguen de otra forma)
    let calidadesEnVenta = ["comun"];

    for (let calidad of calidadesEnVenta) {
        let precio = calidades[calidad].precioHuevo;
        contenido.insertAdjacentHTML("beforeend", "<h3>" + calidades[calidad].nombre + " · 🪙 " + precio + "</h3>");
        for (let color in monstruos) {
            if (monstruos[color].calidad !== calidad) {
                continue;
            }
            let falta = recursos.oro < precio;
            contenido.appendChild(filaMonstruo(
                spriteHuevo(color, 1.5),
                "Huevo " + monstruos[color].nombre.toLowerCase(),
                "🪙 " + precio,
                [crearBoton("Comprar", function () { comprarHuevo(color); }, falta, falta ? "Falta oro" : "")]
            ));
        }
    }
    return { titulo: "Tienda", contenido: contenido };
}

function comprarHuevo(color) {
    let precio = calidades[monstruos[color].calidad].precioHuevo;
    if (recursos.oro < precio) {
        return;
    }
    recursos.oro -= precio;
    inventario.huevos.push(color); //va al inventario, de ahi se incuba
    refrescar();
    dibujarVentana(); //actualiza el oro y los botones de la tienda
}

document.getElementById("boton-tienda").onclick = function () {
    deseleccionar(); //asi no queda abierta la barra de otra estructura
    abrirVentana(ventanaTienda);
};
