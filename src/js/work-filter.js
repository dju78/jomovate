// Progressive enhancement for /work/: every card is in the HTML; this only hides non-matches.
const form = document.querySelector('[data-filters]');
const grid = document.querySelector('[data-project-grid]');
if (form && grid) {
  const cards = [...grid.querySelectorAll('.project-card')];
  const count = document.querySelector('[data-result-count]');
  const empty = document.querySelector('[data-empty]');
  const params = new URLSearchParams(location.search);

  for (const key of ['q', 'category', 'status', 'service']) {
    const value = params.get(key);
    if (!value) continue;
    const el = form.elements[key];
    if (el instanceof RadioNodeList) {
      for (const r of el) r.checked = r.value === value;
    } else if (el) el.value = value;
  }

  const apply = () => {
    const q = form.elements.q.value.trim().toLowerCase();
    const category = form.elements.category.value;
    const status = form.elements.status.value;
    const service = form.elements.service.value;
    const terms = q.split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const card of cards) {
      const d = card.dataset;
      const match =
        (!category || d.categories.split(' ').includes(category)) &&
        (!status || d.status === status) &&
        (!service || d.service === service || d.service === 'both') &&
        terms.every((t) => d.search.includes(t));
      card.hidden = !match;
      if (match) shown++;
    }
    count.textContent = shown === cards.length ? `Showing all ${cards.length} projects` : `Showing ${shown} of ${cards.length} projects`;
    empty.hidden = shown !== 0;

    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (category) next.set('category', category);
    if (status) next.set('status', status);
    if (service) next.set('service', service);
    const qs = next.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  };

  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('submit', (e) => { e.preventDefault(); apply(); });
  form.addEventListener('reset', () => setTimeout(apply));
  document.querySelector('[data-clear]')?.addEventListener('click', () => { form.reset(); form.elements.q.focus(); });
  apply();
}
