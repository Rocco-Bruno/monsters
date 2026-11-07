// Claves donde se guarda la partida y el jugador (ver mapa/guardado.js y perfil jugador/perfil.js)
let clavePartida = "monsters-city-partida";
let claveJugador = "monsters-city-jugador";

let ventanaNombre = document.getElementById("ventana-nombre");
let inputNombre = document.getElementById("input-nombre");
let errorNombre = document.getElementById("error-nombre");

// Al pulsar Play se abre la ventana para poner el nombre (no se va al mapa todavia)
document.getElementById("boton-play").onclick = function (evento) {
    evento.preventDefault();
    try {
        let jugador = JSON.parse(sessionStorage.getItem(claveJugador));
        inputNombre.value = jugador ? jugador.nombre : "";
    } catch (error) {
    }
    errorNombre.textContent = "";
    ventanaNombre.classList.add("abierto");
    inputNombre.focus();
};

// Cancelar o tocar afuera cierra la ventana
document.getElementById("boton-cancelar").onclick = cerrarVentanaNombre;
ventanaNombre.onclick = function (evento) {
    if (evento.target === ventanaNombre) {
        cerrarVentanaNombre();
    }
};
document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
        cerrarVentanaNombre();
    }
});

function cerrarVentanaNombre() {
    ventanaNombre.classList.remove("abierto");
}

// Al confirmar el nombre empieza una partida nueva (se borra la partida guardada) y se va al mapa
document.getElementById("form-nombre").onsubmit = function (evento) {
    evento.preventDefault();
    let nombre = inputNombre.value.trim();
    if (nombre.length < 2) {
        errorNombre.textContent = "El nombre tiene que tener al menos 2 letras.";
        return;
    }
    try {
        sessionStorage.removeItem(clavePartida);
        sessionStorage.setItem(claveJugador, JSON.stringify({ nombre: nombre }));
    } catch (error) {
    }
    location.href = document.getElementById("boton-play").href;
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
