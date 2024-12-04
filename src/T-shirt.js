import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const canvas = document.querySelector("canvas.webglShirt");
scene.background = new THREE.Color(0xf0f0f0);

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
camera.position.set(-6, 0, 4);
scene.add(camera);

const gltfLoader = new GLTFLoader();
let T_shirt;
let mixer;

gltfLoader.load("/models/horse_walk/scene.gltf", (gltf) => {
  T_shirt = gltf.scene;
  T_shirt.scale.set(0.05, 0.05, 0.05);
  scene.add(T_shirt);

  mixer = new THREE.AnimationMixer(T_shirt);
  gltf.animations.forEach((clip) => {
    const action = mixer.clipAction(clip);
    action.play();
  });
});

const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight("#ddddff", 1);
scene.add(ambientLight);

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

const clock = new THREE.Clock();
let previousTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  if (mixer) {
    mixer.update(deltaTime);
  }

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
