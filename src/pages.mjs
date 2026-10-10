// Page builders. Each returns { path, title, description, body, ... } for `page()` in layout.mjs.
import { esc, html, icon, statusBadge, picture, placeholder, projectCard, cta, breadcrumbs, STATUS_LABELS, TYPE_LABELS } from './layout.mjs';

const PROCESS = [
  ['Discovery', 'A short conversation about what you need, who it is for and what you already have.'],
  ['Scope and quote', 'A written scope with deliverables, timings and a quote, agreed before work starts.'],
  ['Design or analysis', 'Wireframes and a working build, or data preparation and analysis, shared as it progresses.'],
  ['Review', 'You test and comment. Changes within the agreed scope are made before sign-off.'],
  ['Delivery', 'Launch, handover of files and access, and short documentation so you are not dependent on me.'],
  ['Support', 'Optional ongoing help with updates, fixes, hosting or refreshed reports, agreed separately.'],
];

const processList = () => html`<ol class="process">${PROCESS.map(([t, d], i) => html`<li><span class="process-step" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${d}</p></li>`)}</ol>`;

const orgLd = (site) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${site.url}/#organization`,
  name: site.name,
  alternateName: site.shortName,
  url: `${site.url}/`,
  logo: `${site.url}/img/brand/jomovate-logo.png`,
  email: site.email,
  areaServed: 'GB',
  founder: { '@id': `${site.url}/#founder` },
});

const personLd = (site) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${site.url}/#founder`,
  name: site.founder.name,
  jobTitle: 'Founder, Jomovate Digital Labs',
  url: `${site.url}/about/`,
  image: `${site.url}/img/founder.webp`,
  sameAs: [site.founder.portfolio, site.founder.research, site.founder.github, site.founder.orcid],
});

const crumbLd = (site, items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.label, item: site.url + it.href })),
});

// ---------------------------------------------------------------- Home
export function home({ site, projects, categories }) {
  const featured = projects.filter((p) => p.featured);
  const count = projects.length;
  return {
    path: '/',
    title: 'Jomovate Digital Labs — Websites, applications and data insight',
    description: 'Professional websites, practical web applications and clear data analysis for UK organisations. Founder-led studio with live products in care, finance, analytics and automotive.',
    active: 'home',
    jsonLd: [orgLd(site), personLd(site)],
    body: html`
<section class="hero">
  <div class="container hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">Jomovate Digital Labs · United Kingdom</p>
      <h1>Professional websites, practical applications and clear data insights.</h1>
      <p class="lead">I design and build websites and web applications that make everyday work easier, and turn spreadsheets and survey data into reports and dashboards people can act on.</p>
      <div class="actions">
        <a class="btn btn-primary btn-lg" href="/contact/">Discuss your project</a>
        <a class="btn btn-secondary btn-lg" href="/work/">View our work</a>
      </div>
      <p class="hero-note">${count} projects in the portfolio, each with its status stated plainly — live, pilot or prototype.</p>
    </div>
    <div class="hero-visual" aria-hidden="true">
      <div class="hero-shot hero-shot-back">${picture('care-quality-intelligence', '', { sizes: '(min-width: 900px) 480px, 90vw' })}</div>
      <div class="hero-shot hero-shot-front">${picture('ukcalc', '', { eager: true, sizes: '(min-width: 900px) 480px, 90vw' })}</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">What I do</p>
      <h2>Two services, one practical approach</h2>
    </div>
    <div class="grid-2">
      <article class="service-card">
        <h3><a href="/services/web-development/">Websites and applications</a></h3>
        <p>Business websites, booking and enquiry systems, customer portals and internal workflow tools — built to be fast, accessible and easy to maintain.</p>
        <ul class="ticks">
          <li>${icon.check} Business and organisation websites</li>
          <li>${icon.check} Booking, quoting and approval workflows</li>
          <li>${icon.check} Customer portals and dashboards</li>
          <li>${icon.check} Support, hosting help and updates</li>
        </ul>
        <a class="text-link" href="/services/web-development/">Website and application development ${icon.arrow}</a>
      </article>
      <article class="service-card">
        <h3><a href="/services/data-analysis/">Data analysis and dashboards</a></h3>
        <p>Clean, analyse and explain your data: from a one-off survey analysis to a dashboard your team checks every week.</p>
        <ul class="ticks">
          <li>${icon.check} Data cleaning and quality checks</li>
          <li>${icon.check} Analysis in SQL, R, Python or Excel</li>
          <li>${icon.check} Power BI and Tableau dashboards</li>
          <li>${icon.check} Survey analysis and automated reports</li>
        </ul>
        <a class="text-link" href="/services/data-analysis/">Data analysis and dashboards ${icon.arrow}</a>
      </article>
    </div>
  </div>
</section>

<section class="section section-tint">
  <div class="container">
    <div class="section-head section-head-row">
      <div>
        <p class="eyebrow">Selected work</p>
        <h2>Real products, real screenshots</h2>
        <p class="section-intro">A selection of live products, pilots and research tools. Every entry links to the working site where one is available.</p>
      </div>
      <a class="btn btn-secondary" href="/work/">View all ${count} projects</a>
    </div>
    <div class="card-grid">${featured.map((p) => projectCard(p, categories))}</div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">How a project runs</p>
      <h2>Clear steps, agreed in writing</h2>
      <p class="section-intro">Every engagement follows the same simple process, scaled to the size of the job.</p>
    </div>
    ${processList()}
  </div>
</section>

<section class="section section-tint">
  <div class="container founder">
    <img class="founder-photo" src="/img/founder-480.webp" srcset="/img/founder-480.webp 480w, /img/founder.webp 900w" sizes="(min-width: 800px) 320px, 70vw" width="480" height="480" alt="Daramola Joseph Omoyele" loading="lazy" decoding="async">
    <div>
      <p class="eyebrow">Who you will work with</p>
      <h2>${esc(site.founder.name)}</h2>
      <p>Jomovate is a founder-led studio. You work directly with Daramola — a data analyst and researcher with published work on economics and public policy, and a portfolio of web applications designed, built and run end to end.</p>
      <p>That mix means the analysis is statistically sound and the software is built around the people who will use it.</p>
      <a class="text-link" href="/about/">About Jomovate and its founder ${icon.arrow}</a>
    </div>
  </div>
</section>

<div class="container">${cta()}</div>
`,
  };
}

