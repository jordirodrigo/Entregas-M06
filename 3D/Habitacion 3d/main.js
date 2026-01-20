import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'; // <--- esto faltaba


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
camera.position.set(0, 2, 5);

// --- C. RENDERER ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- D. LUCES ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// =================================================
// 👉 AQUÍ VA EL OBJETO 3D 👈
// =================================================
let object; // referencia al modelo

const loader = new OBJLoader();
loader.load(
    './Models/suzane.obj', 
    (obj) => {
        object = obj;

        object.scale.set(1, 1, 1);     // ajusta si no se ve
        object.position.set(0, 0, 0);
        object.rotation.y = Math.PI;

        scene.add(object);
    },
    undefined,
    (error) => {
        console.error('Error cargando el OBJ', error);
    }
);


// --- E. CONTROLES ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;


// --- F. ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);

    object.rotation.y += 0.005;
    object.rotation.x += 0.002;

    controls.update();
    renderer.render(scene, camera);
}
animate();

// --- G. RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
