// Uses only Ofcom's reserved drama numbers (07700 900000–900999), which are never allocated to real people.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWhatsAppNumber, validateChannelUrl, waLink, DRAFTS, whatsappConfig } from '../src/whatsapp.mjs';

const FICTIONAL = '447700900123';

test('UK numbers in common formats normalise to the wa.me international form', () => {
  for (const input of ['+44 7700 900123', '+447700900123', '0044 7700 900123', '07700 900123', '07700-900-123', '(07700) 900123', '+44 (7700) 900.123']) {
    assert.deepEqual(normalizeWhatsAppNumber(input), { ok: true, digits: FICTIONAL }, input);
  }
});

test('empty, malformed and placeholder numbers are rejected', () => {
  for (const input of ['', '   ', undefined, '+44 0 7700 900123', '+44 7700 9001', '+44 7700 900123 4', '07700 9OO123', 'tel:+447700900123', '44+7700900123', '+44 7700 900123 ext 2', 'XXXXXXXXXXX', '+00 000']) {
    assert.equal(normalizeWhatsAppNumber(input).ok, false, String(input));
  }
});

test('non-UK international numbers are accepted when plausible', () => {
  assert.deepEqual(normalizeWhatsAppNumber('+234 803 000 0000'), { ok: true, digits: '2348030000000' });
  assert.equal(normalizeWhatsAppNumber('+1 23').ok, false);
});

test('only official WhatsApp channel URLs are accepted, unchanged', () => {
  const url = 'https://whatsapp.com/channel/0029TestOnlyChannelId00';
  assert.deepEqual(validateChannelUrl(url), { ok: true, url });
  assert.equal(validateChannelUrl('https://www.whatsapp.com/channel/0029TestOnlyChannelId00').ok, true);
  for (const bad of ['', 'http://whatsapp.com/channel/0029TestOnlyChannelId00', 'https://whatsapp.com.evil.example/channel/0029TestOnlyChannelId00', 'https://chat.whatsapp.com/AbCdEf123456', 'https://whatsapp.com/channel/', 'https://wa.me/447700900123', 'https://whatsapp.com/channel/0029Test"><script>']) {
    assert.equal(validateChannelUrl(bad).ok, false, bad);
  }
});

test('click-to-chat links use wa.me with a correctly encoded draft', () => {
  assert.equal(waLink(FICTIONAL, DRAFTS.web), 'https://wa.me/447700900123?text=Hello%20Jomovate%2C%20I%20would%20like%20to%20discuss%20a%20website%20project.');
  assert.equal(waLink(FICTIONAL, 'A & B? #1'), 'https://wa.me/447700900123?text=A%20%26%20B%3F%20%231');
  assert.equal(waLink(FICTIONAL, ''), 'https://wa.me/447700900123');
});

test('draft messages are short, generic and only mention a project name when given one', () => {
  for (const key of ['general', 'web', 'data']) {
    assert.ok(DRAFTS[key].startsWith('Hello Jomovate'));
    assert.ok(DRAFTS[key].length < 120);
  }
  assert.equal(DRAFTS.project('UKCalc'), 'Hello Jomovate, I would like to discuss a project similar to UKCalc.');
});

test('config hides each button independently and never echoes the number in warnings', () => {
  assert.deepEqual(whatsappConfig({}), { chat: null, channel: null, notes: [] });
  const onlyChannel = whatsappConfig({ WHATSAPP_CHANNEL_URL: 'https://whatsapp.com/channel/0029TestOnlyChannelId00' });
  assert.equal(onlyChannel.chat, null);
  assert.ok(onlyChannel.channel);
  const bad = whatsappConfig({ WHATSAPP_NUMBER: '07700 9001' });
  assert.equal(bad.chat, null);
  assert.equal(bad.notes.length, 1);
  assert.ok(!bad.notes[0].includes('7700'), 'warning must not contain the number');
});