// ---------------------------------------------------------------- Services
const SERVICES = {
  web: {
    slug: 'web-development',
    title: 'Website and application development',
    short: 'Websites and applications',
    description: 'Business websites, booking systems, customer portals and workflow tools for UK organisations — accessible, fast and easy to maintain.',
    intro: 'Websites and web applications that do a clear job: explain what you offer, take bookings or enquiries, replace a paper or spreadsheet process, or give customers a secure place to see their information.',
    offers: [
      ['Business websites', 'A clear, fast website that explains your services and turns visitors into enquiries. Mobile-friendly, accessible and set up for search engines.'],
      ['Booking and enquiry systems', 'Online booking, availability checks, quotes and approvals, with notifications and an admin area for your team.'],
      ['Customer portals', 'Secure sign-in areas where customers can see quotes, documents, progress or results.'],
      ['Workflow tools', 'Internal applications that replace spreadsheets, email chains and paper forms with a single, auditable process.'],
      ['Support and improvements', 'Updates, fixes, hosting help and small improvements after launch, agreed separately.'],
    ],
    deliverables: ['Agreed sitemap or feature list', 'Responsive design tested on phone and desktop', 'Accessibility checks against WCAG 2.2 AA', 'Page titles, descriptions and social previews', 'Analytics or form handling where needed', 'Handover notes and all access credentials'],
    tools: ['HTML, CSS and JavaScript', 'React and Next.js', 'TypeScript', 'Node.js and Express', 'Supabase and PostgreSQL', 'Netlify and Vercel hosting'],
    need: ['Your logo and any brand guidance', 'Text and photos you already have (or help writing them)', 'Who needs access and what they should be able to do', 'Any existing domain, hosting or email accounts'],
  },
  data: {
    slug: 'data-analysis',
    title: 'Data analysis and dashboards',
    short: 'Data analysis and dashboards',
    description: 'Data cleaning, analysis in SQL, R, Python or Excel, Power BI and Tableau dashboards, survey analysis and automated reporting for UK organisations.',
    intro: 'Turn data you already hold into clear answers. I clean and check it, analyse it with the right method, and present the results in a report or dashboard your team can use without a statistics degree.',
    offers: [
      ['Data cleaning and quality checks', 'Find and fix duplicates, gaps, unit errors and inconsistent categories, with a record of every change.'],
      ['Analysis', 'Descriptive and statistical analysis in SQL, R, Python or Excel — trends, comparisons, drivers and forecasts, with assumptions stated.'],
      ['Dashboards', 'Power BI, Tableau or web dashboards built around the decisions your team makes each week.'],
      ['Survey analysis', 'Questionnaire data cleaned, weighted where appropriate, analysed and written up in plain English.'],
      ['Reporting automation', 'Recurring reports produced automatically from your data, so the numbers are consistent every month.'],
    ],
    deliverables: ['A short data-quality summary', 'Analysis with methods and assumptions stated', 'Charts that follow accessibility good practice', 'A written summary for non-specialists', 'Reusable code, queries or workbook', 'A walkthrough session on request'],
    tools: ['SQL', 'R', 'Python (pandas, statsmodels)', 'Excel', 'Power BI', 'Tableau', 'Streamlit'],
    need: ['The question you need answered', 'Access to the data, or a sample to start', 'Who will read the results', 'Any data-protection constraints (personal data stays out of shared samples)'],
  },
};

