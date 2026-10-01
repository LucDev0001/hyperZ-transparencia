// transparency/js/game.js

// Global Game State
window.DepuMon = {
  xp: 0,
  pokedex: [],
  inventory: [],
  profile: { coins: 0 },
  currentEncounter: null,
  sceneObjects: [],
  collidableObjects: [], // For collision detection
  otherPlayers: {}, // Map of id -> mesh
};

// Three.js Globals
let scene, camera, renderer, player, playerBox;
let moveForward = false,
  moveBackward = false,
  moveLeft = false,
  moveRight = false;
let playerVelocity = new THREE.Vector3();
const playerSpeed = 0.2;
let raycaster;
let clock = new THREE.Clock();

// Camera Control
let cameraAngle = 0;
let cameraMode = "TPP"; // TPP or FPP
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
let cameraPitch = 0.3; // vertical tilt (radians, clamped -0.4 to 1.0)

// Day/Night cycle
let ambientLight, dirLight;
// Streetlight PointLights — referenciados para modular intensidade à noite
const _streetLights = [];
// Pre-allocated color objects reused every frame (avoids GC churn)
const _daySky = new THREE.Color(0x87ceeb);
const _nightSky = new THREE.Color(0x000033);
const _dayFog = new THREE.Color(0xaaccff);
const _nightFog = new THREE.Color(0x000022);

// Audio
const walkSound = new Audio("/transparency/audio/step.mp3");
walkSound.loop = true;

document.addEventListener("DOMContentLoaded", initGame);

function initGame() {
  // Load Data from Server
  const apiSyncUrl = (window.BASE_PATH || "") + "/api.php?action=game_sync";
  fetch(apiSyncUrl)
    .then((res) => {
      if (!res.ok) throw new Error("API Error");
      return res.json();
    })
    .then((data) => {
      if (data.status === "success") {
        window.DepuMon.xp = parseInt(data.profile.xp) || 0;
        window.DepuMon.profile = data.profile;
        window.DepuMon.pokedex = data.pokedex;
        window.DepuMon.inventory = data.inventory;
        window.DepuMon.csrf_token = data.csrf_token;

        // Check Party
        if (!data.profile.party && typeof openPartySelection === "function") {
          openPartySelection();
        }
        if (typeof updateXPDisplay === "function") updateXPDisplay();
      }

      // Inicializar Chat do Jogo
      if (typeof initGameChat === "function") initGameChat();

      // Check Daily Reward
      checkDailyReward();
    })
    .catch((err) => {
      console.error("Sync error:", err);
    });

  if (!isWebGLAvailable()) {
    showGameAlert(
      "Seu dispositivo ou navegador não suporta gráficos 3D (WebGL).",
      "error",
    );
  } else {
    init3DWorld();
  }

  // Start Multiplayer Heartbeat (5s — sufficient for casual multiplayer)
  setInterval(sendHeartbeat, 5000);

  // ── Lightweight rain effect (DOM canvas overlay) ─────────────────────────
  const rainCanvas = document.createElement("canvas");
  rainCanvas.id = "rainOverlay";
  rainCanvas.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0;transition:opacity 2s;";
  document.getElementById("gameMap")?.parentElement?.appendChild(rainCanvas) ||
    document.body.appendChild(rainCanvas);

  let rainCtx = rainCanvas.getContext("2d");
  const rainDrops = Array.from({ length: 120 }, () => ({
    x: Math.random(),
    y: Math.random(),
    speed: 0.004 + Math.random() * 0.006,
    len: 8 + Math.random() * 12,
  }));

  function drawRain() {
    if (!rainCanvas.isConnected) return;
    requestAnimationFrame(drawRain);
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
    rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
    // Only draw if night (dayFactor < 0.3)
    const nowH = new Date().getHours() + new Date().getMinutes() / 60;
    const tAngle = ((nowH - 6) / 24) * Math.PI * 2;
    const df = (Math.sin(tAngle) + 1) / 2;
    if (df < 0.3) {
      rainCanvas.style.opacity = String(((0.3 - df) / 0.3) * 0.35);
      rainCtx.strokeStyle = "rgba(174,214,241,0.6)";
      rainCtx.lineWidth = 1;
      rainDrops.forEach((d) => {
        d.y += d.speed;
        if (d.y > 1) {
          d.y = 0;
          d.x = Math.random();
        }
        rainCtx.beginPath();
        rainCtx.moveTo(d.x * rainCanvas.width, d.y * rainCanvas.height);
        rainCtx.lineTo(
          d.x * rainCanvas.width - 2,
          d.y * rainCanvas.height + d.len,
        );
        rainCtx.stroke();
      });
    } else {
      rainCanvas.style.opacity = "0";
    }
  }
  drawRain();
}

