// ============================================================
//  等距小工廠 Diorama — 3D 互動版（Three.js r128）
//  一座漂浮工廠島：鍋爐→業務報告、獎盃→優良事蹟、機器人→創新作為
//  內容取自 js/data.js。
// ============================================================
const mount = document.getElementById('scene');
const isMobile = matchMedia('(max-width:820px)').matches;
const ACCENTS = { report: '#2f80c4', merit: '#f5b301', innovation: '#34d399' };
const ICONS = { report: '📋', merit: '🏅', innovation: '🤖' };

// ---------- 場景 ----------
const scene = new THREE.Scene();
const BG_COLOR = 0x88c4e8; // 飽和質感天空藍
scene.background = new THREE.Color(BG_COLOR);
scene.fog = new THREE.Fog(BG_COLOR, 38, 72);

const aspect = innerWidth / innerHeight;
let viewD = isMobile ? 11 : 9.5;
const camera = new THREE.OrthographicCamera(-viewD * aspect, viewD * aspect, viewD, -viewD, -100, 1000);
camera.position.set(16, 13, 16);
camera.lookAt(0, 1.4, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.25 : 1.75));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
mount.appendChild(renderer.domElement);

const labelRenderer = new THREE.CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight);
Object.assign(labelRenderer.domElement.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '10' });
mount.appendChild(labelRenderer.domElement);

// ---------- 燈光（日光天空照明）----------
scene.add(new THREE.HemisphereLight(0xffffff, 0x475569, 0.7));
scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const sun = new THREE.DirectionalLight(0xfffae6, 0.85);
sun.position.set(12, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(isMobile ? 512 : 2048, isMobile ? 512 : 2048);
sun.shadow.camera.left = -16; sun.shadow.camera.right = 16;
sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 50;
sun.shadow.bias = -0.0004;
scene.add(sun);

// ---------- 小工具 ----------
function mat(color, o = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.75, metalness: o.metal ?? 0.05, flatShading: o.flat ?? true });
}
function shadowize(obj, receive = false) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = receive; } });
  return obj;
}

// ---------- 漂浮工廠島 ----------
const island = new THREE.Group();
scene.add(island);
const deck = new THREE.Mesh(new THREE.CylinderGeometry(8.4, 8.4, 0.8, 48), mat(0x475569, { rough: 0.7 }));
deck.position.y = 0; deck.receiveShadow = true; island.add(deck);
const grass = new THREE.Mesh(new THREE.CylinderGeometry(8.42, 8.42, 0.28, 48), mat(0x1f5424, { rough: 0.85 }));
grass.position.y = 0.34; grass.receiveShadow = true; island.add(grass);
const soil = new THREE.Mesh(new THREE.CylinderGeometry(8.4, 3.6, 3.4, 48), mat(0x4a3b32, { rough: 1 }));
soil.position.y = -2.0; island.add(soil);
// 地面淡格線
const gridTop = new THREE.GridHelper(16, 16, 0x3b82f6, 0x60a5fa);
gridTop.position.y = 0.42; gridTop.material.transparent = true; gridTop.material.opacity = 0.35; island.add(gridTop);

const FLOOR = 0.42; // 物件擺放高度

