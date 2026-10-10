#!/usr/bin/env node
// Local preview of _site with Netlify-like behaviour: directory indexes, _redirects (301s) and 404.html.
// Form POSTs are simulated: FORMS=ok (default) returns 200, FORMS=fail returns 404 like Netlify does
// when form detection is switched off. Usage: node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../_site');
const port = Number(process.argv[2] || process.env.PORT || 8123);
const forms = process.env.FORMS || 'ok';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml' };

if (!existsSync(root)) {
  console.error('No _site folder. Run `npm run build` first.');
  process.exit(1);
}
const redirects = existsSync(join(root, '_redirects'))
  ? new Map(readFileSync(join(root, '_redirects'), 'utf8').split('\n').filter(Boolean).map((l) => l.trim().split(/\s+/)).map(([f, t]) => [f.toLowerCase(), t]))
  : new Map();

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const fields = Object.fromEntries(new URLSearchParams(body));
    console.log(`[form ${forms}] ${fields['form-name'] || '?'}:`, { ...fields, brief: (fields.brief || '').slice(0, 40) });
    if (forms === 'ok') {
      res.writeHead(303, { Location: '/contact/thanks/' });
      return res.end();
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found');
  }
  const target = redirects.get(url.pathname.toLowerCase());
  if (target) {
    res.writeHead(301, { Location: target });
    return res.end();
  }
  let file = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!file.startsWith(root)) { res.writeHead(400); return res.end(); }
  try {
    if ((await stat(file)).isDirectory()) {
      if (!url.pathname.endsWith('/')) { res.writeHead(301, { Location: `${url.pathname}/${url.search}` }); return res.end(); }
      file = join(file, 'index.html');
    }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': types['.html'] });
    res.end(await readFile(join(root, '404.html')));
  }
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port} (forms: ${forms})`));