function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

function checkDailyReward() {
  fetch(`${window.BASE_PATH || ""}/api.php?action=game_daily_reward`, {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRF-Token": window.DepuMon.csrf_token },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (data.status === "success") {
        showGameAlert(
          `🎉 Recompensa Diária: +${data.reward} Moedas!`,
          "success",
        );
        window.DepuMon.profile.coins += data.reward;
        if (typeof updateXPDisplay === "function") updateXPDisplay();
      }
    })
    .catch((err) => {
      console.log("Could not check daily reward.", err);
    });
}

function toggleCamera() {
  cameraMode = cameraMode === "TPP" ? "FPP" : "TPP";
  // Update UI label
  const lbl = document.getElementById("camModeLabel");
  if (lbl) lbl.textContent = cameraMode === "TPP" ? "3ª" : "1ª";
  // Hide player body in FPP (you can't see yourself in first person)
  if (player) player.visible = cameraMode === "TPP";
  showGameAlert(
    cameraMode === "TPP" ? "📷 Terceira Pessoa" : "👁️ Primeira Pessoa",
    "info",
  );
}

function init3DWorld() {
  const container = document.getElementById("gameMap");
  if (!container) {
    console.error("Map container #gameMap not found!");
    return;
  }
  container.innerHTML = ""; // Clear Leaflet map
  container.style.transform = "none"; // Reset any 2D map styles

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);
  scene.fog = new THREE.Fog(0x111111, 10, 80);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 5, 10);

  // Renderer — absolute minimum requirements for maximum compatibility
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      stencil: false,
      depth: true,
      premultipliedAlpha: false,
      failIfMajorPerformanceCaveat: false,
      powerPreference: "default",
    });
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
  } catch (e) {
    console.error("Erro ao criar contexto WebGL:", e);
    showGameAlert(
      "Seu navegador não suporta WebGL ou ele está desativado.",
      "error",
    );
    return;
  }
  const isMobile = window.innerWidth < 768;
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = !isMobile;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  // Lights
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(50, 50, 25);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 200;
  dirLight.shadow.camera.left = -50;
  dirLight.shadow.camera.right = 50;
  dirLight.shadow.camera.top = 50;
  dirLight.shadow.camera.bottom = -50;
  dirLight.shadow.mapSize.width = 512;
  dirLight.shadow.mapSize.height = 512;
  scene.add(dirLight);
  scene.add(dirLight.target);

  // Ground (asphalt base)
  const planeGeometry = new THREE.PlaneGeometry(250, 250);
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x181818,
    roughness: 0.95,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);

  // Player (body + head group)
  player = new THREE.Group();
  const bodyMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.42, 1.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6 }),
  );
  bodyMesh.position.y = 0.7;
  bodyMesh.castShadow = true;
  player.add(bodyMesh);

  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xf5c5a3 }),
  );
  headMesh.position.y = 1.75;
  headMesh.castShadow = true;
  player.add(headMesh);

  player.position.set(0, 0, 0);
  scene.add(player);

  generateProceduralCity(isMobile);

  // Controls
  setupControls();

  // Initial Spawn
  spawnDeputies3D();
  spawnArenas3D();
  spawnLegendary3D();

  // Loop
  animate();

  window.addEventListener("resize", onWindowResize);
}

