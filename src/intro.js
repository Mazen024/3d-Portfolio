import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const canvas = document.querySelector("canvas.webgl1");

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
let CarResize;
loader.load(
  "/models/car.gltf",
  (gltf) => {
    Car = gltf.scene;
    scene.add(Car);
    Car.position.set(5, 0, 0);
    Car.scale.set(0.5, 0.5, 0.5);
    CarResize = Car.position.x;
  },
  undefined,
  (error) => {
    console.error("An error occurred while loading the GLTF model:", error);
  }
);

let eye;
loader.load("/models/EyeModel2/scene.gltf", (gltf) => {
  eye = gltf.scene;
  scene.add(eye);
  eye.scale.set(0.5, 0.5, 0.5);
  eye.rotation.set(1, 0.5, 1);

  const setEyePosition = () => {
    const screenPosition = new THREE.Vector3(-0.9, 0.8, 0);
    screenPosition.unproject(camera);
    const direction = screenPosition.sub(camera.position).normalize();
    const distance = -camera.position.z / direction.z;
    const worldPosition = camera.position
      .clone()
      .add(direction.multiplyScalar(distance));
    eye.position.copy(worldPosition);
  };

  setEyePosition();
  window.addEventListener("resize", setEyePosition);
});

const cursor = { x: 0, y: 0 };

window.addEventListener("mousemove", (e) => {
  cursor.x = (e.clientX / sizes.width - 0.5) * 2;
  cursor.y = -(e.clientY / sizes.height - 0.5) * 2;

  if (eye) {
    eye.rotation.y = THREE.MathUtils.lerp(0.5, 1.8, (cursor.x + 1) / 2);
    eye.rotation.x = THREE.MathUtils.lerp(1, -0.5, (cursor.y + 1) / 2);
  }
});

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  if (sizes.width < 600) {
    Car.position.x = 0.5;
    CarResize = 0.5;
    Car.scale.set(0.3, 0.3, 0.3);
  } else {
    Car.position.x = 5;
  }
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

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
        Car.position.set(CarResize * 8, 0, 0);
      }
    } else if (moveAlongX) {
      Car.rotation.y = -Math.PI / 2;
      Car.position.x -= 0.1;
      if (Car.position.x <= CarResize) {
        moveAlongX = false;
        rotationY = true;
      }
    } else if (rotationY) {
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

const backButton = document.querySelector(".placeholder-button");
const openPortfolioBtn = document.getElementById("openPortfolioBtn");

openPortfolioBtn.addEventListener("click", () => {
  document.querySelector(".intro").style.display = "none";
  document.getElementById("portfolioContent").style.display = "block";
  document.querySelector(".webgl1").style.display = "none";
  document.querySelector(".webgl").style.display = "block";
});

backButton.addEventListener("click", () => {
  document.getElementById("portfolioContent").style.display = "none";
  document.querySelector(".intro").style.display = "flex";
  document.querySelector(".webgl1").style.display = "block";
  document.querySelector(".webgl").style.display = "none";
});
