import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEnquiry, submitEnquiry } from '../src/js/enquiry.js';

const valid = { name: 'Ada', email: 'ada@example.com', service: 'Not sure yet', brief: 'A booking page for a small clinic.' };

test('a complete enquiry passes validation', () => {
  assert.deepEqual(validateEnquiry(valid), []);
});

test('missing required fields are reported individually', () => {
  const fields = validateEnquiry({}).map((e) => e.field);
  assert.deepEqual(fields.sort(), ['brief', 'email', 'name', 'service']);
});

test('whitespace-only answers count as missing', () => {
  assert.ok(validateEnquiry({ ...valid, name: '   ' }).some((e) => e.field === 'name'));
});

test('malformed email and too-short brief are rejected', () => {
  const errors = validateEnquiry({ ...valid, email: 'ada@example', brief: 'Help' });
  assert.ok(errors.some((e) => e.field === 'email'));
  assert.ok(errors.some((e) => e.field === 'brief'));
});

test('optional fields are not required', () => {
  assert.deepEqual(validateEnquiry({ ...valid, organisation: '', budget: '', timeframe: '' }), []);
});

test('submission succeeds only on a 2xx response and posts url-encoded data', async () => {
  let seen;
  const fakeFetch = async (url, init) => { seen = { url, init }; return { ok: true, status: 200 }; };
  const result = await submitEnquiry(fakeFetch, [['form-name', 'jomovate-enquiry'], ['name', 'Ada & Co']]);
  assert.equal(result.ok, true);
  assert.equal(seen.url, '/');
  assert.equal(seen.init.method, 'POST');
  assert.equal(seen.init.headers['Content-Type'], 'application/x-www-form-urlencoded');
  assert.equal(seen.init.body, 'form-name=jomovate-enquiry&name=Ada+%26+Co');
});

test('a 404 (Netlify form detection off) is reported as a failure, not success', async () => {
  const result = await submitEnquiry(async () => ({ ok: false, status: 404 }), [['name', 'Ada']]);
  assert.deepEqual(result, { ok: false, status: 404 });
});

test('a network error is reported as a failure', async () => {
  const result = await submitEnquiry(async () => { throw new TypeError('Failed to fetch'); }, []);
  assert.equal(result.ok, false);
  assert.equal(result.status, 0);
});