function generateProceduralCity(isMobile = false) {
  // ── Road network ──────────────────────────────────────────────────────────
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 1,
  });
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xddbb00 });
  const roadAxes = [-60, -30, 0, 30, 60];

  roadAxes.forEach((r) => {
    const ns = new THREE.Mesh(new THREE.PlaneGeometry(8, 250), roadMat);
    ns.rotation.x = -Math.PI / 2;
    ns.position.set(r, 0.01, 0);
    if (!isMobile) ns.receiveShadow = true;
    scene.add(ns);

    const ew = new THREE.Mesh(new THREE.PlaneGeometry(250, 8), roadMat);
    ew.rotation.x = -Math.PI / 2;
    ew.position.set(0, 0.01, r);
    if (!isMobile) ew.receiveShadow = true;
    scene.add(ew);

    // Center dashes (every 20u — half the mesh count vs every 10)
    for (let d = -110; d < 110; d += 20) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 4.5), stripeMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(r, 0.015, d);
      scene.add(dash);
      const dash2 = new THREE.Mesh(
        new THREE.PlaneGeometry(4.5, 0.2),
        stripeMat,
      );
      dash2.rotation.x = -Math.PI / 2;
      dash2.position.set(d, 0.015, r);
      scene.add(dash2);
    }
  });

  // ── Building palette ──────────────────────────────────────────────────────
  const PALETTE = [
    { col: 0x383838, rough: 0.9, metal: 0.0 }, // concrete
    { col: 0x4a3c3c, rough: 0.9, metal: 0.0 }, // brick
    { col: 0x1e3254, rough: 0.15, metal: 0.7 }, // glass tower
    { col: 0x2a3a2a, rough: 0.9, metal: 0.0 }, // industrial green
    { col: 0x50483a, rough: 0.85, metal: 0.0 }, // old sandstone
    { col: 0x3a3a50, rough: 0.5, metal: 0.4 }, // modern dark
  ];

  // Otimização: Pré-criar materiais em vez de alocá-los a cada iteração do loop
  const preMadeMats = PALETTE.map(
    (p) =>
      new THREE.MeshStandardMaterial({
        color: p.col,
        roughness: p.rough,
        metalness: p.metal,
      }),
  );

  const winLit = new THREE.MeshBasicMaterial({
    color: 0xffeeaa,
    transparent: true,
    opacity: 0.88,
  });
  const winDark = new THREE.MeshBasicMaterial({
    color: 0x334466,
    transparent: true,
    opacity: 0.35,
  });

  // City blocks (between roads)
  const ranges = [
    [-110, -68],
    [-58, -36],
    [-26, -6],
    [6, 26],
    [36, 58],
    [68, 110],
  ];
  ranges.forEach(([x0, x1]) => {
    ranges.forEach(([z0, z1]) => {
      const cx = (x0 + x1) / 2,
        cz = (z0 + z1) / 2;
      if (Math.abs(cx) < 20 && Math.abs(cz) < 20) return; // government plaza
      const count = 2 + Math.floor(Math.random() * 3);
      for (let b = 0; b < count; b++) {
        const w = Math.random() * 9 + 4;
        const d = Math.random() * 9 + 4;
        const h = Math.random() * 24 + 5;
        const px = x0 + Math.random() * Math.max(0, x1 - x0 - w);
        const pz = z0 + Math.random() * Math.max(0, z1 - z0 - d);

        const bMat =
          preMadeMats[Math.floor(Math.random() * preMadeMats.length)];
        const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMat);
        building.position.set(px + w / 2, h / 2, pz + d / 2);
        if (!isMobile) {
          building.castShadow = true;
          building.receiveShadow = true;
        }
        scene.add(building);
        window.DepuMon.collidableObjects.push(building);

        // Emissive windows — only tall buildings, single front face, sparser grid
        if (h > 14) {
          const rows = Math.max(1, Math.floor(h / 4.5));
          const cols = Math.max(1, Math.floor(w / 3.5));
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              if (Math.random() < 0.35) continue;
              const wMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(0.7, 0.85),
                Math.random() > 0.22 ? winLit : winDark,
              );
              const wx =
                building.position.x +
                (cols > 1 ? col / (cols - 1) - 0.5 : 0) * (w * 0.78);
              const wy = row * 4.5 + 2.2;
              wMesh.position.set(wx, wy, building.position.z + d / 2 + 0.04);
              scene.add(wMesh);
            }
          }
        }
      }
    });
  });

  // ── Trees ─────────────────────────────────────────────────────────────────
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x3a2810,
    roughness: 1,
  });
  const leafMats = [
    new THREE.MeshStandardMaterial({ color: 0x1a5a18, roughness: 1 }),
    new THREE.MeshStandardMaterial({ color: 0x267a22, roughness: 1 }),
    new THREE.MeshStandardMaterial({ color: 0x1e4a1a, roughness: 1 }),
  ];
  function addTree(tx, tz) {
    const h = 2.8 + Math.random() * 2.2;
    const r = 1.3 + Math.random() * 0.9;
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.28, h, 5),
      trunkMat,
    );
    trunk.position.set(tx, h / 2, tz);
    trunk.castShadow = true;
    scene.add(trunk);
    const lMat = leafMats[Math.floor(Math.random() * leafMats.length)];
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(r, 6, 4), lMat);
    leaves.position.set(tx, h + r * 0.55, tz);
    leaves.castShadow = true;
    scene.add(leaves);
  }

  // Sidewalk trees flanking main roads
  const sidewalkOffsets = [-4, 4];
  roadAxes.forEach((r) => {
    for (let d = -95; d < 95; d += 14) {
      sidewalkOffsets.forEach((off) => {
        if (Math.random() > 0.55) addTree(r + off, d);
        if (Math.random() > 0.55) addTree(d, r + off);
      });
    }
  });

  // Central park cluster (government area)
  for (let t = 0; t < 16; t++) {
    addTree((Math.random() - 0.5) * 22, 18 + (Math.random() - 0.5) * 22);
  }

  // ── Streetlights ──────────────────────────────────────────────────────────
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.8,
  });
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffe890,
    emissive: 0xffe890,
    emissiveIntensity: 1.8,
  });
  let lightCount = 0;

  function addStreetlight(lx, lz) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 6, 6),
      poleMat,
    );
    pole.position.set(lx, 3, lz);
    scene.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.08), poleMat);
    arm.position.set(lx + 0.9, 6.1, lz);
    scene.add(arm);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), bulbMat);
    bulb.position.set(lx + 1.8, 6.1, lz);
    scene.add(bulb);
    if (lightCount < 8) {
      // limit real PointLights for performance
      const pl = new THREE.PointLight(0xffe890, 0.9, 22);
      pl.position.set(lx + 1.8, 6.1, lz);
      scene.add(pl);
      _streetLights.push(pl);
      lightCount++;
    }
  }

  const ltPos = [-45, -15, 15, 45];
  ltPos.forEach((lx) => ltPos.forEach((lz) => addStreetlight(lx + 4, lz + 4)));

  // ── Reflecting pool (Espelho d'água) ──────────────────────────────────────
  const poolMat = new THREE.MeshStandardMaterial({
    color: 0x1a3a6a,
    roughness: 0.05,
    metalness: 0.9,
    transparent: true,
    opacity: 0.85,
  });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(18, 6), poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0, 0.02, 10);
  scene.add(pool);
}

