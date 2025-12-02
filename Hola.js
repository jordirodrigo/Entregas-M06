document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("myButton");
    
    if (btn) {
        btn.addEventListener("click", function() {
            // Pedir rango para primos
            let inicio = parseInt(prompt("Ingresa el inicio del rango:"));
            while (isNaN(inicio)) inicio = parseInt(prompt("Ingresa un inicio válido:"));
            let fin = parseInt(prompt("Ingresa el fin del rango:"));
            while (isNaN(fin) || fin < inicio) fin = parseInt(prompt("Ingresa un fin válido (>= inicio):"));

            // Función para comprobar si un número es primo (usa Math.sqrt)
            function esPrimo(n) {
                if (n <= 1) return false;
                if (n <= 3) return true;
                if (n % 2 === 0) return false;
                const limite = Math.floor(Math.sqrt(n));
                let d = 3;
                while (d <= limite) {
                    if (n % d === 0) return false;
                    d += 2;
                }
                return true;
            }

            console.log(`Números primos en [${inicio}, ${fin}]:`);
            let p = inicio;
            while (p <= fin) {
                if (esPrimo(p)) console.log(p);
                p++;
            }
fgrt
            // Juego: número secreto entre 1 y 100 (validación de rango y pistas)
            const secreto = Math.floor(Math.random() * 100) + 1;
            let intentos = 0;
            let adivina;
            do {
                const entrada = prompt("Adivina el número secreto (1-100):");
                intentos++;
                if (entrada === null) { // usuario canceló
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
                    alert("Número fuera de rango (menor que 1). Pista: el número secreto es mayor.");
                    continue;
                }
                if (adivina > 100) {
                    alert("Número fuera de rango (mayor que 100). Pista: el número secreto es menor.");
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
