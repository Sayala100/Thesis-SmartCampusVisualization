import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setY(15);
camera.position.setX(30);

renderer.render(scene, camera);

const geometry = new THREE.BoxGeometry(10, 50, 10);
const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
const cube = new THREE.Mesh(geometry, material);

scene.add(cube)

const geometry2 = new THREE.BoxGeometry(100, 1, 100);
const material2 = new THREE.MeshStandardMaterial({ color: 0xcdcdcd });
const floor = new THREE.Mesh(geometry2, material2);



scene.add(floor);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);

const pointLight = new THREE.PointLight(0xff0000, 200);
pointLight.position.set(11, 20, 11);
const pointLightHelper = new THREE.PointLightHelper(pointLight);
scene.add(pointLightHelper);

scene.add(pointLight);



function animate() {
  requestAnimationFrame(animate);

  controls.update();
  pointLight.position.x = Math.cos(Date.now() * 0.001) * 10;
  pointLight.position.z = Math.sin(Date.now() * 0.001) * 10;


  renderer.render(scene, camera);
}

animate();