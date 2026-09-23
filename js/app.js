// ============================================================
//  明亮活潑版 — 依 js/data.js 產生內容
//  含：3D 快捷按鈕、KPI、數據表、可展開詳情、圖文合一（卡片內含實錄照）+ 燈箱
// ============================================================
const ACCENTS = ['#2f80c4', '#f26a2e', '#f5b301']; // 藍 / 橘 / 黃
const ICONS   = ['📋', '🏅', '🤖'];

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// 重點標示：**手動標記** 與 數據（數字＋單位／百分比／金額）自動標示
const RE_PCT = /(\d[\d,]*(?:\.\d+)?\s*(?:％|%))/g;
const RE_MONEY = /(\d{1,3}(?:,\d{3})+\s*元)/g;
const RE_UNIT = /(\d[\d,]*(?:\.\d+)?\s*(?:場次|座數|件數|人次|座|件|家|台|項|份|則|人|次|天|筆|冊))/g;
function hl(t) {
  return String(t)
    .replace(/\*\*([^*]+)\*\*/g, '<span class="hl">$1</span>')
    .replace(RE_PCT, '<span class="hl">$1</span>')
    .replace(RE_MONEY, '<span class="hl">$1</span>')
    .replace(RE_UNIT, '<span class="hl">$1</span>');
}
const esch = (s) => hl(esc(s));

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

// 收納式數據表：平常收合，點擊以動畫展開
// 重點數據跑馬燈（點卡片可跳到數據所在段落；滑過／取得焦點時暫停）
function renderTicker(sec) {
  if (!sec.ticker || !sec.ticker.length) return '';
  const one = (t, clone) => {
    const attrs = `type="button" data-to="${esc(t.to || '')}"${clone ? ' tabindex="-1" aria-hidden="true"' : ''}`;
    if (t.title) {
      return `<button class="tk-card tk-topic" ${attrs}>` +
        `<b>${t.icon ? `<span class="tk-ic">${esc(t.icon)}</span>` : ''}${esc(t.title)}</b>` +
        `<span>${esc(t.note || '')}</span></button>`;
    }
    return `<button class="tk-card" ${attrs}>` +
      `<b>${esc(t.value)}<i>${esc(t.unit || '')}</i></b><span>${esc(t.label)}</span></button>`;
  };
  const setA = sec.ticker.map((t) => one(t, false)).join('');
  const setB = sec.ticker.map((t) => one(t, true)).join('');
  return `<div class="ticker" data-ticker><div class="ticker-track"><div class="tk-set">${setA}</div><div class="tk-set">${setB}</div></div></div>`;
}