export function servicesIndex({ site, projects, categories }) {
  const webWork = projects.filter((p) => p.service !== 'data' && p.featured).slice(0, 3);
  const dataWork = projects.filter((p) => p.service !== 'web' && p.categories.includes('analytics')).slice(0, 3);
  return {
    path: '/services/',
    title: 'Services',
    description: 'Website and application development, and data analysis and dashboards, for UK organisations. Clear scope, written quotes and direct contact with the founder.',
    active: 'services',
    jsonLd: [crumbLd(site, [{ label: 'Home', href: '/' }, { label: 'Services', href: '/services/' }])],
    body: html`
<section class="page-hero">
  <div class="container narrow">
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Services' }])}
    <p class="eyebrow">Services</p>
    <h1>Websites, applications and data analysis</h1>
    <p class="lead">Two core services, both delivered directly by the founder. You get a written scope and quote before any work starts, and the files and access at the end.</p>
  </div>
</section>
<section class="section">
  <div class="container">
    ${[['web', webWork], ['data', dataWork]].map(([k, work]) => {
      const s = SERVICES[k];
      return html`<article class="service-overview">
        <div>
          <h2><a href="/services/${s.slug}/">${s.title}</a></h2>
          <p>${s.intro}</p>
          <ul class="ticks">${s.offers.map(([t]) => html`<li>${icon.check} ${t}</li>`)}</ul>
          <div class="actions"><a class="btn btn-primary" href="/services/${s.slug}/">Explore ${s.short.toLowerCase()}</a></div>
        </div>
        <div class="related-mini">
          <p class="kicker">Related work</p>
          <ul>${work.map((p) => html`<li><a href="/work/${p.slug}/">${esc(p.title)}</a> ${statusBadge(p.status)}</li>`)}</ul>
        </div>
      </article>`;
    })}
  </div>
</section>
<section class="section section-tint">
  <div class="container">
    <div class="section-head"><p class="eyebrow">Process</p><h2>How engagements work</h2></div>
    ${processList()}
    <p class="note">Prices depend on scope and are given as a written quote after discovery. No fixed prices are published.</p>
  </div>
</section>
<div class="container">${cta({ title: 'Not sure which service you need?', text: 'Describe the problem in a few sentences. I will suggest the simplest way to solve it — which is sometimes a spreadsheet, not software.' })}</div>
`,
  };
}

export function serviceDetail(key, { site, projects, categories }) {
  const s = SERVICES[key];
  const related = projects.filter((p) => p.service === key || p.service === 'both').slice(0, 6);
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Services', href: '/services/' }, { label: s.title, href: `/services/${s.slug}/` }];
  return {
    path: `/services/${s.slug}/`,
    title: s.title,
    description: s.description,
    active: 'services',
    ogImage: `/img/og/${related[0]?.slug || 'default'}.jpg`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: s.title,
        description: s.description,
        provider: { '@id': `${site.url}/#organization` },
        areaServed: 'GB',
        url: `${site.url}/services/${s.slug}/`,
      },
      crumbLd(site, crumbs),
    ],
    body: html`
<section class="page-hero">
  <div class="container narrow">
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Services', href: '/services/' }, { label: s.title }])}
    <p class="eyebrow">Service</p>
    <h1>${s.title}</h1>
    <p class="lead">${s.intro}</p>
    <div class="actions">
      <a class="btn btn-primary btn-lg" href="/contact/?service=${key}">Discuss your project</a>
      <a class="btn btn-secondary btn-lg" href="/contact/?service=${key}&amp;type=quote">Request a quote</a>
    </div>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section-head"><p class="eyebrow">What I can help with</p><h2>Typical projects</h2></div>
    <div class="offer-grid">${s.offers.map(([t, d]) => html`<div class="offer"><h3>${t}</h3><p>${d}</p></div>`)}</div>
  </div>
</section>
<section class="section section-tint">
  <div class="container grid-3-cols">
    <div><h2 class="h3">What you receive</h2><ul class="ticks">${s.deliverables.map((d) => html`<li>${icon.check} ${d}</li>`)}</ul></div>
    <div><h2 class="h3">Tools I use</h2><ul class="chip-list">${s.tools.map((t) => html`<li>${t}</li>`)}</ul></div>
    <div><h2 class="h3">What I will need from you</h2><ul class="plain-list">${s.need.map((d) => html`<li>${d}</li>`)}</ul></div>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section-head section-head-row">
      <div><p class="eyebrow">Evidence</p><h2>Related work</h2></div>
      <a class="btn btn-secondary" href="/work/?service=${key}">See all related work</a>
    </div>
    <div class="card-grid">${related.map((p) => projectCard(p, categories))}</div>
  </div>
</section>
<section class="section section-tint">
  <div class="container">
    <div class="section-head"><p class="eyebrow">Process</p><h2>How it works</h2></div>
    ${processList()}
  </div>
</section>
<div class="container">${cta({ secondary: ['Request a quote', `/contact/?service=${key}&type=quote`], primary: ['Discuss your project', `/contact/?service=${key}`] })}</div>
`,
  };
}

