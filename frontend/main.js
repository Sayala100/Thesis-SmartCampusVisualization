//Importaciones

import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

RectAreaLightUniformsLib.init();

// Crear la escena
const scene = new THREE.Scene();

// Crear la cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Crear el renderizador
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});



// Configurar el renderizador
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setY(15);
camera.position.setX(30);

renderer.render(scene, camera);

const loader = new GLTFLoader();

const loadedModels = []; // Array to store model information

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

    // Store the data for future use
    loadedModels.push({
        name,
        object,
        dimensions: size,
        position: center
    });
}

// Load all models
const modelFiles = [
    { name: 'SD', path: 'imports/SD.glb' },
    { name: 'Entrada_Caneca', path: 'imports/Entrada_Caneca.glb' },
    { name: 'ML', path: 'imports/ML.glb' },
    { name: 'Lleras', path: 'imports/Lleras.glb' },
    { name: 'Civico2', path: 'imports/Civico2.glb' },
    { name: 'SD_1Color', path: 'imports/SD_1Color.glb' }
];

// Iterate over each model file and load
modelFiles.forEach(({ name, path }) => {
    loader.load(
        path,
        function (gltf) {
            const object = gltf.scene;
            scene.add(object); // Add to the scene
            logModelDimensions(name, object); // Log dimensions and position
        },
        undefined,
        function (error) {
            console.error(`Error loading model: ${name}`, error);
        }
    );
});

//Creación de suelo
const geometry2 = new THREE.BoxGeometry(100, 1, 100);
const material2 = new THREE.MeshStandardMaterial({ color: 0xcdcdcd });
const flooro = new THREE.Mesh(geometry2, material2);
flooro.position.set(0, -1, 0);
scene.add(flooro);


//Iluminacion

//Luz de ambiente
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);


// Store the lights around each model
const modelLights = {};

// Function to create surrounding lights for a model
function createSurroundingLights(modelName, position, dimensions) {
  const lights = [];

  // Create lights around the model based on its position and dimensions
  const createLight = (color, width, height, xOffset, yOffset, zOffset, rotation = 0) => {
    const light = new THREE.RectAreaLight(color, 1, width, height);
    light.position.set(position.x + xOffset, position.y + yOffset, position.z + zOffset);
    light.rotation.set(0, rotation, 0);
    light.distance = 1;
    scene.add(light);
    return light;
  };

  // Surround the model with 5 lights based on its dimensions
  lights.push(createLight(0xff0000, dimensions.x, dimensions.y, 0, 1, 0)); // top light
  lights.push(createLight(0xff0000, dimensions.x, dimensions.y, 0, -1, 0)); // bottom light
  lights.push(createLight(0xff0000, dimensions.z, dimensions.y, 1, 0, 0, Math.PI / 2)); // front light
  lights.push(createLight(0xff0000, dimensions.z, dimensions.y, -1, 0, 0, -Math.PI / 2)); // back light
  lights.push(createLight(0xff0000, dimensions.x, dimensions.z, 0, 2, 0)); // above light (new)

  // Store the lights for future access
  modelLights[modelName] = lights;
}

// Create lights around each model
createSurroundingLights('SD', { x: 0.075, y: 1.474, z: 4.912 }, { x: 3.8, y: 2.92, z: 6.1 });
createSurroundingLights('Entrada_Caneca', { x: 8.063, y: 0.380, z: 0.914 }, { x: 0.67, y: 0.62, z: 1.38 });
createSurroundingLights('Lleras', { x: 5.352, y: 0.984, z: 0.321 }, { x: 3.02, y: 2.46, z: 2.84 });
createSurroundingLights('ML', { x: 0.333, y: 1.405, z: 6.735 }, { x: 4.71, y: 2.80, z: 5.38 });
createSurroundingLights('Civico2', { x: 5.785, y: 0.664, z: 7.138 }, { x: 2.35, y: 1.38, z: 3.71 });

// Function to animate the intensity of surrounding lights for a specific model
function animateModelLightIntensity(modelName, startIntensity, endIntensity, duration) {
  const lights = modelLights[modelName];
  
  if (!lights) {
    console.error(`No lights found for model: ${modelName}`);
    return;
  }

  const startTime = performance.now();

  function updateIntensity() {
    const elapsedTime = performance.now() - startTime;
    const progress = Math.min(elapsedTime / duration, 1); // Normalizes the progress

    // Set the intensity for each light
    lights.forEach(light => {
      light.intensity = startIntensity + (endIntensity - startIntensity) * progress;
    });

    if (progress < 1) {
      requestAnimationFrame(updateIntensity);
    }
  }

  updateIntensity();
}

// Example of how to call the animateModelLightIntensity function:
animateModelLightIntensity('SD', 0.5, 2, 2000); // Fade in lights around 'SD' from intensity 0.5 to 2 over 2 seconds





function animateLightIntensity(light, startIntensity, endIntensity, duration) {
  const startTime = performance.now();

  function updateIntensity() {
      const elapsedTime = performance.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1); // Normaliza el progreso entre 0 y 1
      
      light.intensity = startIntensity + (endIntensity - startIntensity) * progress;

      if (progress < 1) {
          requestAnimationFrame(updateIntensity);
      }
  }

  updateIntensity();
}

//create afunction that varies the intensity of the light, each light in a different oscilation





// Controles de orbita
const controls = new OrbitControls(camera, renderer.domElement);
scene.add(controls);

// Inicializador
function animate() {

  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  

}

animate();

// Reloj

//Párametros
const startHour = 5; // 5 AM
const endHour = 22; // 10 PM
const duration = 30000; // 1 minuto en milisegundos
const clockElement = document.getElementById('clock');
const startTime = performance.now();
const endTime = startTime + duration;

//Función para actualizar el reloj
function updateClock() {
    const now = performance.now();
    const elapsed = Math.min(now - startTime, duration);
    const progress = elapsed / duration;

    // Calcular la hora actual
    const totalMinutes = (endHour - startHour) * 60;
    const currentMinutes = startHour * 60 + progress * totalMinutes;
    const hours = Math.floor(currentMinutes / 60);
    const minutes = Math.floor(currentMinutes % 60);

    // Formatear la hora
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    clockElement.textContent = `${formattedHours}:${formattedMinutes} ${ampm}`;

    if (now < endTime) {
        requestAnimationFrame(updateClock);
    }
}


updateClock();

// Create an AxesHelper with size 5
const axesHelper = new THREE.AxesHelper(5);  // The number specifies the size of the axes

// Add the axes helper to the scene
scene.add(axesHelper);