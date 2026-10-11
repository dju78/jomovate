#!/usr/bin/env node
// Builds the static site into _site/ (or the directory given with --out).
// No dependencies: Node 20+ only. Usage: node scripts/build.mjs [--out dir] [--drafts]
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { page, byGroup } from '../src/layout.mjs';
import * as P from '../src/pages.mjs';
import { whatsappConfig } from '../src/whatsapp.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const outArg = args.indexOf('--out');
const out = resolve(root, outArg >= 0 ? args[outArg + 1] : '_site');
const withDrafts = args.includes('--drafts');
const useLocalEnv = !args.includes('--no-local-env'); // tests pass this so a real .env.local is never read

const readJson = async (p) => JSON.parse(await readFile(join(root, p), 'utf8'));

// Legacy Claude Design URLs (and the lower-case forms Netlify's pretty URLs produced) → new routes.
export const LEGACY_REDIRECTS = [
  ['/Home.dc.html', '/'], ['/home.dc', '/'],
  ['/Products.dc.html', '/work/'], ['/products.dc', '/work/'], ['/products', '/work/'],
  ['/Services.dc.html', '/services/'], ['/services.dc', '/services/'],
  ['/About.dc.html', '/about/'], ['/about.dc', '/about/'],
  ['/Insights.dc.html', '/insights/'], ['/insights.dc', '/insights/'],
  ['/Contact.dc.html', '/contact/'], ['/contact.dc', '/contact/'],
  ['/NavHeader.dc.html', '/'], ['/Footer.dc.html', '/'],
];

// Case studies that have been withdrawn from the site → the Work directory, so old links keep working.
export const REMOVED_PROJECT_REDIRECTS = [
  ['/work/aldanat-match-predictor/', '/work/'], ['/work/aldanat-match-predictor', '/work/'],
];

const STATUSES = ['live', 'pilot', 'prototype', 'in-development', 'archived'];
const ACCESS = ['open', 'demo-login', 'sign-in', 'invite-only', 'unavailable'];

/**
 * Optional local settings (.env.local, gitignored) for values that must not be committed, e.g. WHATSAPP_NUMBER.
 * Real environment variables (such as Netlify's) take precedence. Values are never printed.
 */
export function loadLocalEnv(file, env = process.env) {
  const merged = { ...env };
  if (!existsSync(file)) return merged;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (merged[m[1]] === undefined || merged[m[1]] === '') merged[m[1]] = value;
  }
  return merged;
}

const TYPES = ['own-product', 'research', 'client', 'community', 'concept'];

export function validateProjects(data, { imageExists = () => true } = {}) {
  const errors = [];
  const slugs = new Set();
  for (const p of data.projects) {
    const where = `project "${p.slug || p.title}"`;
    for (const k of ['slug', 'title', 'status', 'type', 'summary', 'problem', 'audience', 'role', 'solution', 'outcomes', 'statusNote', 'liveCheck', 'service']) {
      if (!p[k] || typeof p[k] !== 'string') errors.push(`${where}: missing ${k}`);
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug || '')) errors.push(`${where}: slug must be kebab-case`);
    if (slugs.has(p.slug)) errors.push(`${where}: duplicate slug`);
    slugs.add(p.slug);
    if (!STATUSES.includes(p.status)) errors.push(`${where}: unknown status ${p.status}`);
    if (!ACCESS.includes(p.access)) errors.push(`${where}: access must be one of ${ACCESS.join(', ')}`);
    if (p.status === 'live' && p.access === 'unavailable') errors.push(`${where}: a live project cannot be unavailable`);
    if (p.access !== 'unavailable' && !p.liveUrl) errors.push(`${where}: only unavailable projects may omit liveUrl`);
    if (!TYPES.includes(p.type)) errors.push(`${where}: unknown type ${p.type}`);
    if (!['web', 'data', 'both'].includes(p.service)) errors.push(`${where}: service must be web, data or both`);
    if (!Array.isArray(p.categories) || !p.categories.length || p.categories.some((c) => !data.categories[c])) errors.push(`${where}: bad categories`);
    for (const k of ['features', 'tech', 'limitations', 'repos']) if (!Array.isArray(p[k])) errors.push(`${where}: ${k} must be an array`);
    if (p.liveUrl && !/^https:\/\//.test(p.liveUrl)) errors.push(`${where}: liveUrl must be https`);
    if (p.publicSource && !/^https:\/\/github\.com\/dju78\/[\w.-]+$/.test(p.publicSource)) errors.push(`${where}: publicSource must be an exact public GitHub URL`);
    if (p.image && (!p.imageAlt || !p.caption)) errors.push(`${where}: image needs imageAlt and caption`);
    if (p.image && !imageExists(p.slug)) errors.push(`${where}: screenshot file missing`);
    if (p.type === 'client' && p.published && !p.clientApproved) errors.push(`${where}: client work needs clientApproved:true before publishing`);
  }
  for (const p of data.projects) for (const r of p.relatedTo || []) if (!slugs.has(r)) errors.push(`project "${p.slug}": relatedTo unknown slug ${r}`);
  return errors;
}

