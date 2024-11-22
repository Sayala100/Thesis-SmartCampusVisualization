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
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  context: document.querySelector('#bg').getContext('webgl2'),
});

// Configurar renderizador y cámara
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(30, 15, 30);
renderer.render(scene, camera);
renderer.shadowMap.width = 512;
renderer.shadowMap.height = 512;

// Cargar modelos GLTF
const loader = new GLTFLoader();
const modelFiles = [
  { name: 'SD', path: '/imports/SD.glb' },
  { name: 'Entrada_Caneca', path: '/imports/Entrada_Caneca.glb' },
  { name: 'ML', path: '/imports/ML.glb' },
  { name: 'Lleras', path: '/imports/Lleras.glb' },
  { name: 'Civico2', path: '/imports/Civico2.glb' },
];

modelFiles.forEach(({ name, path }) => {
  loader.load(
    path,
    (gltf) => scene.add(gltf.scene),
    undefined,
    (error) => console.error(`Error loading model: ${name}`, error)
  );
});

// Crear suelo
const floor = new THREE.Mesh(
  new THREE.BoxGeometry(100, 1, 100),
  new THREE.MeshStandardMaterial({ color: 0xcdcdcd })
);
floor.position.set(0, -0.5, 0);
scene.add(floor);

// Iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

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
  lights.push(createLight(0x55ff00, dimensions.x, dimensions.y, 0, 0, -dimensions.z / 2, [0, Math.PI, 0])); // Atrás
  lights.push(createLight(0x55ff00, dimensions.x, dimensions.y, 0, 0, dimensions.z / 2 + 0.1)); // Frente
  lights.push(createLight(0x55ff00, dimensions.z, dimensions.y, dimensions.x / 2, 0, 0, [0, Math.PI / 2, 0])); // Lado derecho
  lights.push(createLight(0x55ff00, dimensions.z, dimensions.y, -dimensions.x / 2, 0, 0, [0, -Math.PI / 2, 0])); // Lado izquierdo
  lights.push(createLight(0x55ff00, dimensions.x, dimensions.z, 0, dimensions.y / 2 + 0.1, 0, [-Math.PI / 2, 0, 0])); // Arriba

  modelLights[modelName] = lights;
}

// Crear luces para cada modelo
createSurroundingLights('SD', { x: 0.075, y: 1.474, z: 0 }, { x: 3.8, y: 2.92, z: 6.1 });
createSurroundingLights('Entrada_Caneca', { x: 8.063, y: 0.380, z: 0.914 }, { x: 0.67, y: 0.62, z: 1.38 });
createSurroundingLights('LL', { x: 5.352, y: 0.984, z: 0.321 }, { x: 3.02, y: 2.46, z: 2.84 });
createSurroundingLights('ML', { x: 0.333, y: 1.405, z: 6.735 }, { x: 4.71, y: 2.80, z: 5.38 });
createSurroundingLights('RGD', { x: 5.785, y: 0.664, z: 7.138 }, { x: 2.35, y: 1.38, z: 3.71 });

// Actualizar colores
async function fetchBuildingEntries() {
  try {
    const response = await axios.get('https://tesis.notadev.lat/procesar_entradas_edificio');
    return response.data;
  } catch (error) {
    console.error('Error fetching building entries:', error);
  }
}

function calcularTono(valor, minimo = 0, maximo = 4000) {
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

    lights.forEach((light) => light.color.setHSL(currentHue, 1, 0.4));
    if (progress < 1) requestAnimationFrame(updateHue);
  }
  updateHue();
}

// Controles de órbita
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2 - 0.1;

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