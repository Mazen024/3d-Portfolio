import * as THREE from "three";
import gsap from "gsap";

const textureLoader = new THREE.TextureLoader();
// Water
const watercolor = textureLoader.load("Textures/Water/WaterCOLOR.jpg");
const waterDisp = textureLoader.load("Textures/Water/WaterDISP.png");
const waterNormal = textureLoader.load("Textures/Water/WaterNORM.jpg");
const waterOcc = textureLoader.load("Textures/Water/WaterOCC.jpg");
const waterSpec = textureLoader.load("Textures/Water/WaterSPEC.jpg");

// Stone
const stoneColor = textureLoader.load("Textures/Stone/Stone_Floorcolor.jpg");
const stoneOcc = textureLoader.load("Textures/Stone/Stone_FloorambientOcc.jpg");
const stoneHeight = textureLoader.load("Textures/Stone/Stone_Floorheight.png");
const stoneNormal = textureLoader.load("Textures/Stone/Stone_Floornormal.jpg");
const stoneRoughness = textureLoader.load("Textures/Stone/Stone_Floorough.jpg");

// Lava
const lavaColor = textureLoader.load("Textures/Lava/LavaCOLOR.jpg");
const lavaDisp = textureLoader.load("Textures/Lava/LavaDISP.png");
const lavaMask = textureLoader.load("Textures/Lava/LavaMASK.jpg");
const lavaNormal = textureLoader.load("Textures/Lava/LavaNORM.jpg");
const lavaOcc = textureLoader.load("Textures/Lava/LavaOCC.jpg");
const lavaRoughness = textureLoader.load("Textures/Lava/LavaROUGH.jpg");

const scene = new THREE.Scene();
const canvas = document.querySelector("canvas.webgl");

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const waterMaterial = new THREE.MeshPhongMaterial({
  color: "#ffeded",
  map: watercolor,
  displacementScale: 0.01,
  displacementMap: waterDisp,
  normalMap: waterNormal,
  aoMap: waterOcc,
  specularMap: waterSpec,
});

const stoneMaterial = new THREE.MeshStandardMaterial({
  color: "#ffeded",
  map: stoneColor,
  displacementScale: 0.01,
  displacementMap: stoneHeight,
  normalMap: stoneNormal,
  aoMap: stoneOcc,
  roughness: 0.5,
  roughnessMap: stoneRoughness,
});

const lavaMaterial = new THREE.MeshStandardMaterial({
  color: "#ffeded",
  map: lavaColor,
  displacementScale: 0.1,
  displacementMap: lavaDisp,
  normalMap: lavaNormal,
  aoMap: lavaOcc,
  roughness: 0.1,
  roughnessMap: lavaRoughness,
  alphaMap: lavaMask,
});

const objectsDistance = 4;

const mesh1 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), lavaMaterial);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2, 4), stoneMaterial);
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  waterMaterial
);
mesh1.position.y = 0;
mesh2.position.y = -objectsDistance;
mesh3.position.y = -objectsDistance * 2;
mesh1.position.x = -2;
mesh2.position.x = 2;
mesh3.position.x = -2;
scene.add(mesh1, mesh2, mesh3);
const sectionsMeshes = [mesh1, mesh2, mesh3];

const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight("#ffffff", 0.1);
scene.add(ambientLight);

const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  if (sizes.width < 600) {
    mesh1.position.x = 0;
    mesh2.position.x = 0;
    mesh3.position.x = 0;
    mesh1.scale.set(0.7, 0.7, 0.7);
    mesh2.scale.set(0.7, 0.7, 0.7);
    mesh3.scale.set(0.7, 0.7, 0.7);
  } else {
    mesh1.position.x = -2;
    mesh2.position.x = 2;
    mesh3.position.x = -2;
  }
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

let scrollY = window.scrollY;
let currentSection = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;

  const newSection = Math.round(scrollY / (sizes.height * 1.2));
  if (newSection != currentSection) {
    currentSection = newSection;

    if (currentSection === 1) {
      gsap.to(mesh2.rotation, {
        duration: 2,
        ease: "power2.inOut",
        y: "+=6",
      });
    } else {
      gsap.to(sectionsMeshes[currentSection].rotation, {
        duration: 2,
        ease: "power2.inOut",
        x: "+=6",
        y: "+=3",
        z: "+=6",
      });
    }
  }
});

const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = e.clientY / sizes.height - 0.5;
});

const renderer = new THREE.WebGLRenderer({
  canvas,
});

renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

const clock = new THREE.Clock();
let prevTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;

  camera.position.y = (-scrollY / sizes.height) * objectsDistance;
  const parallaxX = cursor.x;
  const parallaxY = -cursor.y;

  // Camera Animation
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  for (const [index, mesh] of sectionsMeshes.entries()) {
    if (index === 1) {
      mesh.rotation.y += deltaTime * 0.12;
    } else {
      mesh.rotation.x += deltaTime * 0.1;
      mesh.rotation.y += deltaTime * 0.12;
    }
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
