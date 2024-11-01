// Import necessary modules
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const canvas = document.querySelector("canvas.webgl");

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.y = 5;
camera.position.z = 20;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0xffffff);

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const textureLoader = new THREE.TextureLoader();
const snowTexture = textureLoader.load("/1.png");

const snowCount = 3000;
const snowGeometry = new THREE.BufferGeometry();
const snowMaterial = new THREE.PointsMaterial({
  alphaMap: snowTexture,
  size: 2,
  transparent: true,
  sizeAttenuation: true,
  depthTest: false,
});

const positions = new Float32Array(snowCount * 3);
const speeds = new Float32Array(snowCount);
for (let i = 0; i < snowCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 100;
  positions[i * 3 + 1] = Math.random() * 100;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
  speeds[i] = 0.5 + Math.random();
}
snowGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const snowflakes = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snowflakes);

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
loader.setDRACOLoader(dracoLoader);

let Car;

loader.load(
  "/models/car.gltf",
  (gltf) => {
    Car = gltf.scene;
    scene.add(Car);
    Car.position.set(5, 0, 0);
    Car.scale.set(0.5, 0.5, 0.5);
  },
  undefined,
  (error) => {
    console.error("An error occurred while loading the GLTF model:", error);
  }
);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

let moveTowardsCamera = true;
let moveAlongX = false;
let rotationY = false;

let isSnowing = true;

const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  const snowPositions = snowflakes.geometry.attributes.position.array;
  for (let i = 0; i < snowCount; i++) {
    if (isSnowing) {
      snowPositions[i * 3 + 1] -= speeds[i] * 0.1;
      if (snowPositions[i * 3 + 1] < -50) {
        snowPositions[i * 3 + 1] = 50;
        snowPositions[i * 3] = (Math.random() - 0.5) * 100;
        snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      }
    }
  }
  snowflakes.geometry.attributes.position.needsUpdate = true;

  if (Car) {
    if (moveTowardsCamera) {
      Car.position.z += 0.1;
      if (Car.position.z >= camera.position.z + 5) {
        moveTowardsCamera = false;
        moveAlongX = true;
        Car.position.set(20, 0, 0);
      }
    } else if (moveAlongX) {
      Car.rotation.y = -Math.PI / 2;
      Car.position.x -= 0.1;
      if (Car.position.x <= 5) {
        moveAlongX = false;
        rotationY = true;
      }
    } else if (rotationY) {
      console.log(Car.rotation.y);
      if (Car.rotation.y >= 0) {
        moveTowardsCamera = true;
      } else Car.rotation.y += 0.1;
    }
  }

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();