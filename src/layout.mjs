// Shared HTML helpers and the page shell (head, header, footer).
// Pages are plain template literals; everything user-visible is escaped with `esc`.

export const esc = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const html = (strings, ...values) =>
  strings.reduce((out, str, i) => out + str + (i < values.length ? flat(values[i]) : ''), '');

const flat = (v) => (Array.isArray(v) ? v.join('') : v == null || v === false ? '' : String(v));

const NAV = [
  { href: '/work/', label: 'Work', key: 'work' },
  { href: '/services/', label: 'Services', key: 'services' },
  { href: '/about/', label: 'About', key: 'about' },
  { href: '/insights/', label: 'Insights', key: 'insights' },
];

import { waLink, DRAFTS } from './whatsapp.mjs';

export const STATUS_LABELS = {
  live: 'Live',
  pilot: 'Pilot',
  prototype: 'Prototype',
  'in-development': 'In development',
  archived: 'Archived',
};

export const TYPE_LABELS = {
  'own-product': 'Own product',
  research: 'Independent research',
  client: 'Client work',
  community: 'Community project',
  concept: 'Concept',
};

// How a visitor can reach each portfolio entry. Shown on cards and case studies so nothing implies open access it doesn't have.
export const ACCESS_LABELS = {
  open: 'Open to try',
  'demo-login': 'Demo sign-in provided',
  'sign-in': 'Account sign-in required',
  'invite-only': 'Invited pilot users only',
  unavailable: 'Demo currently unavailable',
};

export function accessLabel(access) {
  return html`<span class="access${access === 'open' ? ' access-open' : ''}">${esc(ACCESS_LABELS[access] || access)}</span>`;
}

export const icon = {
  arrow: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  external: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
  code: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>',
  check: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  mail: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  chat: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>',
  bell: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
};

/** Email link with a click hook (a click is not an enquiry; see docs/MEASUREMENT.md). */
export function emailLink(site, where, { iconFirst = false } = {}) {
  return html`<a href="mailto:${site.email}" data-track="contact_click" data-method="email" data-location="${esc(where)}">${iconFirst ? `${icon.mail} ` : ''}${site.email}</a>`;
}

/**
 * "Chat on WhatsApp" button. Renders nothing unless a valid business number is configured.
 * The draft text is generic (never visitor input) and is only pre-filled — WhatsApp does not send it automatically.
 */
export function waChat(site, { message = DRAFTS.general, where, className = 'btn btn-whatsapp', note = false } = {}) {
  const chat = site.whatsapp?.chat;
  if (!chat) return '';
  return html`<a class="${className}" href="${esc(waLink(chat.digits, message))}" rel="noopener" data-track="contact_click" data-method="whatsapp" data-location="${esc(where)}">${icon.chat} Chat on WhatsApp<span class="visually-hidden"> (opens WhatsApp with a draft message; nothing is sent until you press send)</span></a>${note ? html`<p class="wa-note">Opens WhatsApp with a short draft. Nothing is sent until you press send.</p>` : ''}`;
}

/** Secondary "follow" link for the WhatsApp channel. Renders nothing unless a valid channel URL is configured. */
export function waChannel(site, where) {
  const channel = site.whatsapp?.channel;
  if (!channel) return '';
  return html`<a class="channel-link" href="${esc(channel.url)}" rel="noopener" data-track="channel_click" data-method="whatsapp_channel" data-location="${esc(where)}">${icon.bell} Follow Jomovate on WhatsApp</a>`;
}

export function statusBadge(status) {
  return html`<span class="badge badge-${esc(status)}">${esc(STATUS_LABELS[status] || status)}</span>`;
}

