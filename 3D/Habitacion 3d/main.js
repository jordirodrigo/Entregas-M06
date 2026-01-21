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
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// Guardamos posición inicial y lookAt
const initialCameraPosition = camera.position.clone();
const initialCameraLookAt = new THREE.Vector3(0, 0, 0);
let initialMinPolarAngle = Math.PI / 3;
let initialMaxPolarAngle = Math.PI / 3;

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

// --- E. OBJETO 3D ---
let objects = [];
const loader = new OBJLoader();

loader.load(
    './models/pruebasepa1.obj',
    (obj1) => {
        obj1.position.set(0, 0, 0);
        obj1.scale.set(1, 1, 1);
        scene.add(obj1);
        objects.push(obj1);
    },
    undefined,
    (error) => console.error('Error cargando OBJ', error)
);
loader.load(
    './models/pruebasepa2.obj',
    (obj1) => {
        obj1.position.set(0, 0, 0);
        obj1.scale.set(1, 1, 1);
        scene.add(obj1);
        objects.push(obj1);
    },
    undefined,
    (error) => console.error('Error cargando OBJ', error)
);

// --- F. CONTROLES ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minPolarAngle = initialMinPolarAngle;
controls.maxPolarAngle = initialMaxPolarAngle;
controls.minDistance = 3;
controls.maxDistance = 15;

// ⚡ Desactivar clic derecho para mover la cámara
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: null
};

// --- G. VARIABLES DE TRANSICIÓN ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let targetPosition = null;
let targetLookAt = null;
let polarTarget = null; 
let returningToInitial = false; // indica si estamos regresando con Enter
const step = 0.05;
let cameraLocked = false;

// --- CLICK ---
window.addEventListener('click', (event) => {
    if (cameraLocked || returningToInitial) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objects, true);
    if (intersects.length > 0) {
        let clickedObject = intersects[0].object;
        while (clickedObject && !clickedObject.name && clickedObject.parent) {
            clickedObject = clickedObject.parent;
        }
        if (!clickedObject) return;

        if (clickedObject.name === "Cube.001") {
            // Objetivo de polarAngle suave
            polarTarget = Math.PI / 2;

            // Posición final frente al objeto
            const distance = 5;
            targetPosition = new THREE.Vector3(
                clickedObject.position.x,
                clickedObject.position.y,
                clickedObject.position.z + distance
            );

            // LookAt constante
            targetLookAt = clickedObject.position.clone();

            // Bloqueamos controles mientras se mueve
            controls.enabled = false;
            cameraLocked = false;
        }
    }
});

// --- ENTER: volver a posición inicial ---
window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !returningToInitial) {
        // Iniciamos la transición de regreso
        targetPosition = initialCameraPosition.clone();
        targetLookAt = initialCameraLookAt.clone();
        polarTarget = initialMinPolarAngle; // regresamos a los límites originales
        returningToInitial = true;

        // Reactivar controles al terminar
        controls.enabled = true;
        cameraLocked = false;
    }
});

// --- H. ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);

    // 🔹 Transición suave de polarAngle
    if (polarTarget !== null) {
        const t = 0.05;
        controls.minPolarAngle = THREE.MathUtils.lerp(controls.minPolarAngle, polarTarget, t);
        controls.maxPolarAngle = THREE.MathUtils.lerp(controls.maxPolarAngle, polarTarget, t);
        if (Math.abs(controls.minPolarAngle - polarTarget) < 0.001) {
            controls.minPolarAngle = polarTarget;
            controls.maxPolarAngle = polarTarget;
            polarTarget = null;
        }
    }

    // 🔹 Movimiento de cámara hacia el objetivo
    if (targetPosition && targetLookAt) {
        const direction = new THREE.Vector3().subVectors(targetPosition, camera.position);
        if (direction.length() <= step) {
            camera.position.copy(targetPosition);
            camera.lookAt(targetLookAt);
            cameraLocked = !returningToInitial;
            if (returningToInitial) returningToInitial = false;
            targetPosition = null;
            targetLookAt = null;
        } else {
            direction.normalize();
            camera.position.add(direction.multiplyScalar(step));
            camera.lookAt(targetLookAt);
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// --- I. RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
