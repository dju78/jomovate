// Build-level checks: run with `npm test` (Node 20+, no dependencies).
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync, mkdtempSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { validateProjects, LEGACY_REDIRECTS } from '../scripts/build.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = mkdtempSync(join(tmpdir(), 'jomovate-site-'));
const data = JSON.parse(readFileSync(join(root, 'content/projects.json'), 'utf8'));
const published = data.projects.filter((p) => p.published);

const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
let htmlFiles = [];
const read = (rel) => readFileSync(join(out, rel), 'utf8');

before(() => {
  execFileSync(process.execPath, [join(root, 'scripts/build.mjs'), '--out', out], { stdio: 'pipe' });
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
