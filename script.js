import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

const canvas = document.getElementById("threeCanvas");
const pointer = new THREE.Vector2(0, 0);
const targetPointer = new THREE.Vector2(0, 0);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  preserveDrawingBuffer: true,
  powerPreference: "high-performance",
});
renderer.setClearColor(0x020603, 1);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020603);
scene.fog = new THREE.FogExp2(0x020603, 0.032);

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 220);
camera.position.set(0, 4.5, 23);

const world = new THREE.Group();
scene.add(world);

const green = new THREE.Color(0x70ff8f);
const deepGreen = new THREE.Color(0x0f6b2a);
const acid = new THREE.Color(0xc8ff5d);

const ambient = new THREE.AmbientLight(0x4aff75, 0.5);
scene.add(ambient);

const keyLight = new THREE.PointLight(0x70ff8f, 24, 70);
keyLight.position.set(0, 9, 12);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0xc8ff5d, 8, 60);
rimLight.position.set(-14, -2, -12);
scene.add(rimLight);

const grid = new THREE.GridHelper(120, 64, 0x48ff70, 0x0a3416);
grid.position.set(0, -6, -20);
grid.material.transparent = true;
grid.material.opacity = 0.48;
world.add(grid);

const rearGrid = new THREE.GridHelper(120, 64, 0x1eff64, 0x092811);
rearGrid.rotation.x = Math.PI / 2;
rearGrid.position.set(0, 0, -48);
rearGrid.material.transparent = true;
rearGrid.material.opacity = 0.2;
world.add(rearGrid);

const core = new THREE.Group();
core.position.set(8.5, 0.2, -2);
world.add(core);

const knotGeometry = new THREE.TorusKnotGeometry(3.1, 0.55, 180, 18, 2, 3);
const knotMaterial = new THREE.MeshStandardMaterial({
  color: 0x112817,
  emissive: 0x1dff62,
  emissiveIntensity: 0.32,
  metalness: 0.2,
  roughness: 0.26,
  wireframe: true,
});
const knot = new THREE.Mesh(knotGeometry, knotMaterial);
core.add(knot);

const twinRig = new THREE.Group();
twinRig.position.set(0, -0.25, 0.1);
core.add(twinRig);

const twinBoxGeometry = new THREE.BoxGeometry(1.9, 3.2, 1.25);
const physicalMaterial = new THREE.MeshStandardMaterial({
  color: 0x07180b,
  emissive: 0x70ff8f,
  emissiveIntensity: 0.72,
  transparent: true,
  opacity: 0.26,
  wireframe: true,
});
const virtualMaterial = new THREE.MeshStandardMaterial({
  color: 0x0a2210,
  emissive: 0xc8ff5d,
  emissiveIntensity: 0.58,
  transparent: true,
  opacity: 0.2,
  wireframe: true,
});
const physicalTwin = new THREE.Mesh(twinBoxGeometry, physicalMaterial);
physicalTwin.position.set(-2.05, 0, 0);
twinRig.add(physicalTwin);

const virtualTwin = new THREE.Mesh(twinBoxGeometry, virtualMaterial);
virtualTwin.position.set(2.05, 0, 0);
virtualTwin.scale.set(1.18, 1.18, 1.18);
twinRig.add(virtualTwin);

const syncMaterial = new THREE.LineBasicMaterial({
  color: 0x70ff8f,
  transparent: true,
  opacity: 0.52,
});
[-1.15, -0.38, 0.38, 1.15].forEach((y) => {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-1.05, y, 0.72),
    new THREE.Vector3(1.05, y, 0.72),
  ]);
  twinRig.add(new THREE.Line(geometry, syncMaterial));
});

const ringMaterial = new THREE.MeshBasicMaterial({
  color: 0x70ff8f,
  transparent: true,
  opacity: 0.48,
  wireframe: true,
});
for (let i = 0; i < 5; i += 1) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.6 + i * 1.4, 0.018, 8, 128), ringMaterial);
  ring.rotation.x = Math.PI / 2 + i * 0.08;
  ring.rotation.y = i * 0.16;
  core.add(ring);
}

const nodeMaterial = new THREE.MeshStandardMaterial({
  color: 0x0b1f10,
  emissive: 0x70ff8f,
  emissiveIntensity: 0.76,
  roughness: 0.4,
});
for (let i = 0; i < 18; i += 1) {
  const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18 + (i % 3) * 0.05, 1), nodeMaterial);
  const angle = (i / 18) * Math.PI * 2;
  const radius = 5.4 + Math.sin(i * 1.7) * 1.5;
  node.position.set(Math.cos(angle) * radius, Math.sin(i * 0.6) * 2.1, Math.sin(angle) * radius);
  core.add(node);
}

const tunnelGroup = new THREE.Group();
world.add(tunnelGroup);
const tunnelMaterial = new THREE.LineBasicMaterial({
  color: 0x2eff67,
  transparent: true,
  opacity: 0.22,
});
for (let i = 0; i < 16; i += 1) {
  const radius = 7 + i * 0.28;
  const shape = new THREE.BufferGeometry();
  const points = [];
  const segments = 6;
  for (let j = 0; j <= segments; j += 1) {
    const angle = (j / segments) * Math.PI * 2 + Math.PI / 6;
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.58, -i * 4.2);
  }
  shape.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  tunnelGroup.add(new THREE.Line(shape, tunnelMaterial));
}