// ---------------------------------------------------------------- Work directory
export function workIndex({ site, projects, categories }) {
  const statusCounts = Object.keys(STATUS_LABELS).filter((s) => projects.some((p) => p.status === s));
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Work', href: '/work/' }];
  return {
    path: '/work/',
    title: 'Work and products',
    description: `${projects.length} websites, applications and data tools by Jomovate Digital Labs — searchable by sector and status, with honest live, pilot and prototype labels.`,
    active: 'work',
    scripts: ['/js/work-filter.js'],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Work and products',
        url: `${site.url}/work/`,
        hasPart: projects.map((p) => ({ '@type': 'CreativeWork', name: p.title, url: `${site.url}/work/${p.slug}/` })),
      },
      crumbLd(site, crumbs),
    ],
    body: html`
<section class="page-hero">
  <div class="container narrow">
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Work' }])}
    <p class="eyebrow">Work</p>
    <h1>Products, websites and research tools</h1>
    <p class="lead">Everything here was designed and built by Jomovate's founder. Each entry states its status: <strong>live</strong> (publicly usable), <strong>pilot</strong> (in use by invited users), <strong>prototype</strong> (working but not a finished service), <strong>in development</strong> or <strong>archived</strong>.</p>
  </div>
</section>
<section class="section section-tight">
  <div class="container">
    <form class="filters" role="search" aria-label="Filter projects" data-filters>
      <div class="field field-search">
        <label for="q">Search projects</label>
        <input id="q" name="q" type="search" class="input" placeholder="Try “dashboard”, “React” or “care”" autocomplete="off">
      </div>
      <fieldset class="field">
        <legend>Sector</legend>
        <div class="pill-group">
          <label class="pill"><input type="radio" name="category" value="" checked><span>All</span></label>
          ${Object.entries(categories).map(([k, v]) => html`<label class="pill"><input type="radio" name="category" value="${k}"><span>${esc(v)}</span></label>`)}
        </div>
      </fieldset>
      <div class="filter-row">
        <div class="field">
          <label for="status">Status</label>
          <select id="status" name="status" class="input">
            <option value="">Any status</option>
            ${statusCounts.map((s) => html`<option value="${s}">${STATUS_LABELS[s]}</option>`)}
          </select>
        </div>
        <div class="field">
          <label for="service">Service</label>
          <select id="service" name="service" class="input">
            <option value="">Any service</option>
            <option value="web">Websites &amp; applications</option>
            <option value="data">Data analysis &amp; dashboards</option>
          </select>
        </div>
        <button type="reset" class="btn btn-secondary">Clear filters</button>
      </div>
    </form>
    <p class="result-count" data-result-count aria-live="polite">Showing all ${projects.length} projects</p>
    <div class="card-grid" data-project-grid>${projects.map((p) => projectCard(p, categories, { headingLevel: 2 }))}</div>
    <p class="empty-state" data-empty hidden>No projects match those filters. <button type="button" class="link-button" data-clear>Clear filters</button></p>
  </div>
</section>
<div class="container">${cta({ title: 'Want something similar?', text: 'If one of these is close to what you need, mention it in your message — it helps me understand the scope quickly.' })}</div>
`,
  };
}

