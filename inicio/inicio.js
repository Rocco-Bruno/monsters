// Al pulsar Play empieza una partida nueva (se borra la partida guardada, ver mapa/guardado.js).
document.getElementById("boton-play").onclick = function () {
    try {
        sessionStorage.removeItem("monsters-city-partida");
    } catch (error) {
    }
};

// Al pulsar Configuración, muestra un aviso mientras esa opción está pendiente.
document.getElementById("boton-configuracion").onclick = function () {
    alert("Próximamente");
};

// Al pulsar Salir, agradece al jugador e intenta cerrar la ventana actual.
// El navegador puede impedir el cierre si la ventana no fue abierta por JavaScript.
document.getElementById("boton-salir").onclick = function () {
    alert("¡Gracias por jugar!");
    window.close();
};
