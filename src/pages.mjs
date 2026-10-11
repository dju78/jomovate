// Page builders. Each returns { path, title, description, body, ... } for `page()` in layout.mjs.
import { esc, html, icon, projectLabels, statusBadge, picture, placeholder, projectCard, cta, breadcrumbs, STATUS_LABELS, TYPE_LABELS, ACCESS_LABELS, accessLabel, emailLink, waChat, waChannel } from './layout.mjs';
import { DRAFTS } from './whatsapp.mjs';

const PROCESS = [
  ['Understand', 'Clarify the problem, users and desired outcomes.'],
  ['Plan', 'Define the requirements, data needs and project scope.'],
  ['Build and validate', 'Develop the solution and check it against agreed requirements.'],
  ['Launch and support', 'Prepare handover and agree any ongoing support.'],
];

// Homepage service grid, in priority order: data services first, websites last.
const HOME_SERVICES = [
  ['Data Analytics & Insights', 'Turn raw data into useful evidence through data cleaning, statistical analysis, trend analysis and clear reporting.', 'data-analysis'],
  ['Dashboards & Business Intelligence', 'Track performance with interactive dashboards, KPI monitoring and automated reports that support everyday decisions.', 'data-analysis'],
  ['Research & Evaluation', 'Answer important questions through survey analysis, economic research and evaluation of outcomes and impact.', 'data-analysis'],
  ['Web & Mobile Applications', 'Develop custom web tools for desktop and mobile, including client portals, reporting systems, calculators, booking tools and business applications.', 'web-development'],
  ['Workflow Automation & Integration', 'Reduce repetitive administration, streamline data collection and connect tools to improve everyday workflows.', 'web-development'],
  ['Professional Websites', 'Create clear, accessible, mobile friendly websites that communicate services and help customers take action.', 'web-development'],
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
    title: 'Jomovate Digital Labs | Data analytics & digital product studio',
    description: 'Data analysis, dashboards and research, plus custom web applications, workflow automation and websites. A founder-led UK studio helping businesses and organisations turn data into decisions.',
    active: 'home',
    jsonLd: [orgLd(site), personLd(site)],
    body: html`
<section class="hero" aria-labelledby="hero-title">
  <div class="container">
    <div class="hero-copy">
      <p class="eyebrow">Jomovate Digital Labs · United Kingdom</p>
      <p class="hero-descriptor">Data Analytics &amp; Digital Product Studio</p>
      <h1 id="hero-title"><span>Data insights.</span> <span>Web &amp; mobile applications.</span> <span>Digital solutions that work.</span></h1>
      <p class="lead">We help businesses and organisations turn data into informed decisions and ideas into useful digital products. Our services span data analysis, interactive dashboards, custom applications, workflow automation and professional websites.</p>
      <div class="actions">
        <a class="btn btn-primary btn-lg" href="/work/">Explore our work</a>
        <a class="btn btn-secondary btn-lg" href="/contact/" data-track="cta_click" data-location="home-hero">Discuss your project</a>
      </div>
      <p class="hero-note">${count} projects in the portfolio, each with its status stated plainly: live, pilot or prototype.</p>
    </div>
  </div>
</section>

<section class="section section-tint" aria-labelledby="services-title">
  <div class="container">
    <div class="section-head section-head-row">
      <div>
        <p class="eyebrow">Services</p>
        <h2 id="services-title">From data to working software</h2>
        <p class="section-intro">Analysis and research come first. Applications and websites are built on the same evidence-led approach.</p>
      </div>
      <a class="btn btn-secondary" href="/services/">All services</a>
    </div>
    <div class="service-grid">${HOME_SERVICES.map(([t, d, slug]) => html`<article class="service-card">
      <h3><a href="/services/${slug}/">${esc(t)}</a></h3>
      <p>${esc(d)}</p>
    </article>`)}</div>
  </div>
</section>

<section class="section" aria-labelledby="work-title">
  <div class="container">
    <div class="section-head section-head-row">
      <div>
        <p class="eyebrow">Featured projects</p>
        <h2 id="work-title">Real products, real screenshots</h2>
        <p class="section-intro">Data and research tools first, then applications. Every entry states its status and links to the working site where one is available.</p>
      </div>
      <a class="btn btn-secondary" href="/work/">View all ${count} projects</a>
    </div>
    <div class="card-grid">${featured.map((p) => projectCard(p, categories))}</div>
  </div>
</section>

<section class="section section-tint" aria-labelledby="process-title">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">How we work</p>
      <h2 id="process-title">Four clear stages</h2>
      <p class="section-intro">Every engagement follows the same simple process, scaled to the size of the job.</p>
    </div>
    ${processList()}
  </div>
</section>

<section class="section" aria-labelledby="about-title">
  <div class="container founder">
    <img class="founder-photo" src="/img/founder-480.webp" srcset="/img/founder-480.webp 480w, /img/founder.webp 900w" sizes="(min-width: 800px) 320px, 70vw" width="480" height="480" alt="Daramola Joseph Omoyele" loading="lazy" decoding="async">
    <div>
      <p class="eyebrow">About Jomovate</p>
      <h2 id="about-title">${esc(site.founder.name)}</h2>
      <p>Jomovate is a founder-led studio. You work directly with Daramola, a data analyst and researcher with published work on economics and public policy, and a portfolio of web applications designed, built and run end to end.</p>
      <p>That mix means the analysis is statistically sound and the software is built around the people who will use it.</p>
      <p>Jomovate works with small businesses, charities and community groups, care and service providers, and teams with data they need to analyse. Typical projects range from survey analysis, reporting and dashboards to booking tools, client portals and websites that staff or volunteers can keep up to date.</p>
      <a class="text-link" href="/about/">About Jomovate and its founder ${icon.arrow}</a>
    </div>
  </div>
</section>

<div class="container" id="contact">${cta({ whatsapp: waChat(site, { where: 'home-cta' }) })}</div>
`,
  };
}

