import { loadData } from './data.js';

const state = { query: '', category: 'all', data: null };

const $grid = document.getElementById('grid');
const $search = document.getElementById('search');
const $tabs = document.getElementById('cat-tabs');
const $stats = document.getElementById('stats');

const escape = (s = '') => String(s).replace(/[&<>"']/g, ch =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));

function render() {
  const { cards, categories } = state.data;
  const q = state.query.trim().toLowerCase();
  const filtered = cards.filter(c => {
    if (state.category !== 'all' && c.category !== state.category) return false;
    if (!q) return true;
    const haystack = [c.title, c.id, ...(c.pills || [])].join(' ').toLowerCase();
    return haystack.includes(q);
  });

  if (!filtered.length) {
    $grid.innerHTML = '<div class="empty">Ingen kort matcher din søgning.</div>';
    return;
  }

  $grid.innerHTML = filtered.map(c => {
    const cat = categories[c.category] || {};
    const pills = (c.pills || []).map(p => `<span class="pill">${escape(p)}</span>`).join('');
    return `
      <a class="gym-card" data-cat="${c.category}" style="--cat-color:${cat.color}"
         href="card.html?id=${encodeURIComponent(c.id)}">
        <div class="gym-card-img">
          <img src="${escape(c.image)}" alt="${escape(c.title)}" loading="lazy" />
        </div>
        <div class="gym-card-title-bar">
          <div class="gym-card-id">${escape(c.id)}</div>
          <div class="gym-card-title">${escape(c.title)}</div>
        </div>
        ${pills ? `<div class="gym-card-pills">${pills}</div>` : ''}
      </a>`;
  }).join('');
}

function buildTabs() {
  const cats = state.data.categories;
  const counts = state.data.cards.reduce((m, c) => (m[c.category] = (m[c.category] || 0) + 1, m), {});
  const buttons = [
    `<button class="cat-tab active" data-cat="all">Alle (${state.data.cards.length})</button>`,
    ...Object.entries(cats).map(([k, c]) =>
      `<button class="cat-tab" data-cat="${k}">${k} – ${escape(c.name)} (${counts[k] || 0})</button>`)
  ];
  $tabs.innerHTML = buttons.join('');
  $tabs.addEventListener('click', e => {
    const btn = e.target.closest('.cat-tab');
    if (!btn) return;
    state.category = btn.dataset.cat;
    $tabs.querySelectorAll('.cat-tab').forEach(b => b.classList.toggle('active', b === btn));
    render();
  });
}

function renderStats() {
  if (!$stats) return;
  const total = state.data.cards.length;
  const cats = Object.keys(state.data.categories).length;
  $stats.innerHTML = `
    <div class="stat"><span class="stat-n">${total}</span><span class="stat-l">Kort i alt</span></div>
    <div class="stat"><span class="stat-n">${cats}</span><span class="stat-l">Kategorier</span></div>`;
}

$search.addEventListener('input', e => { state.query = e.target.value; render(); });

(async () => {
  try {
    state.data = await loadData();
    renderStats();
    buildTabs();
    render();
  } catch (err) {
    $grid.innerHTML = `<div class="empty">${err.message}</div>`;
  }
})();