// ---------- 造型：壓力容器 / 鍋爐（業務報告）----------
function makeBoiler() {
  const g = new THREE.Group();
  const steel = mat(0x1d4ed8), band = mat(0x1e3a8a);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.1, 22), steel); body.position.y = 1.35;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.1, 22, 12, 0, 6.29, 0, Math.PI / 2), steel); dome.position.y = 2.4;
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(1.1, 22, 12, 0, 6.29, 0, Math.PI / 2), steel);
  bottom.rotation.x = Math.PI; bottom.position.y = 0.3;
  g.add(body, dome, bottom);
  [0.8, 1.9].forEach((y) => { const b = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.08, 8, 26), band); b.rotation.x = Math.PI / 2; b.position.y = y; g.add(b); });
  const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.14, 18), mat(0xe2e8f0, { rough: 0.5 }));
  gauge.rotation.x = Math.PI / 2; gauge.position.set(0, 1.55, 1.02); g.add(gauge);
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.02), mat(0xd97706)); needle.position.set(0, 1.6, 1.12); g.add(needle);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.3, 12), mat(0xd97706)); pipe.position.set(0.72, 3.0, 0); g.add(pipe);
  const pipe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.7, 12), mat(0xd97706)); pipe2.rotation.z = Math.PI / 2; pipe2.position.set(0.4, 3.55, 0); g.add(pipe2);
  [[0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 8), band); leg.position.set(x, 0.0, z); g.add(leg);
  });
  return shadowize(g);
}

// ---------- 造型：獎盃（優良事蹟）----------
function makeTrophy() {
  const g = new THREE.Group();
  const gold = mat(0xd97706, { metal: 0.4, rough: 0.35 });
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.5, 1.1, 20), gold); cup.position.y = 2.1; g.add(cup);
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 12, 0, 6.29, 0, Math.PI / 2), gold);
  bowl.rotation.x = Math.PI; bowl.position.y = 1.55; g.add(bowl);
  [[1.0], [-1.0]].forEach(([x]) => { const h = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.08, 8, 16), gold); h.position.set(x, 2.15, 0); h.rotation.y = Math.PI / 2; g.add(h); });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 12), gold); stem.position.y = 1.05; g.add(stem);
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.25, 18), gold); base1.position.y = 0.72; g.add(base1);
  const base2 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 1.3), mat(0x78350f, { rough: 0.6 })); base2.position.y = 0.42; g.add(base2);
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), mat(0xfef08a, { rough: 0.3, metal: 0.3 })); star.position.set(0, 2.0, 0.78); g.add(star);
  return shadowize(g);
}

// ---------- 造型：AI 機器人（創新作為 - 飽和科幻色彩）----------
function makeRobot() {
  const g = new THREE.Group();
  const bodyColor = mat(0x3b82f6, { rough: 0.6, metal: 0.15 }), green = mat(0x10b981), dark = mat(0x0f172a);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 1.0), bodyColor); body.position.y = 1.4;
  body.geometry.translate(0, 0, 0); g.add(body);
  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.05), green); belly.position.set(0, 1.4, 0.52); g.add(belly);
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.85, 0.9), bodyColor); head.position.y = 2.5; g.add(head);
  const eyeL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 14), green); eyeL.rotation.x = Math.PI / 2; eyeL.position.set(-0.25, 2.55, 0.46);
  const eyeR = eyeL.clone(); eyeR.position.x = 0.25; g.add(eyeL, eyeR);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), dark); ant.position.y = 3.1; g.add(ant);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), green); bulb.position.y = 3.35; g.add(bulb);
  [[-0.95], [0.95]].forEach(([x]) => { const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.9, 10), bodyColor); arm.position.set(x, 1.5, 0); arm.rotation.z = x > 0 ? 0.25 : -0.25; g.add(arm); });
  [[-0.35], [0.35]].forEach(([x]) => { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.4), dark); leg.position.set(x, 0.65, 0); g.add(leg); });
  g.userData.bulb = bulb; g.userData.head = head;
  return shadowize(g);
}

