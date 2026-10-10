// Mobile navigation, campaign-link carrying and contact-click hooks.
// Without JavaScript the menu simply stays visible (see .site-nav in site.css).
import { pickAttribution, withAttribution, track } from './attribution.js';

document.documentElement.classList.add('js');
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
  toggle.hidden = false;
  const set = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      set(false);
      toggle.focus();
    }
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  matchMedia('(min-width: 860px)').addEventListener('change', () => set(false));
}

// Keep campaign parameters (e.g. from an advert) on internal links so they reach the enquiry form.
const attribution = pickAttribution(location.search, location.pathname);
if (Object.keys(attribution).length) {
  for (const a of document.querySelectorAll('a[href^="/"]')) a.setAttribute('href', withAttribution(a.getAttribute('href'), attribution));
}

// A click on a contact route is recorded as a click only; a captured enquiry is a separate event (contact.js).
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-track]');
  if (el) track(el.dataset.track, { method: el.dataset.method || 'link', location: el.dataset.location || '' });
});
