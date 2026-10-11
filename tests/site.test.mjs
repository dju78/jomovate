// Build-level checks: run with `npm test` (Node 20+, no dependencies).
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync, mkdtempSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { validateProjects, LEGACY_REDIRECTS, REMOVED_PROJECT_REDIRECTS } from '../scripts/build.mjs';
import { projectGroup } from '../src/layout.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = mkdtempSync(join(tmpdir(), 'jomovate-site-'));
const data = JSON.parse(readFileSync(join(root, 'content/projects.json'), 'utf8'));
const published = data.projects.filter((p) => p.published);

const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
let htmlFiles = [];
const read = (rel) => readFileSync(join(out, rel), 'utf8');

before(() => {
  execFileSync(process.execPath, [join(root, 'scripts/build.mjs'), '--out', out, '--no-local-env'], { stdio: 'pipe', env: { ...process.env, WHATSAPP_NUMBER: '', WHATSAPP_CHANNEL_URL: '' } });
  htmlFiles = walk(out).filter((f) => f.endsWith('.html'));
});

test('project data is valid', () => {
  assert.deepEqual(validateProjects(data), []);
});

test('validator rejects private or malformed source links and unapproved client work', () => {
  const bad = {
    categories: data.categories,
    projects: [{ ...published[0], slug: 'x', publicSource: 'https://github.com/dju78/private-thing/tree/main' }, { ...published[0], slug: 'y', type: 'client' }],
  };
  const errors = validateProjects(bad);
  assert.ok(errors.some((e) => e.includes('publicSource')));
  assert.ok(errors.some((e) => e.includes('clientApproved')));
});

test('every published project has a case-study page and appears in the directory', () => {
  const work = read('work/index.html');
  for (const p of published) {
    assert.ok(existsSync(join(out, 'work', p.slug, 'index.html')), `missing page for ${p.slug}`);
    assert.ok(work.includes(`href="/work/${p.slug}/"`), `${p.slug} missing from /work/`);
  }
  assert.equal((work.match(/class="project-card"/g) || []).length, published.length);
});

test('private repositories are never linked as source', () => {
  const privateRepos = ['gacebolt', 'Nairadetect', 'tax-report-ng', 'car_garage', 'car_-repair_clau', 'Price_quality_explorer', 'takete-ide-reporting-hub', 'apeke_alaga', 'Tobdav'];
  for (const f of htmlFiles) {
    const html = readFileSync(f, 'utf8');
    for (const r of privateRepos) assert.ok(!html.includes(`github.com/dju78/${r}`), `${r} linked in ${f}`);
  }
});

test('no fabricated metrics from the old Services page remain', () => {
  for (const f of htmlFiles) {
    const html = readFileSync(f, 'utf8');
    for (const s of ['$2.4M', '520 hrs', 'Revenue impact']) assert.ok(!html.includes(s), `"${s}" found in ${f}`);
  }
});