// ---------------------------------------------------------------- Case study
export function caseStudy(p, { site, projects, categories, checkedOn }) {
  const cats = p.categories.map((c) => categories[c]);
  const related = (p.relatedTo || []).map((s) => projects.find((x) => x.slug === s)).filter(Boolean);
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Work', href: '/work/' }, { label: p.title, href: `/work/${p.slug}/` }];
  const appLd = {
    '@context': 'https://schema.org',
    '@type': p.categories.includes('websites') ? 'WebSite' : 'SoftwareApplication',
    name: p.title,
    description: p.summary,
    url: p.liveUrl || `${site.url}/work/${p.slug}/`,
    creator: { '@id': `${site.url}/#founder` },
    ...(p.image ? { image: `${site.url}/img/projects/${p.slug}.webp` } : {}),
    ...(p.categories.includes('websites') ? {} : { applicationCategory: 'WebApplication', operatingSystem: 'Web browser' }),
  };
  return {
    path: `/work/${p.slug}/`,
    title: `${p.title} — case study`,
    description: p.summary,
    active: 'work',
    ogType: 'article',
    ogImage: p.image ? `/img/og/${p.slug}.jpg` : '/img/og/default.jpg',
    jsonLd: [appLd, crumbLd(site, crumbs)],
    body: html`
<article>
<section class="page-hero case-hero">
  <div class="container">
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Work', href: '/work/' }, { label: p.title }])}
    <div class="case-head">
      <div>
        <p class="eyebrow">${esc(cats.join(' · '))}</p>
        <h1>${esc(p.title)}</h1>
        <p class="lead">${esc(p.summary)}</p>
        <div class="actions">
          ${p.liveUrl ? html`<a class="btn btn-primary" href="${esc(p.liveUrl)}" rel="noopener">Visit ${p.status === 'pilot' || p.status === 'in-development' ? 'site' : 'live site'} ${icon.external}<span class="visually-hidden"> (opens ${esc(new URL(p.liveUrl).hostname)})</span></a>` : ''}
          ${p.publicSource ? html`<a class="btn btn-secondary" href="${esc(p.publicSource)}" rel="noopener">${icon.code} View source on GitHub</a>` : ''}
        </div>
      </div>
      <dl class="facts">
        <div><dt>Status</dt><dd>${statusBadge(p.status)} <span class="facts-note">${esc(p.statusNote)}</span></dd></div>
        <div><dt>Type</dt><dd>${esc(TYPE_LABELS[p.type])}</dd></div>
        <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
        <div><dt>Built with</dt><dd><ul class="chip-list">${p.tech.map((t) => html`<li>${esc(t)}</li>`)}</ul></dd></div>
        <div><dt>Link checked</dt><dd>${esc(p.liveCheck)} <span class="facts-note">(${esc(formatDate(checkedOn))})</span></dd></div>
      </dl>
    </div>
  </div>
</section>
${p.image ? html`<section class="section section-tight">
  <div class="container">
    <figure class="case-figure">
      ${picture(p.slug, p.imageAlt, { eager: true, sizes: '(min-width: 1200px) 1100px, 100vw' })}
      <figcaption>${esc(p.caption)}</figcaption>
    </figure>
  </div>
</section>` : ''}
<section class="section">
  <div class="container prose-grid">
    <div class="prose">
      <h2>The problem</h2>
      <p>${esc(p.problem)}</p>
      <h2>Who it is for</h2>
      <p>${esc(p.audience)}</p>
      <h2>What was built</h2>
      <p>${esc(p.solution)}</p>
      <h3>Key features</h3>
      <ul class="ticks">${p.features.map((f) => html`<li>${icon.check} ${esc(f)}</li>`)}</ul>
      <h2>Results so far</h2>
      <p>${esc(p.outcomes)}</p>
      ${p.limitations.length ? html`<h2>Limitations and context</h2><ul class="plain-list">${p.limitations.map((l) => html`<li>${esc(l)}</li>`)}</ul>` : ''}
    </div>
    <aside class="case-aside" aria-label="Related">
      <div class="aside-card">
        <p class="kicker">Need something like this?</p>
        <p>${p.service === 'data' ? 'I build analysis tools and dashboards for organisations with their own data.' : 'I build websites and applications like this for businesses and organisations.'}</p>
        <a class="btn btn-primary btn-block" href="/contact/?service=${p.service === 'data' ? 'data' : 'web'}&amp;ref=${p.slug}">Discuss your project</a>
        <a class="text-link" href="/services/${p.service === 'data' ? 'data-analysis' : 'web-development'}/">About this service ${icon.arrow}</a>
      </div>
      ${related.length ? html`<div class="aside-card"><p class="kicker">Related projects</p><ul class="plain-list">${related.map((r) => html`<li><a href="/work/${r.slug}/">${esc(r.title)}</a></li>`)}</ul></div>` : ''}
    </aside>
  </div>
</section>
<div class="container"><p class="back-link"><a class="text-link" href="/work/">← All work</a></p></div>
</article>
`,
  };
}

