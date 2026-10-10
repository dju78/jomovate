// Pure enquiry-form logic, shared by the browser (contact.js) and the Node test suite.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const REQUIRED = {
  name: 'Enter your name',
  email: 'Enter your email address',
  service: 'Choose the service you are interested in',
  brief: 'Tell me a little about the project',
};

/** Returns an array of { field, message } for every invalid field (empty array when valid). */
export function validateEnquiry(values) {
  const errors = [];
  const v = (k) => String(values[k] ?? '').trim();
  for (const [field, message] of Object.entries(REQUIRED)) {
    if (!v(field)) errors.push({ field, message });
  }
  if (v('email') && !EMAIL.test(v('email'))) {
    errors.push({ field: 'email', message: 'Enter an email address in the format name@example.com' });
  }
  if (v('brief') && v('brief').length < 20) {
    errors.push({ field: 'brief', message: 'Add a bit more detail to the brief (at least 20 characters)' });
  }
  return errors;
}

/**
 * Posts the form to Netlify Forms. Resolves { ok: true } only for a 2xx response;
 * anything else (404 when form detection is off, 5xx, network failure) resolves { ok: false }
 * so the page never shows a success message for a failed submission.
 */
export async function submitEnquiry(fetchImpl, entries, endpoint = '/') {
  const body = new URLSearchParams(entries).toString();
  try {
    const res = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'text/html' },
      body,
    });
    return { ok: Boolean(res && res.ok), status: res ? res.status : 0 };
  } catch (err) {
    return { ok: false, status: 0, error: String(err) };
  }
}
