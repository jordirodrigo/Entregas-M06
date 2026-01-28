import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ====================================
// CONFIGURACIÓN
// ====================================
const pasoGrados = 12;
const desplazamientoX = 0.9;

// Factores de interpolación
const rotLerp = 0.08;   // rotación GLB
const xLerp   = 0.10;   // desplazamiento lateral GLB

function gradosARadianes(g){ return g * Math.PI / 180; }

// ====================================
// ESCENA, CÁMARA, RENDERER
// ====================================
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(0, 2, 5);
const baseCamPosition = camera.position.clone();
const baseCamRotation = camera.rotation.clone();

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5,10,7.5);
scene.add(dirLight);

// ====================================
// RAYCASTER
// ====================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ====================================
// VARIABLES GLB
// ====================================
let rootObj;
let pivot = new THREE.Object3D();
scene.add(pivot);

let objectNames = [];
let currentName = null;

let targetRotation = 0;
let targetX = 0;
let basePositionX = 0;

// ====================================
// STACK UNDO
// ====================================
let historyStack = []; // { name, rotation, posX }

// ====================================
// CAMERA PARALLAX
// ====================================
let mouseX = 0;
let mouseY = 0;
let camRotX = 0;
let camRotY = 0;
let camPosX = 0;

const camRotStrength = 0.05; // rotación cámara máxima
const camPosStrength = 0.05;  // desplazamiento cámara máximo
const camLerp = 0.06;        // suavidad

window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

// ====================================
// CARGA GLB
// ====================================
new GLTFLoader().load('./models/prueba.glb', gltf => {
    rootObj = gltf.scene;

    const box = new THREE.Box3().setFromObject(rootObj);
    const center = new THREE.Vector3();
    box.getCenter(center);

    rootObj.position.sub(center);
    pivot.add(rootObj);
    pivot.position.copy(center);

    basePositionX = pivot.position.x;
    targetX = basePositionX;

    rootObj.traverse(child => {
        if(child.isMesh){
            // Detectamos cilindros numerados
            if(/^\d+$/.test(child.name)){
                objectNames.push(child.name);
                child.material.side = THREE.DoubleSide;
            }
        }
    });

    if(objectNames.length) currentName = objectNames[0];
    console.log('Cilindros detectados:', objectNames);
});

// ====================================
// CLICK (IGNORANDO MESH "invisible")
// ====================================
window.addEventListener('click', e => {
    if(!rootObj) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    let hits = raycaster.intersectObjects(rootObj.children, true);

    // FILTRO: solo meshes numerados y que no sean "invisible"
    const hitNumerado = hits.find(h => objectNames.includes(h.object.name) && h.object.name !== "invisible");
    if(!hitNumerado) return;

    let obj = hitNumerado.object;
    const newName = obj.name;
    const diff = parseInt(newName) - parseInt(currentName);
    if(diff === 0) return;

    // Guardamos estado actual (targets)
    historyStack.push({
        name: currentName,
        rotation: targetRotation,
        posX: targetX
    });

    targetRotation += gradosARadianes(pasoGrados * diff);

    const num = parseInt(newName);
    targetX = (num % 2 === 0)
        ? basePositionX + desplazamientoX
        : basePositionX - desplazamientoX;

    currentName = newName;
});

// ====================================
// ENTER = UNDO (ENCADENABLE)
// ====================================
window.addEventListener('keydown', e => {
    if(e.key === 'Enter' && historyStack.length){
        const last = historyStack.pop();
        targetRotation = last.rotation;
        targetX = last.posX;
        currentName = last.name;
    }
});

// ====================================
// ANIMACIÓN (SIEMPRE ACTIVA)
// ====================================
function animate(){
    requestAnimationFrame(animate);

    pivot.rotation.x = THREE.MathUtils.lerp(
        pivot.rotation.x,
        targetRotation,
        rotLerp
    );
    pivot.position.x = THREE.MathUtils.lerp(
        pivot.position.x,
        targetX,
        xLerp
    );

    // CAMARA PARALLAX SUAVE
    const targetCamRotY = mouseX * camRotStrength;
    const targetCamRotX = -mouseY * camRotStrength;
    const targetCamPosX = mouseX * camPosStrength;

    camRotY = THREE.MathUtils.lerp(camRotY, targetCamRotY, camLerp);
    camRotX = THREE.MathUtils.lerp(camRotX, targetCamRotX, camLerp);
    camPosX = THREE.MathUtils.lerp(camPosX, targetCamPosX, camLerp);

    camera.rotation.y = baseCamRotation.y + camRotY;
    camera.rotation.x = baseCamRotation.x + camRotX;
    camera.position.x = baseCamPosition.x + camPosX;

    renderer.render(scene, camera);
}
animate();

// ====================================
// RESIZE
// ====================================
window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
