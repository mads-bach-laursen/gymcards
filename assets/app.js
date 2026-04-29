import { loadData } from './data.js';

const escape = (s = '') => String(s).replace(/[&<>"']/g, ch =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));

const state = { cat: 'all', query: '' };

const $stats   = document.getElementById('stats');
const $btns    = document.getElementById('filter-buttons');
const $search  = document.getElementById('search');
const $sec     = document.getElementById('sections');
const $empty   = document.getElementById('empty');

function buildHero(data) {
  const total = data.cards.length;
  const cats = Object.keys(data.categories).length;
  const counts = {};
  data.cards.forEach(c => counts[c.category] = (counts[c.category] || 0) + 1);
  const biggest = Math.max(...Object.values(counts));
  $stats.innerHTML = `
    <div class="stat"><span class="stat-n">${total}</span><span class="stat-l">Kort i alt</span></div>
    <div class="stat"><span class="stat-n">${cats}</span><span class="stat-l">Kategorier</span></div>
    <div class="stat"><span class="stat-n">${biggest}</span><span class="stat-l">Største serie</span></div>`;
  return counts;
}

function buildFilters(data, counts) {
  const cats = data.categories;
  const all = `<button class='filter-btn all active' data-cat='all'>Alle</button>`;
  const rest = Object.entries(cats).map(([k, c]) => `
    <button class='filter-btn' data-cat='${k}' data-main='${c.color}'
            style='background:${c.soft};color:${c.deep};'>
      ${k} – ${escape(c.name)} <span style='opacity:0.5;font-size:11px;'>(${counts[k] || 0})</span>
    </button>`).join('');
  $btns.innerHTML = all + rest;
}

function buildSections(data, counts) {
  const cats = data.categories;
  const grouped = Object.keys(cats).map(k => {
    const items = data.cards.filter(c => c.category === k);
    const ids = items.map(i => i.id);
    const range = ids.length ? `${ids[0]} – ${ids[ids.length - 1]}` : '';
    const cat = cats[k];
    const cardsHTML = items.map(c => `
      <a class='gym-card' data-letter='${k}' data-search='${escape((c.id + ' ' + c.title).toLowerCase())}'
         href='card.html?id=${encodeURIComponent(c.id)}'>
        <div>
          <img src='${escape(c.image)}' alt='${escape(c.title)}' loading='lazy' />
          <div style='background:${cat.color};padding:10px 14px 14px;'>
            <div style='font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.55);margin-bottom:3px;'>${escape(c.id)}</div>
            <div style='font-family:Barlow Condensed,sans-serif;font-size:18px;font-weight:800;text-transform:uppercase;line-height:1.1;color:${k==='P'?'#1a1a1a':'#fff'};'>${escape(c.title)}</div>
          </div>
          ${(c.pills && c.pills.length) ? `
          <div style='padding:8px 12px 10px;background:#fff;display:flex;gap:5px;flex-wrap:wrap;border-top:1px solid #f0f0f0;'>
            ${c.pills.map(p => `<span style='font-size:10px;font-weight:600;padding:3px 8px;border-radius:20px;background:${cat.soft};color:${cat.deep};white-space:nowrap;'>${escape(p)}</span>`).join('')}
          </div>` : ''}
        </div>
      </a>`).join('');

    return `
      <section class='cat-section' data-letter='${k}'>
        <div class='cat-header' style='border-bottom:3px solid ${cat.soft};'>
          <div class='cat-badge' style='background:${cat.color};${k==='P'?'color:#1a1a1a;':''}'>${k}</div>
          <div style='flex:1;'>
            <div class='cat-name' style='color:${cat.color};'>${escape(cat.name)}</div>
            <div class='cat-meta'>${range} &nbsp;·&nbsp; ${counts[k] || 0} kort</div>
          </div>
          <a href='#filter-bar' class='to-top'>&#8593; Top</a>
        </div>
        <div class='cards-grid'>${cardsHTML}</div>
      </section>`;
  }).join('');
  $sec.innerHTML = grouped;
}

function applyFilter() {
  const q = state.query.toLowerCase().trim();
  let visible = 0;
  document.querySelectorAll('.cat-section').forEach(sec => {
    if (state.cat !== 'all' && sec.dataset.letter !== state.cat) {
      sec.classList.add('hidden');
      return;
    }
    sec.classList.remove('hidden');
    let secVisible = 0;
    sec.querySelectorAll('.gym-card').forEach(c => {
      const match = !q || c.dataset.search.includes(q);
      c.classList.toggle('hidden', !match);
      if (match) { secVisible++; visible++; }
    });
    if (secVisible === 0) sec.classList.add('hidden');
  });
  $empty.classList.toggle('show', visible === 0);
}

function bindEvents() {
  $btns.addEventListener('click', e => {
    const b = e.target.closest('.filter-btn');
    if (!b) return;
    state.cat = b.dataset.cat;
    $search.value = ''; state.query = '';
    document.querySelectorAll('.filter-btn').forEach(x => {
      x.classList.remove('active');
      if (x.classList.contains('all')) { x.style.background = ''; x.style.color = ''; }
      else if (x.dataset.cat) {
        const cat = state.data.categories[x.dataset.cat];
        if (cat) { x.style.background = cat.soft; x.style.color = cat.deep; }
      }
    });
    b.classList.add('active');
    if (!b.classList.contains('all')) {
      b.style.background = b.dataset.main;
      b.style.color = b.dataset.cat === 'P' ? '#1a1a1a' : '#fff';
    }
    applyFilter();
  });
  $search.addEventListener('input', e => { state.query = e.target.value; applyFilter(); });
}

(async () => {
  try {
    const data = await loadData();
    state.data = data;
    const counts = buildHero(data);
    buildFilters(data, counts);
    buildSections(data, counts);
    bindEvents();
  } catch (err) {
    $sec.innerHTML = `<div class='empty show'>${escape(err.message)}</div>`;
  }
})();