// ---------------------------------------------------------------- Services
const SERVICES = {
  web: {
    slug: 'web-development',
    title: 'Application and website development',
    short: 'Applications and websites',
    headline: 'Web applications, automation and websites that save time',
    audience: ['Small businesses that need a professional website or online booking', 'Charities and community groups that want a site volunteers can keep up to date', 'Teams replacing spreadsheets, paper forms or email chains with a simple web tool'],
    faq: [
      ['How much does a website or application cost?', 'Every project is quoted in writing after a short discovery conversation. No fixed prices are published because scope varies widely, from a few pages to a full booking system.'],
      ['How long will it take?', 'It depends on the scope. The timescale is agreed in the written scope before any work starts.'],
      ['Can you improve my existing website instead of rebuilding it?', 'Yes. Share the address and what is not working; sometimes targeted improvements are better value than a rebuild.'],
      ['What happens after launch?', 'You receive the files, access details and plain-English notes. Ongoing support, hosting help or updates are optional and agreed separately.'],
    ],
    description: 'Custom web applications that work on desktop and mobile, workflow automation, booking systems, client portals and professional websites for UK organisations.',
    intro: 'Web applications and websites that do a clear job: replace a paper or spreadsheet process, take bookings or enquiries, give customers a secure place to see their information, or explain what you offer. Applications are built for the web and work on desktop and mobile.',
    offers: [
      ['Web and mobile applications', 'Custom web tools that work on desktop and mobile: client portals, reporting systems, calculators, booking tools and business applications.'],
      ['Workflow automation and integration', 'Replace spreadsheets, email chains and paper forms with a single process, streamline data collection and connect the tools you already use.'],
      ['Booking and enquiry systems', 'Online booking, availability checks, quotes and approvals, with notifications and an admin area for your team.'],
      ['Customer portals', 'Secure sign-in areas where customers can see quotes, documents, progress or results.'],
      ['Professional websites', 'A clear, fast website that explains your services and helps customers take action. Mobile-friendly, accessible and set up for search engines.'],
      ['Support and improvements', 'Updates, fixes, hosting help and small improvements after launch, agreed separately.'],
    ],
    deliverables: ['Agreed sitemap or feature list', 'Responsive design tested on phone and desktop', 'Accessibility checks against WCAG 2.2 AA', 'Page titles, descriptions and social previews', 'Analytics or form handling where needed', 'Handover notes and all access credentials'],
    tools: ['HTML, CSS and JavaScript', 'React and Next.js', 'TypeScript', 'Node.js and Express', 'Supabase and PostgreSQL', 'Netlify and Vercel hosting'],
    need: ['Your logo and any brand guidance', 'Text and photos you already have (or help writing them)', 'Who needs access and what they should be able to do', 'Any existing domain, hosting or email accounts'],
  },
  data: {
    slug: 'data-analysis',
    title: 'Data analysis, dashboards and research',
    short: 'Data analysis and dashboards',
    headline: 'Data analysis, dashboards and research that answer your questions',
    audience: ['Organisations with spreadsheets or exports nobody has time to analyse', 'Managers who need a regular report or dashboard they can trust', 'Teams with survey results to clean, analyse and write up'],
    faq: [
      ['What data can you work with?', 'Spreadsheets (Excel, CSV), database exports and survey-platform exports are typical. If you are unsure, describe what you have and I will tell you what is feasible.'],
      ['How do you handle personal or sensitive data?', 'How data is shared and protected is agreed before anything is sent. Wherever possible I work with the minimum data needed or an anonymised extract.'],
      ['Do I need Power BI or Tableau licences?', 'Not necessarily. Dashboards can be built in a tool your organisation already uses, in Excel, or as a web dashboard; licensing is your choice.'],
      ['How much does it cost?', 'Every project is quoted in writing after a short discovery conversation. No fixed prices are published.'],
    ],
    description: 'Data cleaning, analysis in SQL, R, Python or Excel, Power BI and Tableau dashboards, survey analysis, research and evaluation, and automated reporting for UK organisations.',
    intro: 'Turn data you already hold into clear answers. I clean and check it, analyse it with the right method, and present the results in a report or dashboard your team can use without a statistics degree.',
    offers: [
      ['Data cleaning and quality checks', 'Find and fix duplicates, gaps, unit errors and inconsistent categories, with a record of every change.'],
      ['Analysis', 'Descriptive and statistical analysis in SQL, R, Python or Excel: trends, comparisons, drivers and forecasts, with assumptions stated.'],
      ['Dashboards', 'Power BI, Tableau or web dashboards built around the decisions your team makes each week.'],
      ['Survey analysis', 'Questionnaire data cleaned, weighted where appropriate, analysed and written up in plain English.'],
      ['Research and evaluation', 'Economic research and evaluation of outcomes and impact, with methods, assumptions and limitations stated.'],
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
    description: 'Data analysis, dashboards and research, and application and website development, for UK organisations. Clear scope, written quotes and direct contact with the founder.',
    active: 'services',
    jsonLd: [crumbLd(site, [{ label: 'Home', href: '/' }, { label: 'Services', href: '/services/' }])],
    body: html`
<section class="page-hero">
  <div class="container narrow">
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Services' }])}
    <p class="eyebrow">Services</p>
    <h1>Data analysis, applications and websites</h1>
    <p class="lead">Two core services, both delivered directly by the founder. You get a written scope and quote before any work starts, and the files and access at the end.</p>
  </div>
</section>
<section class="section">
  <div class="container">
    ${[['data', dataWork], ['web', webWork]].map(([k, work]) => {
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
<div class="container">${cta({ title: 'Not sure which service you need?', text: 'Describe the problem in a few sentences. I will suggest the simplest way to solve it, which is sometimes a spreadsheet, not software.' })}</div>
`,
  };
}

export function serviceDetail(key, { site, projects, categories }) {
  const s = SERVICES[key];
  const related = projects.filter((p) => p.service === key || p.service === 'both').slice(0, 6);
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Services', href: '/services/' }, { label: s.title, href: `/services/${s.slug}/` }];
  return {
    path: `/services/${s.slug}/`,
    title: `${s.title} for UK organisations`,
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
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: s.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
      crumbLd(site, crumbs),
    ],
    body: html`
<section class="page-hero">
  <div class="container narrow">
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'Services', href: '/services/' }, { label: s.title }])}
    <p class="eyebrow">${s.title}</p>
    <h1>${s.headline}</h1>
    <p class="lead">${s.intro}</p>
    <div class="actions">
      <a class="btn btn-primary btn-lg" href="/contact/?service=${key}" data-track="cta_click" data-location="service-hero-${key}">Discuss your project</a>
      ${waChat(site, { message: DRAFTS[key], where: `service-hero-${key}`, className: 'btn btn-whatsapp btn-lg' })}
      <a class="btn btn-secondary btn-lg" href="/contact/?service=${key}&amp;type=quote">Request a quote</a>
    </div>
  </div>
</section>
<section class="section section-tight">
  <div class="container">
    <div class="section-head"><p class="eyebrow">Who it is for</p><h2>Is this right for you?</h2></div>
    <ul class="ticks">${s.audience.map((a) => html`<li>${icon.check} ${a}</li>`)}</ul>
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
      <div><p class="eyebrow">Examples</p><h2>Related work</h2><p class="section-intro">Real projects with their status shown: live, pilot or prototype.</p></div>
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
<section class="section">
  <div class="container">
    <div class="section-head"><p class="eyebrow">Questions</p><h2>Frequently asked questions</h2></div>
    <div class="faq">${s.faq.map(([q, a]) => html`<details><summary>${q}</summary><p>${a}</p></details>`)}</div>
  </div>
</section>
<div class="container">${cta({ title: key === 'web' ? 'Ready to talk about your website?' : 'Have data you need to make sense of?', secondary: ['Request a quote', `/contact/?service=${key}&type=quote`], primary: ['Discuss your project', `/contact/?service=${key}`], whatsapp: waChat(site, { message: DRAFTS[key], where: `service-cta-${key}` }) })}</div>
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
    description: `${projects.length} data tools, applications and websites by Jomovate Digital Labs — searchable by sector and status, with honest live, pilot and prototype labels.`,
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
    <h1>Data tools, applications and websites</h1>
    <p class="lead">Everything here was designed and built by Jomovate's founder. Data and research projects come first, then applications, then websites. Each entry states whether it is a client project, an independent product or a concept, and its status: <strong>live</strong> (publicly available), <strong>pilot</strong> (in use by invited users), <strong>prototype</strong> (working but not a finished service) or <strong>in development</strong>. Some apps open at a sign-in page or are limited to invited pilot users; each entry says how it can be accessed.</p>
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
            <option value="data">Data analysis &amp; dashboards</option>
            <option value="web">Applications &amp; websites</option>
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
<div class="container">${cta({ title: 'Want something similar?', text: 'If one of these is close to what you need, mention it in your message. It helps me understand the scope quickly.' })}</div>
`,
  };
}

