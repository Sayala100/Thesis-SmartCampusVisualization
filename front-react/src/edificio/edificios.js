// Importaciones
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import axios from 'axios';

const clockElement = document.getElementById('clock');
// Constantes iniciales
const START_HUES = {
  SD: 0.33,
  ML: 0.33,
  LL: 0.33,
  RGD: 0.33,
  Entrada_Caneca: 0.33,
};

// Inicializar librerías
RectAreaLightUniformsLib.init();

// Crear escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  context: document.querySelector('#bg').getContext('webgl2'),
});

// Configurar renderizador y cámara
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(40, 20, 20);
renderer.render(scene, camera);
renderer.shadowMap.width = 512;
renderer.shadowMap.height = 512;

// Cargar modelos GLTF
const loader = new GLTFLoader();
const modelFiles = [
  { name: 'SD', path: '/imports/EdificiosSD.gltf' },
  { name: 'Entrada_Caneca', path: '/imports/EdificiosCD.gltf' },
  { name: 'ML', path: '/imports/EdificiosML.gltf' },
  { name: 'Lleras', path: '/imports/EdificiosLL.gltf' },
  { name: 'RGD', path: '/imports/EdificiosRGD.gltf' },
  { name: 'C', path: '/imports/EdificiosC.gltf' },
  { name: 'TX', path: '/imports/EdificiosTX.gltf' },
  { name: 'TrashCan', path: '/imports/EdificiosTrashCan.gltf' },
  { name: 'Aulas', path: '/imports/EdificiosAulas.gltf' },
  { name: 'O', path: '/imports/EdificiosO.gltf' },
];

modelFiles.forEach(({ name, path }) => {
  loader.load(
    path,
    (gltf) =>{
      logModelDimensions(name, gltf.scene);
      scene.add(gltf.scene)
    },
    undefined,
    (error) => console.error(`Error loading model: ${name}`, error)
  );
});

const floorGeometry = new THREE.PlaneGeometry(100, 100);

const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load('/bg.png'); // Replace with the path to your image

floorTexture.flipY = false;

const floorMaterial = new THREE.MeshPhongMaterial({
  map: floorTexture,  // Set the texture as the map
  side: THREE.DoubleSide
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);

floor.rotation.x = Math.PI / 2;
floor.receiveShadow = true;
floor.position.y -= 0.01;

scene.add(floor);

//cielo 
const skyGeo = new THREE.SphereGeometry(500, 32, 32);
const texture = textureLoader.load("/sky.jpg");
const skyMaterial = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.BackSide, 
  emmisive: 0xffffff,
  emmisiveIntensity: 0.5
});

const sky = new THREE.Mesh(skyGeo, skyMaterial);
scene.add(sky);


// Iluminación
const ambientLight = new THREE.AmbientLight(0xc1c1c1, 1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xc1c1c1, 1); // Light color set to gray
directionalLight.position.set(1, 1, 1).normalize(); // Direction of the light
scene.add(directionalLight);


// Función para crear luces alrededor de un modelo
const modelLights = {};
function createSurroundingLights(modelName, position, dimensions) {
  const lights = [];
  const createLight = (color, width, height, xOffset, yOffset, zOffset, rotation = [0, 0, 0]) => {
    const light = new THREE.RectAreaLight(color, 1, width, height);
    light.position.set(position.x + xOffset, position.y + yOffset, position.z + zOffset);
    light.rotation.set(...rotation);
    scene.add(light);
    return light;
  };

  // Crear 5 luces alrededor del modelo
  // Atrás
  lights.push(createLight(0x66cc66, dimensions.x, dimensions.y, 0, 0, -dimensions.z / 2, [0, Math.PI, 0])); 
  // Frente
  lights.push(createLight(0x66cc66, dimensions.x, dimensions.y, 0, 0, dimensions.z / 2 + 0.1));
  // Lado derecho
  lights.push(createLight(0x66cc66, dimensions.z, dimensions.y, dimensions.x / 2, 0, 0, [0, Math.PI / 2, 0]));
  // Lado izquierdo
  lights.push(createLight(0x66cc66, dimensions.z, dimensions.y, -dimensions.x / 2, 0, 0, [0, -Math.PI / 2, 0])); 
  // Arriba
  lights.push(createLight(0x66cc66, dimensions.x, dimensions.z, 0, dimensions.y / 2 + 0.1, 0, [-Math.PI / 2, 0, 0])); 

  modelLights[modelName] = lights;
}

