// transparency/js/game_3d.js — Battle 3D Arena v2
// Animações: lunge, recoil, damage float, screen shake, flash

let battleScene, battleCamera, battleRenderer, battleAnimationId;
let sprite1, sprite2;

// ── Estado da animação de ataque ──────────────────────────────────────────────
const ORIG_X = { p1: -2.2, p2: 2.2 };
const ORIG_Y = 2.2; // fighters stand on podium level
let attackAnim = {
  active: false,
  t: 0,
  sprite: null,
  targetSprite: null,
  isPlayer: true,
};

// ── Init — Câmara dos Deputados interior (leve / mobile-friendly) ─────────────
function init3DArena() {
  const container = document.getElementById("arena3d");
  container.innerHTML = "";

  battleScene = new THREE.Scene();
  battleScene.background = new THREE.Color(0x12122a);

  const w = container.clientWidth || 320;
  const h = container.clientHeight || 240;
  battleCamera = new THREE.PerspectiveCamera(55, w / h, 0.1, 80);
  battleCamera.position.set(0, 3, 7);
  battleCamera.lookAt(0, 1.5, 0);

  try {
    battleRenderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: false,
      failIfMajorPerformanceCaveat: false,
      powerPreference: "default",
    });
    battleRenderer.setSize(w, h);
    battleRenderer.setPixelRatio(1); // force 1x — arena needs to be fast
    container.appendChild(battleRenderer.domElement);
  } catch (e) {
    console.error("Erro ao criar contexto WebGL para arena 3D:", e);
    return;
  }

  // Lights (no shadows — fast)
  battleScene.add(new THREE.AmbientLight(0xd4c5a0, 0.9));
  const rimP1 = new THREE.PointLight(0x3b82f6, 2.2, 14);
  rimP1.position.set(-3.5, 3, -1);
  battleScene.add(rimP1);
  const rimP2 = new THREE.PointLight(0xef4444, 2.2, 14);
  rimP2.position.set(3.5, 3, -1);
  battleScene.add(rimP2);
  const topLight = new THREE.PointLight(0xfff8e7, 1.5, 20);
  topLight.position.set(0, 8, 2);
  battleScene.add(topLight);

  // ── Background canvas texture — paints seat rows + wall (zero extra meshes) ──
  const bgCanvas = document.createElement("canvas");
  bgCanvas.width = 512;
  bgCanvas.height = 256;
  const bgCtx = bgCanvas.getContext("2d");
  // Sky / dome
  const grad = bgCtx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#1a1a4a");
  grad.addColorStop(1, "#0d1a2e");
  bgCtx.fillStyle = grad;
  bgCtx.fillRect(0, 0, 512, 256);
  // Back wall
  bgCtx.fillStyle = "#1e2d50";
  bgCtx.fillRect(0, 60, 512, 140);
  // Green stripe
  bgCtx.fillStyle = "#1a6b35";
  bgCtx.fillRect(0, 155, 512, 14);
  // Coat of arms circle
  bgCtx.fillStyle = "#fbbf24";
  bgCtx.beginPath();
  bgCtx.arc(256, 100, 22, 0, Math.PI * 2);
  bgCtx.fill();
  bgCtx.fillStyle = "#15803d";
  bgCtx.beginPath();
  bgCtx.arc(256, 100, 16, 0, Math.PI * 2);
  bgCtx.fill();
  // Seat rows (3 simplified arcs)
  const rowColors = ["#1a5c2e", "#174f27", "#134320"];
  for (let r = 0; r < 3; r++) {
    bgCtx.fillStyle = rowColors[r];
    bgCtx.fillRect(0, 175 + r * 22, 512, 16);
    // seat divisions
    bgCtx.fillStyle = "#0a2210";
    for (let s = 0; s < 24; s++) {
      bgCtx.fillRect(s * 22 + 1, 175 + r * 22, 2, 16);
    }
  }
  const bgTex = new THREE.CanvasTexture(bgCanvas);
  const bgPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10),
    new THREE.MeshBasicMaterial({ map: bgTex }),
  );
  bgPlane.position.set(0, 4, -8);
  battleScene.add(bgPlane);

  // ── Floor ──
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 12),
    new THREE.MeshStandardMaterial({ color: 0x1a5c2e, roughness: 1 }),
  );
  floor.rotation.x = -Math.PI / 2;
  battleScene.add(floor);

  // ── Podium (3 meshes) ──
  const mbl = new THREE.MeshStandardMaterial({
    color: 0xd6cbb0,
    roughness: 0.4,
  });
  const podBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.7, 0.8, 8),
    mbl,
  );
  podBase.position.set(0, 0.4, 0);
  battleScene.add(podBase);
  const podTop = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.5, 0.15, 8),
    mbl,
  );
  podTop.position.set(0, 0.87, 0);
  battleScene.add(podTop);
  const lectern = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.55, 0.45),
    new THREE.MeshStandardMaterial({ color: 0xb8a070, roughness: 0.6 }),
  );
  lectern.position.set(0, 1.48, 0);
  battleScene.add(lectern);

  animate3D();
}

