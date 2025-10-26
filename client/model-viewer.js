import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

// Set renderer size and add to DOM
const container = document.getElementById('model-container');
const size = 400;
renderer.setSize(size, size);
container.appendChild(renderer.domElement);

// Lighting (important!)
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 5);
scene.add(directionalLight);

// Additional light from the back
const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
backLight.position.set(-5, -5, -5);
scene.add(backLight);

// Camera position
camera.position.z = 5;

// Load model
const loader = new GLTFLoader();
let model;

loader.load(
  'models/oven.glb',
  (gltf) => {
    model = gltf.scene;

    // Fix material transparency
    model.traverse((child) => {
      if (child.isMesh) {
        // Make all materials opaque
        child.material.transparent = false;
        child.material.opacity = 1.0;
        child.material.depthWrite = true;
        child.material.alphaTest = 0;

        console.log('Fixed material:', child.material.name, 'opacity:', child.material.opacity);
      }
    });

    scene.add(model);

    // Center and scale the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center the model
    model.position.sub(center);

    // Scale to fit in view (adjust the divisor to make it bigger/smaller)
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxDim;
    model.scale.setScalar(scale);

    console.log('Model loaded successfully');
  },
  (progress) => {
    console.log('Loading:', Math.round(progress.loaded / progress.total * 100) + '%');
  },
  (error) => {
    console.error('Error loading model:', error);
  }
);

// Mouse tracking
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;

// Track mouse movement
window.addEventListener('mousemove', (event) => {
  // Normalize mouse position to -1 to 1
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  // Calculate target rotation based on mouse position
  targetRotationY = mouseX * Math.PI * 0.3 + 180 // Rotate left/right (Y axis)
  targetRotationX = -mouseY * Math.PI * 0.15; // Rotate up/down (X axis)
});

// Animation loop with mouse tracking
function animate() {
  requestAnimationFrame(animate);

  if (model) {
    // Smoothly interpolate rotation towards mouse position
    model.rotation.y += (targetRotationY - model.rotation.y) * 0.05;
    model.rotation.x += (targetRotationX - model.rotation.x) * 0.05;
  }

  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  // Keep the renderer square
  const containerWidth = container.offsetWidth;
  const newSize = Math.min(containerWidth, 400);
  renderer.setSize(newSize, newSize);
});
