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

// === NOMBRE: CAMBIÁ ACÁ las reglas ===
let largoMinimo = 3;
let largoMaximo = 16; // (tiene que coincidir con maxlength del input en inicio.html)
// Solo letras (con tildes y ñ), números, espacios, guion y guion bajo
let caracteresPermitidos = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 _-]+$/;
// Palabras prohibidas (en minúscula, sin tildes y sin letras repetidas: "puuuta" se lee "puta").
// Se buscan adentro de todo el nombre, aunque esté separado ("p u t a") o con números ("pvt4", "m1erda").
let palabrasProhibidas = [
    "puta", "puto", "mierda", "pelotud", "boludo", "verga", "poronga", "garcha", "culiad", "culiao",
    "chupala", "chupame", "conchetu", "conchatu", "concha", "pija", "choto", "trolo", "forro", "orto",
    "culo", "coger", "cogo", "garca", "pendej", "cabron", "maricon", "marica", "joder", "folar",
    "idiota", "imbecil", "estupid", "subnormal", "retrasad", "mogolic", "sorete", "hdp", "ctm",
    "violar", "violad", "nazi", "hitler", "porno", "sexo", "teta", "pene", "vagina",
    "fuck", "shit", "bitch", "dick", "cock", "pusy", "cunt", "whore", "slut", "niga", "niger", "fag",
];
// Palabras normales que contienen una prohibida adentro (se sacan antes de buscar)
let palabrasPermitidas = [
    "computa", "computo", "disputa", "disputo", "reputa", "reputo", "imputa", "diputad", "pijama",
    "escultor", "oculo", "calculo", "orton", "porto", "cogollo", "penelope", "dickens", "cocker",
    "tetera", "tetris", "hdpe",
];

// Pasa el nombre a una forma simple para comparar: minúsculas, sin tildes, números como letras,
// sin espacios ni símbolos y sin letras repetidas
function normalizar(texto) {
    let numeros = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "9": "g" };
    return texto.toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[0-9]/g, function (n) { return numeros[n] || ""; })
        .replace(/v/g, "u")
        .replace(/[^a-zñ]/g, "")
        .replace(/(.)\1+/g, "$1");
}

// Devuelve que tiene de malo el nombre (o null si esta bien)
function problemaDelNombre(nombre) {
    if (nombre.length < largoMinimo) {
        return "El nombre tiene que tener al menos " + largoMinimo + " caracteres.";
    }
    if (nombre.length > largoMaximo) {
        return "El nombre puede tener como mucho " + largoMaximo + " caracteres.";
    }
    if (!caracteresPermitidos.test(nombre)) {
        return "Solo se pueden usar letras, números, espacios, - y _.";
    }
    if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(nombre) || (nombre.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g).length < 2)) {
        return "El nombre tiene que tener al menos 2 letras.";
    }
    if (/(.)\1\1\1/i.test(nombre)) {
        return "No repitas tanto la misma letra.";
    }
    let simple = normalizar(nombre);
    for (let permitida of palabrasPermitidas) {
        simple = simple.split(normalizar(permitida)).join("_");
    }
    for (let prohibida of palabrasProhibidas) {
        if (simple.indexOf(normalizar(prohibida)) !== -1) {
            return "Ese nombre no está permitido. Probá con otro.";
        }
    }
    return null;
}

// Mientras se escribe se borran los caracteres que no se pueden usar
inputNombre.addEventListener("input", function () {
    let limpio = inputNombre.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 _-]/g, "").replace(/  +/g, " ");
    if (limpio !== inputNombre.value) {
        inputNombre.value = limpio;
        errorNombre.textContent = "Solo se pueden usar letras, números, espacios, - y _.";
    } else {
        errorNombre.textContent = "";
    }
});

// Al confirmar el nombre empieza una partida nueva (se borra la partida guardada) y se va al mapa
document.getElementById("form-nombre").onsubmit = function (evento) {
    evento.preventDefault();
    let nombre = inputNombre.value.trim().replace(/\s+/g, " ");
    let problema = problemaDelNombre(nombre);
    if (problema) {
        errorNombre.textContent = problema;
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