function setupControls() {
  document.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;
      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;
      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;
      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;
    }
  });

  document.addEventListener("keyup", (e) => {
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;
      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;
      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;
      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  });

  raycaster = new THREE.Raycaster();
  // Only raycast clicks that land on the raw 3D canvas, not on any HUD/button/overlay
  document.addEventListener("click", (e) => {
    if (e.target.closest('button,a,input,select,textarea,[role="button"]'))
      return;
    if (
      e.target.closest(
        "#bottomHud,#dockMenu,#gameChatContainer,#gameChatToggleBtn",
      )
    )
      return;
    if (e.target.id && e.target.id.endsWith("Modal")) return;
    onMouseClick(e);
  });

  // Mouse Drag for Camera (horizontal angle + vertical pitch)
  document.addEventListener("mousedown", (e) => {
    if (
      e.target.closest(
        "#bottomHud,#topHud,#gameChatContainer,#gameChatToggleBtn,button,a",
      )
    )
      return;
    isDragging = true;
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
  });
  document.addEventListener("mouseup", () => (isDragging = false));
  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - previousMouseX;
    const dy = e.clientY - previousMouseY;
    cameraAngle -= dx * 0.005;
    cameraPitch = Math.max(-0.4, Math.min(1.0, cameraPitch - dy * 0.003));
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
  });

  // Touch drag on canvas for camera look (right side of screen, not joystick)
  let camTouch = null;
  const canvas = renderer.domElement;
  canvas.addEventListener(
    "touchstart",
    (e) => {
      for (const t of e.changedTouches) {
        if (t.clientX > window.innerWidth * 0.35) {
          // right 65% of screen
          camTouch = { id: t.identifier, x: t.clientX, y: t.clientY };
        }
      }
    },
    { passive: true },
  );
  canvas.addEventListener(
    "touchmove",
    (e) => {
      if (!camTouch) return;
      for (const t of e.changedTouches) {
        if (t.identifier === camTouch.id) {
          const dx = t.clientX - camTouch.x;
          const dy = t.clientY - camTouch.y;
          cameraAngle -= dx * 0.006;
          cameraPitch = Math.max(-0.4, Math.min(1.0, cameraPitch - dy * 0.004));
          camTouch.x = t.clientX;
          camTouch.y = t.clientY;
        }
      }
    },
    { passive: true },
  );
  canvas.addEventListener(
    "touchend",
    (e) => {
      for (const t of e.changedTouches) {
        if (camTouch && t.identifier === camTouch.id) camTouch = null;
      }
    },
    { passive: true },
  );
}

// Joystick / Button Movement Support
function moveUser(direction) {
  const step = 2.0;

  // Calculate direction relative to camera
  const sin = Math.sin(cameraAngle);
  const cos = Math.cos(cameraAngle);
  const fwd = new THREE.Vector3(-sin, 0, -cos);
  const right = new THREE.Vector3(cos, 0, -sin);

  let move = new THREE.Vector3();
  if (direction === "up") move.add(fwd);
  if (direction === "down") move.sub(fwd);
  if (direction === "left") move.sub(right);
  if (direction === "right") move.add(right);

  move.normalize().multiplyScalar(step);
  if (player) {
    player.position.add(move);
    checkCollision();
  }
}

function scanArea() {
  spawnDeputies3D();
}

