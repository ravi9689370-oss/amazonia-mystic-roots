import { Amazonia3DEngine } from './graphics-engine.js';
import { mysticAudio } from './audio-engine.js';
import { APP_NAME } from './config.js';

// Master game state
const state = {
  level: 1,
  xp: 0,
  xpToNext: 100,
  hp: 100,
  maxHp: 100,
  coins: 12000, // Starting coins so users can test the 10,000 -> 1 Diamond exchange right away
  diamonds: 5,
  medkits: 3,
  questProgress: 0,
  questTarget: 3,
  isSprinting: false,
  stance: 'STAND',
  jumpVelocity: 0,
  jumpOffset: 0,
  squadId: localStorage.getItem('amazonia_squad_id') || 'AMAZON-ALPHA',
  equippedCharacter: 'char_sadhak',
  equippedWeapon: 'wpn_chakrastra_1',

  // Characters & weapons unlocked by Level or Diamonds
  catalog: [
    {
      id: 'char_sadhak',
      name: 'अर्जुन (वनवासी साधक)',
      category: 'CHARACTER',
      unlockLevel: 1,
      diamondCost: 0,
      owned: true,
      outfitColor: 0x1f5c3a,
      desc: 'लेवल 1 बेस सर्वाइवर कैरेक्टर'
    },
    {
      id: 'char_yogic_white',
      name: 'पवित्र सफेद योगिक साधक पोशाक',
      category: 'OUTFIT',
      unlockLevel: 3,
      diamondCost: 2,
      owned: false,
      outfitColor: 0xf5f5f5,
      desc: 'लेवल 3 या 2 डायमंड्स से अनलॉक: दिव्य आध्यात्मिक कवच'
    },
    {
      id: 'char_night_armor',
      name: 'नाइट कॉम्बैट शैडो आर्मर',
      category: 'OUTFIT',
      unlockLevel: 6,
      diamondCost: 4,
      owned: false,
      outfitColor: 0x1a1c2e,
      desc: 'लेवल 6 या 4 डायमंड्स से अनलॉक: रात के राक्षसों के खिलाफ सुरक्षा'
    },
    {
      id: 'wpn_chakrastra_1',
      name: 'चक्रास्त्र Mk-I (त्रिशूल-कटाना)',
      category: 'WEAPON',
      unlockLevel: 1,
      diamondCost: 0,
      owned: true,
      weaponColor: 0x00ffff,
      desc: 'वैदिक त्रिशूल और कटाना का प्राथमिक संगम'
    },
    {
      id: 'wpn_chakrastra_solar',
      name: 'सूर्य-चक्रास्त्र (Golden Blade)',
      category: 'WEAPON',
      unlockLevel: 5,
      diamondCost: 3,
      owned: false,
      weaponColor: 0xffd700,
      desc: 'लेवल 5 या 3 डायमंड्स: चमकती स्वर्ण ऊर्जा और दोगुना प्रहार'
    },
    {
      id: 'wpn_chakrastra_void',
      name: 'महाकाल-चक्रास्त्र (Lv.10 Mythic)',
      category: 'WEAPON',
      unlockLevel: 10,
      diamondCost: 8,
      owned: false,
      weaponColor: 0xff0055,
      desc: 'लेवल 10 या 8 डायमंड्स: अंतिम सर्वशक्तिमान हाइब्रिड अस्त्र'
    }
  ]
};

let engine = null;

// UI Helper: Toast Notification
let toastTimeout = null;
function showToast(msg) {
  const banner = document.getElementById('toast-banner');
  banner.textContent = msg;
  banner.style.opacity = '1';
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    banner.style.opacity = '0';
  }, 3200);
}

// Refresh HUD & level unlocks
function updateHUD() {
  state.catalog.forEach((item) => {
    if (!item.owned && state.level >= item.unlockLevel) {
      item.owned = true;
      showToast(`🎉 लेवल ${state.level} अनलॉक: ${item.name}!`);
    }
  });

  document.getElementById('hud-level').textContent = `Lv${state.level}`;
  document.getElementById('hud-hp-text').textContent = `${Math.ceil(state.hp)}/${state.maxHp}`;
  document.getElementById('hud-hp-bar').style.width = `${(state.hp / state.maxHp) * 100}%`;
  document.getElementById('hud-xp-bar').style.width = `${Math.min(100, (state.xp / state.xpToNext) * 100)}%`;
  document.getElementById('hud-coins').textContent = state.coins.toLocaleString();
  document.getElementById('hud-diamonds').textContent = state.diamonds;
  document.getElementById('hud-medkits').textContent = state.medkits;
  document.getElementById('hud-quest-prog').textContent = `${state.questProgress}/${state.questTarget}`;

  const activeChar = state.catalog.find((i) => i.id === state.equippedCharacter);
  const activeWpn = state.catalog.find((i) => i.id === state.equippedWeapon);
  if (activeChar) document.getElementById('hud-char-name').textContent = activeChar.name;
  if (activeWpn) document.getElementById('hud-weapon-name').textContent = activeWpn.name;
}