// Crear luces para cada modelo
createSurroundingLights('SD', { x: 12.62, y: 1.48, z: 17.52 }, { x: 3.90, y: 2.92, z: 6.03 });
createSurroundingLights('Entrada_Caneca', { x: -15.34, y: 0.38, z: -3.85 }, { x: 0.66, y: 0.62, z: 1.38 });
createSurroundingLights('LL', { x: 0.06, y: 1.08, z: 2.25 }, { x: 3.04, y: 2.71, z: 2.84 });
createSurroundingLights('ML', { x: 0.29, y: 1.12, z: 8.76 }, { x: 4.77, y: 2.24, z: 5.37 });
createSurroundingLights('RGD', { x: 10.62, y: 0.66, z: 0.71 }, { x: 2.35, y: 1.38, z: 3.71 });
createSurroundingLights('C', { x: -4.39, y: 1.22, z: -4.90 }, { x: 4.60, y: 2.53, z: 4.45 });
createSurroundingLights('TX', { x: -9.78, y: 1.74, z: 1.81 }, { x: 3.79, y: 3.19, z: 3.35 });
createSurroundingLights('TrashCan', { x: -29.88, y: 1.67, z: 6.06 }, { x: 10.57, y: 3.38, z: 7.91 });
createSurroundingLights('Aulas', { x: 22.46, y: 1.15, z: 0.72 }, { x: 9.91, y: 2.29, z: 3.92 });
createSurroundingLights('O', { x: -12.92, y: 0.49, z: -13.14 }, { x: 1.59, y: 1.10, z: 6.21 });

// Actualizar colores
async function fetchBuildingEntries() {
  try {
    const response = await axios.get('https://tesis.notadev.lat/procesar_entradas_edificio');
    return response.data;
  } catch (error) {
    console.error('Error fetching building entries:', error);
  }
}

function calcularTono(valor, minimo = 0, maximo = 2000) {
  const proporcion = Math.min(Math.max((maximo - valor) / (maximo - minimo), 0), 1);
  return 0.33 * proporcion;
}

async function actualizarColores() {
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  const edificios = await fetchBuildingEntries();
  if (!edificios) return;

  const regex = /\[(\d+)(?:\.(\d+))?, (\d+)(?:\.(\d+))?\]/;
  for (const rango in edificios[Object.keys(edificios)[0]]) {
    const match = rango.match(regex);
    if (!match) continue;
    let num1 = match[1];
    let decimal1 = match[2];
    let num2 = match[3];
    let decimal2 = match[4];
    
    // Format the numbers
    let formattedNum1 = decimal1 === "0" ? `${num1}:00` : `${num1}:${decimal1 === "5" ? "30" : "00"}`;
    let formattedNum2 = decimal2 === "0" ? `${num2}:00` : `${num2}:${decimal2 === "5" ? "30" : "00"}`;
    
    clockElement.textContent = `${formattedNum1} - ${formattedNum2}`;

    for (const edificio in edificios) {
      const valor = edificios[edificio][rango];
      const hue = calcularTono(valor);
      const startHue = START_HUES[edificio];
      animateModelLightHue(edificio, startHue, hue, 1000);
      START_HUES[edificio] = hue;
    }
    await sleep(1000);
  }
}

// Animar luces
function animateModelLightHue(modelName, startHue, endHue, duration) {
  const lights = modelLights[modelName];
  if (!lights) return;

  const startTime = performance.now();
  function updateHue() {
    const elapsedTime = performance.now() - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    const currentHue = startHue + (endHue - startHue) * progress;

    lights.forEach((light) => light.color.setHSL(currentHue, 1, 0.66));
    if (progress < 1) requestAnimationFrame(updateHue);
  }
  updateHue();
}

// Controles de órbita
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2 - 0.1;
controls.maxDistance = 70;
controls.minDistance = 10;
controls.keys = {
	LEFT: 'ArrowLeft', //left arrow
	UP: 'ArrowUp', // up arrow
	RIGHT: 'ArrowRight', // right arrow
	BOTTOM: 'ArrowDown' // down arrow
}
// Animar escena
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}



animate();
actualizarColores();

function mount(container) {
  if (container) {
      container.appendChild(renderer.domElement);
  } else {
      renderer.domElement.remove();
  }
}

export { mount };

function logModelDimensions(name, object) {
  
  // Compute the bounding box
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size); // Get dimensions
  box.getCenter(center); // Get center position

  // Log dimensions and position
  console.log(`Model: ${name}`);
  console.log('Dimensions:', size); // Logs width, height, depth
  console.log('Position (Center):', center); // Logs center position  
}