async function writePage(rel, contents) {
  const file = rel.endsWith('.html') ? join(out, rel) : join(out, rel, 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, contents);
}

const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 10);

async function main() {
  const site = await readJson('content/site.json');
  const wa = whatsappConfig(useLocalEnv ? loadLocalEnv(join(root, '.env.local')) : process.env);
  site.whatsapp = { chat: wa.chat, channel: wa.channel };
  for (const note of wa.notes) console.warn(`Warning: ${note}`);
  const projectData = await readJson('content/projects.json');
  const insights = await readJson('content/insights.json');

  let all = projectData.projects;
  if (withDrafts && existsSync(join(root, 'drafts/drafts.json'))) {
    const drafts = await readJson('drafts/drafts.json');
    all = [...all, ...drafts.projects.map((d) => ({ ...d, published: true, draft: true, clientApproved: true }))];
  }
  const imageDirs = [join(root, 'static/img/projects'), ...(withDrafts ? [join(root, 'drafts/img/projects')] : [])];
  const errors = validateProjects({ ...projectData, projects: all }, {
    imageExists: (slug) => imageDirs.some((d) => existsSync(join(d, `${slug}.webp`)) && existsSync(join(d, `${slug}-640.webp`))),
  });
  if (errors.length) {
    console.error(`Content errors:\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }
  const projects = all.filter((p) => p.published).sort(byGroup);
  const { categories, checkedOn } = projectData;

  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await cp(join(root, 'static'), out, { recursive: true });
  if (withDrafts && existsSync(join(root, 'drafts/img'))) await cp(join(root, 'drafts/img'), join(out, 'img'), { recursive: true });

  // Assets: one fingerprinted stylesheet; small JS modules served as-is.
  const css = (await readFile(join(root, 'src/css/organic.css'), 'utf8')) + '\n' + (await readFile(join(root, 'src/css/site.css'), 'utf8'));
  const cssName = `/css/site.${hash(css)}.css`;
  await mkdir(join(out, 'css'), { recursive: true });
  await writeFile(join(out, cssName), css);
  await cp(join(root, 'src/js'), join(out, 'js'), { recursive: true });
  const assets = { css: cssName, js: '/js/site.js' };

  const ctx = { site, projects, categories, checkedOn, insights };
  const pages = [
    P.home(ctx),
    P.servicesIndex(ctx),
    P.serviceDetail('web', ctx),
    P.serviceDetail('data', ctx),
    P.workIndex(ctx),
    ...projects.map((p) => ({ ...P.caseStudy(p, ctx), noindex: Boolean(p.draft) })),
    P.about(ctx),
    P.insightsIndex(ctx),
    ...insights.articles.map((a) => P.insightArticle(a, ctx)),
    P.contact(ctx),
    P.contactThanks(ctx),
    P.privacy(ctx),
    P.notFound(ctx),
  ];
  for (const pg of pages) await writePage(pg.path, page({ site, assets, ...pg }));

  const indexable = pages.filter((p) => !p.noindex);
  await writeFile(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url><loc>${site.url}${p.path}</loc><lastmod>${checkedOn}</lastmod></url>`).join('\n')}
</urlset>
`);
  await writeFile(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
  await writeFile(join(out, '_redirects'), [...LEGACY_REDIRECTS, ...REMOVED_PROJECT_REDIRECTS].map(([from, to]) => `${from}  ${to}  301!`).join('\n') + '\n');

  const files = await countFiles(out);
  console.log(`Built ${pages.length} pages (${projects.length} projects${withDrafts ? ', drafts included' : ''}) and ${files} files into ${out}`);
  console.log(`WhatsApp chat button: ${wa.chat ? 'enabled' : 'hidden (WHATSAPP_NUMBER not set)'} · WhatsApp channel link: ${wa.channel ? 'enabled' : 'hidden (WHATSAPP_CHANNEL_URL not set)'}`);
}

async function countFiles(dir) {
  let n = 0;
  for (const e of await readdir(dir, { withFileTypes: true })) n += e.isDirectory() ? await countFiles(join(dir, e.name)) : 1;
  return n;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
