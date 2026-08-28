// ============================================================
//  明亮活潑版 — 依 js/data.js 產生內容
//  含：3D 快捷按鈕、KPI、數據表、可展開詳情、圖文合一（卡片內含實錄照）+ 燈箱
// ============================================================
const ACCENTS = ['#2f80c4', '#f26a2e', '#f5b301']; // 藍 / 橘 / 黃
const ICONS   = ['📋', '🏅', '🤖'];

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// 圖片群組（供燈箱依主題翻頁）
const IMG_GROUPS = {};

// ---- HERO 3D 快捷按鈕 ----
const heroNav = document.querySelector('.hero-nav');
heroNav.innerHTML = SECTIONS
  .map((s, i) => `<a class="btn3d" href="#${s.id}" style="--a:${ACCENTS[i]}"><span class="b3-ic">${ICONS[i]}</span>${esc(s.name)}</a>`)
  .join('');

if (matchMedia('(hover:hover)').matches) {
  heroNav.querySelectorAll('.btn3d').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      btn.style.transform = `translateY(-3px) rotateY(${px * 14}deg) rotateX(${-py * 14}deg)`;
      btn.style.animationPlayState = 'paused';
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; btn.style.animationPlayState = ''; });
  });
}

// ---- 內容區塊 ----
const main = document.getElementById('sections');

function renderStats(sec) {
  if (!sec.stats || !sec.stats.length) return '';
  return `<div class="chips">${sec.stats
    .map((s) => `<div class="chip"><b>${esc(s.value)}<i>${esc(s.unit || '')}</i></b><span>${esc(s.label)}</span></div>`)
    .join('')}</div>`;
}

function renderTables(sec) {
  if (!sec.tables || !sec.tables.length) return '';
  return sec.tables.map((t) => {
    const head = `<tr>${t.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>`;
    const body = t.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
    return `<div class="dtable-wrap"><div class="dtable-title">${esc(t.title)}</div>
      <div class="dtable-scroll"><table class="dtable"><thead>${head}</thead><tbody>${body}</tbody></table></div></div>`;
  }).join('');
}

function renderDetail(detail) {
  if (!detail) return '';
  const inner = Array.isArray(detail)
    ? `<ul>${detail.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`
    : `<p>${esc(detail)}</p>`;
  return `<button class="more" type="button">展開詳情 <span class="caret">▾</span></button>
    <div class="detail"><div class="detail-inner">${inner}</div></div>`;
}

// 卡片內的實錄照片（圖文合一）
function renderCardImages(grpId, images) {
  if (!images || !images.length) return '';
  IMG_GROUPS[grpId] = images;
  const figs = images
    .map((g, i) => `<figure data-idx="${i}"><img src="${esc(g.img)}" alt="${esc(g.caption)}" loading="lazy"><span class="ci-cap">${esc(g.caption)}</span></figure>`)
    .join('');
  return `<div class="card-imgs" data-grp="${grpId}">${figs}</div>`;
}

// 主題橫幅（總覽圖，整段最上方；點擊可放大）
function renderBanner(sec) {
  if (!sec.banner) return '';
  const grp = sec.id + '-banner';
  IMG_GROUPS[grp] = [sec.banner];
  return `<div class="card-imgs banner-imgs" data-grp="${grp}">
    <figure data-idx="0"><img src="${esc(sec.banner.img)}" alt="${esc(sec.banner.caption)}" loading="lazy">
    <span class="ci-cap">${esc(sec.banner.caption)}</span></figure></div>`;
}

// 相關連結（由文件 QR Code 解析而來）
function renderLinks(links) {
  if (!links || !links.length) return '';
  return `<div class="card-links">${links
    .map((l) => `<a class="ext-link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">🔗 ${esc(l.label)}</a>`)
    .join('')}</div>`;
}

// PDF 附件（開新分頁檢視）
function renderFiles(files) {
  if (!files || !files.length) return '';
  return `<div class="card-files">${files
    .map((f) => `<a class="file-link" href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">
      <span class="fl-ic">📄</span><span class="fl-tx">${esc(f.title)}</span><span class="fl-go">開啟 PDF ↗</span></a>`)
    .join('')}</div>`;
}

