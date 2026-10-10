import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickAttribution, withAttribution, track, PARAMS } from '../src/js/attribution.js';

test('only allow-listed campaign parameters are kept, with the landing page', () => {
  const a = pickAttribution('?utm_source=google&utm_medium=cpc&utm_campaign=web-dev-uk&gclid=Cj0KCQ_abc-123&email=x@y.com&name=Ada', '/services/web-development/');
  assert.deepEqual(a, { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'web-dev-uk', gclid: 'Cj0KCQ_abc-123', landing_page: '/services/web-development/' });
  assert.ok(!('email' in a) && !('name' in a));
});

test('no campaign parameters means no attribution at all', () => {
  assert.deepEqual(pickAttribution('?q=dashboard&service=web', '/work/'), {});
});

test('values are sanitised and length-limited; invalid gclid and landing paths are dropped', () => {
  const a = pickAttribution(`?utm_campaign=${encodeURIComponent('<script>alert(1)</script>spring')}&utm_term=${'x'.repeat(300)}&gclid=bad%20id!&landing_page=https://evil.example/`, '/contact/');
  assert.equal(a.utm_campaign, 'scriptalert(1)/scriptspring');
  assert.equal(a.utm_term.length, 100);
  assert.ok(!('gclid' in a));
  assert.equal(a.landing_page, '/contact/');
});

test('attribution is carried on same-site links only', () => {
  const a = { utm_source: 'google', landing_page: '/services/data-analysis/' };
  assert.equal(withAttribution('/contact/?service=data', a), '/contact/?service=data&utm_source=google&landing_page=%2Fservices%2Fdata-analysis%2F');
  assert.equal(withAttribution('/work/#top', a), '/work/?utm_source=google&landing_page=%2Fservices%2Fdata-analysis%2F#top');
  for (const href of ['https://ukcalc.jomovate.com/', 'mailto:info@jomovate.com', 'https://wa.me/447700900123', '//evil.example/']) assert.equal(withAttribution(href, a), href);
  assert.equal(withAttribution('/contact/?utm_source=linkedin', a).includes('utm_source=linkedin'), true, 'existing values are not overwritten');
});

test('track() does nothing without a tag manager, and pushes when dataLayer exists', () => {
  delete globalThis.window;
  track('contact_click', { method: 'email' }); // must not throw
  globalThis.window = {};
  track('contact_click');
  assert.equal(globalThis.window.dataLayer, undefined, 'must not create dataLayer itself');
  globalThis.window.dataLayer = [];
  track('enquiry_submitted', { service: 'Not sure yet' });
  assert.deepEqual(globalThis.window.dataLayer, [{ event: 'enquiry_submitted', service: 'Not sure yet' }]);
  delete globalThis.window;
});

test('the parameter list matches the hidden form fields', async () => {
  const { ATTRIBUTION_FIELDS } = await import('../src/pages.mjs');
  assert.deepEqual(ATTRIBUTION_FIELDS, [...PARAMS, 'landing_page']);
});

test('landing directly on the contact page records that page as the landing page', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../src/js/contact.js', import.meta.url), 'utf8');
  assert.match(src, /pickAttribution\(location\.search, location\.pathname\)/);
  assert.equal(pickAttribution('?utm_source=google', '/contact/').landing_page, '/contact/');
});
