// Shared data loader – cached across calls.
let _cache = null;
export async function loadData() {
  if (_cache) return _cache;
  const res = await fetch('data/cards.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('Kunne ikke hente cards.json');
  _cache = await res.json();
  return _cache;
}