test('every page has a title, description, canonical URL and social image in <head>', () => {
  for (const f of htmlFiles) {
    const html = readFileSync(f, 'utf8');
    const head = html.slice(0, html.indexOf('</head>'));
    assert.match(head, /<title>[^<]{5,}<\/title>/, f);
    assert.match(head, /<meta name="description" content="[^"]{20,}">/, f);
    assert.match(head, /<link rel="canonical" href="https:\/\/jomovate\.com\/[^"]*">/, f);
    const og = head.match(/<meta property="og:image" content="https:\/\/jomovate\.com(\/[^"]+)">/);
    assert.ok(og, `og:image missing in ${f}`);
    assert.ok(existsSync(join(out, og[1])), `og:image file ${og[1]} missing`);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${f} should have exactly one h1`);
  }
});

test('JSON-LD blocks are valid JSON', () => {
  for (const f of htmlFiles) {
    const html = readFileSync(f, 'utf8');
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
  }
});

test('internal links, images, scripts and stylesheets resolve', () => {
  const missing = [];
  for (const f of htmlFiles) {
    const html = readFileSync(f, 'utf8');
    for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const p = m[1];
      const target = p.endsWith('/') ? join(out, p, 'index.html') : join(out, p);
      if (!existsSync(target)) missing.push(`${p} (in ${f.replace(out, '')})`);
    }
    for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
      for (const part of m[1].split(',')) {
        const p = part.trim().split(' ')[0];
        if (!existsSync(join(out, p))) missing.push(`${p} (srcset in ${f.replace(out, '')})`);
      }
    }
  }
  assert.deepEqual(missing, []);
});

test('images have alt attributes and explicit dimensions', () => {
  for (const f of htmlFiles) {
    for (const m of readFileSync(f, 'utf8').matchAll(/<img\b[^>]*>/g)) {
      assert.match(m[0], /\salt="/, `img without alt in ${f}: ${m[0].slice(0, 80)}`);
      assert.match(m[0], /\swidth="\d+"/, `img without width in ${f}`);
      assert.match(m[0], /\sheight="\d+"/, `img without height in ${f}`);
    }
  }
});

test('enquiry form is wired for Netlify Forms with required fields and labels', () => {
  const html = read('contact/index.html');
  const form = html.slice(html.indexOf('<form'), html.indexOf('</form>'));
  assert.match(form, /name="jomovate-enquiry"/);
  assert.match(form, /data-netlify="true"/);
  assert.match(form, /netlify-honeypot="company-website"/);
  assert.match(form, /<input type="hidden" name="form-name" value="jomovate-enquiry">/);
  assert.match(form, /method="POST"/);
  assert.match(form, /action="\/contact\/thanks\/"/);
  for (const name of ['name', 'email', 'service', 'brief']) {
    const el = form.match(new RegExp(`<(?:input|select|textarea)[^>]*name="${name}"[^>]*>`));
    assert.ok(el, `${name} field missing`);
    assert.match(el[0], /\srequired/, `${name} should be required`);
    const id = el[0].match(/id="([^"]+)"/)[1];
    assert.match(form, new RegExp(`<label for="${id}">`), `${name} has no label`);
  }
  for (const name of ['organisation', 'budget', 'timeframe']) {
    const el = form.match(new RegExp(`<(?:input|select)[^>]*name="${name}"[^>]*>`));
    assert.ok(el, `${name} field missing`);
    assert.doesNotMatch(el[0], /\srequired/, `${name} should be optional`);
  }
  assert.ok(existsSync(join(out, 'contact/thanks/index.html')));
});

test('legacy .dc.html URLs redirect to the new routes', () => {
  const redirects = read('_redirects');
  for (const legacy of ['/Home.dc.html', '/Products.dc.html', '/Services.dc.html', '/About.dc.html', '/Insights.dc.html', '/Contact.dc.html']) {
    const line = redirects.split('\n').find((l) => l.startsWith(`${legacy} `));
    assert.ok(line, `no redirect for ${legacy}`);
    const target = line.split(/\s+/)[1];
    assert.ok(existsSync(join(out, target, 'index.html')), `${legacy} redirects to missing ${target}`);
  }
  assert.ok(LEGACY_REDIRECTS.length >= 12);
});

test('withdrawn case studies 301 to the Work directory and are not built', () => {
  const redirects = read('_redirects');
  for (const [from, to] of REMOVED_PROJECT_REDIRECTS) {
    assert.ok(redirects.split('\n').includes(`${from}  ${to}  301!`), `no redirect for ${from}`);
    assert.ok(!existsSync(join(out, from, 'index.html')), `${from} still has a page`);
  }
});

test('sitemap lists every indexable page and excludes noindex pages', () => {
  const sitemap = read('sitemap.xml');
  for (const p of published) assert.ok(sitemap.includes(`https://jomovate.com/work/${p.slug}/`));
  for (const path of ['/', '/services/web-development/', '/services/data-analysis/', '/about/', '/insights/', '/contact/', '/privacy/']) {
    assert.ok(sitemap.includes(`<loc>https://jomovate.com${path}</loc>`), `${path} missing from sitemap`);
  }
  assert.ok(!sitemap.includes('/contact/thanks/'));
  assert.ok(!sitemap.includes('404'));
  assert.match(read('robots.txt'), /Sitemap: https:\/\/jomovate\.com\/sitemap\.xml/);
});