// ---------- 裝飾：吊車 ----------
function makeCrane() {
  const g = new THREE.Group();
  const y = mat(0xd97706), blue = mat(0x1d4ed8);
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.42, 6.4, 0.42), y); mast.position.y = 3.2; g.add(mast);
  const jib = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.32, 0.32), y); jib.position.set(1.9, 6.4, 0); g.add(jib);
  const cjib = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 0.28), y); cjib.position.set(-1.1, 6.4, 0); g.add(cjib);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), blue); cab.position.set(0, 5.9, 0); g.add(cab);
  const wt = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), mat(0x475569)); wt.position.set(-1.7, 6.4, 0); g.add(wt);
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), mat(0x0f172a)); cable.position.set(3.4, 5.0, 0); g.add(cable);
  const hookGrp = new THREE.Group(); hookGrp.position.set(3.4, 3.6, 0);
  const hookTop = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.3), mat(0xe11d48)); hookTop.position.y = 0.5;
  const hookRing = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.09, 10, 20), mat(0xe11d48)); hookRing.position.y = 0.05; hookRing.rotation.x = Math.PI / 2 + 0.4;
  hookGrp.add(hookTop, hookRing); g.add(hookGrp);
  g.userData.hook = hookGrp;
  return shadowize(g);
}

// ---------- 裝飾：安全帽小人 / 三角錐 / 樹 / 鷹架 / 齒輪 / 雲 ----------
function makeWorker(shirt) {
  const g = new THREE.Group();
  const skin = mat(0xfca5a5), hatC = mat(0xd97706);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.7, 10), mat(shirt)); body.position.y = 0.55; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), skin); head.position.y = 1.02; g.add(head);
  const hat = new THREE.Mesh(new THREE.SphereGeometry(0.27, 12, 8, 0, 6.29, 0, 1.3), hatC); hat.position.y = 1.08; g.add(hat);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.05, 12), hatC); brim.position.y = 1.0; g.add(brim);
  return shadowize(g);
}
function makeCone() {
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 14), mat(0xe11d48)); c.position.y = 0.35; g.add(c);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.14, 14), mat(0xf8fafc)); band.position.y = 0.34; g.add(band);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), mat(0xe11d48)); base.position.y = 0.03; g.add(base);
  return shadowize(g);
}
function makeTree() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.6, 8), mat(0x78350f)); trunk.position.y = 0.3; g.add(trunk);
  const c1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), mat(0x15803d)); c1.position.y = 0.95; g.add(c1);
  const c2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), mat(0x166534)); c2.position.set(0.15, 1.35, 0.1); g.add(c2);
  return shadowize(g);
}
function makeScaffold() {
  const g = new THREE.Group(); const b = mat(0x1d4ed8);
  for (let x = 0; x <= 1.4; x += 1.4) for (let z = 0; z <= 1.0; z += 1.0) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), b); p.position.set(x, 1.1, z); g.add(p);
  }
  [0.6, 1.6, 2.1].forEach((y) => {
    const bx = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.06), b); bx.position.set(0.7, y, 0); g.add(bx);
    const bz = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.1), b); bz.position.set(0, y, 0.5); g.add(bz);
    const bz2 = bz.clone(); bz2.position.x = 1.4; g.add(bz2);
  });
  const plank = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.2), mat(0x92400e)); plank.position.set(0.7, 2.15, 0.5); g.add(plank);
  return shadowize(g);
}
function makeGearFlat(color) {
  const shape = new THREE.Shape(); const teeth = 12, r = 0.7, tooth = 0.18, step = Math.PI * 2 / teeth;
  const p = (a, rad) => [Math.cos(a) * rad, Math.sin(a) * rad];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    if (i === 0) shape.moveTo(...p(a, r)); else shape.lineTo(...p(a, r));
    shape.lineTo(...p(a + step * 0.3, r + tooth)); shape.lineTo(...p(a + step * 0.5, r + tooth)); shape.lineTo(...p(a + step * 0.7, r));
  }
  shape.closePath(); const hole = new THREE.Path(); hole.absarc(0, 0, 0.28, 0, 6.29, true); shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.24, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1, curveSegments: 16 });
  geo.rotateX(Math.PI / 2); geo.center();
  return shadowize(new THREE.Mesh(geo, mat(color, { metal: 0.3, rough: 0.5 })));
}
function makeCloud() {
  const g = new THREE.Group(); const m = mat(0xc0d6ed, { rough: 0.8 });
  [[0, 0, 0, 0.9], [0.9, -0.1, 0, 0.6], [-0.8, -0.1, 0.1, 0.55], [0.3, 0.35, -0.2, 0.55]].forEach(([x, y, z, s]) => {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), m); b.position.set(x, y, z); g.add(b);
  });
  return g;
}

