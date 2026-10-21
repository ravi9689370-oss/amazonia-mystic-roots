// 100% procedural 3D graphics engine — Three.js (npm), no external 3D asset files.
import * as THREE from 'three';

class Amazonia3DEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05130d);
    // Volumetric-style exponential jungle fog
    this.scene.fog = new THREE.FogExp2(0x071a12, 0.022);

    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 250);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.clock = new THREE.Clock();
    this.playerGroup = new THREE.Group();
    this.weaponGroup = new THREE.Group();
    this.monsters = [];
    this.questRelics = [];
    this.landmarks = [];
    this.slashEffects = [];

    this.cameraYaw = 0;
    this.cameraPitch = 0.25;
    this.isZoomed = false;
    this.playerStance = 'STAND'; // STAND, CROUCH, PRONE

    this.initLighting();
    this.initTerrainAndFlora();
    this.initCulturalArchitecture();
    this.initCampfire();
    this.initPlayerAndChakrastra();
    this.initMonsters();
    this.initQuestRelics();
    this.initDewParticles();

    window.addEventListener('resize', () => this.onResize());
  }

  // 1. Cinematic lighting (moonlight + campfire shadows)
  initLighting() {
    const hemiLight = new THREE.HemisphereLight(0x2a5c45, 0x08120c, 0.75);
    this.scene.add(hemiLight);

    const moonLight = new THREE.DirectionalLight(0x88bbff, 0.9);
    moonLight.position.set(35, 60, 25);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 160;
    const d = 55;
    moonLight.shadow.camera.left = -d;
    moonLight.shadow.camera.right = d;
    moonLight.shadow.camera.top = d;
    moonLight.shadow.camera.bottom = -d;
    this.scene.add(moonLight);
  }

  // 2. Terrain and flora (trees built 100% in code)
  initTerrainAndFlora() {
    const groundGeo = new THREE.PlaneGeometry(240, 240, 64, 64);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const distFromCenter = Math.hypot(vx, vy);
      const height = distFromCenter < 10 ? 0 : Math.sin(vx * 0.08) * Math.cos(vy * 0.08) * 1.4;
      pos.setZ(i, height);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0d2618,
      roughness: 0.88,
      metalness: 0.08
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2b1d12, roughness: 0.92 });
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x114224, roughness: 0.55 });

    for (let i = 0; i < 95; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 12 + Math.random() * 95;
      const tx = Math.cos(angle) * radius;
      const tz = Math.sin(angle) * radius;

      const treeGroup = new THREE.Group();
      const h = 6 + Math.random() * 7;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.55, h, 8), trunkMat);
      trunk.position.y = h / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      treeGroup.add(trunk);

      for (let c = 0; c < 3; c++) {
        const crown = new THREE.Mesh(new THREE.ConeGeometry(2.8 - c * 0.6, 3.5, 8), canopyMat);
        crown.position.y = h - 0.5 + c * 1.6;
        crown.castShadow = true;
        treeGroup.add(crown);
      }

      treeGroup.position.set(tx, 0, tz);
      this.scene.add(treeGroup);
    }
  }

  // 3. Cultural fusion architecture (torii gates + carved vedic pillars)
  initCulturalArchitecture() {
    const toriiMat = new THREE.MeshStandardMaterial({ color: 0xb81422, roughness: 0.4, metalness: 0.2 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.6 });

    const toriiCoords = [
      { x: 0, z: -18, rot: 0 },
      { x: 26, z: 18, rot: Math.PI / 3 },
      { x: -30, z: -24, rot: -Math.PI / 4 }
    ];

    toriiCoords.forEach((coord) => {
      const torii = new THREE.Group();
      const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 7.5, 12), toriiMat);
      leftPillar.position.set(-2.8, 3.75, 0);
      leftPillar.castShadow = true;

      const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 7.5, 12), toriiMat);
      rightPillar.position.set(2.8, 3.75, 0);
      rightPillar.castShadow = true;

      const topBeam = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.55, 0.7), blackMat);
      topBeam.position.set(0, 7.4, 0);

      const subBeam = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.38, 0.5), toriiMat);
      subBeam.position.set(0, 6.2, 0);

      torii.add(leftPillar, rightPillar, topBeam, subBeam);
      torii.position.set(coord.x, 0, coord.z);
      torii.rotation.y = coord.rot;
      this.scene.add(torii);
      this.landmarks.push({ x: coord.x, z: coord.z, type: 'TORII' });
    });

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8c7a5b, roughness: 0.85, metalness: 0.1 });
    const runeMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xd4af37, emissiveIntensity: 0.9 });

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = Math.cos(angle) * 22;
      const pz = Math.sin(angle) * 22;

      const pillar = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1.8), stoneMat);
      base.position.y = 0.4;
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.1, 4.8, 1.1), stoneMat);
      shaft.position.y = 2.8;
      shaft.castShadow = true;

      const carvedCapital = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.7, 0.9, 8), stoneMat);
      carvedCapital.position.y = 5.5;

      const mysticRing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.06, 8, 24), runeMat);
      mysticRing.position.y = 3.2;

      pillar.add(base, shaft, carvedCapital, mysticRing);
      pillar.position.set(px, 0, pz);
      this.scene.add(pillar);
    }
  }

  // 4. Night campfire with dynamic light flicker
  initCampfire() {
    const fireGroup = new THREE.Group();
    const logMat = new THREE.MeshStandardMaterial({ color: 0x3b2313, roughness: 0.9 });
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.8, 6), logMat);
      log.position.y = 0.15;
      log.rotation.z = Math.PI / 2;
      log.rotation.y = (i * Math.PI) / 4;
      fireGroup.add(log);
    }

    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff7700 });
    this.flameMesh = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.3, 8), flameMat);
    this.flameMesh.position.y = 0.7;
    fireGroup.add(this.flameMesh);

    this.fireLight = new THREE.PointLight(0xff6600, 3.2, 24);
    this.fireLight.position.set(0, 1.4, 0);
    this.fireLight.castShadow = true;
    fireGroup.add(this.fireLight);

    fireGroup.position.set(3.5, 0, -4.5);
    this.scene.add(fireGroup);
  }

  // 5. Player + hybrid weapon (Chakrastra: trident-katana)
  initPlayerAndChakrastra() {
    this.torsoMat = new THREE.MeshStandardMaterial({ color: 0x1f5c3a, roughness: 0.5 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd99b72, roughness: 0.6 });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 1.15, 12), this.torsoMat);
    torso.position.y = 1.15;
    torso.castShadow = true;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), skinMat);
    head.position.y = 1.95;
    head.castShadow = true;

    this.auraRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.04, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xd4af37 })
    );
    this.auraRing.rotation.x = Math.PI / 2;
    this.auraRing.position.y = 0.15;

    this.playerGroup.add(torso, head, this.auraRing);

    this.bladeMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x0088ff,
      emissiveIntensity: 0.85,
      metalness: 0.9,
      roughness: 0.15
    });
    const hiltMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });

    const katanaBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.35, 0.12), this.bladeMat);
    katanaBlade.position.y = 0.7;

    const leftProng = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.45, 6), hiltMat);
    leftProng.position.set(0, 1.15, 0.18);
    leftProng.rotation.x = 0.35;

    const rightProng = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.45, 6), hiltMat);
    rightProng.position.set(0, 1.15, -0.18);
    rightProng.rotation.x = -0.35;

    this.chakraWheel = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 8, 20), this.bladeMat);
    this.chakraWheel.position.y = 1.05;
    this.chakraWheel.rotation.y = Math.PI / 2;

    this.weaponGroup.add(katanaBlade, leftProng, rightProng, this.chakraWheel);
    this.weaponGroup.position.set(0.48, 1.1, -0.35);
    this.weaponGroup.rotation.x = -0.4;

    this.playerGroup.add(this.weaponGroup);
    this.playerGroup.position.set(0, 0, 0);
    this.scene.add(this.playerGroup);
  }

  // 6. Creatures: shadow anaconda + venomous jaguar-monster
  initMonsters() {
    const anacondaMat = new THREE.MeshStandardMaterial({
      color: 0x111a14,
      emissive: 0x00ff66,
      emissiveIntensity: 0.25,
      roughness: 0.35
    });

    const jaguarMat = new THREE.MeshStandardMaterial({
      color: 0x261233,
      emissive: 0xaa00ff,
      emissiveIntensity: 0.35,
      roughness: 0.45
    });

    for (let i = 0; i < 6; i++) {
      const isAnaconda = i % 2 === 0;
      const mGroup = new THREE.Group();

      if (isAnaconda) {
        for (let s = 0; s < 6; s++) {
          const seg = new THREE.Mesh(new THREE.SphereGeometry(0.38 - s * 0.04, 10, 10), anacondaMat);
          seg.position.set(0, 0.35, s * 0.55);
          mGroup.add(seg);
        }
      } else {
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.65, 1.45), jaguarMat);
        body.position.y = 0.65;
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.55), jaguarMat);
        head.position.set(0, 0.9, -0.8);
        mGroup.add(body, head);
      }

      const angle = (i / 6) * Math.PI * 2 + 0.5;
      mGroup.position.set(Math.cos(angle) * 25, 0, Math.sin(angle) * 25);
      mGroup.userData = {
        type: isAnaconda ? 'ANACONDA' : 'JAGUAR',
        hp: 100,
        maxHp: 100,
        speed: isAnaconda ? 2.6 : 3.6
      };

      this.scene.add(mGroup);
      this.monsters.push(mGroup);
    }
  }

  // 7. Fog-valley quest relics
  initQuestRelics() {
    const relicMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffcc,
      emissiveIntensity: 1.0,
      roughness: 0.1
    });

    for (let i = 0; i < 5; i++) {
      const relic = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), relicMat);
      const angle = Math.random() * Math.PI * 2;
      const dist = 14 + Math.random() * 32;
      relic.position.set(Math.cos(angle) * dist, 1.0, Math.sin(angle) * dist);
      this.scene.add(relic);
      this.questRelics.push(relic);
    }
  }

  // 8. Glowing dew & jungle spores
  initDewParticles() {
    const pGeo = new THREE.BufferGeometry();
    const count = 250;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 90;
      positions[i + 1] = 0.5 + Math.random() * 8;
      positions[i + 2] = (Math.random() - 0.5) * 90;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x99ffcc, size: 0.18, transparent: true, opacity: 0.75 });
    this.dewSystem = new THREE.Points(pGeo, pMat);
    this.scene.add(this.dewSystem);
  }

  // Outfit & weapon skin updates
  applyCosmetics(outfitColorHex, weaponColorHex) {
    if (outfitColorHex) this.torsoMat.color.setHex(outfitColorHex);
    if (weaponColorHex) {
      this.bladeMat.color.setHex(weaponColorHex);
      this.bladeMat.emissive.setHex(weaponColorHex);
    }
  }

  // Player stance (stand / crouch / prone)
  setStance(stance) {
    this.playerStance = stance;
    if (stance === 'STAND') {
      this.playerGroup.scale.set(1, 1, 1);
    } else if (stance === 'CROUCH') {
      this.playerGroup.scale.set(1, 0.68, 1);
    } else if (stance === 'PRONE') {
      this.playerGroup.scale.set(1, 0.35, 1.25);
    }
  }

  // Weapon attack animation + damage
  triggerWeaponAttack(isChakraBlast, onMonsterKilled) {
    this.weaponGroup.rotation.x = -1.6;
    setTimeout(() => {
      this.weaponGroup.rotation.x = -0.4;
    }, 180);

    const ringGeo = new THREE.RingGeometry(0.4, isChakraBlast ? 4.8 : 2.4, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isChakraBlast ? 0x00ffff : 0xffd700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const wave = new THREE.Mesh(ringGeo, ringMat);
    wave.rotation.x = Math.PI / 2;
    wave.position.copy(this.playerGroup.position);
    wave.position.y = 1.0;
    this.scene.add(wave);
    this.slashEffects.push({ mesh: wave, created: performance.now() });

    const attackRange = isChakraBlast ? 8.5 : 4.5;
    const damage = isChakraBlast ? 65 : 35;

    this.monsters.forEach((m) => {
      const dist = m.position.distanceTo(this.playerGroup.position);
      if (dist <= attackRange) {
        m.userData.hp -= damage;
        if (m.userData.hp <= 0) {
          m.userData.hp = m.userData.maxHp;
          const respawnAngle = Math.random() * Math.PI * 2;
          m.position.set(Math.cos(respawnAngle) * 35, 0, Math.sin(respawnAngle) * 35);
          if (onMonsterKilled) onMonsterKilled(m.userData.type);
        }
      }
    });
  }

  // Per-frame update + render
  update(moveVec, isSprinting, jumpOffset, callbacks) {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    this.chakraWheel.rotation.z += dt * 5;
    this.auraRing.rotation.z -= dt * 2;

    if (this.fireLight && this.flameMesh) {
      this.fireLight.intensity = 2.8 + Math.sin(time * 18) * 0.5;
      this.flameMesh.scale.y = 0.9 + Math.cos(time * 15) * 0.2;
    }

    const baseSpeed = isSprinting ? 9.5 : 5.5;
    const stanceMult = this.playerStance === 'PRONE' ? 0.45 : this.playerStance === 'CROUCH' ? 0.7 : 1;
    const speed = baseSpeed * stanceMult;

    if (Math.abs(moveVec.x) > 0.01 || Math.abs(moveVec.y) > 0.01) {
      const forward = new THREE.Vector3(Math.sin(this.cameraYaw), 0, Math.cos(this.cameraYaw));
      const right = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));

      this.playerGroup.position.addScaledVector(forward, moveVec.y * speed * dt);
      this.playerGroup.position.addScaledVector(right, moveVec.x * speed * dt);
      this.playerGroup.rotation.y = this.cameraYaw + Math.PI;
    }
    this.playerGroup.position.y = jumpOffset;

    this.questRelics.forEach((relic) => {
      relic.rotation.y += dt * 2.5;
      if (relic.position.distanceTo(this.playerGroup.position) < 2.2) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 18 + Math.random() * 35;
        relic.position.set(Math.cos(angle) * dist, 1.0, Math.sin(angle) * dist);
        if (callbacks && callbacks.onRelicCollected) callbacks.onRelicCollected();
      }
    });

    this.monsters.forEach((m) => {
      const dir = new THREE.Vector3().subVectors(this.playerGroup.position, m.position);
      dir.y = 0;
      const dist = dir.length();
      if (dist > 1.4 && dist < 32) {
        dir.normalize();
        m.position.addScaledVector(dir, m.userData.speed * dt);
        m.lookAt(this.playerGroup.position.x, m.position.y, this.playerGroup.position.z);
      } else if (dist <= 1.45 && callbacks && callbacks.onPlayerHit) {
        callbacks.onPlayerHit(m.userData.type, dt);
      }
    });

    const now = performance.now();
    for (let i = this.slashEffects.length - 1; i >= 0; i--) {
      const eff = this.slashEffects[i];
      const age = (now - eff.created) / 280;
      if (age >= 1) {
        this.scene.remove(eff.mesh);
        this.slashEffects.splice(i, 1);
      } else {
        eff.mesh.scale.setScalar(1 + age * 1.4);
        eff.mesh.material.opacity = 1 - age;
      }
    }

    const camDist = this.isZoomed ? 2.6 : 5.6;
    const camHeight = this.isZoomed ? 1.85 : 2.65;
    const cx = this.playerGroup.position.x + Math.sin(this.cameraYaw) * camDist;
    const cz = this.playerGroup.position.z + Math.cos(this.cameraYaw) * camDist;
    this.camera.position.set(cx, this.playerGroup.position.y + camHeight, cz);
    this.camera.lookAt(
      this.playerGroup.position.x,
      this.playerGroup.position.y + 1.4,
      this.playerGroup.position.z
    );

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export { Amazonia3DEngine };