function renderTables(secOrTables) {
  const list = Array.isArray(secOrTables) ? secOrTables : (secOrTables && secOrTables.tables);
  if (!list || !list.length) return '';
  return list.map((t) => {
    const head = `<tr>${t.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>`;
    const body = t.rows
      .map((r, i) => `<tr style="--r:${i}">${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
      .join('');
    return `<div class="tbl">
      <button class="tmore" type="button"><span class="tm-ic">▦</span><span class="tm-tx">${esc(t.title)}</span><span class="tm-go">展開表格 <i class="caret">▾</i></span></button>
      <div class="tbl-body"><div class="tbl-inner"><div class="dtable-scroll">
        <table class="dtable"><thead>${head}</thead><tbody>${body}</tbody></table>
      </div></div></div>
    </div>`;
  }).join('');
}

// 詳情：支援「字串」「字串陣列」與「小項分組 {no, sub, points, tables}」
function renderDetailInner(detail, idPrefix) {
  if (Array.isArray(detail)) {
    const isGroup = (d) => d && typeof d === 'object';
    if (!detail.some(isGroup)) return `<ul class="d-list">${detail.map((d) => `<li>${esch(d)}</li>`).join('')}</ul>`;
    return detail.map((d) => {
      if (!isGroup(d)) return `<ul class="d-list"><li>${esch(d)}</li></ul>`;
      const pts = (d.points || []).map((x) => `<li>${esch(x)}</li>`).join('');
      const gid = idPrefix && d.no ? ` id="${esc(idPrefix + '-' + d.no)}"` : '';
      return `<div class="d-group"${gid}>
        <h4 class="d-sub">${d.no ? `<span class="d-no">${esc(d.no)}</span>` : ''}${esc(d.sub || '')}</h4>
        ${pts ? `<ul class="d-list">${pts}</ul>` : ''}${renderTables(d.tables)}` +
        `${renderLinks(d.links)}${renderFiles(d.files)}</div>`;
    }).join('');
  }
  return `<p>${esch(detail)}</p>`;
}

function renderDetail(detail, idPrefix) {
  if (!detail) return '';
  return `<button class="more" type="button">展開詳情 <span class="caret">▾</span></button>
    <div class="detail"><div class="detail-inner">${renderDetailInner(detail, idPrefix)}</div></div>`;
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

// 分組標題：有 groupImg 時輸出「圖片卡＋文字疊層」（文字不燒進圖片，改 data.js 即可）
function renderGroupHead(sec, c, gi) {
  if (!c.group) return '';
  const id = ` id="${esc(sec.id + '-f' + gi)}"`;
  const sub = c.groupSub ? `<span class="ag-sub">${esc(c.groupSub)}</span>` : '';
  if (c.groupImg) {
    return `<h3 class="ai-group ai-group-hero"${id}>` +
      `<img class="agh-img" src="${esc(c.groupImg)}" alt="" loading="lazy">` +
      `<span class="agh-text"><span class="agh-title">${esc(c.group)}</span>${sub}</span></h3>`;
  }
  return `<h3 class="ai-group"${id}>${esc(c.group)}${sub}</h3>`;
}

function renderBody(sec) {
  if (sec.type === 'list') {
    return `<ol class="list">${sec.items
      .map((it, k) => `<li><h3>${esc(it.heading)}</h3><p>${esch(it.text)}</p>${renderDetail(it.detail, `${sec.id}-g${k + 1}`)}` +
        `${renderTables(it.tables)}${renderLinks(it.links)}${renderFiles(it.files)}</li>`)
      .join('')}</ol>`;
  }
  if (sec.type === 'ai') {
    let gi = 0;
    const line = sec.typewriter ? `<div class="ai-line">${esc(sec.typewriter)}</div>` : '';
    const cards = `<div class="ai-grid">${sec.cards
      .map((c, j) => (c.group ? renderGroupHead(sec, c, (gi = gi + 1)) : '') +
        `<div class="ai-card"><div class="ic">${esc(c.icon)}</div><b>${esc(c.title)}</b>` +
        `<p>${esch(c.desc)}</p>${renderDetail(c.detail)}${renderCardImages(sec.id + '-' + j, c.images)}` +
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
      <p class="sec-intro">${esch(sec.intro)}</p>
      ${renderBanner(sec)}
      ${renderStats(sec)}
      ${renderTicker(sec)}
      ${renderTables(sec)}
      ${renderBody(sec)}
    </div>`;
  main.appendChild(el);
});

// ---- 展開/收合（高度自動量測，巢狀展開不會被裁切）----
function slideOpen(el) {
  el.style.maxHeight = el.scrollHeight + 'px';
  el.classList.add('open');
  const done = (ev) => {
    if (ev.target !== el || ev.propertyName !== 'max-height') return;
    el.style.maxHeight = 'none';
    el.removeEventListener('transitionend', done);
  };
  el.addEventListener('transitionend', done);
}
function slideClose(el) {
  el.style.maxHeight = el.scrollHeight + 'px';
  el.classList.remove('open');
  requestAnimationFrame(() => requestAnimationFrame(() => { el.style.maxHeight = '0px'; }));
}

// 跑馬燈：依內容長度設定捲動速度（約 46px/秒），並支援減少動態偏好
function setupTickers() {
  document.querySelectorAll('[data-ticker]').forEach((tk) => {
    const track = tk.querySelector('.ticker-track');
    const sets = tk.querySelectorAll('.tk-set');
    if (!track || !sets.length) return;
    // 卡片太少時先補滿一輪寬度，避免捲動時出現空白
    let w = sets[0].scrollWidth;
    const need = tk.clientWidth;
    if (w > 0 && need > 0 && w < need && !track.dataset.filled) {
      const times = Math.ceil(need / w);
      sets.forEach((set) => {
        const base = Array.from(set.children).map((el) => el.cloneNode(true));
        for (let i = 1; i < times; i++) {
          base.forEach((el) => {
            const copy = el.cloneNode(true);
            copy.tabIndex = -1;
            copy.setAttribute('aria-hidden', 'true');
            set.appendChild(copy);
          });
        }
      });
      track.dataset.filled = '1';
      w = sets[0].scrollWidth;
    }
    if (w > 0) track.style.animationDuration = Math.max(20, Math.round(w / 46)) + 's';
  });
}
// 觸控裝置沒有 hover：按住／輕觸時暫停，放開 6 秒後恢復，方便點選移動中的卡片
function bindTickerTouch(root) {
  (root || document).querySelectorAll('[data-ticker]').forEach((tk) => {
    if (tk.dataset.touchBound) return;
    tk.dataset.touchBound = '1';
    let timer = null;
    const pause = () => {
      clearTimeout(timer);
      const track = tk.querySelector('.ticker-track');
      if (track) track.style.animationPlayState = 'paused';
    };
    const resume = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const track = tk.querySelector('.ticker-track');
        if (track) track.style.animationPlayState = '';
      }, 6000);
    };
    tk.addEventListener('touchstart', pause, { passive: true });
    tk.addEventListener('touchend', resume, { passive: true });
    tk.addEventListener('touchcancel', resume, { passive: true });
  });
}

addEventListener('load', setupTickers);
addEventListener('load', () => bindTickerTouch());
setTimeout(() => bindTickerTouch(), 300);
setTimeout(setupTickers, 300);

// 確保跑馬燈恢復轉動（清除觸控暫停留下的 inline 狀態）
function resumeTickers() {
  document.querySelectorAll('[data-ticker] .ticker-track').forEach((t) => { t.style.animationPlayState = ''; });
}

// 點擊數據卡：展開該大項詳情、捲動到對應小項並閃爍提示
function gotoData(to) {
  if (!to) return;
  const el = document.getElementById('report-g' + to) || document.getElementById(to);
  if (!el) return;
  const detail = el.closest('.detail');
  const wasOpen = !detail || detail.classList.contains('open');
  if (detail && !wasOpen) {
    const btn = detail.previousElementSibling;
    if (btn && btn.classList.contains('more')) btn.click();
  }
  setTimeout(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: true }); } catch (err) { /* 舊瀏覽器略過 */ }
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 2400);
    resumeTickers();
  }, wasOpen ? 80 : 440);
}

main.addEventListener('click', (e) => {
  const tk = e.target.closest('.tk-card');
  if (tk) { tk.blur(); resumeTickers(); gotoData(tk.dataset.to); return; }
  const tbtn = e.target.closest('.tmore');
  if (tbtn) {
    const body = tbtn.nextElementSibling;
    const on = tbtn.classList.toggle('open');
    if (on) slideOpen(body); else slideClose(body);
    tbtn.querySelector('.tm-go').firstChild.textContent = on ? '收合表格 ' : '展開表格 ';
    return;
  }
  const btn = e.target.closest('.more');
  if (!btn) return;
  const detail = btn.nextElementSibling;
  const open = btn.classList.toggle('open');
  if (open) slideOpen(detail); else slideClose(detail);
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
