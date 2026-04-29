import { loadData } from './data.js';

const $root = document.getElementById('detail');

function escape(s = '') {
  return String(s).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

function render(card, cat) {
  document.title = `${card.id} · ${card.title} – GymCards`;
  $root.dataset.cat = card.category;
  $root.style.setProperty('--cat-color', cat.color);
  $root.innerHTML = `
    <div class="hero" style="background-image:url('${escape(card.image)}')"></div>
    <div class="body">
      <span class="cat-pill" style="background:${cat.color};color:${card.category==='P'?'#1a1a1a':'#fff'}">
        ${escape(card.id)} · ${escape(cat.name)}
      </span>
      <h1 style="margin-top:12px">${escape(card.title)}</h1>
      <p class="subtitle">${escape(card.subtitle || '')}</p>
      <div class="meta">
        ${card.duration ? `<span class="meta-item">⏱ ${escape(card.duration)}</span>` : ''}
        ${card.level ? `<span class="meta-item">📊 ${escape(card.level)}</span>` : ''}
      </div>
      <p class="description">${escape(card.description || '')}</p>
      ${(card.tags || []).length
        ? `<div class="tags">${card.tags.map(t => `<span class="tag">${escape(t)}</span>`).join('')}</div>`
        : ''}
    </div>`;
}

(async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    $root.innerHTML = `<div class="body"><h1>Mangler kort-ID</h1><p>Brug fx <code>card.html?id=E1</code>.</p></div>`;
    return;
  }
  try {
    const data = await loadData();
    const card = data.cards.find(c => c.id === id);
    if (!card) {
      $root.innerHTML = `<div class="body"><h1>Kort ikke fundet</h1><p>ID <code>${escape(id)}</code> findes ikke.</p></div>`;
      return;
    }
    render(card, data.categories[card.category] || { name: card.category, color: '#666' });
  } catch (err) {
    $root.innerHTML = `<div class="body"><h1>Fejl</h1><p>${escape(err.message)}</p></div>`;
  }
})();