// ---------------------------------------------------------------- About
export function about({ site, projects }) {
  const live = projects.filter((p) => p.status === 'live').length;
  return {
    path: '/about/',
    title: 'About Jomovate and its founder',
    description: `Jomovate Digital Labs is a founder-led UK studio run by ${site.founder.name}, a data analyst and researcher who builds websites, web applications and dashboards.`,
    active: 'about',
    ogType: 'profile',
    jsonLd: [orgLd(site), personLd(site), crumbLd(site, [{ label: 'Home', href: '/' }, { label: 'About', href: '/about/' }])],
    body: html`
<section class="page-hero">
  <div class="container narrow">
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'About' }])}
    <p class="eyebrow">About</p>
    <h1>A small studio with a research habit</h1>
    <p class="lead">Jomovate Digital Labs is a founder-led studio based in the United Kingdom. It builds its own products and takes on website, application and data projects for other organisations.</p>
  </div>
</section>
<section class="section">
  <div class="container founder">
    <img class="founder-photo" src="/img/founder.webp" srcset="/img/founder-480.webp 480w, /img/founder.webp 900w" sizes="(min-width: 800px) 360px, 80vw" width="900" height="900" alt="Daramola Joseph Omoyele" decoding="async">
    <div class="prose">
      <p class="eyebrow">Founder</p>
      <h2>${esc(site.founder.name)}</h2>
      <p>Daramola is a data analyst and researcher who also designs and builds software. Published work covers development economics, tax administration and digital governance, including peer-reviewed articles and responses to UK consultations by the ICO and HMRC — see <a href="/insights/">Insights</a>.</p>
      <p>Alongside that work, Daramola has designed, built and deployed the web applications in the <a href="/work/">portfolio</a> — ${live} of them publicly live — covering care quality, UK finance, analytics, automotive repair and community heritage.</p>
      <div class="actions">
        <a class="btn btn-secondary" href="${site.founder.portfolio}" rel="me noopener">Founder portfolio ${icon.external}</a>
        <a class="btn btn-secondary" href="${site.founder.research}" rel="me noopener">Research and publications ${icon.external}</a>
      </div>
    </div>
  </div>
</section>
<section class="section section-tint">
  <div class="container">
    <div class="section-head"><p class="eyebrow">How Jomovate works</p><h2>What you can expect</h2></div>
    <div class="offer-grid">
      <div class="offer"><h3>Direct contact</h3><p>You deal with the person doing the work. There is no account manager and no hand-off to an unnamed team.</p></div>
      <div class="offer"><h3>Honest scope</h3><p>If a spreadsheet, an off-the-shelf tool or a smaller project would serve you better, I will say so.</p></div>
      <div class="offer"><h3>Evidence over claims</h3><p>Every portfolio entry shows its real status and links to the working product where one exists.</p></div>
      <div class="offer"><h3>Built to hand over</h3><p>You receive the code, files, access and plain-English notes, so you are not locked in.</p></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="container grid-2">
    <div>
      <h2 class="h3">Skills used day to day</h2>
      <ul class="chip-list">${['Statistical analysis', 'Econometrics', 'SQL', 'R', 'Python', 'Excel', 'Power BI', 'Tableau', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Supabase', 'Streamlit'].map((s) => html`<li>${s}</li>`)}</ul>
    </div>
    <div>
      <h2 class="h3">Beyond the UK</h2>
      <p>Some projects serve communities in Nigeria — a heritage website and quiz game for Kogi State, and published research on development economics. They are included because they show the same care for real users, not because Jomovate's services focus there; commercial work is focused on UK organisations.</p>
    </div>
  </div>
</section>
<div class="container">${cta({ title: 'Want to know if we are a good fit?', text: 'Send a short description of what you are working on. I will be direct about where I can help and where I cannot.' })}</div>
`,
  };
}

// ---------------------------------------------------------------- Insights
export function insightsIndex({ site, insights }) {
  return {
    path: '/insights/',
    title: 'Insights',
    description: 'Practical notes from Jomovate projects on data quality, fair metrics and building useful tools, plus the founder’s published research and policy submissions.',
    active: 'insights',
    jsonLd: [crumbLd(site, [{ label: 'Home', href: '/' }, { label: 'Insights', href: '/insights/' }])],
    body: html`
<section class="page-hero">
  <div class="container narrow">
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Insights' }])}
    <p class="eyebrow">Insights</p>
    <h1>Notes from the work</h1>
    <p class="lead">Short, practical articles drawn from real projects, and research by Jomovate's founder.</p>
  </div>
</section>
<section class="section section-tight">
  <div class="container">
    <h2>Articles</h2>
    <div class="article-list">${insights.articles.map((a) => html`<article class="article-card">
      <p class="kicker"><time datetime="${a.date}">${formatDate(a.date)}</time></p>
      <h3><a href="/insights/${a.slug}/">${esc(a.title)}</a></h3>
      <p>${esc(a.summary)}</p>
    </article>`)}</div>
  </div>
</section>
<section class="section">
  <div class="container">
    <h2>Research and policy contributions</h2>
    <p class="section-intro">Selected publications by ${esc(site.founder.name)}. The full list is on the <a href="${site.founder.research}" rel="noopener">research site</a>.</p>
    <ul class="pub-list">${insights.publications.map((p) => html`<li>
      <p class="kicker">${esc(p.kind)}</p>
      <a href="${esc(p.url)}" rel="noopener">${esc(p.title)} ${icon.external}</a>
      <p>${esc(p.venue)}</p>
    </li>`)}</ul>
  </div>
</section>
<div class="container">${cta()}</div>
`,
  };
}

