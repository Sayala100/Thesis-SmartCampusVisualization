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

loader.load( 'imports/SD.glb', function ( gltf ) {

	const object = gltf.scene;
  scene.add( object );

 

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load( 'imports/Entrada_Caneca.glb', function ( gltf ) {

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load( 'imports/ML.glb', function ( gltf ) {

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load( 'imports/Lleras.glb', function ( gltf ) {

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load( 'imports/Civico2.glb', function ( gltf ) {

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load( 'imports/SD_1Color.glb', function ( gltf ) {

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

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



//Luz civico 1
const rectLight1 = new THREE.RectAreaLight( 0xff0000, 1, 2.4, 1.3);
rectLight1.position.set( 5.8, 0.7, 9.05 );
rectLight1.distance = 1;
scene.add( rectLight1 );

//Luz civico 2
const rectLight2 = new THREE.RectAreaLight( 0xff0000, 1, 3.7, 1.3);
rectLight2.position.set( 7, 0.7, 7.1 );
rectLight2.rotation.set(0, Math.PI / 2, 0);
rectLight2.distance = 1;
scene.add( rectLight2 );

//Luz civico 3
const rectLight3 = new THREE.RectAreaLight( 0xff0000, 1, 3.7, 1.3);
rectLight3.position.set( 4.6, 0.7, 7.1 );
rectLight3.rotation.set(0, Math.PI / -2, 0);
rectLight3.distance = 1;
scene.add( rectLight3 );

//Luz civico 4
const rectLight4 = new THREE.RectAreaLight( 0xff0000, 1, 2.4, 1.3);
rectLight4.position.set( 5.8, 0.7, 4.9 );
rectLight4.rotation.set(0, Math.PI, 0);
rectLight4.distance = 1;
scene.add( rectLight4 );

//Luz civico techo
const rectLight5 = new THREE.RectAreaLight( 0xff0000, 1, 3.7, 2.4);
rectLight5.position.set( 5.8, 1.5, 7.1 );
rectLight5.rotation.set(Math.PI / 2, Math.PI, Math.PI / 2);
rectLight5.distance = 1;
scene.add( rectLight5 );

//Luz LL 1
const rectLight6 = new THREE.RectAreaLight( 0xff0000, 1, 2.4, 2);
rectLight6.position.set( 5.8, 0.7, 1.95 );
rectLight6.distance = 1;
scene.add( rectLight6 );





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



// Ayudas


//Ayudador luz
// scene.add( new RectAreaLightHelper( rectLight1 ) );
// scene.add( new RectAreaLightHelper( rectLight2 ) );
// scene.add( new RectAreaLightHelper( rectLight3 ) );
// scene.add( new RectAreaLightHelper( rectLight4 ) );
// scene.add( new RectAreaLightHelper( rectLight5 ) );
scene.add( new RectAreaLightHelper( rectLight6 ) );

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