// ---------- 3D 模型載入進度與完全載入控制 ----------
let modelsLoadedCount = 0;
const TOTAL_GLB_MODELS = 3; // boiler.glb, crane.glb, factory.glb

function onModelLoaded() {
  modelsLoadedCount++;
  const pct = Math.min(Math.round((modelsLoadedCount / TOTAL_GLB_MODELS) * 100), 100);
  
  const loaderBar = document.getElementById('loader-bar');
  const loaderPct = document.getElementById('loader-pct');
  if (loaderBar) loaderBar.style.width = pct + '%';
  if (loaderPct) loaderPct.textContent = pct + '%';

  // 必須當 3D 模型 100% 全數載入完畢，才淡出載入畫面並呈現首頁
  if (modelsLoadedCount >= TOTAL_GLB_MODELS) {
    setTimeout(() => {
      const loaderEl = document.getElementById('loader');
      const introEl = document.getElementById('intro');
      if (loaderEl) loaderEl.classList.add('hidden');
      if (introEl) introEl.classList.remove('hidden');
    }, 450);
  }
}

function getGLTFLoader() {
  if (typeof THREE !== 'undefined' && THREE.GLTFLoader) {
    const loader = new THREE.GLTFLoader();
    if (typeof MeshoptDecoder !== 'undefined') {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
    return loader;
  }
  return null;
}

function loadGLTFModel(url, targetHeight, shadow = true, onComplete, retryCount = 0) {
  const loader = getGLTFLoader();
  if (!loader) {
    if (retryCount < 20) {
      setTimeout(() => loadGLTFModel(url, targetHeight, shadow, onComplete, retryCount + 1), 200);
    } else {
      console.warn(`[GLTF Load Error] GLTFLoader 腳本逾時未載入: ${url}`);
      onModelLoaded(); // 計數累加避免卡死
    }
    return;
  }

  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene;
      model.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = shadow;
          c.receiveShadow = shadow;
          if (c.material) {
            c.material.roughness = 0.5;
            c.material.metalness = 0.15;
          }
        }
      });

      // 計算邊界框並精準縮放與對齊底邊
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = targetHeight / (size.y > 0 ? size.y : maxDim);
      model.scale.setScalar(scale);

      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.x = -center.x * scale;
      model.position.y = -box.min.y * scale;
      model.position.z = -center.z * scale;

      const container = new THREE.Group();
      container.add(model);
      onComplete(container, gltf);
      onModelLoaded(); // 載入完成通知
    },
    undefined,
    (err) => {
      console.warn(`[GLTF Load Error] 無法載入模型 ${url}:`, err);
      onModelLoaded(); // 即使出錯也累加計數避免畫面卡住
    }
  );
}

// ---------- 點擊判定參數（手機放寬）----------
const TAP_MOVE = isMobile ? 18 : 8;   // 允許的手指位移（像素）
const TAP_TIME = 800;                  // 允許的按住時間（毫秒）
const TAP_TOL = isMobile ? 60 : 28;    // 未直接命中時的螢幕容錯半徑（像素）

// 讓浮動標籤可被輕觸開啟（拖曳則不觸發，交還給場景旋轉）
function bindLabelTap(el, id) {
  let d = null;
  el.addEventListener('pointerdown', (e) => { d = { x: e.clientX, y: e.clientY, t: Date.now() }; });
  el.addEventListener('pointerup', (e) => {
    if (!d || !started) { d = null; return; }
    const moved = Math.hypot(e.clientX - d.x, e.clientY - d.y);
    if (moved < TAP_MOVE && Date.now() - d.t < TAP_TIME) { e.stopPropagation(); openPanel(id); }
    d = null;
  });
}