test('pages render without the legacy runtime and contain no inline style or script handlers (CSP)', () => {
  for (const f of htmlFiles) {
    const html = readFileSync(f, 'utf8');
    assert.ok(!/support\.js|x-dc|unpkg\.com|babel/i.test(html), `legacy runtime referenced in ${f}`);
    assert.ok(!/\sstyle="/.test(html), `inline style attribute in ${f}`);
    assert.ok(!/\son[a-z]+="/.test(html), `inline event handler in ${f}`);
  }
});

test('the homepage features a limited selection, not every project', () => {
  const home = read('index.html');
  const cards = (home.match(/class="project-card"/g) || []).length;
  assert.ok(cards >= 3 && cards <= 6, `homepage shows ${cards} project cards`);
});

test('every email address and mailto link uses the configured business email', () => {
  const { email } = JSON.parse(readFileSync(join(root, 'content/site.json'), 'utf8'));
  assert.equal(email, 'info@jomovate.com');
  for (const f of htmlFiles) {
    const html = readFileSync(f, 'utf8');
    assert.ok(!/dju78@jomovate\.com/i.test(html), `old address in ${f}`);
    for (const m of html.matchAll(/href="mailto:([^"?]+)/g)) assert.equal(m[1], email, `unexpected mailto in ${f}`);
    for (const m of html.matchAll(/[\w.+-]+@jomovate\.com/gi)) assert.equal(m[0].toLowerCase(), email, `unexpected address ${m[0]} in ${f}`);
  }
  const ld = read('index.html').match(/"email":"([^"]+)"/);
  assert.equal(ld?.[1], email, 'Organization JSON-LD email');
});

// ---- WhatsApp, access labels, attribution fields, fonts (added with the advertising-readiness work)

const buildWith = (env) => {
  const dir = mkdtempSync(join(tmpdir(), 'jomovate-wa-'));
  const log = execFileSync(process.execPath, [join(root, 'scripts/build.mjs'), '--out', dir, '--no-local-env'], { env: { ...process.env, WHATSAPP_NUMBER: '', WHATSAPP_CHANNEL_URL: '', ...env }, encoding: 'utf8' });
  return { dir, log, read: (rel) => readFileSync(join(dir, rel), 'utf8') };
};
// Ofcom reserved drama number; test-only.
const TEST_NUMBER = '07700 900123';
const TEST_CHANNEL = 'https://whatsapp.com/channel/0029TestOnlyChannelId00';

test('default build publishes no WhatsApp links or placeholders', () => {
  for (const f of htmlFiles) {
    const html = readFileSync(f, 'utf8');
    assert.ok(!/wa\.me|whatsapp\.com\/channel|Chat on WhatsApp|Follow Jomovate on WhatsApp/i.test(html), `WhatsApp link in ${f}`);
  }
});