export function insightArticle(a, { site, projects }) {
  const proj = projects.find((p) => p.slug === a.project);
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Insights', href: '/insights/' }, { label: a.title, href: `/insights/${a.slug}/` }];
  return {
    path: `/insights/${a.slug}/`,
    title: a.title,
    description: a.summary,
    active: 'insights',
    ogType: 'article',
    ogImage: proj?.image ? `/img/og/${proj.slug}.jpg` : '/img/og/default.jpg',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: a.title,
        description: a.summary,
        datePublished: a.date,
        author: { '@id': `${site.url}/#founder`, name: site.founder.name },
        publisher: { '@id': `${site.url}/#organization` },
        mainEntityOfPage: `${site.url}/insights/${a.slug}/`,
      },
      crumbLd(site, crumbs),
    ],
    body: html`
<article>
<section class="page-hero">
  <div class="container narrow">
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Insights', href: '/insights/' }, { label: a.title }])}
    <p class="eyebrow"><time datetime="${a.date}">${formatDate(a.date)}</time> · ${esc(site.founder.name)}</p>
    <h1>${esc(a.title)}</h1>
    <p class="lead">${esc(a.summary)}</p>
  </div>
</section>
<section class="section section-tight">
  <div class="container narrow prose">
    ${a.body.map((b) => (b.h2 ? html`<h2>${esc(b.h2)}</h2>` : b.ul ? html`<ul>${b.ul.map((li) => html`<li>${esc(li)}</li>`)}</ul>` : html`<p>${esc(b.p)}</p>`))}
    ${proj ? html`<aside class="aside-card"><p class="kicker">Related project</p><p><a href="/work/${proj.slug}/">${esc(proj.title)}</a> — ${esc(proj.summary)}</p></aside>` : ''}
    <p class="back-link"><a class="text-link" href="/insights/">← All insights</a></p>
  </div>
</section>
</article>
<div class="container">${cta()}</div>
`,
  };
}

// ---------------------------------------------------------------- Contact
export function contact({ site }) {
  return {
    path: '/contact/',
    title: 'Contact — discuss your project',
    description: 'Tell Jomovate about your website, application or data project. Share a short brief and receive questions or a written quote.',
    active: 'contact',
    scripts: ['/js/contact.js'],
    jsonLd: [crumbLd(site, [{ label: 'Home', href: '/' }, { label: 'Contact', href: '/contact/' }])],
    body: html`
<section class="page-hero">
  <div class="container narrow">
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Contact' }])}
    <p class="eyebrow">Contact</p>
    <h1>Discuss your project</h1>
    <p class="lead">A short description is enough to start. I will reply by email with questions or suggested next steps.</p>
  </div>
</section>
<section class="section section-tight">
  <div class="container contact-grid">
    <div class="form-card">
      <div data-form-status tabindex="-1"></div>
      <form name="${site.formName}" method="POST" action="/contact/thanks/" data-netlify="true" netlify-honeypot="company-website" novalidate data-enquiry-form>
        <input type="hidden" name="form-name" value="${site.formName}">
        <p class="visually-hidden" aria-hidden="true"><label>Leave this empty <input name="company-website" tabindex="-1" autocomplete="off"></label></p>
        <input type="hidden" name="enquiry-type" value="discussion" data-enquiry-type>
        <input type="hidden" name="referring-project" value="" data-referring-project>
        <div class="error-summary" data-error-summary tabindex="-1" hidden>
          <h2 class="h4">Please check the form</h2>
          <ul></ul>
        </div>
        <div class="form-row">
          <div class="field">
            <label for="f-name">Name <span class="req">(required)</span></label>
            <input class="input" id="f-name" name="name" autocomplete="name" required maxlength="120" aria-describedby="f-name-error">
            <p class="field-error" id="f-name-error" hidden></p>
          </div>
          <div class="field">
            <label for="f-email">Email <span class="req">(required)</span></label>
            <input class="input" id="f-email" name="email" type="email" autocomplete="email" required maxlength="200" aria-describedby="f-email-error">
            <p class="field-error" id="f-email-error" hidden></p>
          </div>
        </div>
        <div class="field">
          <label for="f-org">Organisation <span class="opt">(optional)</span></label>
          <input class="input" id="f-org" name="organisation" autocomplete="organization" maxlength="160">
        </div>
        <div class="field">
          <label for="f-service">Service <span class="req">(required)</span></label>
          <select class="input" id="f-service" name="service" required aria-describedby="f-service-error">
            <option value="">Choose one</option>
            <option value="Website or web application">Website or web application</option>
            <option value="Data analysis or dashboard">Data analysis or dashboard</option>
            <option value="Not sure yet">Not sure yet</option>
          </select>
          <p class="field-error" id="f-service-error" hidden></p>
        </div>
        <div class="field">
          <label for="f-brief">Project brief <span class="req">(required)</span></label>
          <p class="hint" id="f-brief-hint">What do you need, who is it for, and is there anything already in place? Please do not include confidential or personal data about other people.</p>
          <textarea class="input" id="f-brief" name="brief" rows="6" required minlength="20" maxlength="5000" aria-describedby="f-brief-hint f-brief-error"></textarea>
          <p class="field-error" id="f-brief-error" hidden></p>
        </div>
        <div class="form-row">
          <div class="field">
            <label for="f-budget">Budget <span class="opt">(optional)</span></label>
            <select class="input" id="f-budget" name="budget">
              <option value="">Prefer not to say</option>
              <option>Under £1,000</option>
              <option>£1,000 – £3,000</option>
              <option>£3,000 – £7,500</option>
              <option>Over £7,500</option>
              <option>Not sure yet</option>
            </select>
          </div>
          <div class="field">
            <label for="f-timeframe">Timeframe <span class="opt">(optional)</span></label>
            <select class="input" id="f-timeframe" name="timeframe">
              <option value="">No fixed date</option>
              <option>Within a month</option>
              <option>1 – 3 months</option>
              <option>3 – 6 months</option>
              <option>Just exploring</option>
            </select>
          </div>
        </div>
        <p class="hint">Your details are used only to reply to this enquiry. See the <a href="/privacy/">privacy notice</a>.</p>
        <button class="btn btn-primary btn-lg" type="submit" data-submit>Send enquiry</button>
      </form>
    </div>
    <aside class="contact-aside">
      <div class="aside-card">
        <p class="kicker">Prefer email?</p>
        <p><a href="mailto:${site.email}">${icon.mail} ${site.email}</a></p>
        <p>Based in the ${esc(site.country)}.</p>
      </div>
      <div class="aside-card">
        <p class="kicker">What happens next</p>
        <ol class="mini-process">${PROCESS.map(([t, d]) => html`<li><strong>${t}.</strong> ${d}</li>`)}</ol>
      </div>
    </aside>
  </div>
</section>
`,
  };
}

