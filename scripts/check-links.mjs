#!/usr/bin/env node
// Checks every external link in _site and reports HTTP status. A 2xx/3xx only shows the URL responds;
// it does not prove the product behind it works. Usage: npm run build && npm run check-links
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../_site');
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const urls = new Set();
for (const f of walk(out).filter((f) => f.endsWith('.html'))) {
  for (const m of readFileSync(f, 'utf8').matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const u = m[1].replace(/&amp;/g, '&');
    const host = new URL(u).hostname;
    // Skip font CDNs and the site's own canonical URLs (they only exist once deployed).
    if (!/fonts\.(googleapis|gstatic)\.com$/.test(host) && host !== 'jomovate.com') urls.add(u);
  }
}

const check = async (url) => {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(30000), headers: { 'User-Agent': 'Mozilla/5.0 (link check; jomovate.com)' } });
      if (method === 'HEAD' && (res.status === 405 || res.status === 403 || res.status >= 500)) continue;
      return { url, status: res.status, final: res.url !== url ? res.url : '' };
    } catch (e) {
      if (method === 'GET') return { url, status: 0, final: String(e.cause?.code || e.name) };
    }
  }
};

// Streamlit Community Cloud answers scripted requests with a cookie/auth redirect loop, so those
// apps report status 0 here; check them in a browser.
const results = await Promise.all([...urls].sort().map(check));
let bad = 0;
for (const r of results) {
  const ok = r.status >= 200 && r.status < 400;
  if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${r.status} ${r.url}${r.final ? ` -> ${r.final.slice(0, 80)}` : ''}`);
}
console.log(`\n${results.length} external links, ${bad} failing`);
process.exitCode = bad ? 1 : 0;
