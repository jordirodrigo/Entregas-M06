let titulo = document.getElementById("titulo");
titulo.textContent = "¡Bienvenido al DOM con JavaScript!";

document.getElementById("paragrafo").textContent = "Este es un párrafo agregado dinámicamente usando JavaScript.";

document.getElementById("Mascota").src = "4.png";

let newArticle = document.createElement("article");
newArticle.innerHTML = "<h2>Artículo Dinámico</h2><p>Este artículo fue creado y agregado al DOM usando JavaScript.</p>";
document.body.appendChild(newArticle);
document.getElementById("main").appendChild(newArticle);
 