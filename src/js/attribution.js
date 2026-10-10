// Campaign attribution without cookies or storage: allow-listed parameters are read from the landing URL,
// carried in internal link URLs, and copied into the enquiry form's hidden fields. Pure functions; tested in Node.

export const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
const MAX = 100;

const clean = (key, value) => {
  const v = String(value ?? '').trim();
  if (!v) return '';
  if (key === 'gclid') return /^[A-Za-z0-9_-]{1,200}$/.test(v) ? v : '';
  return v.replace(/[^\p{L}\p{N} ._+:/|()-]/gu, '').slice(0, MAX).trim();
};

const cleanPath = (v) => (/^\/[A-Za-z0-9/_-]{0,99}$/.test(String(v ?? '')) ? v : '');

/** Returns only allow-listed, sanitised campaign values (plus landing_page) from a query string. */
export function pickAttribution(search, landingPath = '') {
  const params = new URLSearchParams(search);
  const out = {};
  for (const key of PARAMS) {
    const v = clean(key, params.get(key));
    if (v) out[key] = v;
  }
  if (!Object.keys(out).length) return {};
  out.landing_page = cleanPath(params.get('landing_page')) || cleanPath(landingPath);
  if (!out.landing_page) delete out.landing_page;
  return out;
}

/** Adds attribution to a same-site path (never to external, mailto or WhatsApp links). */
export function withAttribution(href, attribution) {
  if (!href || !href.startsWith('/') || href.startsWith('//') || !Object.keys(attribution).length) return href;
  const url = new URL(href, 'https://jomovate.com');
  for (const [k, v] of Object.entries(attribution)) if (!url.searchParams.has(k)) url.searchParams.set(k, v);
  return url.pathname + url.search + url.hash;
}

/**
 * Measurement hook. Pushes to window.dataLayer only if a tag manager has created it; otherwise does nothing.
 * No analytics or advertising tags are installed (see docs/MEASUREMENT.md).
 */
export function track(event, data = {}) {
  const w = typeof window === 'undefined' ? undefined : window;
  if (w && Array.isArray(w.dataLayer)) w.dataLayer.push({ event, ...data });
}
