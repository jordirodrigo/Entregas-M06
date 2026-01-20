import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// --- A. ESCENA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

// --- B. CÁMARA ---
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 8, 5);
camera.lookAt(0, 0, 0);

// --- C. RENDERER ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- D. LUCES ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// =================================================
// 👉 OBJETOS 3D (2 OBJ diferentes)
// =================================================
let objects = []; // array para todos los objetos interactivos

const loader = new OBJLoader();

// Cargar primer OBJ
// Cargar primer OBJ
loader.load(
    './models/Prueba.obj',
    (obj1) => {
        obj1.position.set(-2, 0, 0);
        obj1.scale.set(1, 1, 1);
        obj1.name = "Objeto 1"; // <-- asignamos nombre
        scene.add(obj1);
        objects.push(obj1);
    },
    undefined,
    (error) => console.error('Error cargando obj1', error)
);

// Cargar segundo OBJ
loader.load(
    './models/Prueba2.obj',
    (obj2) => {
        obj2.position.set(2, 0, 0);
        obj2.scale.set(1, 1, 1);
        obj2.name = "Objeto 2"; // <-- asignamos nombre
        scene.add(obj2);
        objects.push(obj2);
    },
    undefined,
    (error) => console.error('Error cargando obj2', error)
);


// --- E. CONTROLES ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minPolarAngle = Math.PI / 3; // ángulo vertical fijo
controls.maxPolarAngle = Math.PI / 3;
controls.minDistance = 3;
controls.maxDistance = 15;

// --- F. RAYCASTER ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let targetPosition = null;
let targetLookAt = null;
const camSpeed = 0.05;

window.addEventListener('click', (event) => {
    // Coordenadas normalizadas del ratón
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objects, true); // true para hijos
    if (intersects.length > 0) {
        // Obtenemos el mesh intersectado
        let clickedObject = intersects[0].object;

        // Subir hasta encontrar el objeto con nombre
        while (clickedObject && !clickedObject.name && clickedObject.parent) {
            clickedObject = clickedObject.parent;
        }

        if (!clickedObject) return; // seguridad

        console.log(`¡Has pulsado ${clickedObject.name}!`);

        // Solo mover la cámara si es Objeto 1
        if (clickedObject.name == "Cube") {
            targetPosition = new THREE.Vector3(
                clickedObject.position.x,
                clickedObject.position.y + 2,
                clickedObject.position.z + 2
            );
            targetLookAt = clickedObject.position.clone();
        }
    }
});





// --- G. ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);

    // Rotación opcional de objetos


    if (targetPosition && targetLookAt) {
        camera.position.lerp(targetPosition, camSpeed);
        camera.lookAt(targetLookAt);
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

// --- H. RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