const particleCount = 900;
const positions = new Float32Array(particleCount * 3);
const speeds = new Float32Array(particleCount);
for (let i = 0; i < particleCount; i += 1) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 80;
  positions[i3 + 1] = (Math.random() - 0.5) * 40;
  positions[i3 + 2] = -Math.random() * 120;
  speeds[i] = 0.12 + Math.random() * 0.5;
}
const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({
  color: 0x70ff8f,
  size: 0.06,
  transparent: true,
  opacity: 0.7,
  depthWrite: false,
});
const particles = new THREE.Points(particleGeometry, particleMaterial);
world.add(particles);

const scanGeometry = new THREE.PlaneGeometry(80, 0.22);
const scanMaterial = new THREE.MeshBasicMaterial({
  color: acid,
  transparent: true,
  opacity: 0.16,
  side: THREE.DoubleSide,
});
const scanLine = new THREE.Mesh(scanGeometry, scanMaterial);
scanLine.position.set(0, 0, -16);
world.add(scanLine);

function resizeThree() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  core.position.x = width < 860 ? 0 : 8.5;
  core.position.y = width < 860 ? -1.2 : 0.2;
  camera.position.z = width < 860 ? 28 : 23;
}

function animateThree(time = 0) {
  const t = time * 0.001;
  pointer.lerp(targetPointer, 0.055);

  const speed = reducedMotion ? 0.08 : 1;
  knot.rotation.x = t * 0.22 * speed + pointer.y * 0.35;
  knot.rotation.y = t * 0.34 * speed + pointer.x * 0.55;
  twinRig.rotation.y = Math.sin(t * 0.42) * 0.12 - pointer.x * 0.18;
  twinRig.rotation.x = Math.sin(t * 0.31) * 0.06 + pointer.y * 0.08;
  virtualTwin.scale.setScalar(1.14 + Math.sin(t * 1.8) * 0.04);
  core.rotation.y = Math.sin(t * 0.23) * 0.16 + pointer.x * 0.12;
  core.rotation.x = pointer.y * -0.08;
  tunnelGroup.rotation.z = t * 0.025 * speed;
  scanLine.position.y = Math.sin(t * 0.72) * 7;
  scanLine.material.opacity = 0.08 + Math.abs(Math.sin(t * 1.7)) * 0.12;

  camera.position.x = pointer.x * 2.2;
  camera.position.y = 4.5 + pointer.y * 1.4;
  camera.lookAt(0, -0.4, -18);

  const positionAttribute = particleGeometry.getAttribute("position");
  for (let i = 0; i < particleCount; i += 1) {
    const zIndex = i * 3 + 2;
    positions[zIndex] += speeds[i] * speed;
    if (positions[zIndex] > 12) {
      positions[zIndex] = -120;
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    }
  }
  positionAttribute.needsUpdate = true;

  renderer.render(scene, camera);
  requestAnimationFrame(animateThree);
}

window.addEventListener("resize", resizeThree);
window.addEventListener("pointermove", (event) => {
  targetPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  targetPointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
});
window.addEventListener("pointerleave", () => {
  targetPointer.set(0, 0);
});

resizeThree();
animateThree();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const sections = [...document.querySelectorAll("section[id]")];
const navLinks = [...document.querySelectorAll(".site-nav a")];
const navObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { threshold: 0.45 }
);
sections.forEach((section) => navObserver.observe(section));

document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--ry", `${x * 4}deg`);
    card.style.setProperty("--rx", `${y * -4}deg`);
  });
  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--rx", "0deg");
  });
});

const filters = [...document.querySelectorAll(".filter")];
const cards = [...document.querySelectorAll(".project-card")];
filters.forEach((button) => {
  button.addEventListener("click", () => {
    const activeFilter = button.dataset.filter;
    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    cards.forEach((card) => {
      const tags = card.dataset.tags.split(" ");
      card.classList.toggle("hidden", activeFilter !== "all" && !tags.includes(activeFilter));
    });
  });
});

const gain = document.getElementById("gain");
const filter = document.getElementById("filter");
const feedback = document.getElementById("feedback");
const signalScore = document.getElementById("signalScore");
const latencyValue = document.getElementById("latencyValue");
const streamValue = document.getElementById("streamValue");
const confidenceValue = document.getElementById("confidenceValue");
const bars = [...document.querySelectorAll(".wave-stack span")];

function updateConsole() {
  const gainValue = Number(gain.value);
  const filterValue = Number(filter.value);
  const feedbackValue = Number(feedback.value);
  const score = gainValue * 0.48 + filterValue * 0.22 + feedbackValue * 0.3;
  const latency = Math.max(8, Math.round(42 - filterValue * 0.18 + feedbackValue * 0.06));
  const stream = Math.round(28 + gainValue * 0.28 + filterValue * 0.04);
  const confidence = Math.min(99, Math.round(54 + filterValue * 0.28 + feedbackValue * 0.22));

  signalScore.textContent = score.toFixed(1);
  latencyValue.textContent = `${latency} ms`;
  streamValue.textContent = `${stream} Hz`;
  confidenceValue.textContent = `${confidence}%`;

  bars.forEach((bar, index) => {
    const wave = Math.sin(index * 0.86 + score * 0.08) * 18;
    const level = Math.max(12, Math.min(96, score * 0.62 + wave + feedbackValue * 0.16));
    bar.style.setProperty("--bar", `${level}%`);
  });
}

[gain, filter, feedback].forEach((input) => input.addEventListener("input", updateConsole));
updateConsole();

const tickerTrack = document.querySelector(".ticker-track");
if (tickerTrack) {
  tickerTrack.innerHTML += tickerTrack.innerHTML;
}
