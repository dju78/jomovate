// WhatsApp helpers. Both values are optional; a button is rendered only when its own value is valid.
// The number is never logged: callers get { ok, reason } and only the generated wa.me link.

/**
 * Normalises a business number to the digits wa.me expects (international format, no "+", no spaces).
 * Accepts "+44 7xxx xxxxxx", "0044…", or a UK national number starting with 0.
 * Returns { ok: true, digits } or { ok: false, reason }.
 */
export function normalizeWhatsAppNumber(raw) {
  const input = String(raw ?? '').trim();
  if (!input) return { ok: false, reason: 'empty' };
  if (/[^\d\s()+.-]/.test(input)) return { ok: false, reason: 'contains characters other than digits, spaces, +, -, (, ) or .' };
  let digits = input.replace(/[\s().-]/g, '');
  if ((digits.match(/\+/g) || []).length > 1 || (digits.includes('+') && !digits.startsWith('+'))) {
    return { ok: false, reason: '"+" may only appear at the start' };
  }
  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = `44${digits.slice(1)}`; // UK national format
  if (!/^\d+$/.test(digits)) return { ok: false, reason: 'not a number' };
  if (digits.startsWith('44')) {
    // UK: country code + 10 national digits; WhatsApp numbers are normally mobiles (07…).
    if (digits.startsWith('440')) return { ok: false, reason: 'UK number has a 0 after the country code' };
    if (!/^44\d{10}$/.test(digits)) return { ok: false, reason: 'UK numbers need 10 digits after +44' };
  } else if (!/^[1-9]\d{7,14}$/.test(digits)) {
    return { ok: false, reason: 'international numbers need 8–15 digits including the country code' };
  }
  return { ok: true, digits };
}

/** Accepts only an official WhatsApp channel URL and returns it unchanged (exact value supplied). */
export function validateChannelUrl(raw) {
  const url = String(raw ?? '').trim();
  if (!url) return { ok: false, reason: 'empty' };
  if (!/^https:\/\/(www\.)?whatsapp\.com\/channel\/[A-Za-z0-9]{10,64}\/?$/.test(url)) {
    return { ok: false, reason: 'must look like https://whatsapp.com/channel/<id>' };
  }
  return { ok: true, url };
}

/** Builds an official click-to-chat link. The draft text is only pre-filled; WhatsApp never sends it automatically. */
export function waLink(digits, message) {
  const text = String(message ?? '').slice(0, 300);
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** Short, generic draft messages. They must never contain anything a visitor typed. */
export const DRAFTS = {
  general: 'Hello Jomovate, I would like to discuss a project.',
  web: 'Hello Jomovate, I would like to discuss a website project.',
  data: 'Hello Jomovate, I would like to discuss a data analysis or dashboard project.',
  project: (title) => `Hello Jomovate, I would like to discuss a project similar to ${String(title).slice(0, 80)}.`,
};

/** Reads WHATSAPP_NUMBER / WHATSAPP_CHANNEL_URL from an env-like object. Never includes the number in messages. */
export function whatsappConfig(env = {}) {
  const number = normalizeWhatsAppNumber(env.WHATSAPP_NUMBER);
  const channel = validateChannelUrl(env.WHATSAPP_CHANNEL_URL);
  return {
    chat: number.ok ? { digits: number.digits } : null,
    channel: channel.ok ? { url: channel.url } : null,
    notes: [
      env.WHATSAPP_NUMBER && !number.ok ? `WHATSAPP_NUMBER ignored (${number.reason}); "Chat on WhatsApp" buttons hidden.` : null,
      env.WHATSAPP_CHANNEL_URL && !channel.ok ? `WHATSAPP_CHANNEL_URL ignored (${channel.reason}); channel link hidden.` : null,
    ].filter(Boolean),
  };
}
