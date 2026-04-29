import { loadData } from './data.js';

const $root = document.getElementById('detail');

const escape = (s = '') => String(s).replace(/[&<>"']/g, ch =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));

// Light-tone pair for each category, for badges and steps-box.
const CAT_TINT = {
  E: { soft: '#e1f5ee', deep: '#085041' },
  F: { soft: '#dbeefe', deep: '#053a6b' },
  P: { soft: '#fff3d6', deep: '#7a4a00' },
};

function render(card, cat) {
  const tint = CAT_TINT[card.category] || { soft: '#eee', deep: '#333' };
  const onColor = card.category === 'P' ? '#1a1a1a' : '#fff';
  const onColorDim = card.category === 'P' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.65)';
  document.title = `GymCard ${card.id} – ${card.title}`;
  $root.dataset.cat = card.category;
  $root.style.setProperty('--cat-color', cat.color);
  $root.style.setProperty('--cat-soft', tint.soft);
  $root.style.setProperty('--cat-deep', tint.deep);
  $root.style.setProperty('--on-color', onColor);
  $root.style.setProperty('--on-color-dim', onColorDim);

  const badges = (card.badges || []).map(b => `
    <div class="badge">
      <div class="badge-label">${escape(b.label)}</div>
      <div class="badge-value">${escape(b.value)}</div>
    </div>`).join('');

  const steps = (card.steps || []).map(s => `
    <div class="step-row">
      <div class="step-label">${escape(s.label)}</div>
      <div class="step-text">${escape(s.text)}</div>
    </div>`).join('');

  const stepsBox = steps ? `
    <div class="steps-box">
      <div class="steps-heading">${escape(card.steps_heading || 'Forløb')}</div>
      ${steps}
    </div>` : '';

  const music = card.music ? `<div class="music-row">${escape(card.music)}</div>` : '';

  const goal = card.goal ? `
    <div class="goal-row">
      <span class="goal-label">${escape(card.goal.label)}</span>
      <span class="goal-value">${escape(card.goal.value)}</span>
    </div>` : '';

  $root.innerHTML = `
    <div class="photo-wrap">
      <img src="${escape(card.image)}" alt="${escape(card.title)}" />
      <div class="card-id-badge">${escape(card.id)}</div>
    </div>
    <div class="card-header">
      <div class="card-header-label">GymCard · Kategori ${escape(card.category)}</div>
      <div class="card-title">${escape(card.title)}</div>
    </div>
    ${card.description ? `<p class="desc">${escape(card.description)}</p>` : ''}
    ${badges ? `<div class="badges">${badges}</div>` : ''}
    ${stepsBox}
    ${music}
    ${goal}
    <div class="footer">GymCards® · gymnashop.dk</div>
  `;
}

(async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    $root.innerHTML = `<div class="msg"><h1>Mangler kort-ID</h1><p>Brug fx <code>card.html?id=E1</code>.</p></div>`;
    return;
  }
  try {
    const data = await loadData();
    const card = data.cards.find(c => c.id.toLowerCase() === id.toLowerCase());
    if (!card) {
      $root.innerHTML = `<div class="msg"><h1>Kort ikke fundet</h1><p>ID <code>${escape(id)}</code> findes ikke.</p></div>`;
      return;
    }
    render(card, data.categories[card.category] || { name: card.category, color: '#666' });
  } catch (err) {
    $root.innerHTML = `<div class="msg"><h1>Fejl</h1><p>${escape(err.message)}</p></div>`;
  }
})();
