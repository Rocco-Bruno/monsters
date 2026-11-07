//=== INTRO: el logo animado que aparece al abrir el juego ===
//cuando termina la animacion (o si el jugador toca la pantalla o una tecla) pasa a la pantalla de Play

//CAMBIÁ ACÁ cuanto dura la animacion en milisegundos (el GIF dura 4,7 segundos)
let duracionIntro = 4700;
//milisegundos que tarda en apagarse la pantalla antes de pasar (igual que la transition de intro.css)
let duracionFundido = 600;

let pantallaIntro = document.getElementById("pantalla-intro");
let terminada = false;

function terminarIntro() {
    if (terminada) {
        return;
    }
    terminada = true;
    pantallaIntro.classList.add("saliendo");
    setTimeout(function () {
        location.replace("../inicio/inicio.html"); //replace: asi "atras" no vuelve a la intro
    }, duracionFundido);
}

//el fundido empieza antes de que termine el GIF (si no, el GIF vuelve a empezar y se ve un salto)
setTimeout(terminarIntro, duracionIntro - duracionFundido);
pantallaIntro.onclick = terminarIntro;
document.addEventListener("keydown", terminarIntro);