// ---------------------------------------------------------------- Case study
// Projects that are not openly usable get "Request a demonstration" rather than implying open access.
export const wantsDemo = (p) => ['pilot', 'in-development'].includes(p.status) || ['sign-in', 'invite-only', 'unavailable', 'demo-login'].includes(p.access);

const visitLabel = (p) =>
  ({ 'sign-in': 'Open sign-in page', 'invite-only': 'Open pilot sign-in', 'demo-login': 'Open demo (sign-in)' })[p.access] ||
  (p.status === 'archived' ? 'Visit archived site' : p.categories.includes('websites') ? 'Visit website' : 'Try it now');

export function caseStudy(p, { site, projects, categories, checkedOn }) {
  const cats = projectLabels(p, categories);
  const demo = wantsDemo(p);
  const svc = p.service === 'data' ? 'data' : 'web';
  const enquiry = `/contact/?service=${svc}&ref=${p.slug}${demo ? '&type=demo' : ''}`;
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
    title: `${p.title} | case study`,
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
          ${p.liveUrl ? html`<a class="btn btn-primary" href="${esc(p.liveUrl)}" rel="noopener"${p.liveNewTab ? ' target="_blank"' : ''}>${visitLabel(p)} ${icon.external}<span class="visually-hidden"> (opens ${esc(new URL(p.liveUrl).hostname)}${p.liveNewTab ? ' in a new tab' : ''})</span></a>` : ''}
          <a class="btn btn-secondary" href="${esc(enquiry)}" data-track="cta_click" data-location="case-hero">${demo ? 'Request a demonstration' : 'Discuss this project'}</a>
          ${p.publicSource ? html`<a class="btn btn-secondary" href="${esc(p.publicSource)}" rel="noopener">${icon.code} View source on GitHub</a>` : ''}
        </div>
      </div>
      <dl class="facts">
        <div><dt>Status</dt><dd>${statusBadge(p.status)} <span class="facts-note">${esc(p.statusNote)}</span></dd></div>
        <div><dt>Access</dt><dd>${accessLabel(p.access)}</dd></div>
        <div><dt>Type</dt><dd>${esc(TYPE_LABELS[p.type])}</dd></div>
        <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
        <div><dt>Built with</dt><dd><ul class="chip-list">${p.tech.map((t) => html`<li>${esc(t)}</li>`)}</ul></dd></div>
        <div><dt>Link checked</dt><dd>${esc(p.liveCheck)} <span class="facts-note">(${esc(formatDate(p.checkedOn || checkedOn))})</span></dd></div>
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
      ${p.usersCan ? html`<h2>What users can do</h2><ul class="ticks">${p.usersCan.map((u) => html`<li>${icon.check} ${esc(u)}</li>`)}</ul>` : ''}
      ${p.outcomes ? html`<h2>Results so far</h2><p>${esc(p.outcomes)}</p>` : ''}
      ${p.limitations.length ? html`<h2>Limitations and context</h2><ul class="plain-list">${p.limitations.map((l) => html`<li>${esc(l)}</li>`)}</ul>` : ''}
      ${p.ownerNote ? html`<h2>Who to contact</h2><p>${esc(p.ownerNote)}</p>` : ''}
    </div>
    <aside class="case-aside" aria-label="Related">
      <div class="aside-card">
        <p class="kicker">Need something like this?</p>
        <p>${p.service === 'data' ? 'I build analysis tools and dashboards for organisations with their own data.' : 'I build applications and websites like this for businesses and organisations.'}</p>
        <a class="btn btn-primary btn-block" href="/contact/?service=${svc}&amp;ref=${p.slug}" data-track="cta_click" data-location="case-aside">Discuss your project</a>
        ${waChat(site, { message: DRAFTS.project(p.title), where: 'case-aside', className: 'btn btn-whatsapp btn-block' })}
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
    description: `Jomovate Digital Labs is a founder-led UK studio run by ${site.founder.name}, a data analyst and researcher who builds dashboards, web applications and websites.`,
    active: 'about',
    ogType: 'profile',
    jsonLd: [orgLd(site), personLd(site), crumbLd(site, [{ label: 'Home', href: '/' }, { label: 'About', href: '/about/' }])],
    body: html`
<section class="page-hero">
  <div class="container narrow">
    ${breadcrumbs([{ label: 'Home', href: '/' }, { label: 'About' }])}
    <p class="eyebrow">About</p>
    <h1>A small studio with a research habit</h1>
    <p class="lead">Jomovate Digital Labs is a founder-led studio based in the United Kingdom. It builds its own products and takes on data, application and website projects for other organisations.</p>
  </div>
</section>
<section class="section">
  <div class="container founder">
    <img class="founder-photo" src="/img/founder.webp" srcset="/img/founder-480.webp 480w, /img/founder.webp 900w" sizes="(min-width: 800px) 360px, 80vw" width="900" height="900" alt="Daramola Joseph Omoyele" decoding="async">
    <div class="prose">
      <p class="eyebrow">Founder</p>
      <h2>${esc(site.founder.name)}</h2>
      <p>Daramola is a data analyst and researcher who also designs and builds software. Published work covers development economics, tax administration and digital governance, including peer-reviewed articles and responses to UK consultations by the ICO and HMRC. See <a href="/insights/">Insights</a>.</p>
      <p>Alongside that work, Daramola has designed, built and deployed the web applications in the <a href="/work/">portfolio</a>, ${live} of them publicly live, covering care quality, UK finance, analytics, automotive repair and community heritage.</p>
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
      <p>Some projects serve communities in Nigeria: a heritage website and quiz game for Kogi State, and published research on development economics. They are included because they show the same care for real users, not because Jomovate's services focus there; commercial work is focused on UK organisations.</p>
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
    ${proj ? html`<aside class="aside-card"><p class="kicker">Related project</p><p><a href="/work/${proj.slug}/">${esc(proj.title)}</a>: ${esc(proj.summary)}</p></aside>` : ''}
    <p class="back-link"><a class="text-link" href="/insights/">← All insights</a></p>
  </div>
</section>
</article>
<div class="container">${cta()}</div>
`,
  };
}