// ---------- 擺放 ----------
const interactives = [];
function place(obj, x, z, id) {
  obj.position.set(x, FLOOR, z);
  island.add(obj);
  if (id) {
    obj.userData.id = id; obj.userData.baseY = FLOOR;
    interactives.push(obj);
    const el = document.createElement('div');
    el.className = 'node-label'; el.style.setProperty('--a', ACCENTS[id]);
    const sec = SECTIONS.find((s) => s.id === id);
    if (sec) {
      el.innerHTML = `<span class="nl-ic">${ICONS[id]}</span>${sec.name}<span class="nl-tap">點我看內容</span>`;
    }
    const label = new THREE.CSS2DObject(el);
    label.position.set(0, obj.userData.labelY || 3.4, 0);
    obj.add(label); obj.userData.labelEl = el;
    // 讓浮動標籤本身可直接點擊（手機最可靠的點擊目標）
    el.style.pointerEvents = 'auto';
    el.style.cursor = 'pointer';
    bindLabelTap(el, id);
  }
  return obj;
}

const boiler = makeBoiler(); boiler.userData.labelY = 4.0; place(boiler, -3.6, 1.6, 'report');
const trophy = makeTrophy(); trophy.userData.labelY = 3.6; place(trophy, 3.8, 2.2, 'merit');
const robot = makeRobot(); robot.userData.labelY = 3.9; place(robot, 0.4, -3.2, 'innovation');

const crane = makeCrane(); place(crane, 5.2, -3.6);

// 當 GLB 模型存在時，非同步載入並精準取代 3D 造型
SECTIONS.forEach((sec) => {
  if (!sec.model) return;
  let targetObj = null;
  let targetHeight = 3.5;
  let labelY = 3.8;

  if (sec.id === 'report') { targetObj = boiler; targetHeight = 3.6; labelY = 4.2; }
  else if (sec.id === 'merit') { targetObj = trophy; targetHeight = 3.4; labelY = 3.8; }

  if (targetObj) {
    loadGLTFModel(sec.model, targetHeight, true, (gltfGroup) => {
      // 移轉 CSS2D 標籤與 userData
      let label = null;
      targetObj.children.forEach((c) => { if (c.isCSS2DObject) label = c; });
      if (label) {
        targetObj.remove(label);
        label.position.set(0, labelY, 0);
        gltfGroup.add(label);
      }
      gltfGroup.position.copy(targetObj.position);
      gltfGroup.userData = Object.assign({}, targetObj.userData);
      
      const idx = interactives.indexOf(targetObj);
      if (idx !== -1) interactives[idx] = gltfGroup;
      island.remove(targetObj);
      island.add(gltfGroup);
    });
  }
});

// 旁邊的大塔吊位置，替換為適當縮放比例 (targetHeight = 2.6) 的 factory.glb 工廠模型
loadGLTFModel('assets/models/factory.glb', 2.6, true, (gltfFactory) => {
  gltfFactory.position.copy(crane.position);
  gltfFactory.userData = Object.assign({}, crane.userData);
  island.remove(crane);
  island.add(gltfFactory);
});
place(makeScaffold(), -5.4, -3.2);
const gear1 = makeGearFlat(0x9aa7b2); place(gear1, -1.6, 4.6);
const gear2 = makeGearFlat(0xf5b301); gear2.scale.setScalar(0.7); place(gear2, -0.7, 5.0);
[makeWorker(0x2f80c4), makeWorker(0xe8622a), makeWorker(0x34d399)].forEach((w, i) => {
  const ang = i * 2.1; place(w, Math.cos(ang) * 6, Math.sin(ang) * 6); w.userData.bob = i;
});
[[-6.2, 3.6], [6.4, 3.4], [-4.4, 5.2], [5.6, 4.6]].forEach(([x, z]) => place(makeTree(), x, z));
[[2.0, 4.4], [-2.6, -5.2], [4.2, -1.2], [1.2, 5.4]].forEach(([x, z]) => place(makeCone(), x, z));

