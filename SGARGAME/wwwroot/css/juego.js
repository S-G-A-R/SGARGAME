let canvas, ctx;
let objetos = [];
let velocidadCaida = 3;
let interval;
let dotnetRef;
let boteSeleccionado = null;
let tiempoUltimoObjeto = 0;
let intervaloGeneracion = 1200;

const tiposBasura = [
    { tipo: "papel", img: "/imagenes/objetos/papel.png" },
    { tipo: "botella", img: "/imagenes/objetos/agua.png" },
    { tipo: "lata", img: "/imagenes/objetos/lata.png" },
    { tipo: "bolsa", img: "/imagenes/objetos/bolsadeplastico.png" },
    { tipo: "carton", img: "/imagenes/objetos/caja.png" },
    { tipo: "fruta", img: "/imagenes/objetos/cascara.png" },
    { tipo: "hoja", img: "/imagenes/objetos/hoja.png" },
    { tipo: "botellavidrio", img: "/imagenes/objetos/botellavidrio.png" },
    { tipo: "colillas", img: "/imagenes/objetos/colillas.png" },
    { tipo: "panal", img: "/imagenes/objetos/panal.png" },
    { tipo: "papelsucio", img: "/imagenes/objetos/papelsucio.png" }

];

//window.iniciarJuego = function (dotnet) {
//    try {
//        dotnetRef = dotnet;
//        console.log("Iniciando juego, dotnetRef:", !!dotnetRef);

//        const gameArea = document.getElementById("gameArea");
//        if (!gameArea) {
//            console.error("No existe #gameArea en el DOM");
//            return;
//        }

//        // Asegurar canvas
//        let existingCanvas = document.getElementById("gameCanvas");
//        if (!existingCanvas) {
//            const canvasEl = document.createElement("canvas");
//            canvasEl.id = "gameCanvas";
//            canvasEl.width = 800;
//            canvasEl.height = 500;
//            gameArea.appendChild(canvasEl);
//        }


//};

window.iniciarJuego = function (dotnet) {
    try {
        dotnetRef = dotnet;

        const gameArea = document.getElementById("gameArea");
        if (!gameArea) return;

        let existingCanvas = document.getElementById("gameCanvas");
        if (!existingCanvas) {
            const canvasEl = document.createElement("canvas");
            canvasEl.id = "gameCanvas";
            canvasEl.width = 800;
            canvasEl.height = 500;
            gameArea.appendChild(canvasEl);
        }

        canvas = document.getElementById("gameCanvas");
        ctx = canvas.getContext("2d");

        // 🚨 IMPORTANTE: AQUI AGREGAMOS LOS BOTES
        crearBotes(gameArea);

        objetos = [];
        boteSeleccionado = null;

        clearInterval(interval);
        interval = setInterval(update, 30);

    } catch (e) {
        console.error("Error:", e);
    }
};


function crearBotes(gameArea) {

    // Si ya existen, no los crea otra vez
    let contenedor = document.getElementById("botesContainer");

    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "botesContainer";   // ID para CSS
        gameArea.appendChild(contenedor);   // 👈 SE AGREGA ABAJO, NO ARRIBA
    }

    // Limpiar antes de agregar
    contenedor.innerHTML = "";

    const bins = [
        { key: "papel", label: "🗞️ Papel/Carton" },
        { key: "plastico", label: "🛍️ Plástico/Latas" },
        { key: "vidrio", label: "🍾 Vidrio" },
        { key: "organico", label: "🍌 Orgánico" },
        { key: "noreciclable", label: "🚫 No reciclable" }
    ];

    bins.forEach(b => {
        const btn = document.createElement("div");
        btn.className = `bote bin-${b.key}`;
        btn.setAttribute("data-bin", b.key);
        btn.innerText = b.label;
        btn.style.userSelect = "none";
        btn.addEventListener("click", () => seleccionarBote(b.key));
        contenedor.appendChild(btn);
    });
}


function update() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ahora = Date.now();

    if (ahora - tiempoUltimoObjeto > intervaloGeneracion && objetos.length < 5) {
        tiempoUltimoObjeto = ahora;

        const tipo = tiposBasura[Math.floor(Math.random() * tiposBasura.length)];
        const img = new Image();
        img.src = tipo.img;

        const objeto = {
            tipo: tipo.tipo,
            x: Math.random() * (canvas.width - 50),
            y: -60,
            img: img,
            ancho: 45,
            alto: 45,
            cargada: false
        };

        img.onload = () => (objeto.cargada = true);
        objetos.push(objeto);
    }

    for (let i = 0; i < objetos.length; i++) {
        const o = objetos[i];
        o.y += velocidadCaida;

        if (o.cargada) {
            ctx.drawImage(o.img, o.x, o.y, o.ancho, o.alto);
        } else {
            ctx.fillStyle = "#000";
            ctx.fillRect(o.x, o.y, o.ancho, o.alto);
        }

        if (o.y + o.alto >= canvas.height - 50) {
            if (dotnetRef && dotnetRef.invokeMethodAsync) {
                dotnetRef.invokeMethodAsync("PerderVida").catch(err => console.warn(err));
            }
            objetos.splice(i, 1);
            i--;
        }
    }
}

function seleccionarBote(tipo) {
    try {
        boteSeleccionado = tipo;
        document.querySelectorAll(".bote").forEach(b => b.classList.remove("seleccionado"));
        const boton = document.querySelector(`.bote[data-bin='${tipo}']`);
        if (boton) boton.classList.add("seleccionado");

        const objeto = objetos.reduce((masCercano, actual) =>
            !masCercano || actual.y > masCercano.y ? actual : masCercano,
            null
        );

        if (!objeto) return;

        if (validarCoincidencia(objeto.tipo, boteSeleccionado)) {
            if (dotnetRef && dotnetRef.invokeMethodAsync) {
                dotnetRef.invokeMethodAsync("AumentarPuntos").catch(err => console.warn(err));
            }
        } else {
            if (dotnetRef && dotnetRef.invokeMethodAsync) {
                dotnetRef.invokeMethodAsync("PerderVida").catch(err => console.warn(err));
            }
        }

        objetos = objetos.filter(o => o !== objeto);
    } catch (e) {
        console.error("Error en seleccionarBote:", e);
    }
}

function validarCoincidencia(objetoTipo, boteTipo) {
    if (boteTipo === "organico") return objetoTipo === "fruta" || objetoTipo === "hoja";
    if (boteTipo === "plastico") return objetoTipo === "bolsa" || objetoTipo === "lata" || objetoTipo === "botella";
    if (boteTipo === "papel") return objetoTipo === "papel" || objetoTipo === "carton";
    if (boteTipo === "vidrio") return objetoTipo === "botellavidrio";
    if (boteTipo === "noreciclable") return objetoTipo === "panal" || objetoTipo === "papelsucio" || objetoTipo === "colillas"; {
        const reciclables = ["papel", "carton", "bolsa", "lata", "botella", "fruta", "hoja"];
        return !reciclables.includes(objetoTipo);
    }
    return false;
}

window.aumentarVelocidad = function () {
    velocidadCaida += 0.8;
    if (intervaloGeneracion > 600) intervaloGeneracion -= 100;
};

window.terminarJuego = function (puntaje) {
    clearInterval(interval);
    alert(`Juego terminado 😢\nPuntaje final: ${puntaje}`);
};