function updatePlayerMovement(delta) {
  playerVelocity.set(0, 0, 0);
  let direction = new THREE.Vector3();

  // Movement relative to camera angle
  const sin = Math.sin(cameraAngle);
  const cos = Math.cos(cameraAngle);
  const fwd = new THREE.Vector3(-sin, 0, -cos);
  const right = new THREE.Vector3(cos, 0, -sin);

  if (moveForward) direction.add(fwd);
  if (moveBackward) direction.sub(fwd);
  if (moveLeft) direction.sub(right);
  if (moveRight) direction.add(right);

  if (direction.length() > 0) {
    direction.normalize();
    playerVelocity.add(direction.multiplyScalar(playerSpeed));

    // Play Walk Sound
    if (walkSound.paused) walkSound.play().catch(() => {});
  } else {
    // Stop Walk Sound
    if (!walkSound.paused) walkSound.pause();
  }

  player.position.add(playerVelocity);
  // Visual walk bobbing
  if (direction.length() > 0 && player) {
    const t = Date.now() * 0.012;
    player.position.y = 0.7 + Math.abs(Math.sin(t)) * 0.18;
  } else if (player && Math.abs(player.position.y - 0.7) > 0.01) {
    player.position.y += (0.7 - player.position.y) * 0.15; // ease back to default
  }
  if (direction.length() > 0 && typeof updateQuestProgress === "function") {
    updateQuestProgress("walk", playerSpeed);
  }
  checkCollision();
}

// Collision optimisation — reuse Box3 instances instead of allocating every frame
const _collisionCache = new Map();
const _playerBox3 = new THREE.Box3();

function checkCollision() {
  const collidables = window.DepuMon.collidableObjects;

  // Reuse single player Box3
  _playerBox3.setFromObject(player);
  _playerBox3.min.addScalar(0.2);
  _playerBox3.max.subScalar(0.2);

  for (let i = 0; i < collidables.length; i++) {
    const obj = collidables[i];
    // Buildings are static — compute Box3 once and cache it
    let box = _collisionCache.get(obj);
    if (!box) {
      box = new THREE.Box3().setFromObject(obj);
      _collisionCache.set(obj, box);
    }
    if (box.intersectsBox(_playerBox3)) {
      // Revert movement (Simple bounce back)
      player.position.sub(playerVelocity);
      if (playerVelocity.length() === 0) {
        // If moved by button (no velocity), push back
        const push = player.position
          .clone()
          .sub(collidables[i].position)
          .normalize()
          .multiplyScalar(0.5);
        push.y = 0;
        player.position.add(push);
      }
      return;
    }
  }
}

function animate() {
  if (!renderer || !scene || !camera) return;
  requestAnimationFrame(animate);

  // Yield CPU/GPU to arena renderer while battle is open
  if (!document.getElementById("arenaModal")?.classList.contains("hidden"))
    return;
  const delta = clock.getDelta();

  updatePlayerMovement(delta);

  // Day/Night Cycle
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;
  const timeAngle = ((hours - 6) / 24) * Math.PI * 2;
  const dayFactor = (Math.sin(timeAngle) + 1) / 2;

  dirLight.position.x = 50 * Math.cos(timeAngle);
  dirLight.position.y = 50 * Math.sin(timeAngle);
  dirLight.position.z = 25;

  scene.background.lerpColors(_nightSky, _daySky, dayFactor);
  scene.fog.color.lerpColors(_nightFog, _dayFog, dayFactor);

  ambientLight.intensity = 0.1 + dayFactor * 0.6;
  dirLight.intensity = dayFactor * 1.2;

  const nightGlow = Math.max(0, 1 - dayFactor * 1.8);
  for (let i = 0; i < _streetLights.length; i++) {
    if (_streetLights[i]) _streetLights[i].intensity = 0.3 + nightGlow * 2.2;
  }

  scene.fog.near = 10 + dayFactor * 30;
  scene.fog.far = 40 + dayFactor * 60;

  // Camera Follow
  if (player && cameraMode === "TPP") {
    const camDist = 12;
    const hDist = Math.cos(cameraPitch) * camDist;
    const vDist = Math.sin(cameraPitch) * camDist;
    camera.position.x = player.position.x + Math.sin(cameraAngle) * hDist;
    camera.position.z = player.position.z + Math.cos(cameraAngle) * hDist;
    camera.position.y = player.position.y + 1 + vDist;
    camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
  } else if (player) {
    // FPP — First Person
    camera.position.copy(player.position);
    camera.position.y += 1.7;
    const targetX = player.position.x - Math.sin(cameraAngle);
    const targetZ = player.position.z - Math.cos(cameraAngle);
    const targetY = camera.position.y - Math.sin(cameraPitch);
    camera.lookAt(targetX, targetY, targetZ);
  }

  // Animate Sprites (Billboarding)
  const time = Date.now() * 0.003;
  window.DepuMon.sceneObjects.forEach((obj) => {
    if (obj.userData.type === "deputy") {
      // Flutuar
      if (obj.userData.sprite) {
        obj.userData.sprite.position.y =
          obj.userData.originalY + Math.sin(time) * 0.3;
      }
    }
    if (obj.userData.type === "legendary") {
      // Flutuar mais lento e majestoso
      if (obj.userData.sprite) {
        obj.userData.sprite.position.y =
          obj.userData.originalY + Math.sin(time * 0.5) * 0.5;
      }
    }
  });

  renderer.render(scene, camera);
  updateMiniMap();
}