function renderBody(sec) {
  if (sec.type === 'list') {
    return `<ol class="list">${sec.items
      .map((it) => `<li><h3>${esc(it.heading)}</h3><p>${esc(it.text)}</p>${renderDetail(it.detail)}</li>`)
      .join('')}</ol>`;
  }
  if (sec.type === 'ai') {
    const line = sec.typewriter ? `<div class="ai-line">${esc(sec.typewriter)}</div>` : '';
    const cards = `<div class="ai-grid">${sec.cards
      .map((c, j) => (c.group ? `<h3 class="ai-group">${esc(c.group)}</h3>` : '') +
        `<div class="ai-card"><div class="ic">${esc(c.icon)}</div><b>${esc(c.title)}</b>` +
        `<p>${esc(c.desc)}</p>${renderDetail(c.detail)}${renderCardImages(sec.id + '-' + j, c.images)}` +
        `${renderLinks(c.links)}${renderFiles(c.files)}</div>`)
      .join('')}</div>`;
    return line + cards;
  }
  return '';
}

SECTIONS.forEach((sec, i) => {
  const el = document.createElement('section');
  el.className = 'sec reveal';
  el.id = sec.id;
  el.innerHTML = `
    <div class="card" style="--a:${ACCENTS[i]}">
      <div class="sec-head">
        <span class="sec-dot">${ICONS[i]}</span>
        <div><h2>${esc(sec.name)}</h2><span class="sec-en">${esc(sec.en)}</span></div>
      </div>
      <p class="sec-intro">${esc(sec.intro)}</p>
      ${renderBanner(sec)}
      ${renderStats(sec)}
      ${renderTables(sec)}
      ${renderBody(sec)}
    </div>`;
  main.appendChild(el);
});

// ---- 展開/收合 ----
main.addEventListener('click', (e) => {
  const btn = e.target.closest('.more');
  if (!btn) return;
  const detail = btn.nextElementSibling;
  const open = btn.classList.toggle('open');
  detail.classList.toggle('open', open);
  btn.firstChild.textContent = open ? '收合詳情 ' : '展開詳情 ';
});

// ---- 圖片燈箱 ----
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `<button class="lb-close" aria-label="關閉">✕</button>
  <button class="lb-nav lb-prev" aria-label="上一張">‹</button>
  <button class="lb-nav lb-next" aria-label="下一張">›</button>
  <img alt=""><div class="lb-cap"></div>`;
document.body.appendChild(lightbox);
const lbImg = lightbox.querySelector('img');
const lbCap = lightbox.querySelector('.lb-cap');
let lbList = [], lbIdx = 0;

function lbShow(idx) {
  if (!lbList.length) return;
  lbIdx = (idx + lbList.length) % lbList.length;
  lbImg.src = lbList[lbIdx].img;
  lbCap.textContent = `${lbList[lbIdx].caption}　(${lbIdx + 1}/${lbList.length})`;
}
main.addEventListener('click', (e) => {
  const fig = e.target.closest('.card-imgs figure');
  if (!fig) return;
  const grp = fig.closest('.card-imgs').dataset.grp;
  lbList = IMG_GROUPS[grp] || [];
  lbShow(+fig.dataset.idx);
  lightbox.classList.add('open');
});
lightbox.addEventListener('click', (e) => {
  if (e.target.closest('.lb-next')) lbShow(lbIdx + 1);
  else if (e.target.closest('.lb-prev')) lbShow(lbIdx - 1);
  else if (e.target === lbImg) lbShow(lbIdx + 1);
  else lightbox.classList.remove('open');
});
addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') lightbox.classList.remove('open');
  else if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
  else if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
});

// ---- 進場動畫 ----
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: 0.1 });
  reveals.forEach((r) => io.observe(r));
  setTimeout(() => reveals.forEach((r) => r.classList.add('in')), 1000);
} else {
  reveals.forEach((r) => r.classList.add('in'));
}