export function contactThanks({ site }) {
  return {
    path: '/contact/thanks/',
    title: 'Enquiry sent',
    description: 'Thank you for your enquiry.',
    noindex: true,
    body: html`<section class="page-hero"><div class="container narrow">
      <h1>Thank you — your enquiry has been sent</h1>
      <p class="lead">I will read it and reply by email. If you do not hear back, please write to <a href="mailto:${site.email}">${site.email}</a>.</p>
      <p><a class="btn btn-secondary" href="/work/">View our work</a></p>
    </div></section>`,
  };
}

export function privacy({ site }) {
  return {
    path: '/privacy/',
    title: 'Privacy notice',
    description: 'How Jomovate Digital Labs handles information you send through this website.',
    body: html`<section class="page-hero"><div class="container narrow">
      ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Privacy' }])}
      <h1>Privacy notice</h1>
      <p class="lead">This notice explains what happens to information you send through jomovate.com.</p>
    </div></section>
    <section class="section section-tight"><div class="container narrow prose">
      <h2>Who is responsible</h2>
      <p>This website is operated by ${esc(site.founder.name)} under the name Jomovate Digital Labs, in the ${esc(site.country)}. Contact: <a href="mailto:${site.email}">${site.email}</a>.</p>
      <h2>What is collected</h2>
      <p>If you use the enquiry form, the details you enter: name, email address, and optionally your organisation, budget, timeframe and project brief. The site does not use advertising or analytics cookies.</p>
      <h2>Why and on what basis</h2>
      <p>Your details are used only to reply to your enquiry and, if you go ahead, to prepare a quote. The lawful basis is legitimate interests in responding to a request you made, or steps taken at your request before entering into a contract.</p>
      <h2>Where it is stored</h2>
      <p>Form submissions are processed and stored by Netlify, the website host, and delivered by email. Netlify may process data outside the UK under its own safeguards.</p>
      <h2>How long it is kept</h2>
      <p>Enquiries are kept only as long as needed to respond and follow up. If work goes ahead, related records are kept as required for tax and accounting.</p>
      <h2>Your rights</h2>
      <p>You can ask to see, correct or delete your information by emailing <a href="mailto:${site.email}">${site.email}</a>. You can also complain to the Information Commissioner's Office at <a href="https://ico.org.uk/" rel="noopener">ico.org.uk</a>.</p>
      <h2>Linked products</h2>
      <p>Products linked from the portfolio are separate sites with their own terms and privacy information.</p>
    </div></section>`,
  };
}

export function notFound() {
  return {
    path: '/404.html',
    title: 'Page not found',
    description: 'The page you were looking for could not be found.',
    noindex: true,
    body: html`<section class="page-hero"><div class="container narrow">
      <p class="eyebrow">404</p>
      <h1>That page could not be found</h1>
      <p class="lead">It may have moved when the site was reorganised. Try one of these instead:</p>
      <div class="actions"><a class="btn btn-primary" href="/">Home</a><a class="btn btn-secondary" href="/work/">Work</a><a class="btn btn-secondary" href="/services/">Services</a><a class="btn btn-secondary" href="/contact/">Contact</a></div>
    </div></section>`,
  };
}

export function formatDate(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
