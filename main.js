//Importaciones

import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';


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



//Creación de modelado

//Crear suelo
const geometry2 = new THREE.BoxGeometry(100, 1, 100);
const material2 = new THREE.MeshStandardMaterial({ color: 0xcdcdcd });
const flooro = new THREE.Mesh(geometry2, material2);
scene.add(flooro);


// Crear el edificio

//Párametros
const floors = [];
const numFloors = 6; 
const width = 8;
const height = 4;
const depth = 8;
const color = 'gray'; 
const spacing = 0.5; 

//Función para crear los pisos
function createMultipleFloors(numFloors, width, height, depth, color, spacing, scene) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const geometry2 = new THREE.BoxGeometry(width, spacing, depth);
    const material = new THREE.MeshStandardMaterial({ color: color });
    
    for (let i = 0; i < numFloors; i++) {
        const floor = new THREE.Mesh(geometry, material);
        floor.position.set(0, i * (height + spacing) + height/2, 0);
        floor.name = `floor${i + 1}`; 
        scene.add(floor);
        floors.push(floor); 
    }
}


createMultipleFloors(numFloors, width, height, depth, color, spacing, scene);


//Iluminacion

//Luz de ambiente
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);



// Crear luz rectángular
const rectLight1 = new THREE.RectAreaLight( 0xff0000, 4, 8, 3.5);
rectLight1.position.set( 0, 2.5, 4.1 );
scene.add( rectLight1 );

const rectLight2 = new THREE.RectAreaLight( 0xff0000, 4, 8, 3.5);
rectLight2.position.set( 0, 6.5, 4.1 );
scene.add( rectLight2 );

const rectLight3 = new THREE.RectAreaLight( 0xff0000, 4, 8, 3.5);
rectLight3.position.set( 0, 11, 4.1 );
scene.add( rectLight3 );

const rectLight4 = new THREE.RectAreaLight( 0xff0000, 4, 8, 3.5);
rectLight4.position.set( 0, 15.5, 4.1 );
scene.add( rectLight4 );

const rectLight5 = new THREE.RectAreaLight( 0xff0000, 4, 8, 3.5);
rectLight5.position.set( 0, 20, 4.1 );
scene.add( rectLight5 );

const rectLight6 = new THREE.RectAreaLight( 0xff0000, 4, 8, 3.5);
rectLight6.position.set( 0, 24.5, 4.1 );
scene.add( rectLight6 );



function animateLightIntensity(light, startIntensity, endIntensity, duration) {
  const startTime = performance.now();

  function updateIntensity() {
      const elapsedTime = performance.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1); // Normaliza el progreso entre 0 y 1
      startIntensity = light.intensity;
      light.intensity = startIntensity + (endIntensity - startIntensity) * progress;

      if (progress < 1) {
          requestAnimationFrame(updateIntensity);
      }
  }

  updateIntensity();
}

//create afunction that varies the intensity of the light, each light in a different oscilation

function oscilateLightIntensity() {
  animateLightIntensity(rectLight1, 0, 3, 10000);
  animateLightIntensity(rectLight2, 3, 1, 10000);
  animateLightIntensity(rectLight3, 0, 4, 10000);
  animateLightIntensity(rectLight4, 2, 1, 10000);
  animateLightIntensity(rectLight5, 1, 2, 10000);
  animateLightIntensity(rectLight6, 5, 0, 10000);

  
  
}

oscilateLightIntensity();

function oscilateLightIntensity2() {
  animateLightIntensity(rectLight1, 3, 0, 10000);
  animateLightIntensity(rectLight2, 1, 5, 10000);
  animateLightIntensity(rectLight3, 4, 2, 10000);
  animateLightIntensity(rectLight4, 1, 0, 10000);
  animateLightIntensity(rectLight5, 2, 5, 10000);
  animateLightIntensity(rectLight6, 0, 2, 10000);

  
  
}

function oscilateLightIntensity3() {
  animateLightIntensity(rectLight1, 0, 5, 10000);
  animateLightIntensity(rectLight2, 5, 3, 10000);
  animateLightIntensity(rectLight3, 2, 0, 10000);
  animateLightIntensity(rectLight4, 0, 5, 10000);
  animateLightIntensity(rectLight5, 5, 1, 10000);
  animateLightIntensity(rectLight6, 2, 4, 10000);

  
  
}

function wait(delay, callback) {
  setTimeout(callback, delay);
}

wait(10000, oscilateLightIntensity2);
wait(20000, oscilateLightIntensity3);




// Ayudas

//Crear ejes
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

//Ayudador luz
scene.add( new RectAreaLightHelper( rectLight1 ) );

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