// ── Criar sprite de lutador ───────────────────────────────────────────────────
function createFighterSprite(url, isPlayer) {
  const geometry = new THREE.PlaneGeometry(1.8, 1.8);
  const material = new THREE.MeshBasicMaterial({
    color: isPlayer ? 0x3b82f6 : 0xef4444,
    transparent: true,
    opacity: 0.6,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = isPlayer ? ORIG_X.p1 : ORIG_X.p2;
  mesh.position.y = ORIG_Y;
  mesh.rotation.y = isPlayer ? 0.15 : -0.15;
  battleScene.add(mesh);

  // Shadow plane beneath sprite
  const shadowGeo = new THREE.CircleGeometry(0.6, 16);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.4,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(mesh.position.x, 1.05, 0);
  battleScene.add(shadow);
  mesh.userData.shadow = shadow;

  if (url) {
    const loader = new THREE.TextureLoader();
    // Avoid double-proxy: if URL already goes through proxy_image, use it directly
    const proxyUrl = url.includes("proxy_image")
      ? url
      : `${window.BASE_PATH || ""}/api.php?action=proxy_image&url=${encodeURIComponent(url)}`;
    loader.load(
      proxyUrl,
      (tex) => {
        mesh.material.map = tex;
        mesh.material.color.setHex(0xffffff);
        mesh.material.opacity = 1;
        mesh.material.needsUpdate = true;
      },
      undefined,
      () => {
        loader.load(url, (tex) => {
          mesh.material.map = tex;
          mesh.material.color.setHex(0xffffff);
          mesh.material.opacity = 1;
          mesh.material.needsUpdate = true;
        });
      },
    );
  }

  return mesh;
}

function setupFighters3D(p1Url, p2Url) {
  if (sprite1) {
    if (sprite1.userData.shadow) battleScene.remove(sprite1.userData.shadow);
    battleScene.remove(sprite1);
  }
  if (sprite2) {
    if (sprite2.userData.shadow) battleScene.remove(sprite2.userData.shadow);
    battleScene.remove(sprite2);
  }
  sprite1 = createFighterSprite(p1Url, true);
  sprite2 = createFighterSprite(p2Url, false);
}

// ── Loop de animação ──────────────────────────────────────────────────────────
function animate3D() {
  battleAnimationId = requestAnimationFrame(animate3D);

  const now = Date.now();

  // Idle breathing + subtle sway when not attacking
  if (sprite1 && !attackAnim.active) {
    sprite1.position.y = ORIG_Y + Math.sin(now * 0.0025) * 0.07;
    sprite1.rotation.z = Math.sin(now * 0.0018) * 0.025;
    sprite1.scale.x = 1 + Math.sin(now * 0.003) * 0.015;
    if (sprite1.userData.shadow)
      sprite1.userData.shadow.position.x = sprite1.position.x;
  }
  if (sprite2 && !attackAnim.active) {
    sprite2.position.y = ORIG_Y + Math.sin(now * 0.0025 + 2) * 0.07;
    sprite2.rotation.z = Math.sin(now * 0.0018 + 1.5) * 0.025;
    sprite2.scale.x = 1 + Math.sin(now * 0.003 + 2) * 0.015;
    if (sprite2.userData.shadow)
      sprite2.userData.shadow.position.x = sprite2.position.x;
  }

  // ── Animação de Ataque (lunge → impacto → recoil) ─────────────────────────
  if (attackAnim.active) {
    attackAnim.t = Math.min(attackAnim.t + 0.04, 1);
    const t = attackAnim.t;
    const isP = attackAnim.isPlayer;
    const origX = isP ? ORIG_X.p1 : ORIG_X.p2;
    const thrustX = isP ? ORIG_X.p1 + 1.2 : ORIG_X.p2 - 1.2; // Lunge toward center

    if (t < 0.35) {
      // FASE 1 — Avançar (ease-in quad)
      const p = t / 0.35;
      attackAnim.sprite.position.x = origX + (thrustX - origX) * (p * p);
      attackAnim.sprite.position.y = ORIG_Y + Math.sin(p * Math.PI) * 0.3; // pequeno salto
    } else if (t < 0.55) {
      // FASE 2 — Impacto: pisca o alvo
      attackAnim.sprite.position.x = thrustX;
      attackAnim.sprite.position.y = ORIG_Y;
      const flicker = Math.sin(t * 80) > 0;
      if (attackAnim.targetSprite?.material) {
        attackAnim.targetSprite.material.color.setHex(
          flicker ? 0xff2222 : 0xffffff,
        );
        attackAnim.targetSprite.scale.x = 1 + Math.sin(t * 60) * 0.05;
      }
    } else if (t < 1.0) {
      // FASE 3 — Recoil suave (ease-out)
      const p = (t - 0.55) / 0.45;
      const eased = 1 - (1 - p) * (1 - p);
      attackAnim.sprite.position.x = thrustX + (origX - thrustX) * eased;
      attackAnim.sprite.position.y = ORIG_Y;
      if (attackAnim.targetSprite?.material) {
        attackAnim.targetSprite.material.color.setHex(0xffffff);
        attackAnim.targetSprite.scale.x = 1;
      }
    } else {
      // FASE 4 — Reset
      attackAnim.sprite.position.x = origX;
      attackAnim.sprite.position.y = ORIG_Y;
      if (attackAnim.targetSprite?.material) {
        attackAnim.targetSprite.material.color.setHex(0xffffff);
        attackAnim.targetSprite.scale.x = 1;
      }
      if (attackAnim.sprite.userData.shadow)
        attackAnim.sprite.userData.shadow.position.x = origX;
      attackAnim.active = false;
    }

    // Atualizar shadow
    if (attackAnim.sprite.userData.shadow) {
      attackAnim.sprite.userData.shadow.position.x =
        attackAnim.sprite.position.x;
    }
  }

  battleRenderer.render(battleScene, battleCamera);
}

// ── Animação de Ataque (pública) ──────────────────────────────────────────────
function attackAnimation3D(
  isPlayerAttacking,
  dmgToTarget = 0,
  dmgToAttacker = 0,
) {
  const attacker = isPlayerAttacking ? sprite1 : sprite2;
  const target = isPlayerAttacking ? sprite2 : sprite1;
  if (!attacker || !target) return;

  // Cinematic zoom on critical hit
  const isCritical = dmgToTarget >= 25;
  if (isCritical && battleCamera) {
    const origZ = battleCamera.position.z;
    const origFov = battleCamera.fov;
    battleCamera.fov = 40;
    battleCamera.updateProjectionMatrix();
    battleCamera.position.z = 4.5;
    setTimeout(() => {
      battleCamera.fov = origFov;
      battleCamera.updateProjectionMatrix();
      battleCamera.position.z = origZ;
    }, 600);
  }

  // Lunge
  attackAnim = {
    active: true,
    t: 0,
    sprite: attacker,
    targetSprite: target,
    isPlayer: isPlayerAttacking,
  };

  // Floating damage number sobre o alvo
  _showDamageFloat(dmgToTarget, isPlayerAttacking ? "right" : "left");

  // Se houve contra-ataque (dmgToAttacker > 0), mostra depois da animação
  if (dmgToAttacker > 0) {
    setTimeout(
      () =>
        _showDamageFloat(dmgToAttacker, isPlayerAttacking ? "left" : "right"),
      600,
    );
  }

  // Screen shake + particles ao impacto
  setTimeout(_screenShake, 350);
  setTimeout(
    () => _spawnImpactParticles(isPlayerAttacking ? "right" : "left"),
    320,
  );
}

// ── Número de dano flutuante (HTML overlay) ───────────────────────────────────
function _showDamageFloat(dmg, side) {
  if (!dmg) return;
  const container = document.getElementById("arena3d");
  if (!container) return;

  const isCrit = dmg >= 25;
  const div = document.createElement("div");
  div.style.cssText = `
        position: absolute;
        pointer-events: none;
        user-select: none;
        font-weight: 900;
        font-size: ${isCrit ? "2rem" : "1.5rem"};
        color: ${isCrit ? "#ef4444" : "#fbbf24"};
        text-shadow: 0 0 12px currentColor, 0 2px 4px #000;
        ${side === "right" ? "right: 22%" : "left: 22%"};
        top: 38%;
        transform: translateY(0);
        transition: transform 0.85s cubic-bezier(0.22,1,0.36,1), opacity 0.85s ease;
        opacity: 1;
        z-index: 100;
        white-space: nowrap;
    `;
  div.textContent = isCrit ? `⚡ CRÍTICO! -${dmg}` : `-${dmg} 💥`;
  container.appendChild(div);

  requestAnimationFrame(() => {
    div.style.transform = "translateY(-70px)";
    div.style.opacity = "0";
  });
  setTimeout(() => div.remove(), 900);
}

// ── Screen Shake ──────────────────────────────────────────────────────────────
function _screenShake() {
  const el = document.getElementById("arena3d");
  if (!el) return;
  let n = 0;
  const iv = setInterval(() => {
    n++;
    const x = (Math.random() - 0.5) * 10 * (1 - n / 8);
    const y = (Math.random() - 0.5) * 5 * (1 - n / 8);
    el.style.transform = `translate(${x}px,${y}px)`;
    if (n >= 8) {
      clearInterval(iv);
      el.style.transform = "";
    }
  }, 40);
}

// ── Particle burst on impact ──────────────────────────────────────────────────
function _spawnImpactParticles(side) {
  const container = document.getElementById("arena3d");
  if (!container) return;
  const colors = ["#ef4444", "#f97316", "#fbbf24", "#fff"];
  for (let i = 0; i < 10; i++) {
    const p = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 4 + Math.random() * 6;
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 60;
    p.style.cssText = `
            position:absolute;pointer-events:none;border-radius:50%;
            width:${size}px;height:${size}px;background:${color};
            ${side === "right" ? "right:22%" : "left:22%"};top:45%;
            transition:transform .6s cubic-bezier(.2,1,.4,1),opacity .6s ease;
            opacity:1;z-index:50;
        `;
    container.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist - 20}px) scale(0)`;
      p.style.opacity = "0";
    });
    setTimeout(() => p.remove(), 650);
  }
}

// ── Cleanup ───────────────────────────────────────────────────────────────────
function stop3DArena() {
  if (battleAnimationId) cancelAnimationFrame(battleAnimationId);
  attackAnim.active = false;
  if (battleRenderer) {
    battleRenderer.dispose();
    const c = document.getElementById("arena3d");
    if (c) c.innerHTML = "";
  }
}
