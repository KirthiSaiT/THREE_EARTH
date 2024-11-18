import * as THREE from "three";
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js';
import getStarfield from "./src/getStarfield.js";

console.log(`THREE REVISION: %c${THREE.REVISION}`, "color:#FFFF00");
window.THREE = THREE;

const w = window.innerWidth;
const h = window.innerHeight;


// Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(80, w / h, 0.1, 1000);
// Adjusted camera position to zoom in
camera.position.set(2, 1.5, 3); // Closer to the Earth


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true; // Enable shadow maps
document.body.appendChild(renderer.domElement);

// Earth Group and Tilt
const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180; // Tilted Earth
scene.add(earthGroup);

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Load Textures
const loader = new THREE.TextureLoader();
const earthTexture = loader.load("./textures/00_earthmap1k.jpg");
const earthLightsTexture = loader.load("./textures/03_earthlights1k.jpg");
const normalMap = loader.load("./textures/earth_normal_map.jpg");

// Earth Mesh
const geometry = new THREE.SphereGeometry(1, 64, 64); // High-detail geometry
const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,         // Color map for Earth's surface
    normalMap: normalMap,      // Normal map for surface details
    normalScale: new THREE.Vector2(0.8, 0.8), // Enhance normal map effect
    roughness: 0.5,            // Slightly shiny surface
    metalness: 0.2,            // Slight metallic reflections
    emissive: new THREE.Color(0x222222), // Subtle glow for visibility
    emissiveIntensity: 0.5,    // Control the brightness of emissive color
    displacementMap: loader.load("./textures/earth_displacement_map.jpg"),
    displacementScale: 0.05,
});
const earthMesh = new THREE.Mesh(geometry, earthMaterial);
earthMesh.castShadow = true; // Allow shadows to be cast by the Earth
earthMesh.receiveShadow = true; // Receive shadows
earthGroup.add(earthMesh);

// Night Lights Layer
const lightsMaterial = new THREE.MeshBasicMaterial({
    map: earthLightsTexture,
    transparent: true,
    opacity: 0.4, // Lower opacity for subtlety
    blending: THREE.AdditiveBlending, // Enhance brightness for lights
});
const lightsMesh = new THREE.Mesh(geometry, lightsMaterial);
earthGroup.add(lightsMesh);

// Cloud Mesh
const cloudsMaterial = new THREE.MeshStandardMaterial({
    map: loader.load("./textures/04_earthcloudmap.jpg"),
    transparent: true,
    opacity: 0.5, // Subtle clouds to avoid overpowering
    blending: THREE.AdditiveBlending,
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMaterial);
cloudsMesh.scale.setScalar(1.003); // Slightly larger than the Earth
earthGroup.add(cloudsMesh);

// Starfield Background
const stars = getStarfield({ numStars: 5000 });
scene.add(stars);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Brighter ambient light
scene.add(ambientLight);

// Directional Sunlight (Sun Simulation)
const sunLight = new THREE.DirectionalLight(0xffffff, 2.0); // Bright, white light
sunLight.position.set(-5, 3, 5); // Position the sun-like light
sunLight.castShadow = true; // Enable shadows
sunLight.shadow.mapSize.width = 2048; // Higher resolution shadow map
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 50;
scene.add(sunLight);

// Add a small Sun sphere for visualization
const sunGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const sunMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.copy(sunLight.position);
scene.add(sunMesh);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate Earth and Lights
    earthMesh.rotation.y += 0.002;
    lightsMesh.rotation.y += 0.002;
    cloudsMesh.rotation.y += 0.002;

    // Update OrbitControls
    controls.update();

    // Render Scene
    renderer.render(scene, camera);
}

animate();

// Handle Window Resize
window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});
