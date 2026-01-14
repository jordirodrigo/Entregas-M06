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

// base cuerpo cilíndrico
const geometry = new THREE.CylinderGeometry(4, 4, 10, 11);
const material = new THREE.MeshStandardMaterial({
    color: 0x2233FF, emissive: 0x112244
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// brazo1  cilíndrico
const geometry2 = new THREE.CylinderGeometry(1, 1, 10, 11);
geometry2.translate(0, -5, 0);
const material2 = new THREE.MeshStandardMaterial({
    color: 0x00FF00, emissive: 0x112244

});

const cube2 = new THREE.Mesh(geometry2, material2);
scene.add(cube2);
// brazo2  cilíndrico
const geometry3 = new THREE.CylinderGeometry(1, 1, 10, 11);
geometry3.translate(0, -5, 0);
const material3 = new THREE.MeshStandardMaterial({
    color: 0x00FF00, emissive: 0x112244

});
const cube3 = new THREE.Mesh(geometry3, material3);
scene.add(cube3);
// pierna1  cilíndrico
const geometry4 = new THREE.CylinderGeometry(1.5, 1.5, 10, 11);
const material4 = new THREE.MeshStandardMaterial({
    color: 0x00FF00, emissive: 0x112244

});
const cube4 = new THREE.Mesh(geometry4, material4);
scene.add(cube4);
// pierna2  cilíndrico
const geometry5 = new THREE.CylinderGeometry(1.5, 1.5, 10, 11);
const material5 = new THREE.MeshStandardMaterial({
    color: 0x00FF00, emissive: 0x112244
});
const cube5 = new THREE.Mesh(geometry5, material5);
scene.add(cube5);





// --- D. CONTROLES ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- E. ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);

    //if (model) {
    // model.rotation.y += 0.005; // rotación automática opcional
    //}

    const t = Date.now() * 0.001;


    cube2.position.x = 5;
    cube2.position.y = 5;
    cube2.rotation.x = -Math.sin(t) * 0.3;

    cube3.position.x = -5;
    cube3.position.y = 5;
    cube3.rotation.x = Math.sin(t) * 0.3;

    cube4.position.x = 2;
    cube4.position.y = -10;
    cube4.rotation.y = 0;

    cube5.position.x = -2;
    cube5.position.y = -10;
    cube5.rotation.y = 0;



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