// Minimap dot cache — keyed by sceneObject index to avoid DOM churn every frame
const _minimapDotCache = new Map();

function updateMiniMap() {
  const minimap = document.getElementById("minimap");
  if (!minimap || !player) return;

  const range = 40;
  const visible = new Set();

  window.DepuMon.sceneObjects.forEach((obj, idx) => {
    if (obj.userData.type !== "deputy") return;

    const dx = obj.position.x - player.position.x;
    const dz = obj.position.z - player.position.z;

    if (Math.abs(dx) < range && Math.abs(dz) < range) {
      visible.add(idx);
      const mx = 75 + (dx / range) * 75;
      const my = 75 + (dz / range) * 75;

      let dot = _minimapDotCache.get(idx);
      if (!dot) {
        dot = document.createElement("div");
        dot.className = "mm-dot mm-deputy";
        minimap.appendChild(dot);
        _minimapDotCache.set(idx, dot);
      }
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
      dot.style.display = "";
    }
  });

  // Hide dots that went out of range (cheaper than remove+recreate)
  _minimapDotCache.forEach((dot, idx) => {
    if (!visible.has(idx)) dot.style.display = "none";
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

async function spawnDeputies3D() {
  try {
    const json = await api.camara(
      "deputados?ordem=ASC&ordenarPor=nome&itens=20",
    );
    const deputies = json.dados.sort(() => 0.5 - Math.random()).slice(0, 10);
    const loader = new THREE.TextureLoader();

    deputies.forEach((dep) => {
      const proxyUrl = `${window.BASE_PATH || ""}/api.php?action=proxy_image&url=${encodeURIComponent(dep.urlFoto)}`;

      loader.load(proxyUrl, (texture) => {
        const group = new THREE.Group();

        // Posição Aleatória
        group.position.x = (Math.random() - 0.5) * 80;
        group.position.z = (Math.random() - 0.5) * 80;
        group.position.y = 0;

        // Sombra "Checkpoint" (Anel no chão)
        const shadowGeo = new THREE.RingGeometry(1.0, 1.2, 32);
        const shadowMat = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.05;
        group.add(shadow);

        // Círculo interno da sombra (mais transparente)
        const innerShadowGeo = new THREE.CircleGeometry(1.0, 32);
        const innerShadowMat = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.2,
        });
        const innerShadow = new THREE.Mesh(innerShadowGeo, innerShadowMat);
        innerShadow.rotation.x = -Math.PI / 2;
        innerShadow.position.y = 0.04;
        group.add(innerShadow);

        // Sprite Arredondado (Usando Canvas para cortar a imagem)
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");

        // Desenhar Círculo e Imagem
        ctx.save();
        ctx.beginPath();
        ctx.arc(128, 128, 120, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(texture.image, 0, 0, 256, 256);
        ctx.restore();

        // Borda Dourada
        ctx.beginPath();
        ctx.arc(128, 128, 120, 0, Math.PI * 2);
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 10;
        ctx.stroke();

        const spriteTex = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: spriteTex });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.y = 2.5;
        sprite.scale.set(3, 3, 1);
        group.add(sprite);

        // Nome
        const label = createTextLabel(dep.nome);
        label.position.y = 4.2;
        group.add(label);

        group.userData = {
          type: "deputy",
          data: dep,
          sprite: sprite,
          originalY: 2.5,
        };

        scene.add(group);
        window.DepuMon.sceneObjects.push(group);
      });
    });
  } catch (e) {
    console.error("Failed to spawn deputies", e);
  }
}

