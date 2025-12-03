// Mostrar el contenido

// Seleccionar el elemento <h1> y mostrar su contenido
const heading = document.querySelector('h1');
console.log(heading.textContent);

// Seleccionar el párrafo con ID "important" y mostrar su texto
const importantPara = document.getElementById('important');
console.log(importantPara.textContent);

// Modificar el contenido

// Cambiar el texto del párrafo con ID "important"
importantPara.textContent = "Texto importante actualizado.";

// Cambiar el valor del input con ID "user-input"
const userInput = document.getElementById('user-input');
userInput.value = "Nuevo texto en el input.";