export function picture(slug, alt, { eager = false, sizes = '(min-width: 1100px) 360px, (min-width: 700px) 45vw, 100vw' } = {}) {
  const base = `/img/projects/${slug}`;
  return html`<img src="${base}-640.webp" srcset="${base}-640.webp 640w, ${base}.webp 1200w" sizes="${sizes}" width="1200" height="750" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
}

export function placeholder(title, reason = 'No public screenshot') {
  const initials = title
    .replace(/\(.*?\)/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  return html`<div class="shot-placeholder" role="img" aria-label="${esc(`${title}: ${reason}`)}"><span>${esc(initials)}</span><small>${esc(reason)}</small></div>`;
}

export function projectCard(p, categories, { headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  const cats = p.categories.map((c) => categories[c]).join(' · ');
  const search = [p.title, p.summary, p.solution, p.features.join(' '), cats, p.tech.join(' '), TYPE_LABELS[p.type], STATUS_LABELS[p.status]].join(' ').toLowerCase();
  return html`<article class="project-card" data-categories="${esc(p.categories.join(' '))}" data-status="${esc(p.status)}" data-service="${esc(p.service)}" data-search="${esc(search)}">
    <a class="project-card-media" href="/work/${p.slug}/" tabindex="-1" aria-hidden="true">${p.image ? picture(p.slug, '') : placeholder(p.title, p.noImageReason)}</a>
    <div class="project-card-body">
      <div class="project-card-meta">${statusBadge(p.status)}<span class="kicker">${esc(cats)}</span></div>
      <${h} class="project-card-title"><a href="/work/${p.slug}/">${esc(p.title)}</a></${h}>
      <p>${esc(p.summary)}</p>
      <p class="access-row">${accessLabel(p.access)}</p>
      <p class="project-card-type">${esc(TYPE_LABELS[p.type])}</p>
    </div>
  </article>`;
}

export function cta({ title = 'Have a project in mind?', text = 'Tell me what you need and where you are starting from. I will reply with questions or next steps — no obligation.', primary = ['Discuss your project', '/contact/'], secondary = ['Request a quote', '/contact/?type=quote'], whatsapp = '' } = {}) {
  return html`<section class="cta-band" aria-labelledby="cta-title">
    <div>
      <h2 id="cta-title">${esc(title)}</h2>
      <p>${esc(text)}</p>
    </div>
    <div class="actions">
      <a class="btn btn-primary" href="${primary[1]}" data-track="cta_click" data-location="cta-band">${esc(primary[0])}</a>
      ${whatsapp}
      ${secondary ? html`<a class="btn btn-secondary" href="${secondary[1]}">${esc(secondary[0])}</a>` : ''}
    </div>
  </section>`;
}

export function breadcrumbs(items) {
  return html`<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items.map((it, i) =>
    i === items.length - 1
      ? html`<li><span aria-current="page">${esc(it.label)}</span></li>`
      : html`<li><a href="${it.href}">${esc(it.label)}</a></li>`
  )}</ol></nav>`;
}

export function page({ site, assets, path, title, description, body, active = '', ogImage = '/img/og/default.jpg', ogType = 'website', jsonLd = [], scripts = [], noindex = false }) {
  const url = site.url + path;
  const fullTitle = path === '/' ? title : `${title} | ${site.shortName}`;
  const ld = jsonLd.filter(Boolean);
  return html`<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${site.url}${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${site.url}${ogImage}">
<meta name="theme-color" content="#f5ead8">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/figtree-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/caprasimo-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assets.css}">
${ld.map((obj) => html`<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>\n`)}
<script type="module" src="${assets.js}"></script>
${scripts.map((s) => html`<script type="module" src="${s}"></script>`)}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="${esc(site.name)} home">
      <img src="/img/brand/jomovate-logo.webp" width="157" height="34" alt="Jomovate">
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" hidden>
      <span class="nav-toggle-bars" aria-hidden="true"></span><span class="visually-hidden">Menu</span>
    </button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      <ul>
        ${NAV.map((n) => html`<li><a href="${n.href}"${active === n.key ? ' aria-current="page"' : ''}>${n.label}</a></li>`)}
        <li><a class="btn btn-primary btn-sm" href="/contact/"${active === 'contact' ? ' aria-current="page"' : ''} data-track="cta_click" data-location="header">Discuss your project</a></li>
      </ul>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <p class="footer-brand">Jomovate Digital Labs</p>
      <p>Websites, practical applications and data analysis for UK organisations. Founder-led by ${esc(site.founder.name)}.</p>
      <div class="footer-contact">
        ${emailLink(site, 'footer', { iconFirst: true })}
        ${waChat(site, { where: 'footer', className: '' })}
        ${site.whatsapp?.channel ? html`<span>${waChannel(site, 'footer')}<span class="wa-note"> — product updates and business news</span></span>` : ''}
        <span>${esc(site.country)}</span>
      </div>
    </div>
    <div>
      <p class="footer-heading">Services</p>
      <ul>
        <li><a href="/services/web-development/">Websites &amp; applications</a></li>
        <li><a href="/services/data-analysis/">Data analysis &amp; dashboards</a></li>
        <li><a href="/contact/?type=quote">Request a quote</a></li>
      </ul>
    </div>
    <div>
      <p class="footer-heading">Explore</p>
      <ul>
        <li><a href="/work/">Work</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="/insights/">Insights</a></li>
        <li><a href="/contact/">Contact</a></li>
      </ul>
    </div>
    <div>
      <p class="footer-heading">Elsewhere</p>
      <ul>
        <li><a href="${site.founder.portfolio}" rel="me">Founder portfolio</a></li>
        <li><a href="${site.founder.research}" rel="me">Research &amp; publications</a></li>
        <li><a href="${site.founder.github}" rel="me">GitHub</a></li>
        <li><a href="/privacy/">Privacy</a></li>
      </ul>
    </div>
  </div>
  <div class="container footer-base">
    <p>© ${new Date().getFullYear()} Jomovate Digital Labs. Independent products and prototypes are not endorsed by any regulator or public body unless stated.</p>
  </div>
</footer>
</body>
</html>
`;
}
