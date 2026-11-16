//=== ICONOS ANIMADOS DE ORO, GEMAS Y COMIDA ===
//En todo el juego se escribe 🪙 / 💎 / 🍖 en los textos (es más fácil),
//y este archivo los cambia solo por los dibujos animados de assets/png/recursos/.
//Se carga en mapa.html y en perfil.html.

//CAMBIÁ ACÁ los dibujos (tiras horizontales de cuadros de 32x32)
let iconosRecursos = {
    "🪙": { src: "oro.png", frames: 5 },
    "💎": { src: "gema.png", frames: 5 },
    "🍖": { src: "comida.png", frames: 6 },
};
let carpetaRecursos = "../assets/png/recursos/";
let velocidadIconos = 200; //milisegundos que dura cada cuadro

//estilos de los iconos (van acá para que funcionen en cualquier página)
(function () {
    let estilo = document.createElement("style");
    estilo.textContent =
        ".icono-recurso {"
        + "  display: inline-block; width: 1.3em; height: 1.3em; vertical-align: -0.3em;"
        + "  background-repeat: no-repeat; image-rendering: pixelated;"
        + "  animation: animar-icono-recurso infinite;"
        + "}"
        + "@keyframes animar-icono-recurso {"
        + "  from { background-position: 0 0; }"
        + "  to { background-position: var(--fin) 0; }"
        + "}";
    document.head.appendChild(estilo);
})();

//arma el <span> animado de un emoji
function iconoRecurso(emoji) {
    let datos = iconosRecursos[emoji];
    let duracion = datos.frames * velocidadIconos;
    let span = document.createElement("span");
    span.className = "icono-recurso";
    span.setAttribute("aria-label", emoji);
    span.style.backgroundImage = 'url("' + carpetaRecursos + datos.src + '")';
    span.style.backgroundSize = (datos.frames * 1.3) + "em 1.3em";
    span.style.setProperty("--fin", (-datos.frames * 1.3) + "em");
    span.style.animationDuration = duracion + "ms";
    span.style.animationTimingFunction = "steps(" + datos.frames + ")";
    //todos los iconos van sincronizados, asi cuando un texto se actualiza no se "reinicia" el dibujo
    span.style.animationDelay = -(performance.now() % duracion) + "ms";
    return span;
}

let buscarEmojis = new RegExp("(" + Object.keys(iconosRecursos).join("|") + ")");

//busca los emojis dentro de un elemento y los cambia por los iconos
function cambiarEmojis(raiz) {
    if (raiz.nodeType === Node.TEXT_NODE) {
        cambiarTexto(raiz);
        return;
    }
    if (raiz.nodeType !== Node.ELEMENT_NODE || raiz.closest("script, style, textarea")) {
        return;
    }
    let caminante = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    let textos = [];
    while (caminante.nextNode()) {
        if (buscarEmojis.test(caminante.currentNode.nodeValue)) {
            textos.push(caminante.currentNode);
        }
    }
    textos.forEach(cambiarTexto);
}

function cambiarTexto(nodo) {
    let padre = nodo.parentNode;
    if (!padre || !buscarEmojis.test(nodo.nodeValue) || padre.closest("script, style, textarea")) {
        return;
    }
    let partes = nodo.nodeValue.split(buscarEmojis);
    let nuevo = document.createDocumentFragment();
    for (let parte of partes) {
        if (iconosRecursos[parte]) {
            nuevo.appendChild(iconoRecurso(parte));
        } else if (parte) {
            nuevo.appendChild(document.createTextNode(parte));
        }
    }
    padre.replaceChild(nuevo, nodo);
}

//cambia los que ya estan en la página y los que se agreguen después
cambiarEmojis(document.body);
new MutationObserver(function (cambios) {
    for (let cambio of cambios) {
        if (cambio.type === "characterData") {
            cambiarTexto(cambio.target);
        }
        cambio.addedNodes.forEach(cambiarEmojis);
    }
}).observe(document.body, { childList: true, subtree: true, characterData: true });
