let palabra = ""; 
let palabraOriginal = ""; 
let intentosRestantes = 6; 
let intentoActual = 0; 

function normalizar(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

function palabraSecreta() {
    fetch('https://random-word-api.herokuapp.com/word?lang=es&length=5')
        .then(response => response.json())
        .then(data => {
            palabraOriginal = data[0] || '';
            palabra = normalizar(palabraOriginal);
            console.log("Palabra secreta cargada:", palabra);
        });
}

function crearTeclado() {
    let teclado = document.getElementById("teclado");
    if (!teclado) return;
    teclado.innerHTML = ""; 

    const rows = [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L','Ñ'],
        ['Z','X','C','V','B','N','M']
    ];

    rows.forEach(filaLetras => {
        const filaDiv = document.createElement('div');
        filaDiv.style.cssText = "display: flex; justify-content: center; gap: 5px; margin-bottom: 5px;";
        
        filaLetras.forEach(letra => {
            let tecla = document.createElement("div");
            tecla.textContent = letra;
            tecla.className = "tecla";
            // Asignamos un ID único a cada tecla para poder cambiarle el color después
            tecla.id = "tecla-" + letra;
            tecla.style.cssText = "padding: 15px 10px; background: #ddd; border-radius: 4px; cursor: pointer; font-weight: bold; min-width: 35px; text-align: center; transition: background 0.3s; color: black;";
            tecla.onclick = () => escribeTecla(letra);
            filaDiv.appendChild(tecla);
        });
        teclado.appendChild(filaDiv);
    });

    let miTexto = document.getElementById('miTexto');
    if (miTexto) {
        miTexto.style.display = 'none'; 
        let cont = document.getElementById('intentos');
        if (cont) {
            cont.innerHTML = ""; 
            for (let i = 0; i < 6; i++) {
                let fila = document.createElement('div');
                fila.style.cssText = "display: flex; gap: 6px; justify-content: center; margin-bottom: 6px;";
                
                for (let j = 0; j < 5; j++) {
                    let span = document.createElement('span');
                    span.className = `celda celda-${i}-${j}`;
                    span.style.cssText = "display: flex; align-items: center; justify-content: center; width: 45px; height: 45px; border: 2px solid #ccc; font-size: 24px; font-weight: bold; color: black; background: white; text-transform: uppercase;";
                    fila.appendChild(span);
                }
                cont.appendChild(fila);
            }
        }
    }
    palabraSecreta();
}

function escribeTecla(letra) {
    let miTexto = document.getElementById("miTexto");
    if (intentoActual >= 6 || miTexto.textContent.length >= 5) return;

    const base = normalizar(letra).charAt(0);
    miTexto.textContent += base;

    let posicion = miTexto.textContent.length - 1;
    let celda = document.querySelector(`.celda-${intentoActual}-${posicion}`);
    if (celda) {
        celda.textContent = base;
        celda.style.borderColor = "#555";
    }
}

function borrarLetra() {
    let miTexto = document.getElementById("miTexto");
    if (miTexto.textContent.length > 0) {
        let posicionABorrar = miTexto.textContent.length - 1;
        let celda = document.querySelector(`.celda-${intentoActual}-${posicionABorrar}`);
        if (celda) {
            celda.textContent = "";
            celda.style.borderColor = "#ccc";
        }
        miTexto.textContent = miTexto.textContent.substring(0, miTexto.textContent.length - 1);
    }
}

function actualizarColoresTeclado(intento, estados) {
    for (let i = 0; i < intento.length; i++) {
        let letra = intento[i];
        let tecla = document.getElementById("tecla-" + letra);
        if (!tecla) continue;

        let colorActual = tecla.style.background;

        // Prioridad: verde > amarillo > gris
        if (estados[i] === 'correct') {
            tecla.style.background = "#6aaa64";
            tecla.style.color = "white";
        } else if (estados[i] === 'present') {
            // Solo se pone amarillo si no está ya en verde
            if (colorActual !== "rgb(106, 170, 100)") {
                tecla.style.background = "#c9b458";
                tecla.style.color = "white";
            }
        } else if (estados[i] === 'absent') {
            // Solo se pone gris si no es verde o amarillo
            if (colorActual !== "rgb(106, 170, 100)" && colorActual !== "rgb(201, 180, 88)") {
                tecla.style.background = "#787c7e";
                tecla.style.color = "white";
            }
        }
    }
}

function evaluarIntento(intento, secreto) {
    let estados = new Array(5).fill('absent');
    let secretoArr = secreto.split('');
    let intentoArr = intento.split('');

    for (let i = 0; i < 5; i++) {
        if (intentoArr[i] === secretoArr[i]) {
            estados[i] = 'correct';
            secretoArr[i] = null;
            intentoArr[i] = null;
        }
    }
    for (let i = 0; i < 5; i++) {
        if (intentoArr[i] && secretoArr.includes(intentoArr[i])) {
            estados[i] = 'present';
            secretoArr[secretoArr.indexOf(intentoArr[i])] = null;
        }
    }
    return estados;
}

async function comprobar() {
    let miTexto = document.getElementById("miTexto");
    let intento = miTexto.textContent.toUpperCase();

    if (intento.length !== 5) return;

    let estados = evaluarIntento(intento, palabra);

    // Pintar celdas de la graella
    for (let i = 0; i < 5; i++) {
        let celda = document.querySelector(`.celda-${intentoActual}-${i}`);
        celda.style.color = "white";
        if (estados[i] === 'correct') celda.style.background = "#6aaa64";
        else if (estados[i] === 'present') celda.style.background = "#c9b458";
        else celda.style.background = "#787c7e";
        celda.style.borderColor = "transparent";
    }

    // Actualizar el teclado físico en pantalla
    actualizarColoresTeclado(intento, estados);

    if (intento === palabra) {
        setTimeout(() => alert("¡Felicidades!"), 200);
    } else {
        intentoActual++;
        intentosRestantes--;
        miTexto.textContent = ""; 
        if (intentosRestantes <= 0) {
            alert("Has perdido. La palabra era: " + palabraOriginal);
        }
    }
}

crearTeclado();