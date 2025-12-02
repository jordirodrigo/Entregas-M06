document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("myButton");

    if (btn) {
        btn.addEventListener("click", function() {
            // Juego del número secreto
            const secreto = Math.floor(Math.random() * 100) + 1;
            let intentos = 0;
            let adivina;

            do {
                const entrada = prompt("Adivina el número secreto (1-100):");
                intentos++;

                if (entrada === null) {
                    alert("Juego cancelado.");
                    console.log("Juego cancelado tras " + (intentos - 1) + " intentos.");
                    break;
                }

                adivina = parseInt(entrada, 10);
                if (isNaN(adivina)) {
                    alert("Ingresa un número válido entre 1 y 100.");
                    continue;
                }

                if (adivina < 1) {
                    alert("Número fuera de rango. Es mayor.");
                    continue;
                }

                if (adivina > 100) {
                    alert("Número fuera de rango. Es menor.");
                    continue;
                }

                if (adivina > secreto) {
                    alert("El número secreto es menor.");
                } else if (adivina < secreto) {
                    alert("El número secreto es mayor.");
                } else {
                    alert("¡Correcto! Has acertado en " + intentos + " intentos.");
                    console.log("Número secreto: " + secreto + " | Intentos: " + intentos);
                    break;
                }

            } while (true);
        });
    }
});
