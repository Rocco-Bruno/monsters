//cuanto hizo el jugador de cada cosa (lo usan las misiones para saber si se cumplieron)
let progreso = { estructuras: 0, incubadoras: 0, huevos: 0, mejorasGranja: 0 };

//misiones principales
//tipo = que cosa del progreso cuenta, meta = cuanto hay que hacer
//premio = "oro" o "gemas" (las dificiles dan gemas), cantidad = cuanto se gana
let misiones = [
    { texto: "Construí tu primera estructura", tipo: "estructuras", meta: 1, premio: "oro", cantidad: 100 },
    { texto: "Construí una incubadora", tipo: "incubadoras", meta: 1, premio: "oro", cantidad: 150 },
    { texto: "Eclosioná 1 huevo", tipo: "huevos", meta: 1, premio: "oro", cantidad: 200 },
    { texto: "Eclosioná 3 huevos", tipo: "huevos", meta: 3, premio: "oro", cantidad: 500 },
    { texto: "Mejorá 1 vez la granja", tipo: "mejorasGranja", meta: 1, premio: "oro", cantidad: 300 },
    { texto: "Construí 10 estructuras", tipo: "estructuras", meta: 10, premio: "gemas", cantidad: 3 },
    { texto: "Eclosioná 10 huevos", tipo: "huevos", meta: 10, premio: "gemas", cantidad: 5 },
    { texto: "Mejorá 5 veces la granja", tipo: "mejorasGranja", meta: 5, premio: "gemas", cantidad: 10 },
];

let listaMisiones = document.getElementById("lista-misiones");
let botonMisiones = document.getElementById("boton-misiones");

//abrir y cerrar el panel de misiones
botonMisiones.onclick = function () {
    listaMisiones.classList.toggle("abierto");
};

//llamar a esta funcion cada vez que el jugador hace algo
//ejemplo: sumarProgreso("huevos") cuando eclosiona un huevo
function sumarProgreso(tipo) {
    progreso[tipo]++;
    mostrarMisiones();
}

function reclamar(mision) {
    recursos[mision.premio] += mision.cantidad;
    mision.reclamada = true;
    mostrarRecursos();
    mostrarMisiones();
}

//dibuja la lista de misiones con su progreso
function mostrarMisiones() {
    listaMisiones.innerHTML = "<h2>Misiones</h2>";
    let hayPremio = false;

    for (let mision of misiones) {
        let hecho = Math.min(progreso[mision.tipo], mision.meta);
        let icono = mision.premio === "oro" ? "🪙" : "💎";

        let fila = document.createElement("div");
        fila.className = "mision";
        fila.innerHTML = "<p>" + mision.texto + "</p>"
            + "<span>" + hecho + "/" + mision.meta + "</span> "
            + "<span>" + icono + " " + mision.cantidad + "</span>";

        if (mision.reclamada) {
            fila.classList.add("reclamada");
        } else if (hecho === mision.meta) {
            let boton = document.createElement("button");
            boton.textContent = "Reclamar";
            boton.onclick = function () {
                reclamar(mision);
            };
            fila.appendChild(boton);
            hayPremio = true;
        }
        listaMisiones.appendChild(fila);
    }

    //el boton se pone amarillo si hay algun premio para reclamar
    botonMisiones.classList.toggle("hay-premio", hayPremio);
}

mostrarMisiones();