// ---------------------------------------------------------------- Contact
// Campaign parameters accepted from landing-page URLs and passed with an enquiry (see src/js/attribution.js).
export const ATTRIBUTION_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'landing_page'];

export function contact({ site }) {
  return {
    path: '/contact/',
    title: 'Contact | discuss your project',
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
    <p class="quick-contact">Prefer not to use the form? Email ${emailLink(site, 'contact-top')}${site.whatsapp?.chat ? html` or ${waChat(site, { where: 'contact-top', className: 'text-link' })}` : ''}.</p>
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
        ${ATTRIBUTION_FIELDS.map((f) => html`<input type="hidden" name="${f}" value="" data-attribution>`)}
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
        <div class="field">
          <label for="f-source">How did you hear about Jomovate? <span class="opt">(optional)</span></label>
          <select class="input" id="f-source" name="enquiry-source">
            <option value="">Prefer not to say</option>
            <option>Search engine</option>
            <option>Online advertisement</option>
            <option>LinkedIn</option>
            <option>WhatsApp</option>
            <option>Recommendation or referral</option>
            <option>Saw a Jomovate project</option>
            <option>Other</option>
          </select>
        </div>
        <p class="hint">Your details are used only to reply to this enquiry. If you arrived from an advert, the campaign name in the link is sent with your enquiry. See the <a href="/privacy/">privacy notice</a>.</p>
        <button class="btn btn-primary btn-lg" type="submit" data-submit>Send enquiry</button>
      </form>
    </div>
    <aside class="contact-aside">
      ${site.whatsapp?.chat ? html`<div class="aside-card">
        <p class="kicker">Prefer WhatsApp?</p>
        ${waChat(site, { where: 'contact', className: 'btn btn-whatsapp btn-block', note: true })}
        <p class="wa-note">The link shows Jomovate's business number. Please do not send confidential or personal data about other people.</p>
      </div>` : ''}
      <div class="aside-card">
        <p class="kicker">Prefer email?</p>
        <p>${emailLink(site, 'contact', { iconFirst: true })}</p>
        <p>Based in the ${esc(site.country)}.</p>
      </div>
      ${site.whatsapp?.channel ? html`<div class="aside-card">
        <p class="kicker">Stay up to date</p>
        <p>${waChannel(site, 'contact')}</p>
        <p class="wa-note">A WhatsApp channel for product updates and business news. Following it does not share your number with Jomovate.</p>
      </div>` : ''}
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
      <h1>Thank you. Your enquiry has been sent</h1>
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
      <p><strong>Enquiry form:</strong> the details you enter: name and email address, the service you are interested in and your project brief, and optionally your organisation, budget, timeframe and how you heard about Jomovate. If you reached the site from a link carrying campaign parameters (for example from an advert), those parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content and gclid) and the page you first landed on are sent with your enquiry so I can see which campaigns lead to enquiries. They are carried in the page address only; nothing is stored on your device.</p>
      <p><strong>Email:</strong> messages you send to ${site.email}, which is hosted by Google Workspace.</p>
      ${site.whatsapp?.chat || site.whatsapp?.channel ? html`<p><strong>WhatsApp:</strong> if you choose to message Jomovate on WhatsApp, your number and messages are handled by WhatsApp (Meta) under its own terms and privacy policy, and I see your number and what you send. The "Chat on WhatsApp" link opens WhatsApp with a short draft message; nothing is sent until you press send. Following the Jomovate WhatsApp channel does not share your phone number with Jomovate.</p>` : ''}
      <p><strong>No tracking:</strong> the site does not use cookies, analytics, advertising pixels or third-party fonts. The website host, Netlify, processes technical data such as IP addresses to deliver and secure the site, and records the IP address, browser details and referring page with each form submission to help filter spam.</p>
      <h2>Why and on what basis</h2>
      <p>Your details are used only to reply to your enquiry and, if you go ahead, to prepare a quote. Campaign information is used only to understand which advertising and referral routes produce enquiries. The lawful basis is legitimate interests in responding to a request you made, or steps taken at your request before entering into a contract.</p>
      <h2>Where it is stored</h2>
      <p>Form submissions are processed and stored by Netlify and forwarded by email to ${site.email} (Google Workspace). Netlify and Google may process data outside the UK under their own safeguards.</p>
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