test('configured WhatsApp builds show chat buttons in the right places without logging the number', () => {
  const b = buildWith({ WHATSAPP_NUMBER: TEST_NUMBER, WHATSAPP_CHANNEL_URL: TEST_CHANNEL });
  assert.ok(!b.log.includes('7700'), 'build log must not contain the number');
  assert.match(b.log, /WhatsApp chat button: enabled/);
  const expect = (rel, text) => {
    const html = b.read(rel);
    const link = `https://wa.me/447700900123?text=${encodeURIComponent(text).replace(/'/g, '&#39;')}`;
    assert.ok(html.includes(`href="${link}"`), `${rel} missing chat link for "${text}"`);
  };
  expect('contact/index.html', 'Hello Jomovate, I would like to discuss a project.');
  expect('services/web-development/index.html', 'Hello Jomovate, I would like to discuss a website project.');
  expect('services/data-analysis/index.html', 'Hello Jomovate, I would like to discuss a data analysis or dashboard project.');
  expect('work/ukcalc/index.html', 'Hello Jomovate, I would like to discuss a project similar to UKCalc.');
  const home = b.read('index.html');
  assert.ok(home.includes('href="https://wa.me/447700900123'), 'footer chat link missing');
  // Channel: footer and contact only, as a plain link (less prominent than the chat button).
  const contact = b.read('contact/index.html');
  assert.ok(contact.includes(`href="${TEST_CHANNEL}"`) && contact.includes('product updates and business news'));
  assert.ok(home.includes(`href="${TEST_CHANNEL}"`));
  assert.ok(!b.read('services/web-development/index.html').includes('Channel info'));
  assert.doesNotMatch(contact, new RegExp(`class="btn[^"]*"[^>]*href="${TEST_CHANNEL}`), 'channel must not be styled as a primary button');
  // No form values or personal data in any draft.
  for (const m of contact.matchAll(/wa\.me\/\d+\?text=([^"]+)/g)) assert.ok(decodeURIComponent(m[1].replace(/&#39;/g, "'")).startsWith('Hello Jomovate'));
  // Privacy notice describes WhatsApp only when it is offered.
  assert.match(b.read('privacy/index.html'), /handled by WhatsApp \(Meta\)/);
  assert.doesNotMatch(read('privacy/index.html'), /handled by WhatsApp/);
});

test('each WhatsApp value is independent and invalid values stay hidden', () => {
  const chatOnly = buildWith({ WHATSAPP_NUMBER: TEST_NUMBER });
  assert.ok(chatOnly.read('contact/index.html').includes('wa.me/447700900123'));
  assert.ok(!chatOnly.read('contact/index.html').includes('whatsapp.com/channel'));
  const bad = buildWith({ WHATSAPP_NUMBER: '07700 9001', WHATSAPP_CHANNEL_URL: 'https://example.com/channel/abc' });
  assert.ok(!/wa\.me|whatsapp\.com\/channel/.test(bad.read('contact/index.html')));
  assert.ok(!bad.log.includes('7700'));
});

test('portfolio entries state how they can be accessed, and gated apps offer a demonstration route', () => {
  const work = read('work/index.html');
  for (const p of published) {
    const html = read(`work/${p.slug}/index.html`);
    assert.match(html, /<dt>Access<\/dt>/, p.slug);
    const gated = ['pilot', 'in-development'].includes(p.status) || p.access !== 'open';
    assert.equal(html.includes('type=demo'), gated, `${p.slug} demo route`);
    if (p.access !== 'open') assert.doesNotMatch(html, />Try it now /, `${p.slug} must not say "Try it now"`);
  }
  assert.ok((work.match(/class="access/g) || []).length >= published.length);
  for (const slug of ['uba-pulse', 'nairaguard']) assert.match(read(`work/${slug}/index.html`), /Not affiliated|simulated/i);
});

test('enquiry form carries optional source and campaign fields in its static markup', () => {
  const html = read('contact/index.html');
  const form = html.slice(html.indexOf('<form'), html.indexOf('</form>'));
  assert.match(form, /<select[^>]*name="enquiry-source"(?![^>]*required)/);
  for (const f of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'landing_page']) {
    assert.match(form, new RegExp(`<input type="hidden" name="${f}" value="" data-attribution>`), f);
  }
});

test('fonts are self-hosted and no third-party scripts, pixels or font requests are loaded', () => {
  for (const f of ['fonts/caprasimo-latin.woff2', 'fonts/figtree-latin-var.woff2']) assert.ok(existsSync(join(out, f)), f);
  for (const f of htmlFiles) {
    const html = readFileSync(f, 'utf8');
    assert.ok(!/fonts\.googleapis|fonts\.gstatic|googletagmanager|google-analytics|connect\.facebook|gtag\(/.test(html), `third-party tag in ${f}`);
    for (const m of html.matchAll(/<script[^>]*src="([^"]+)"/g)) assert.ok(m[1].startsWith('/'), `external script ${m[1]}`);
  }
  const toml = readFileSync(join(root, 'netlify.toml'), 'utf8');
  assert.match(toml, /font-src 'self'/);
});

test('portfolio lists data and research first, then applications, then websites', () => {
  const rank = { analytics: 0, applications: 1, websites: 2 };
  for (const file of ['work/index.html', 'index.html']) {
    const slugs = [...read(file).matchAll(/project-card-title"><a href="\/work\/([^/]+)\//g)].map((m) => m[1]);
    const ranks = slugs.map((s) => rank[projectGroup(published.find((p) => p.slug === s))]);
    assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b), `${file} order: ${slugs.join(', ')}`);
  }
});

test('homepage sections run hero, services, featured projects, how we work, about, contact', () => {
  const home = read('index.html');
  const ids = ['hero-title', 'services-title', 'work-title', 'process-title', 'about-title', 'cta-title'].map((id) => home.indexOf(`id="${id}"`));
  assert.ok(ids.every((i) => i > 0), 'a homepage section is missing');
  assert.deepEqual(ids, [...ids].sort((a, b) => a - b));
  const services = [...home.matchAll(/class="service-card">\s*<h3><a href="[^"]+">([^<]+)</g)].map((m) => m[1]);
  assert.equal(services[0], 'Data Analytics &amp; Insights');
  assert.equal(services.at(-1), 'Professional Websites');
});

test('client projects link only to their public site, in a new tab', () => {
  for (const p of published.filter((x) => x.type === 'client')) {
    const html = read(`work/${p.slug}/index.html`);
    assert.doesNotMatch(html, /\/admin/, `${p.slug} links to an admin page`);
    assert.match(html, new RegExp(`href="${p.liveUrl.replace(/[.?*+^$()|[\]\/]/g, '\$&')}" rel="noopener" target="_blank"`), `${p.slug} live link`);
    assert.match(html, /Client project/);
  }
});

test('every project card leads with Data & analytics, Applications or Websites', () => {
  for (const file of ['work/index.html', 'index.html']) {
    const labels = [...read(file).matchAll(/project-card-meta">.*?<span class="kicker">([^<]+)</g)].map((m) => m[1]);
    assert.ok(labels.length > 0, `${file} has no cards`);
    for (const l of labels) assert.match(l, /^(Data &amp; analytics|Applications|Websites)( · |$)/, `${file}: ${l}`);
  }
});

test('page and social titles use "|" rather than an em dash', () => {
  for (const f of htmlFiles) {
    const html = readFileSync(f, 'utf8');
    for (const m of html.matchAll(/<title>([^<]*)<\/title>|(?:og|twitter):title" content="([^"]*)"/g)) assert.ok(!(m[1] ?? m[2]).includes('—'), `${f}: ${m[1] ?? m[2]}`);
  }
});

test('visible body text and form messages contain no em dashes', () => {
  for (const f of htmlFiles) {
    const body = readFileSync(f, 'utf8').split('<body>')[1].replace(/<script[\s\S]*?<\/script>/g, '');
    const text = body.replace(/<[^>]+>/g, ' ');
    const attrs = [...body.matchAll(/(?:alt|aria-label|title|placeholder)="([^"]*)"/g)].map((m) => m[1]).join(' ');
    assert.ok(!(text + attrs).includes('—'), `em dash in ${f}`);
  }
  const js = readFileSync(join(root, 'src/js/contact.js'), 'utf8').split('\n').filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*'));
  assert.ok(!js.some((l) => /['"`][^'"`]*—/.test(l)), 'em dash in a contact form message');
});
