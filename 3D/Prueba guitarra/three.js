import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- A. ESCENA Y CONFIGURACIÓN ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.sortObjects = true; // importante para transparencias
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// --- B. LUCES ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// --- C. CARGAR MODELO ---
const loader = new GLTFLoader();
let model;

loader.load(
    'Models/12345.glb',
    (gltf) => {
        model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        model.position.set(20, 0, 0);

        // --- SOLUCIÓN TRANSPARENCIA Y ORDEN DE DIBUJADO ---
        let order = 0;
        model.traverse((child) => {
            if (child.isMesh) {
                child.renderOrder = order++;      // fuerza el orden de dibujado
                const mat = child.material;

                if (mat.transparent) {
                    mat.side = THREE.DoubleSide; // dibuja ambos lados
                    mat.depthWrite = false;      // evita que se tapen entre sí
                } else {
                    mat.side = THREE.FrontSide; // dibuja solo el frente
                    mat.depthWrite = true;
                }

                // opcional: si hay recortes en textura
                // mat.alphaTest = 0.01;
            }
        });

        scene.add(model);
        console.log('Modelo cargado correctamente');
    },
    (xhr) => console.log(`Cargando modelo: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`),
    (error) => console.error('Error cargando el modelo:', error)

);
// base cuerpo cilíndrico
const geometry = new THREE.CylinderGeometry(4, 4, 10, 11);
const material = new THREE.MeshStandardMaterial({color: 0x2233FF, emissive: 0x112244
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// base cuerpo cilíndrico
const geometry2 = new THREE.CylinderGeometry(4, 4, 10, 11);
const material2 = new THREE.MeshStandardMaterial({
    
});
const cube2 = new THREE.Mesh(geometry2, material2);
scene.add(cube2);




// --- D. CONTROLES ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- E. ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);

    //if (model) {
    // model.rotation.y += 0.005; // rotación automática opcional
    //}

    controls.update();
    renderer.render(scene, camera);
}

animate();

// --- F. AJUSTE DE VENTANA ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