function spawnArenas3D() {
  // ── Congresso Nacional (landmark central) ─────────────────────────────────
  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0xededec,
    roughness: 0.25,
    metalness: 0.1,
  });
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  });
  const congress = new THREE.Group();
  congress.position.set(0, 0, -22);

  // Esplanada (base platform)
  const esplanade = new THREE.Mesh(
    new THREE.BoxGeometry(32, 0.6, 14),
    marbleMat,
  );
  esplanade.position.y = 0.3;
  esplanade.castShadow = true;
  esplanade.receiveShadow = true;
  congress.add(esplanade);

  // Twin towers
  [-7, 7].forEach((tx) => {
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 28, 2.8),
      marbleMat,
    );
    tower.position.set(tx, 14.6, 0);
    tower.castShadow = true;
    congress.add(tower);
    // Tower top cap
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.4, 3.2),
      new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2,
      }),
    );
    cap.position.set(tx, 29, 0);
    congress.add(cap);
  });

  // Senate dome (half-sphere, left — Senado)
  const domeGeo = new THREE.SphereGeometry(
    5.5,
    28,
    14,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2,
  );
  const dome = new THREE.Mesh(domeGeo, marbleMat);
  dome.position.set(-11, 0.6, 0);
  dome.castShadow = true;
  congress.add(dome);

  // Deputies bowl (inverted half-sphere, right — Câmara)
  const bowlGeo = new THREE.SphereGeometry(
    5.5,
    28,
    14,
    0,
    Math.PI * 2,
    Math.PI / 2,
    Math.PI / 2,
  );
  const bowl = new THREE.Mesh(bowlGeo, marbleMat);
  bowl.rotation.x = Math.PI;
  bowl.position.set(11, 5.5, 0);
  bowl.castShadow = true;
  congress.add(bowl);

  // Glow ring around base
  const glow = new THREE.Mesh(new THREE.RingGeometry(16, 17.5, 64), glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.05;
  congress.add(glow);

  const congressLabel = createTextLabel("🏛️ Congresso Nacional");
  congressLabel.position.y = 33;
  congressLabel.scale.set(6, 1.5, 1);
  congress.add(congressLabel);

  congress.userData = {
    type: "arena",
    data: { name: "Congresso Nacional", boss: true },
  };
  scene.add(congress);
  window.DepuMon.sceneObjects.push(congress);
  window.DepuMon.collidableObjects.push(esplanade);

  // ── 3 Regional Arenas ─────────────────────────────────────────────────────
  const arenaTypes = [
    {
      name: "Câmara Municipal",
      color: 0xfbbf24,
      pos: [-52, 0, -38],
      boss: false,
    },
    { name: "Prefeitura", color: 0x60a5fa, pos: [52, 0, -38], boss: false },
    {
      name: "Tribunal de Contas",
      color: 0xf87171,
      pos: [0, 0, 55],
      boss: false,
    },
  ];

  arenaTypes.forEach((type) => {
    const group = new THREE.Group();
    group.position.set(...type.pos);

    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.8,
    });
    const pillarMat = new THREE.MeshStandardMaterial({
      color: type.color,
      roughness: 0.4,
      metalness: 0.2,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      roughness: 0.5,
    });

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(5.5, 6, 0.9, 8),
      baseMat,
    );
    base.position.y = 0.45;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    for (let j = 0; j < 8; j++) {
      const angle = (j / 8) * Math.PI * 2;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.38, 6.5, 8),
        pillarMat,
      );
      pillar.position.set(Math.cos(angle) * 4, 4.2, Math.sin(angle) * 4);
      pillar.castShadow = true;
      group.add(pillar);
    }

    const roof = new THREE.Mesh(new THREE.ConeGeometry(6.5, 3.5, 8), roofMat);
    roof.position.y = 9.2;
    roof.castShadow = true;
    group.add(roof);

    const arenaLabel = createTextLabel(type.name);
    arenaLabel.position.y = 13.5;
    arenaLabel.scale.set(3.2, 0.8, 1);
    group.add(arenaLabel);

    // Coloured glow ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(6, 7.2, 32),
      new THREE.MeshBasicMaterial({
        color: type.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    group.add(ring);

    group.userData = { type: "arena", data: { name: type.name, boss: false } };
    scene.add(group);
    window.DepuMon.sceneObjects.push(group);
    window.DepuMon.collidableObjects.push(base);
  });
}

