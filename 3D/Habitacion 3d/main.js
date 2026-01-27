import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ====================================
// CONFIGURACIÓN
// ====================================
const pasoGrados = 12;           // ángulo base por cilindro
const ejeRotacion = new THREE.Vector3(1,0,0);
function gradosARadianes(grados){ return grados * (Math.PI/180); }

// Shift lateral del GLB según par/impar
const desplazamientoX = 0.5; // ajusta cuanto quieres mover el GLB lateralmente

// ====================================
// ESCENA, CÁMARA, RENDERER
// ====================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5,10,7.5);
scene.add(directionalLight);

// ====================================
// RAYCASTER
// ====================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ====================================
// VARIABLES
// ====================================
let rootObj;
let pivot = new THREE.Object3D();
scene.add(pivot);
let objectNames = [];
let currentName = null; // nombre del cilindro actual
let targetRotation = 0;
let targetX = 0; // posición X objetivo para animación lateral
let rotating = false;

// Posición base del pivot (centro) para calcular desplazamiento lateral relativo
let basePositionX = 0;

// ====================================
// STACK PARA UNDO MÚLTIPLE
// ====================================
let historyStack = []; // cada elemento: {name, rotation, posX}

// ====================================
// CARGA DEL GLB
// ====================================
const loader = new GLTFLoader();
loader.load('./models/prueba.glb', function(gltf){
    rootObj = gltf.scene;

    // centramos pivote
    const box = new THREE.Box3().setFromObject(rootObj);
    const center = new THREE.Vector3();
    box.getCenter(center);

    rootObj.position.sub(center);
    pivot.add(rootObj);
    pivot.position.copy(center);

    // Guardamos posición central
    basePositionX = pivot.position.x;

    // detectamos cilindros
    rootObj.traverse(child=>{
        if(child.isMesh && /^\d+$/.test(child.name)){
            objectNames.push(child.name);
            child.material.side = THREE.DoubleSide;
        }
    });

    // primer cilindro como actual
    if(objectNames.length>0) currentName = objectNames[0];

    console.log("Cilindros detectados:", objectNames);

}, undefined, err=>console.error(err));

// ====================================
// CLICK
// ====================================
window.addEventListener('click', (event)=>{
    if(!rootObj || rotating) return;

    mouse.x = (event.clientX / window.innerWidth)*2 - 1;
    mouse.y = -(event.clientY / window.innerHeight)*2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(rootObj.children, true);
    if(intersects.length === 0) return;

    let selectedMesh = intersects[0].object;
    while(selectedMesh.parent && selectedMesh.parent !== rootObj && !objectNames.includes(selectedMesh.name)){
        selectedMesh = selectedMesh.parent;
    }
    if(!objectNames.includes(selectedMesh.name)) return;

    console.log("Cilindro clicado:", selectedMesh.name);

    const newName = selectedMesh.name;
    let diff = parseInt(newName) - parseInt(currentName);
    if(diff === 0) return; // mismo cilindro

    const rotationDegrees = pasoGrados * Math.abs(diff);
    const rotationRads = gradosARadianes(rotationDegrees);
    targetRotation = pivot.rotation.x + (diff > 0 ? rotationRads : -rotationRads);

    // Guardamos estado actual en el stack para undo múltiple
    historyStack.push({name: currentName, rotation: pivot.rotation.x, posX: pivot.position.x});

    // ====================================
    // SHIFT LATERAL según par/impar relativo al centro
    // ====================================
    const numero = parseInt(newName);
    targetX = (numero % 2 === 0) ? basePositionX + desplazamientoX : basePositionX - desplazamientoX;

    rotating = true;

    // Actualizamos currentName
    currentName = newName;
});

// ====================================
// TECLA ENTER PARA VOLVER ATRÁS
// ====================================
window.addEventListener('keydown', (event)=>{
    if(event.key === 'Enter' && historyStack.length > 0 && !rotating){
        const last = historyStack.pop();
        console.log("Volviendo al cilindro anterior:", last.name);
        targetRotation = last.rotation; // animamos de vuelta
        targetX = last.posX;            // restauramos posición X
        currentName = last.name;
        rotating = true;
    }
});

// ====================================
// ANIMACIÓN SUAVE
// ====================================
function animate(){
    requestAnimationFrame(animate);

    if(rotating){
        const delta = 0.003; // velocidad por frame

        // Animación rotación
        const diffRot = targetRotation - pivot.rotation.x;
        if(Math.abs(diffRot)<=delta){
            pivot.rotation.x = targetRotation;
        } else {
            pivot.rotation.x += delta * Math.sign(diffRot);
        }

        // Animación lateral
        const diffX = targetX - pivot.position.x;
        if(Math.abs(diffX)<=delta){
            pivot.position.x = targetX;
        } else {
            pivot.position.x += delta * Math.sign(diffX);
        }

        if(Math.abs(diffRot)<=delta && Math.abs(diffX)<=delta){
            rotating = false;
        }
    }

    renderer.render(scene, camera);
}
animate();

// ====================================
// AJUSTE DE VENTANA
// ====================================
window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
