let canvas, ctx;
let objetos = [];
let velocidadCaida = 2;
let interval;
let dotnetRef;
let boteSeleccionado = null;
let tiempoUltimoObjeto = 0;
let intervaloGeneracion = 1200;
let cantidadObjectos = 2;
const tiposBasura = [
    { tipo: "papel", img: "/imagenes/objetos/papel.png" },
    { tipo: "plastico", img: "/imagenes/objetos/agua.png" },
    { tipo: "plastico", img: "/imagenes/objetos/lata.png" },
    { tipo: "plastico", img: "/imagenes/objetos/bolsadeplastico.png" },
    { tipo: "papel", img: "/imagenes/objetos/caja.png" },
    { tipo: "organico", img: "/imagenes/objetos/cascara.png" },
    { tipo: "organico", img: "/imagenes/objetos/hoja.png" },
    { tipo: "vidrio", img: "/imagenes/objetos/botellavidrio.png" },
    { tipo: "inorganico", img: "/imagenes/objetos/colillas.png" },
    { tipo: "inorganico", img: "/imagenes/objetos/panal.png" },
    { tipo: "inorganico", img: "/imagenes/objetos/papelsucio.png" }
];

window.iniciarJuego = function (dotnet, cantidad) {
    try {
        dotnetRef = dotnet;

        cantidadObjectos = cantidad || 2;

        const gameArea = document.getElementById("gameArea");
        if (!gameArea) return;

        // Crear canvas si no existe
        let existingCanvas = document.getElementById("gameCanvas");
        if (!existingCanvas) {
            const canvasEl = document.createElement("canvas");
            canvasEl.id = "gameCanvas";
            gameArea.appendChild(canvasEl);
        }

        canvas = document.getElementById("gameCanvas");
        ctx = canvas.getContext("2d");

        // 🔥 Ajustar tamaño dinámico del canvas según tamaño en pantalla
        resizeCanvas();

        // Crear los botes
        crearBotes(gameArea);

        // Reiniciar valores
        objetos = [];
        boteSeleccionado = null;

        // Lógica del juego
        clearInterval(interval);
        interval = setInterval(update, 30);

        // 🔥 Ajustar canvas si cambia tamaño de la ventana
        window.onresize = () => resizeCanvas();

    } catch (e) {
        console.error("Error:", e);
    }
};

// 🔥 HACER CANVAS RESPONSIVO
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

//function crearBotes(gameArea) {

//    let contenedor = document.getElementById("botesContainer");

//    if (!contenedor) {
//        contenedor = document.createElement("div");
//        contenedor.id = "botesContainer";
//        gameArea.appendChild(contenedor);
//    }

//    contenedor.innerHTML = "";

//    const bins = [
//        { key: "papel", label: "Papel/Cartón", img: "/imagenes/botes/papelerapapel.png" },
//        { key: "plastico", label: "Plástico/Latas", img: "/imagenes/botes/papeleralatas.png" },
//        { key: "vidrio", label: "Vidrio", img: "/imagenes/botes/papeleravidrio.png"},
//        { key: "organico", label: "Orgánico", img: "/imagenes/botes/papeleraorganicos.png" },
//        { key: "noreciclable", label: "No reciclable", img: "/imagenes/botes/papeleranoreci.png" }
//    ];

//    bins.forEach(b => {
//        const btn = document.createElement("div");
//        btn.className = `bote bin-${b.key}`;
//        btn.setAttribute("data-bin", b.key);
//        btn.innerText = b.label;
//        btn.addEventListener("click", () => seleccionarBote(b.key));
//        contenedor.appendChild(btn);
//    });
//}

function crearBotes(gameArea) {

    let contenedor = document.getElementById("botesContainer");

    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "botesContainer";
        gameArea.appendChild(contenedor);
    }

    contenedor.innerHTML = "";

    const bins = [
        { key: "azul", label: "Papel/Cartón", img: "/imagenes/papelerapapel.png" },
        { key: "amarillo", label: "Plástico/Latas", img: "/imagenes/papeleralatas.png" },
        { key: "verde", label: "Vidrio", img: "/imagenes/papeleravidrio.png" },
        { key: "naranja", label: "Orgánico", img: "/imagenes/papeleraorganicos.png" },
        { key: "gris", label: "No reciclable", img: "/imagenes/papeleranoreci.png" }
    ];

    bins.forEach(b => {
        const btn = document.createElement("div");
        btn.className = `bote bin-${b.key}`;
        btn.setAttribute("data-bin", b.key);

        btn.innerHTML = `
            <img src="${b.img}" class="icono-bote" />
            <span>${b.label}</span>
        `;

        btn.addEventListener("click", () => seleccionarBote(b.key));
        contenedor.appendChild(btn);
    });
}


function update() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ahora = Date.now();

    // Generar nuevos objetos
    if (ahora - tiempoUltimoObjeto > intervaloGeneracion && objetos.length < cantidadObjectos) {
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

    // Mover y dibujar objetos
    for (let i = 0; i < objetos.length; i++) {
        const o = objetos[i];
        o.y += velocidadCaida;

        if (o.cargada) {
            ctx.drawImage(o.img, o.x, o.y, o.ancho, o.alto);
        }

        // Si toca el suelo → pierde vida
        if (o.y + o.alto >= canvas.height - 50) {
            dotnetRef?.invokeMethodAsync("PerderVida").catch(() => { });
            objetos.splice(i, 1);
            
            i--;
        }
    }
}

function seleccionarBote(tipo) {
    boteSeleccionado = tipo;

    document.querySelectorAll(".bote").forEach(b => b.classList.remove("seleccionado"));
    const boton = document.querySelector(`.bote[data-bin='${tipo}']`);
    if (boton) boton.classList.add("seleccionado");

    const objeto = objetos.reduce((masCercano, actual) =>
        !masCercano || actual.y > masCercano.y ? actual : masCercano, null);
    
    if (!objeto) return;

    if (validarCoincidencia(objeto.tipo, boteSeleccionado)) {
        dotnetRef?.invokeMethodAsync("AumentarPuntos").catch(() => { });       
    } else {
        dotnetRef?.invokeMethodAsync("PerderVida").catch(() => { });
    }
   
    objetos = objetos.filter(o => o !== objeto);
   
}

function validarCoincidencia(objetoTipo, boteTipo) {
    if (boteTipo === "naranja") return ["organico"].includes(objetoTipo);
    if (boteTipo === "amarillo") return ["plastico"].includes(objetoTipo);
    if (boteTipo === "azul") return ["papel"].includes(objetoTipo);
    if (boteTipo === "verde") return objetoTipo === "vidrio";
    if (boteTipo === "gris") return objetoTipo === "inorganico";

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
