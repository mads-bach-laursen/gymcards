import { loadData } from './data.js';

const $root = document.getElementById('detail');

const escape = (s = '') => String(s).replace(/[&<>"']/g, ch =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));

function render(card, cat) {
  document.title = `GymCard ${card.id} – ${card.title}`;
  const onMain = card.category === 'P' ? '#1a1a1a' : '#fff';
  const onMainDim = card.category === 'P' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.65)';

  const badges = (card.badges || []).map(b => `
    <div class="badge" style="background:${cat.soft};">
      <div class="badge-label" style="color:${cat.color};">${escape(b.label)}</div>
      <div class="badge-value" style="color:${cat.deep};">${escape(b.value)}</div>
    </div>`).join('');

  const stepRows = (card.steps || []).map(s => `
    <div class="step-row">
      <div class="step-label" style="color:${cat.color};">${escape(s.label)}</div>
      <div class="step-text">${escape(s.text)}</div>
    </div>`).join('');

  const stepsBox = stepRows ? `
    <div class="steps-box" style="border-color:${cat.soft};">
      <div class="steps-heading" style="background:${cat.soft};color:${cat.deep};">${escape(card.steps_heading || 'Forløb')}</div>
      ${stepRows}
    </div>` : '';

  const music = card.music ? `
    <div class="music-row" style="background:${cat.soft};color:${cat.deep};border-left-color:${cat.color};">
      ${escape(card.music)}
    </div>` : '';

  const goal = card.goal ? `
    <div class="goal-row" style="background:${cat.color};">
      <span class="goal-label" style="color:${onMainDim};">${escape(card.goal.label)}</span>
      <span class="goal-value" style="color:${onMain};">${escape(card.goal.value)}</span>
    </div>` : '';

  $root.innerHTML = `
    <div class="card">
      <div class="photo-wrap">
        <img src="${escape(card.image)}" alt="${escape(card.title)}" />
        <div class="card-id-badge" style="background:${cat.color};color:${onMain};">${escape(card.id)}</div>
      </div>
      <div class="card-header" style="background:${cat.color};">
        <div class="card-header-label" style="color:${onMainDim};">GymCard · Kategori ${escape(card.category)}</div>
        <div class="card-title" style="color:${onMain};">${escape(card.title)}</div>
      </div>
      ${card.description ? `<p class="desc">${escape(card.description)}</p>` : ''}
      ${badges ? `<div class="badges">${badges}</div>` : ''}
      ${stepsBox}
      ${music}
      ${goal}
      <div class="footer">GymCards® · gymnashop.dk</div>
    </div>
    <a class="back-link" href="index.html">← Tilbage til alle kort</a>
  `;
}

(async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    $root.innerHTML = `<div style="padding:40px;text-align:center;">Mangler kort-ID. Brug fx <code>card.html?id=E1</code>.</div>`;
    return;
  }
  try {
    const data = await loadData();
    const card = data.cards.find(c => c.id.toLowerCase() === id.toLowerCase());
    if (!card) {
      $root.innerHTML = `<div style="padding:40px;text-align:center;">Kort <code>${escape(id)}</code> findes ikke.</div>`;
      return;
    }
    render(card, data.categories[card.category]);
  } catch (err) {
    $root.innerHTML = `<div style="padding:40px;text-align:center;">${escape(err.message)}</div>`;
  }
})();
