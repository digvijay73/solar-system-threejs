// 🌌 Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ☀️ Light
const light = new THREE.PointLight(0xffffff, 1.5);
light.position.set(0, 0, 0);
scene.add(light);

// ☀️ Sun
const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfdb813 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// 🪐 Planet Data
const planetData = [
  { name: "Mercury", color: 0xaaaaaa, radius: 1.5, speed: 0.03 },
  { name: "Venus", color: 0xffcc00, radius: 2.2, speed: 0.025 },
  { name: "Earth", color: 0x3b9eff, radius: 3, speed: 0.02 },
  { name: "Mars", color: 0xff3300, radius: 3.7, speed: 0.018 },
  { name: "Jupiter", color: 0xff9966, radius: 4.5, speed: 0.015 },
  { name: "Saturn", color: 0xffff66, radius: 5.5, speed: 0.013 },
  { name: "Uranus", color: 0x66ffff, radius: 6.3, speed: 0.01 },
  { name: "Neptune", color: 0x3333ff, radius: 7.2, speed: 0.009 },
];

const planets = [];
const angles = [];

// 🎛️ Pause / Resume Control
let isPaused = false;
const pauseBtn = document.getElementById("pauseBtn");
pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "▶️ Resume" : "⏸ Pause";
});

// 🛠️ Planets creation
const slidersContainer = document.getElementById("sliders");

planetData.forEach((data, index) => {
  const geometry = new THREE.SphereGeometry(0.2, 32, 32);
  const material = new THREE.MeshLambertMaterial({ color: data.color });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  planets.push({ ...data, mesh });
  angles.push(Math.random() * Math.PI * 2);

  const label = document.createElement("label");
  label.innerHTML = `
    ${data.name}: 
    <input type="range" min="0.001" max="0.05" step="0.001" value="${data.speed}" data-index="${index}">
  `;
  slidersContainer.appendChild(label);
});

slidersContainer.addEventListener("input", (e) => {
  const i = e.target.getAttribute("data-index");
  const value = parseFloat(e.target.value);
  planets[i].speed = value;
});

camera.position.z = 12;

// 🌠 Add background stars
function addStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1000;
  const positions = [];

  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    positions.push(x, y, z);
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.2,
    sizeAttenuation: true
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
addStars();

// 🌐 Tooltip + Raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById("tooltip");

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  tooltip.style.left = `${event.clientX + 10}px`;
  tooltip.style.top = `${event.clientY + 10}px`;
});

// 🎯 Zoom Variables
let targetPlanet = null;
let zooming = false;

// 🖱️ Click listener for zoom
window.addEventListener("click", () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

  if (intersects.length > 0) {
    targetPlanet = intersects[0].object;
    zooming = true;
  }
});

// 🔄 Animate loop
function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    planets.forEach((planet, i) => {
      angles[i] += planet.speed;
      planet.mesh.position.x = Math.cos(angles[i]) * planet.radius;
      planet.mesh.position.z = Math.sin(angles[i]) * planet.radius;
    });
  }

  // 🔍 Hover Tooltip logic
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

  if (intersects.length > 0) {
    const intersected = intersects[0].object;
    const planet = planets.find(p => p.mesh === intersected);
    tooltip.style.display = "block";
    tooltip.innerHTML = planet.name;
  } else {
    tooltip.style.display = "none";
  }

  // 🎯 Zoom on Click
  if (zooming && targetPlanet) {
    const targetPos = targetPlanet.position.clone();
    const direction = targetPos.clone().sub(camera.position).normalize();
    camera.position.add(direction.multiplyScalar(0.2));

    const distance = camera.position.distanceTo(targetPos);
    if (distance < 2) {
      zooming = false;
    }
  }

  renderer.render(scene, camera);
}
animate();