// 雲朵
const clouds = [];
[[-9, 8, 3, 1.1], [8, 9, -4, 0.9], [2, 10, 8, 0.8], [-6, 9, -7, 0.85]].forEach(([x, y, z, s]) => {
  const c = makeCloud(); c.position.set(x, y, z); c.scale.setScalar(s); c.userData.sx = x; scene.add(c); clouds.push(c);
});

// ---------- 控制器（轉盤）----------
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minZoom = 0.6; controls.maxZoom = 1.8;
controls.minPolarAngle = Math.PI * 0.18; controls.maxPolarAngle = Math.PI * 0.42;
controls.autoRotate = true; controls.autoRotateSpeed = 0.5;
controls.target.set(0, 1.2, 0);
controls.enabled = false;

// ============================================================
//  互動：點擊設備
// ============================================================
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let down = null, selected = null, started = false;

function toInteractive(obj) {
  while (obj) { if (obj.userData && obj.userData.id) return obj; obj = obj.parent; }
  return null;
}

// 將互動物件投影到螢幕座標（取模型中段作為中心點）
const _v = new THREE.Vector3();
function screenPos(obj) {
  obj.getWorldPosition(_v);
  _v.y += 1.4;
  _v.project(camera);
  return { x: (_v.x * 0.5 + 0.5) * innerWidth, y: (-_v.y * 0.5 + 0.5) * innerHeight };
}

// 依螢幕座標挑選互動物件：先精準射線命中，未中則取容錯半徑內最近者
function pickInteractive(cx, cy) {
  pointer.x = (cx / innerWidth) * 2 - 1;
  pointer.y = -(cy / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(interactives, true)[0];
  if (hit) { const n = toInteractive(hit.object); if (n) return n; }
  // 近距離容錯：手指未精準落在模型上時，改取最接近的互動物件
  let best = null, bestD = TAP_TOL;
  interactives.forEach((o) => {
    if (!o.userData || !o.userData.id) return;
    const p = screenPos(o);
    const d = Math.hypot(p.x - cx, p.y - cy);
    if (d < bestD) { bestD = d; best = o; }
  });
  return best;
}

renderer.domElement.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: Date.now() }; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!down) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
  if (moved < TAP_MOVE && Date.now() - down.t < TAP_TIME) {
    const n = pickInteractive(e.clientX, e.clientY);
    if (n) openPanel(n.userData.id);
  }
  down = null;
});
renderer.domElement.addEventListener('pointermove', (e) => {
  if (!started) return;
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  renderer.domElement.style.cursor = raycaster.intersectObjects(interactives, true).length ? 'pointer' : 'grab';
});

// ============================================================
//  內容面板（沿用 data.js 內容）
// ============================================================
const IMG_GROUPS = {};
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const panel = document.getElementById('panel');
const backdrop = document.getElementById('panel-backdrop');