function spawnLegendary3D() {
  // Ulysses Guimarães (Lendário)
  const dep = {
    id: 9999,
    nome: "Ulysses Guimarães",
    siglaPartido: "MDB",
    siglaUf: "SP",
    urlFoto:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ulysses_Guimar%C3%A3es.jpg/220px-Ulysses_Guimar%C3%A3es.jpg",
    legendary: true,
  };

  const loader = new THREE.TextureLoader();
  // Usar imagem direta se proxy falhar ou proxy
  const proxyUrl = `${window.BASE_PATH || ""}/api.php?action=proxy_image&url=${encodeURIComponent(dep.urlFoto)}`;

  loader.load(proxyUrl, (texture) => {
    const group = new THREE.Group();

    // Posição Aleatória (Longe)
    group.position.x = (Math.random() - 0.5) * 120;
    group.position.z = (Math.random() - 0.5) * 120;
    group.position.y = 0;

    // Aura Dourada (Anel Brilhante)
    const ringGeo = new THREE.RingGeometry(2, 2.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    group.add(ring);

    // Sprite Gigante
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(texture.image, 0, 0, 256, 256);
    ctx.restore();

    // Borda Dourada
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffd700"; // Ouro
    ctx.lineWidth = 15;
    ctx.stroke();

    const spriteTex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: spriteTex });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.y = 4;
    sprite.scale.set(5, 5, 1); // Maior que os normais
    group.add(sprite);

    // Nome Lendário
    const label = createTextLabel("LENDÁRIO");
    label.position.y = 7;
    label.scale.set(3, 0.75, 1);
    group.add(label);

    group.userData = {
      type: "legendary",
      data: dep,
      sprite: sprite,
      originalY: 4,
    };

    scene.add(group);
    window.DepuMon.sceneObjects.push(group);
  });
}

function sendHeartbeat() {
  if (!player) return;

  fetch(`${window.BASE_PATH || ""}/api.php?action=game_heartbeat`, {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRF-Token": window.DepuMon.csrf_token },
    body: JSON.stringify({ x: player.position.x, z: player.position.z }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        updateOtherPlayers(data.players);

        // Update Online Counter UI
        const countEl = document.getElementById("onlineCount");
        if (countEl) countEl.innerText = data.players.length + 1; // +1 self
      }
    });
}

function updateOtherPlayers(playersData) {
  const currentIds = [];

  playersData.forEach((p) => {
    currentIds.push(p.id);

    if (window.DepuMon.otherPlayers[p.id]) {
      // Update position
      const mesh = window.DepuMon.otherPlayers[p.id];
      // Simple interpolation could be added here
      mesh.position.x = p.loc_x;
      mesh.position.z = p.loc_z;
    } else {
      // Spawn new player
      const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 16);
      const material = new THREE.MeshStandardMaterial({ color: 0x10b981 }); // Green for others
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(p.loc_x, 0.9, p.loc_z);
      mesh.castShadow = true;
      scene.add(mesh);
      window.DepuMon.otherPlayers[p.id] = mesh;
    }
  });

  // Remove disconnected players
  for (const id in window.DepuMon.otherPlayers) {
    if (!currentIds.includes(parseInt(id))) {
      scene.remove(window.DepuMon.otherPlayers[id]);
      delete window.DepuMon.otherPlayers[id];
    }
  }
}

function createTextLabel(text) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 128;

  // Background
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.beginPath();
  ctx.roundRect(0, 0, 512, 128, 20);
  ctx.fill();

  // Text
  ctx.font = "bold 48px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(material);

  // Scale sprite to match aspect ratio
  sprite.scale.set(2, 0.5, 1);
  return sprite;
}

function onMouseClick(event) {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(
    window.DepuMon.sceneObjects,
    true,
  );

  if (intersects.length > 0) {
    // Traverse up to find the group with userData
    let obj = intersects[0].object;
    while (obj.parent && !obj.userData.type) {
      obj = obj.parent;
    }

    if (obj.userData.type === "deputy") {
      const dist = player.position.distanceTo(obj.position);
      if (dist < 8) {
        // Increased interaction distance
        if (typeof triggerEncounter === "function") {
          triggerEncounter(obj.userData.data);
        }
      } else {
        showGameAlert("Chegue mais perto para interagir!", "info");
      }
    } else if (obj.userData.type === "arena") {
      const dist = player.position.distanceTo(obj.position);
      if (dist < 15) {
        if (typeof openArena === "function") openArena(obj.userData.data.boss);
      } else {
        showGameAlert("Aproxime-se da Arena para batalhar!", "info");
      }
    } else if (obj.userData.type === "legendary") {
      const dist = player.position.distanceTo(obj.position);
      if (dist < 10) {
        if (typeof openArena === "function") openArena(true); // True para lendário
      } else {
        showGameAlert(
          "Você sente uma presença poderosa... Chegue mais perto!",
          "warning",
        );
      }
    }
  }
}

// Keep existing UI functions
function showGameAlert(msg, type = "info") {
  const container = document.getElementById("gameAlertContainer");
  if (!container) return;
  const div = document.createElement("div");
  const colors =
    type === "success"
      ? "bg-green-600"
      : type === "error"
        ? "bg-red-600"
        : "bg-blue-600";
  div.className = `game-alert ${colors} text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2`;
  div.innerHTML = `<span>${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span> ${msg}`;
  container.appendChild(div);
  setTimeout(() => {
    div.style.opacity = "0";
    setTimeout(() => div.remove(), 500);
  }, 3000);
}