function addXP(amount) {
  state.xp += amount;
  while (state.xp >= state.xpToNext && state.level < 10) {
    state.xp -= state.xpToNext;
    state.level += 1;
    state.xpToNext = Math.floor(state.xpToNext * 1.35);
    state.maxHp += 15;
    state.hp = state.maxHp;
    mysticAudio.playPotliChime();
    showToast(`🔥 बधाई! आप लेवल ${state.level} पर पहुँच गए!`);
  }
  updateHUD();
}

// Render Potli Inventory & Store grids
function renderModals() {
  const potliGrid = document.getElementById('potli-items-grid');
  const storeGrid = document.getElementById('store-items-grid');
  potliGrid.innerHTML = '';
  storeGrid.innerHTML = '';

  state.catalog.forEach((item) => {
    const pCard = document.createElement('div');
    pCard.className = 'item-card';
    const isEquipped = state.equippedCharacter === item.id || state.equippedWeapon === item.id;
    pCard.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
      </div>
      <button class="action-btn ${isEquipped ? 'secondary' : ''}" ${!item.owned ? 'disabled style="opacity:0.45"' : ''}>
        ${!item.owned ? `🔒 Lv.${item.unlockLevel} पर अनलॉक` : isEquipped ? '✓ सुसज्जित (Equipped)' : 'पहनें / Equip'}
      </button>
    `;
    if (item.owned && !isEquipped) {
      pCard.querySelector('button').addEventListener('click', () => {
        if (item.category === 'WEAPON') {
          state.equippedWeapon = item.id;
          engine.applyCosmetics(null, item.weaponColor);
        } else {
          state.equippedCharacter = item.id;
          engine.applyCosmetics(item.outfitColor, null);
        }
        mysticAudio.playPotliChime();
        updateHUD();
        renderModals();
      });
    }
    potliGrid.appendChild(pCard);

    if (item.diamondCost > 0) {
      const sCard = document.createElement('div');
      sCard.className = 'item-card';
      sCard.innerHTML = `
        <div>
          <h4>${item.name}</h4>
          <p>${item.desc}</p>
        </div>
        <button class="action-btn" ${item.owned ? 'disabled style="opacity:0.5"' : ''}>
          ${item.owned ? '✓ अनलॉक हो चुका है' : `💎 ${item.diamondCost} डायमंड्स में खरीदें`}
        </button>
      `;
      if (!item.owned) {
        sCard.querySelector('button').addEventListener('click', () => {
          if (state.diamonds < item.diamondCost) {
            showToast('⚠️ पर्याप्त डायमंड्स नहीं हैं! कॉइन्स एक्सचेंज करें या टॉप-अप करें।');
            return;
          }
          state.diamonds -= item.diamondCost;
          item.owned = true;
          mysticAudio.playPotliChime();
          showToast(`✨ आपने ${item.name} अनलॉक कर लिया!`);
          updateHUD();
          renderModals();
        });
      }
      storeGrid.appendChild(sCard);
    }
  });
}

// Economy: 10,000 Coins -> 1 Diamond exchange (offline, runs 100% on-device)
function bindEconomy() {
  document.getElementById('btn-exchange-coin').addEventListener('click', () => {
    if (state.coins < 10000) {
      showToast('⚠️ विनिमय के लिए कम से कम 10,000 कॉइन्स आवश्यक हैं!');
      return;
    }
    state.coins -= 10000;
    state.diamonds += 1;
    mysticAudio.playPotliChime();
    showToast('💎 सफल विनिमय: 10,000 कॉइन्स ➔ 1 डायमंड प्राप्त हुआ!');
    updateHUD();
    renderModals();
  });

  document.querySelectorAll('[data-iap]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const amount = parseInt(btn.getAttribute('data-iap'), 10);
      state.diamonds += amount;
      mysticAudio.playPotliChime();
      showToast(`🎉 इन-ऐप परचेस सफल: +${amount} डायमंड्स आपके वॉलेट में जुड़ गए!`);
      updateHUD();
      renderModals();
    });
  });
}

// Virtual Joystick touch & mouse logic
const moveVec = { x: 0, y: 0 };
let joyActive = false;

function handleJoystick(clientX, clientY) {
  const joyZone = document.getElementById('joystick-zone');
  const joyKnob = document.getElementById('joystick-knob');
  const rect = joyZone.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const maxR = rect.width / 2 - 15;
  let dx = clientX - cx;
  let dy = clientY - cy;
  const dist = Math.hypot(dx, dy);
  if (dist > maxR) {
    dx = (dx / dist) * maxR;
    dy = (dy / dist) * maxR;
  }
  joyKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  moveVec.x = -dx / maxR;
  moveVec.y = dy / maxR;
}

function resetJoystick() {
  const joyKnob = document.getElementById('joystick-knob');
  joyActive = false;
  joyKnob.style.transform = 'translate(-50%, -50%)';
  moveVec.x = 0;
  moveVec.y = 0;
}

function bindControls() {
  const joyZone = document.getElementById('joystick-zone');
  joyZone.addEventListener('pointerdown', (e) => {
    joyActive = true;
    mysticAudio.init();
    handleJoystick(e.clientX, e.clientY);
  });
  window.addEventListener('pointermove', (e) => {
    if (joyActive) handleJoystick(e.clientX, e.clientY);
  });
  window.addEventListener('pointerup', () => {
    if (joyActive) resetJoystick();
  });

  // Camera swipe-look on the canvas
  let lookPointerId = null;
  let lastLookX = 0;
  const canvasEl = document.getElementById('game-canvas');
  canvasEl.addEventListener('pointerdown', (e) => {
    mysticAudio.init();
    lookPointerId = e.pointerId;
    lastLookX = e.clientX;
  });
  window.addEventListener('pointermove', (e) => {
    if (e.pointerId === lookPointerId) {
      const dx = e.clientX - lastLookX;
      lastLookX = e.clientX;
      engine.cameraYaw -= dx * 0.007;
    }
  });
  window.addEventListener('pointerup', (e) => {
    if (e.pointerId === lookPointerId) lookPointerId = null;
  });

  // Keyboard WASD fallback for desktop testing
  const keys = {};
  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  window.__amazoniaKeys = keys;

  const sprintBtn = document.getElementById('btn-sprint');
  sprintBtn.addEventListener('click', () => {
    state.isSprinting = !state.isSprinting;
    sprintBtn.classList.toggle('active', state.isSprinting);
  });

  document.getElementById('btn-attack').addEventListener('click', () => {
    mysticAudio.init();
    mysticAudio.playKatanaSlash();
    engine.triggerWeaponAttack(false, (monsterType) => {
      state.coins += 2500;
      addXP(45);
      showToast(`⚔️ ${monsterType === 'ANACONDA' ? 'छाया एनाकोंडा' : 'विषैला जगुआर'} परास्त! +2,500 कॉइन्स, +45 XP`);
    });
  });

  document.getElementById('btn-chakra').addEventListener('click', () => {
    mysticAudio.init();
    mysticAudio.playChakraBlast();
    engine.triggerWeaponAttack(true, (monsterType) => {
      state.coins += 3500;
      addXP(65);
      showToast(`🔱 चक्रास्त्र महाप्रहार से ${monsterType} भस्म! +3,500 कॉइन्स!`);
    });
  });

  document.getElementById('btn-jump').addEventListener('click', () => {
    if (state.jumpOffset === 0) state.jumpVelocity = 7.5;
  });

  document.getElementById('btn-crouch').addEventListener('click', () => {
    state.stance = state.stance === 'CROUCH' ? 'STAND' : 'CROUCH';
    engine.setStance(state.stance);
  });

  document.getElementById('btn-prone').addEventListener('click', () => {
    state.stance = state.stance === 'PRONE' ? 'STAND' : 'PRONE';
    engine.setStance(state.stance);
  });

  document.getElementById('btn-zoom').addEventListener('click', () => {
    engine.isZoomed = !engine.isZoomed;
  });

  document.getElementById('btn-heal').addEventListener('click', () => {
    if (state.medkits > 0 && state.hp < state.maxHp) {
      state.medkits -= 1;
      state.hp = state.maxHp;
      mysticAudio.playPotliChime();
      showToast('🌿 संजीवनी हीलिंग किट उपयोग की गई: 100% HP बहाल!');
      updateHUD();
    }
  });

  document.getElementById('btn-switch-weapon').addEventListener('click', () => {
    const ownedWeapons = state.catalog.filter((i) => i.category === 'WEAPON' && i.owned);
    const idx = ownedWeapons.findIndex((w) => w.id === state.equippedWeapon);
    const nextWpn = ownedWeapons[(idx + 1) % ownedWeapons.length];
    if (nextWpn) {
      state.equippedWeapon = nextWpn.id;
      engine.applyCosmetics(null, nextWpn.weaponColor);
      mysticAudio.playKatanaSlash();
      updateHUD();
    }
  });

  document.getElementById('btn-open-potli').addEventListener('click', () => {
    mysticAudio.playPotliChime();
    renderModals();
    document.getElementById('modal-potli').classList.add('open');
  });
  document.getElementById('btn-open-store').addEventListener('click', () => {
    renderModals();
    document.getElementById('modal-store').classList.add('open');
  });
  document.getElementById('btn-open-squad').addEventListener('click', () => {
    document.getElementById('modal-squad').classList.add('open');
  });
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById(btn.getAttribute('data-close')).classList.remove('open');
    });
  });

  const audioBtn = document.getElementById('btn-toggle-audio');
  audioBtn.addEventListener('click', () => {
    const active = mysticAudio.toggle();
    audioBtn.textContent = active ? '🔊 जंगल ऑडियो: ON' : '🔇 जंगल ऑडियो: OFF';
  });
}

// ---- Offline Squad Chat (localStorage + scripted guide companion) ----
const CHAT_KEY = 'amazonia_squad_chat_v1';
const BOT_NAME = 'ऋषि-गाइड';
const BOT_REPLIES = [
  'मेधा बटाओ, कोहरा भारी है! 🌫️',
  'तोरी द्वार के पास अवशेष दिखे, सावधान रहना। ⛩️',
  'चक्रास्त्र का चक्र घूम रहा है… शुभ लक्षण! 🔱',
  'एनाकोंडा की फुसफुसाहट सुनाई दे रही है, पीछे हटो। 🐍',
  'जगुआर-राक्षस नज़दीक है, चक्र-प्रहार तैयार रखो! 🐆',
  'कैंपफायर की लौ तेज़ है, यहाँ आकर आराम करो। 🔥'
];

function loadChatLog() {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveChatLog(log) {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(log.slice(-100)));
  } catch (err) {
    /* storage full or blocked - chat continues in-memory */
  }
}

function bindSquadChat() {
  const chatLog = document.getElementById('squad-chat-log');
  let squadChat = loadChatLog();

  function appendChat(sender, text, persist = true) {
    const div = document.createElement('div');
    div.style.marginBottom = '6px';
    div.innerHTML = `<b style="color:#D4AF37;">[${sender}]:</b> ${text}`;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
    if (persist) {
      squadChat.push({ sender, text });
      saveChatLog(squadChat);
    }
  }

  // Restore history so chat survives restarts (works fully offline)
  squadChat.forEach((m) => appendChat(m.sender, m.text, false));
  if (!squadChat.length) {
    appendChat('सिस्टम', 'ऑफलाइन स्क्वाड मोड सक्रिय — आपकी बातचीत इस डिवाइस पर सुरक्षित रहती है।');
  }
  document.getElementById('input-squad-code').value = state.squadId;

  document.getElementById('btn-join-squad').addEventListener('click', () => {
    const code = document.getElementById('input-squad-code').value.trim() || 'AMAZON-ALPHA';
    state.squadId = code;
    localStorage.setItem('amazonia_squad_id', code);
    appendChat('सिस्टम', `आप स्क्वाड [${code}] से जुड़ गए हैं (ऑफलाइन लॉकर)।`);
  });

  document.getElementById('btn-send-chat').addEventListener('click', () => {
    const input = document.getElementById('input-chat-msg');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    appendChat('आप', msg);
    // The device-local guide answers strategy questions even with zero network.
    setTimeout(() => {
      const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
      appendChat(BOT_NAME, reply);
    }, 900 + Math.random() * 900);
  });
}

// Minimap radar renderer
function bindMinimap() {
  const mapCanvas = document.getElementById('minimap-canvas');
  const mapCtx = mapCanvas.getContext('2d');

  function drawMinimap() {
    mapCtx.clearRect(0, 0, 115, 115);
    const cx = 57.5;
    const cy = 57.5;
    const scale = 1.2;

    mapCtx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    mapCtx.beginPath();
    mapCtx.arc(cx, cy, 25, 0, Math.PI * 2);
    mapCtx.arc(cx, cy, 48, 0, Math.PI * 2);
    mapCtx.stroke();

    const px = engine.playerGroup.position.x;
    const pz = engine.playerGroup.position.z;

    mapCtx.fillStyle = '#FFD700';
    engine.landmarks.forEach((lm) => {
      const rx = cx + (lm.x - px) * scale;
      const ry = cy + (lm.z - pz) * scale;
      mapCtx.fillRect(rx - 3, ry - 3, 6, 6);
    });

    mapCtx.fillStyle = '#00FFFF';
    engine.questRelics.forEach((r) => {
      const rx = cx + (r.position.x - px) * scale;
      const ry = cy + (r.position.z - pz) * scale;
      mapCtx.beginPath();
      mapCtx.arc(rx, ry, 3, 0, Math.PI * 2);
      mapCtx.fill();
    });

    mapCtx.fillStyle = '#FF3B4B';
    engine.monsters.forEach((m) => {
      const rx = cx + (m.position.x - px) * scale;
      const ry = cy + (m.position.z - pz) * scale;
      mapCtx.beginPath();
      mapCtx.arc(rx, ry, 3.5, 0, Math.PI * 2);
      mapCtx.fill();
    });

    mapCtx.fillStyle = '#2ECC71';
    mapCtx.beginPath();
    mapCtx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    mapCtx.fill();
  }

  return drawMinimap;
}

export function startGame() {
  engine = new Amazonia3DEngine('game-canvas');

  updateHUD();
  bindControls();
  bindEconomy();
  bindSquadChat();

  const drawMinimap = bindMinimap();

  showToast(`🌿 ${APP_NAME} में स्वागत है! पूरा गेम ऑफलाइन चलता है।`);

  // Main 60FPS game loop
  let lastMonsterAudio = 0;
  function animate() {
    requestAnimationFrame(animate);

    const activeMove = { x: moveVec.x, y: moveVec.y };
    const keys = window.__amazoniaKeys || {};
    if (keys['KeyW'] || keys['ArrowUp']) activeMove.y = -1;
    if (keys['KeyS'] || keys['ArrowDown']) activeMove.y = 1;
    if (keys['KeyA'] || keys['ArrowLeft']) activeMove.x = 1;
    if (keys['KeyD'] || keys['ArrowRight']) activeMove.x = -1;

    if (state.jumpOffset > 0 || state.jumpVelocity > 0) {
      state.jumpOffset += state.jumpVelocity * 0.04;
      state.jumpVelocity -= 0.45;
      if (state.jumpOffset <= 0) {
        state.jumpOffset = 0;
        state.jumpVelocity = 0;
      }
    }

    engine.update(activeMove, state.isSprinting, state.jumpOffset, {
      onRelicCollected: () => {
        state.questProgress += 1;
        state.coins += 3500;
        addXP(55);
        mysticAudio.playPotliChime();
        if (state.questProgress >= state.questTarget) {
          state.questProgress = 0;
          state.coins += 10000;
          state.diamonds += 2;
          showToast('🏆 कोहरे की घाटी का टास्क पूरा! बोनस +10,000 कॉइन्स और +2 डायमंड्स मिले!');
        } else {
          showToast(`🌿 दुर्लभ अवशेष मिला! +3,500 कॉइन्स (${state.questProgress}/${state.questTarget})`);
        }
        updateHUD();
      },
      onPlayerHit: (monsterType, dt) => {
        state.hp = Math.max(10, state.hp - 12 * dt);
        const now = performance.now();
        if (now - lastMonsterAudio > 2200) {
          lastMonsterAudio = now;
          if (monsterType === 'ANACONDA') {
            mysticAudio.playAnacondaHiss();
          } else {
            mysticAudio.playJaguarRoar();
          }
        }
        updateHUD();
      }
    });

    drawMinimap();
  }

  animate();
}
