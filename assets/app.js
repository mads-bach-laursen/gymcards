import { loadData } from './data.js';

const state = { query: '', category: 'all', data: null };

const $grid = document.getElementById('grid');
const $search = document.getElementById('search');
const $tabs = document.getElementById('cat-tabs');

function render() {
  const { cards, categories } = state.data;
  const q = state.query.trim().toLowerCase();
  const filtered = cards.filter(c => {
    if (state.category !== 'all' && c.category !== state.category) return false;
    if (!q) return true;
    const haystack = [c.title, c.subtitle, c.id, ...(c.tags || [])].join(' ').toLowerCase();
    return haystack.includes(q);
  });

  if (!filtered.length) {
    $grid.innerHTML = '<div class="empty">Ingen kort matcher din søgning.</div>';
    return;
  }

  $grid.innerHTML = filtered.map(c => {
    const cat = categories[c.category] || {};
    return `
      <a class="card" data-cat="${c.category}" style="--cat-color:${cat.color}" href="card.html?id=${encodeURIComponent(c.id)}">
        <div class="img" style="background-image:url('${c.image}')">
          <span class="cat-pill">${c.id} · ${cat.name || c.category}</span>
        </div>
        <div class="body">
          <h3>${c.title}</h3>
          <p>${c.subtitle || ''}</p>
        </div>
      </a>`;
  }).join('');
}

function buildTabs() {
  const cats = state.data.categories;
  const buttons = [
    `<button class="cat-tab active" data-cat="all">Alle</button>`,
    ...Object.entries(cats).map(([key, c]) =>
      `<button class="cat-tab" data-cat="${key}">${key} · ${c.name}</button>`)
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

$search.addEventListener('input', e => { state.query = e.target.value; render(); });

(async () => {
  try {
    state.data = await loadData();
    buildTabs();
    render();
  } catch (err) {
    $grid.innerHTML = `<div class="empty">${err.message}</div>`;
  }
})();
