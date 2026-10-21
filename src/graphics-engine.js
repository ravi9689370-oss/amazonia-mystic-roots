// 100% procedural 3D graphics engine — Three.js (npm), no external 3D asset files.
// Upgraded: cinematic lighting, denser foliage, articulated hero, enhanced monsters.
import * as THREE from 'three';

class Amazonia3DEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020a06);
    // Volumetric Exponential Fog for Deep Amazon Mystic Vibes
    this.scene.fog = new THREE.FogExp2(0x04150b, 0.028);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

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
    this.playerStance = 'STAND';

    this.initCinematicLighting();
    this.initRealisticTerrainAndForest();
    this.initCulturalArchitecturalWonders();
    this.initCampfireFX();
    this.initDetailedPlayerAndChakrastra();
    this.initDetailedMonsters();
    this.initQuestRelics();
    this.initJungleSporesAndDew();

    window.addEventListener('resize', () => this.onResize());
  }

  // 1. सिनेमैटिक लाइटिंग (Moonlight, Bounce Light & Subsurface Scattering feel)
  initCinematicLighting() {
    const ambientLight = new THREE.AmbientLight(0x133827, 0.85);
    this.scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x7fb3d5, 1.4);
    moonLight.position.set(40, 80, 30);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 180;
    const d = 60;
    moonLight.shadow.camera.left = -d;
    moonLight.shadow.camera.right = d;
    moonLight.shadow.camera.top = d;
    moonLight.shadow.camera.bottom = -d;
    this.scene.add(moonLight);
  }

  // 2. रियलिस्टिक अमेज़न जंगल और ऊबड़-खाबड़ जमीन (Terrain with normal-like variation)
  initRealisticTerrainAndForest() {
    const groundGeo = new THREE.PlaneGeometry(300, 300, 96, 96);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const dist = Math.hypot(vx, vy);
      const h = dist < 12 ? 0 : Math.sin(vx * 0.05) * Math.cos(vy * 0.05) * 1.8 + Math.sin(vx * 0.2) * 0.3;
      pos.setZ(i, h);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x091c10,
      roughness: 0.92,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // High-Detail Procedural Amazon Trees
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x24170d, roughness: 0.95 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x0f3b20, roughness: 0.6, metalness: 0.1 });

    for (let i = 0; i < 110; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 14 + Math.random() * 110;
      const tx = Math.cos(angle) * radius;
      const tz = Math.sin(angle) * radius;

      const treeGroup = new THREE.Group();
      const h = 7 + Math.random() * 9;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.65, h, 10), trunkMat);
      trunk.position.y = h / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      treeGroup.add(trunk);

      for (let c = 0; c < 4; c++) {
        const crown = new THREE.Mesh(new THREE.ConeGeometry(3.2 - c * 0.55, 3.2, 8), foliageMat);
        crown.position.y = h - 0.8 + c * 1.4;
        crown.castShadow = true;
        treeGroup.add(crown);
      }

      treeGroup.position.set(tx, 0, tz);
      this.scene.add(treeGroup);
    }
  }

  // 3. सांस्कृतिक फ्यूजन: तोरी गेट्स + नक्काशीदार वैदिक खंभे (original designs)
  initCulturalArchitecturalWonders() {
    const toriiMat = new THREE.MeshStandardMaterial({ color: 0xc91c24, roughness: 0.35, metalness: 0.25 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 });

    const coords = [
      { x: 0, z: -20, rot: 0 },
      { x: 28, z: 22, rot: Math.PI / 3 },
      { x: -32, z: -28, rot: -Math.PI / 4 }
    ];

    coords.forEach((c) => {
      const torii = new THREE.Group();
      const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 8, 12), toriiMat);
      leftPillar.position.set(-3, 4, 0);
      leftPillar.castShadow = true;

      const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 8, 12), toriiMat);
      rightPillar.position.set(3, 4, 0);
      rightPillar.castShadow = true;

      const topBeam = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.6, 0.8), darkWoodMat);
      topBeam.position.set(0, 7.8, 0);

      const subBeam = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.4, 0.55), toriiMat);
      subBeam.position.set(0, 6.6, 0);

      torii.add(leftPillar, rightPillar, topBeam, subBeam);
      torii.position.set(c.x, 0, c.z);
      torii.rotation.y = c.rot;
      this.scene.add(torii);
      this.landmarks.push({ x: c.x, z: c.z, type: 'TORII' });
    });

    // Vedic Carved Pillars
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7a6a4f, roughness: 0.8, metalness: 0.15 });
    const goldRuneMat = new THREE.MeshStandardMaterial({ color: 0xffea75, emissive: 0xd4af37, emissiveIntensity: 0.95 });

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = Math.cos(angle) * 24;
      const pz = Math.sin(angle) * 24;

      const pillar = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(2, 0.9, 2), stoneMat);
      base.position.y = 0.45;
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.2, 1.2), stoneMat);
      shaft.position.y = 3.0;
      shaft.castShadow = true;

      const capital = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 0.75, 1.0, 8), stoneMat);
      capital.position.y = 5.9;

      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.07, 8, 24), goldRuneMat);
      ring.position.y = 3.4;

      pillar.add(base, shaft, capital, ring);
      pillar.position.set(px, 0, pz);
      this.scene.add(pillar);
    }
  }

  // 4. कैंपफायर और डायनेमिक शैडो
  initCampfireFX() {
    const fireGroup = new THREE.Group();
    const logMat = new THREE.MeshStandardMaterial({ color: 0x331a0c, roughness: 0.9 });
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.0, 6), logMat);
      log.position.y = 0.15;
      log.rotation.z = Math.PI / 2;
      log.rotation.y = (i * Math.PI) / 4;
      fireGroup.add(log);
    }

    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    this.flameMesh = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.5, 8), flameMat);
    this.flameMesh.position.y = 0.8;
    fireGroup.add(this.flameMesh);

    this.fireLight = new THREE.PointLight(0xff5500, 3.8, 28);
    this.fireLight.position.set(0, 1.6, 0);
    this.fireLight.castShadow = true;
    fireGroup.add(this.fireLight);

    fireGroup.position.set(4, 0, -5);
    this.scene.add(fireGroup);
  }

  // 5. हाई-डिटेल कैरेक्टर और चक्रास्त्र (Trident-Katana hybrid, original design)
  initDetailedPlayerAndChakrastra() {
    this.torsoMat = new THREE.MeshStandardMaterial({ color: 0x184d30, roughness: 0.45, metalness: 0.1 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd99b72, roughness: 0.65 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

    // Articulated Character Anatomy
    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.3), this.torsoMat);
    hips.position.y = 0.8;
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 1.1, 12), this.torsoMat);
    torso.position.y = 1.35;
    torso.castShadow = true;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), skinMat);
    head.position.y = 2.05;
    head.castShadow = true;

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.29, 12, 12), hairMat);
    hair.position.set(0, 2.15, -0.05);

    this.auraRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.045, 8, 28),
      new THREE.MeshBasicMaterial({ color: 0xd4af37 })
    );
    this.auraRing.rotation.x = Math.PI / 2;
    this.auraRing.position.y = 0.1;

    this.playerGroup.add(hips, torso, head, hair, this.auraRing);

    // Hybrid Weapon: Chakrastra
    this.bladeMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x0099ff,
      emissiveIntensity: 0.9,
      metalness: 0.92,
      roughness: 0.1
    });
    const hiltMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 });

    const katanaBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, 0.12), this.bladeMat);
    katanaBlade.position.y = 0.75;

    const leftProng = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.5, 6), hiltMat);
    leftProng.position.set(0, 1.25, 0.2);
    leftProng.rotation.x = 0.35;

    const rightProng = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.5, 6), hiltMat);
    rightProng.position.set(0, 1.25, -0.2);
    rightProng.rotation.x = -0.35;

    this.chakraWheel = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 24), this.bladeMat);
    this.chakraWheel.position.y = 1.15;
    this.chakraWheel.rotation.y = Math.PI / 2;

    this.weaponGroup.add(katanaBlade, leftProng, rightProng, this.chakraWheel);
    this.weaponGroup.position.set(0.5, 1.15, -0.4);
    this.weaponGroup.rotation.x = -0.4;

    this.playerGroup.add(this.weaponGroup);
    this.playerGroup.position.set(0, 0, 0);
    this.scene.add(this.playerGroup);
  }

  // 6. हाई-डिटेल मॉन्स्टर्स (Shadow Anaconda & Venomous Jaguar)
  initDetailedMonsters() {
    const anacondaMat = new THREE.MeshStandardMaterial({
      color: 0x0b140f,
      emissive: 0x00ff66,
      emissiveIntensity: 0.3,
      roughness: 0.3
    });

    const jaguarMat = new THREE.MeshStandardMaterial({
      color: 0x1f0e2b,
      emissive: 0xb500ff,
      emissiveIntensity: 0.4,
      roughness: 0.4
    });

    for (let i = 0; i < 6; i++) {
      const isAnaconda = i % 2 === 0;
      const mGroup = new THREE.Group();

      if (isAnaconda) {
        for (let s = 0; s < 7; s++) {
          const seg = new THREE.Mesh(new THREE.SphereGeometry(0.4 - s * 0.035, 12, 12), anacondaMat);
          seg.position.set(0, 0.38, s * 0.6);
          mGroup.add(seg);
        }
      } else {
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 1.6), jaguarMat);
        body.position.y = 0.7;
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.6), jaguarMat);
        head.position.set(0, 0.95, -0.9);
        const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.2), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        eyes.position.set(0, 1.05, -1.1);
        mGroup.add(body, head, eyes);
      }

      const angle = (i / 6) * Math.PI * 2 + 0.4;
      mGroup.position.set(Math.cos(angle) * 28, 0, Math.sin(angle) * 28);
      mGroup.userData = {
        type: isAnaconda ? 'ANACONDA' : 'JAGUAR',
        hp: 100,
        maxHp: 100,
        speed: isAnaconda ? 2.8 : 3.8
      };

      this.scene.add(mGroup);
      this.monsters.push(mGroup);
    }
  }

  // 7. कोहरे की घाटी के टास्क आइटम्स
  initQuestRelics() {
    const relicMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffcc,
      emissiveIntensity: 1.2,
      roughness: 0.08
    });

    for (let i = 0; i < 5; i++) {
      const relic = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), relicMat);
      const angle = Math.random() * Math.PI * 2;
      const dist = 16 + Math.random() * 35;
      relic.position.set(Math.cos(angle) * dist, 1.1, Math.sin(angle) * dist);
      this.scene.add(relic);
      this.questRelics.push(relic);
    }
  }

  // 8. जुगनू और ओस के कण (Jungle Spores & Glowing Dew)
  initJungleSporesAndDew() {
    const pGeo = new THREE.BufferGeometry();
    const count = 300;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = 0.5 + Math.random() * 9;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x88ffcc, size: 0.2, transparent: true, opacity: 0.8 });
    this.dewSystem = new THREE.Points(pGeo, pMat);
    this.scene.add(this.dewSystem);
  }

  applyCosmetics(outfitColorHex, weaponColorHex) {
    if (outfitColorHex) this.torsoMat.color.setHex(outfitColorHex);
    if (weaponColorHex) {
      this.bladeMat.color.setHex(weaponColorHex);
      this.bladeMat.emissive.setHex(weaponColorHex);
    }
  }

  setStance(stance) {
    this.playerStance = stance;
    if (stance === 'STAND') this.playerGroup.scale.set(1, 1, 1);
    else if (stance === 'CROUCH') this.playerGroup.scale.set(1, 0.7, 1);
    else if (stance === 'PRONE') this.playerGroup.scale.set(1, 0.38, 1.3);
  }

  triggerWeaponAttack(isChakraBlast, onMonsterKilled) {
    this.weaponGroup.rotation.x = -1.7;
    setTimeout(() => { this.weaponGroup.rotation.x = -0.4; }, 180);

    const ringGeo = new THREE.RingGeometry(0.4, isChakraBlast ? 5.2 : 2.6, 28);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isChakraBlast ? 0x00ffff : 0xffd700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const wave = new THREE.Mesh(ringGeo, ringMat);
    wave.rotation.x = Math.PI / 2;
    wave.position.copy(this.playerGroup.position);
    wave.position.y = 1.0;
    this.scene.add(wave);
    this.slashEffects.push({ mesh: wave, created: performance.now() });

    const range = isChakraBlast ? 9.0 : 4.8;
    const dmg = isChakraBlast ? 70 : 40;

    this.monsters.forEach((m) => {
      const dist = m.position.distanceTo(this.playerGroup.position);
      if (dist <= range) {
        m.userData.hp -= dmg;
        if (m.userData.hp <= 0) {
          m.userData.hp = m.userData.maxHp;
          const angle = Math.random() * Math.PI * 2;
          m.position.set(Math.cos(angle) * 35, 0, Math.sin(angle) * 35);
          if (onMonsterKilled) onMonsterKilled(m.userData.type);
        }
      }
    });
  }

  update(moveVec, isSprinting, jumpOffset, callbacks) {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    this.chakraWheel.rotation.z += dt * 6;
    this.auraRing.rotation.z -= dt * 2.5;

    if (this.fireLight && this.flameMesh) {
      this.fireLight.intensity = 3.2 + Math.sin(time * 20) * 0.6;
      this.flameMesh.scale.y = 0.95 + Math.cos(time * 16) * 0.25;
    }

    const baseSpd = isSprinting ? 10 : 6;
    const stanceMult = this.playerStance === 'PRONE' ? 0.4 : this.playerStance === 'CROUCH' ? 0.68 : 1;
    const speed = baseSpd * stanceMult;

    if (Math.abs(moveVec.x) > 0.01 || Math.abs(moveVec.y) > 0.01) {
      const fwd = new THREE.Vector3(Math.sin(this.cameraYaw), 0, Math.cos(this.cameraYaw));
      const rt = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));
      this.playerGroup.position.addScaledVector(fwd, moveVec.y * speed * dt);
      this.playerGroup.position.addScaledVector(rt, moveVec.x * speed * dt);
      this.playerGroup.rotation.y = this.cameraYaw + Math.PI;
    }
    this.playerGroup.position.y = jumpOffset;

    this.questRelics.forEach((r) => {
      r.rotation.y += dt * 3;
      if (r.position.distanceTo(this.playerGroup.position) < 2.4) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 18 + Math.random() * 38;
        r.position.set(Math.cos(angle) * dist, 1.1, Math.sin(angle) * dist);
        if (callbacks && callbacks.onRelicCollected) callbacks.onRelicCollected();
      }
    });

    this.monsters.forEach((m) => {
      const dir = new THREE.Vector3().subVectors(this.playerGroup.position, m.position);
      dir.y = 0;
      const dist = dir.length();
      if (dist > 1.4 && dist < 35) {
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
      const age = (now - eff.created) / 300;
      if (age >= 1) {
        this.scene.remove(eff.mesh);
        this.slashEffects.splice(i, 1);
      } else {
        eff.mesh.scale.setScalar(1 + age * 1.5);
        eff.mesh.material.opacity = 1 - age;
      }
    }

    const camDist = this.isZoomed ? 2.8 : 5.8;
    const camHeight = this.isZoomed ? 1.9 : 2.8;
    const cx = this.playerGroup.position.x + Math.sin(this.cameraYaw) * camDist;
    const cz = this.playerGroup.position.z + Math.cos(this.cameraYaw) * camDist;
    this.camera.position.set(cx, this.playerGroup.position.y + camHeight, cz);
    this.camera.lookAt(this.playerGroup.position.x, this.playerGroup.position.y + 1.4, this.playerGroup.position.z);

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export { Amazonia3DEngine };
