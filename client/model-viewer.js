import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { AnaglyphEffect } from 'three/addons/effects/AnaglyphEffect.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
const effect = new AnaglyphEffect(renderer); 

// Loaders and models
const loader = new GLTFLoader();
const fontLoader = new FontLoader();
let model;
let textMesh;

// Base rotation for model to face forward
const BASE_ROTATION_Y = -Math.PI / 2;

// Set renderer size and add to DOM
const container = document.getElementById('model-container');
const CONTAINZER_SIZE = 600;
effect.setSize(CONTAINZER_SIZE, CONTAINZER_SIZE);
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 5);
scene.add(directionalLight);

const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
backLight.position.set(-5, -5, -5);
scene.add(backLight);

// Camera position
camera.position.z = 8;

loader.load(
  'models/oven.glb',
  (gltf) => {
    if (model) {
      model.dispose()
    }

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

    // Set base rotation to face forward (adjust as needed)
    model.rotation.y = BASE_ROTATION_Y;

    console.log('Model loaded successfully');

    updateTemperatureText(0, 'F');
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

  // Calculate target rotation based on mouse position (add base rotation)
  targetRotationY = mouseX * Math.PI * 0.3 + BASE_ROTATION_Y; // Rotate left/right (Y axis)
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

  effect.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  // Keep the renderer square
  const containerWidth = container.offsetWidth;
  const newSize = Math.min(containerWidth, CONTAINZER_SIZE);
  effect.setSize(newSize, newSize);
});

export function updateTemperatureText(temp, unit) {
  if (!model) return;

  const text = `${Math.round(temp)}°${unit}`;

  // Remove ALL existing text meshes (handles race conditions from async font loading)
  const textMeshesToRemove = model.children.filter(child =>
    child.type === 'Mesh' && child.geometry.type === 'TextGeometry'
  );
  textMeshesToRemove.forEach(mesh => {
    model.remove(mesh);
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) mesh.material.dispose();
  });

  fontLoader.load(
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    (font) => {
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.5,
        depth: 0.1,
      });

      const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      textMesh = new THREE.Mesh(textGeometry, textMaterial);

      // Center the text geometry
      textGeometry.computeBoundingBox();
      const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
      // Position text in local coordinates (X axis = forward after rotation)
      textMesh.position.set(0.5, 0, textWidth / 2);

      // Rotate text to face forward in model's local space
      textMesh.rotation.y = -BASE_ROTATION_Y;

      // Add text as child of model
      model.add(textMesh);
    }
  );
}