function renderStats(sec) {
  if (!sec.stats) return '';
  return `<div class="chips">${sec.stats.map((s) => `<div class="chip"><b>${esc(s.value)}<i>${esc(s.unit || '')}</i></b><span>${esc(s.label)}</span></div>`).join('')}</div>`;
}
function renderTables(sec) {
  if (!sec.tables) return '';
  return sec.tables.map((t) => `<div class="dtable-wrap"><div class="dtable-title">${esc(t.title)}</div><div class="dtable-scroll"><table class="dtable"><thead><tr>${t.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`).join('');
}
function renderDetail(d) {
  if (!d) return '';
  const inner = Array.isArray(d) ? `<ul>${d.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p>${esc(d)}</p>`;
  return `<button class="more" type="button">展開詳情 <span class="caret">▾</span></button><div class="detail"><div class="detail-inner">${inner}</div></div>`;
}
function renderImgs(grp, imgs) {
  if (!imgs || !imgs.length) return '';
  IMG_GROUPS[grp] = imgs;
  return `<div class="card-imgs" data-grp="${grp}">${imgs.map((g, i) => `<figure data-idx="${i}"><img src="${esc(g.img)}" alt="${esc(g.caption)}" loading="lazy"><span class="ci-cap">${esc(g.caption)}</span></figure>`).join('')}</div>`;
}
function renderBanner(sec) {
  if (!sec.banner) return '';
  const grp = sec.id + '-banner';
  IMG_GROUPS[grp] = [sec.banner];
  return `<div class="card-imgs banner-imgs" data-grp="${grp}"><figure data-idx="0"><img src="${esc(sec.banner.img)}" alt="${esc(sec.banner.caption)}" loading="lazy"><span class="ci-cap">${esc(sec.banner.caption)}</span></figure></div>`;
}
function renderLinks(links) {
  if (!links || !links.length) return '';
  return `<div class="card-links">${links.map((l) => `<a class="ext-link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">🔗 ${esc(l.label)}</a>`).join('')}</div>`;
}
function renderFiles(files) {
  if (!files || !files.length) return '';
  return `<div class="card-files">${files.map((f) => `<a class="file-link" href="${esc(f.url)}" target="_blank" rel="noopener noreferrer"><span class="fl-ic">📄</span><span class="fl-tx">${esc(f.title)}</span><span class="fl-go">開啟 PDF ↗</span></a>`).join('')}</div>`;
}
function renderBody(sec) {
  if (sec.type === 'list') return `<ol class="list">${sec.items.map((it) => `<li><h3>${esc(it.heading)}</h3><p>${esc(it.text)}</p>${renderDetail(it.detail)}</li>`).join('')}</ol>`;
  if (sec.type === 'ai') {
    const line = sec.typewriter ? `<div class="ai-line">${esc(sec.typewriter)}</div>` : '';
    return line + renderBanner(sec) + `<div class="ai-grid">${sec.cards.map((c, j) => (c.group ? `<h3 class="ai-group">${esc(c.group)}</h3>` : '') + `<div class="ai-card"><div class="ic">${esc(c.icon)}</div><b>${esc(c.title)}</b><p>${esc(c.desc)}</p>${renderDetail(c.detail)}${renderImgs(sec.id + '-' + j, c.images)}${renderLinks(c.links)}${renderFiles(c.files)}</div>`).join('')}</div>`;
  }
  return '';
}
function openPanel(id) {
  const sec = SECTIONS.find((s) => s.id === id);
  selected = id;
  panel.style.setProperty('--accent', ACCENTS[id]);
  document.getElementById('panel-en').textContent = sec.en;
  document.getElementById('panel-en').style.color = ACCENTS[id];
  document.getElementById('panel-title').textContent = sec.name;
  document.getElementById('panel-intro').textContent = sec.intro;
  document.getElementById('panel-body').innerHTML = renderStats(sec) + renderTables(sec) + renderBody(sec);
  panel.classList.remove('hidden'); backdrop.classList.remove('hidden');
  controls.autoRotate = false;
}
function closePanel() {
  panel.classList.add('hidden'); backdrop.classList.add('hidden');
  selected = null; controls.autoRotate = true;
}
document.getElementById('panel-close').addEventListener('click', closePanel);
backdrop.addEventListener('click', closePanel);
addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

// 展開 / 收合
document.getElementById('panel-body').addEventListener('click', (e) => {
  const btn = e.target.closest('.more');
  if (!btn) return;
  const d = btn.nextElementSibling;
  const open = btn.classList.toggle('open'); d.classList.toggle('open', open);
  btn.firstChild.textContent = open ? '收合詳情 ' : '展開詳情 ';
});

// 燈箱
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `<button class="lb-close">✕</button><button class="lb-nav lb-prev">‹</button><button class="lb-nav lb-next">›</button><img alt=""><div class="lb-cap"></div>`;
document.body.appendChild(lightbox);
const lbImg = lightbox.querySelector('img'), lbCap = lightbox.querySelector('.lb-cap');
let lbList = [], lbIdx = 0;
function lbShow(i) { if (!lbList.length) return; lbIdx = (i + lbList.length) % lbList.length; lbImg.src = lbList[lbIdx].img; lbCap.textContent = `${lbList[lbIdx].caption}　(${lbIdx + 1}/${lbList.length})`; }
document.getElementById('panel-body').addEventListener('click', (e) => {
  const fig = e.target.closest('.card-imgs figure'); if (!fig) return;
  lbList = IMG_GROUPS[fig.closest('.card-imgs').dataset.grp] || []; lbShow(+fig.dataset.idx); lightbox.classList.add('open');
});
lightbox.addEventListener('click', (e) => {
  if (e.target.closest('.lb-next')) lbShow(lbIdx + 1);
  else if (e.target.closest('.lb-prev')) lbShow(lbIdx - 1);
  else if (e.target === lbImg) lbShow(lbIdx + 1);
  else lightbox.classList.remove('open');
});

// ============================================================
//  進場流程
// ============================================================
document.getElementById('intro-title').textContent = SITE.title;
document.getElementById('intro-sub').textContent = SITE.subtitle;
document.getElementById('enter-label').textContent = '進入工廠';
document.querySelector('#topbar .topbar-title').textContent = SITE.title;
document.getElementById('hint').textContent = '拖曳可旋轉工廠 ·  點設備看內容';
const tagEl = document.querySelector('.intro-tag'); if (tagEl) tagEl.textContent = '3D 互動工廠 · TAP TO EXPLORE';

function enter() {
  if (started) return; started = true;
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('topbar').classList.remove('hidden');
  document.getElementById('hint').classList.remove('hidden');
  controls.enabled = true;
  setTimeout(() => document.getElementById('hint').classList.add('hidden'), 6000);
}
document.getElementById('enter-btn').addEventListener('click', enter);
// 安全備用退場機制（若網路異常，最長 6 秒後強行顯示首頁）
setTimeout(() => {
  const loaderEl = document.getElementById('loader');
  if (loaderEl && !loaderEl.classList.contains('hidden')) {
    loaderEl.classList.add('hidden');
    if (document.getElementById('intro')) document.getElementById('intro').classList.remove('hidden');
  }
}, 6000);

// ============================================================
//  動畫
// ============================================================
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta(), t = clock.elapsedTime;
  if (crane.userData.hook) crane.userData.hook.position.x = 3.4 + Math.sin(t * 0.9) * 0.5;
  gear1.rotation.y += dt * 0.6; gear2.rotation.y -= dt * 0.9;
  if (robot.userData.bulb) robot.userData.bulb.material.emissive = new THREE.Color(0x34d399).multiplyScalar((Math.sin(t * 3) + 1) * 0.3);
  clouds.forEach((c) => { c.position.x += dt * 0.4; if (c.position.x > 12) c.position.x = -12; });
  interactives.forEach((o, i) => {
    const sel = selected === o.userData.id;
    const target = o.userData.baseY + (sel ? 0.5 : 0) + (o.userData.id ? Math.sin(t * 1.2 + i) * 0.08 : 0);
    o.position.y += (target - o.position.y) * 0.15;
    o.rotation.y += dt * (sel ? 0.8 : 0.15);
    if (o.userData.labelEl) o.userData.labelEl.style.opacity = started ? '1' : '0';
  });
  island.children.forEach((o) => { if (o.userData.bob !== undefined) o.position.y = FLOOR + Math.abs(Math.sin(t * 2 + o.userData.bob)) * 0.12; });
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();

// ---------- resize ----------
addEventListener('resize', () => {
  const a = innerWidth / innerHeight;
  camera.left = -viewD * a; camera.right = viewD * a; camera.top = viewD; camera.bottom = -viewD;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  labelRenderer.setSize(innerWidth, innerHeight);
});
