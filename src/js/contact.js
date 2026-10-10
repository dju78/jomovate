import { validateEnquiry, submitEnquiry } from './enquiry.js';

const form = document.querySelector('[data-enquiry-form]');
if (form) {
  const params = new URLSearchParams(location.search);
  const status = document.querySelector('[data-form-status]');
  const summary = form.querySelector('[data-error-summary]');
  const submit = form.querySelector('[data-submit]');
  const email = document.querySelector('a[href^="mailto:"]')?.getAttribute('href').slice(7) || '';

  // Pre-fill from links such as /contact/?service=data&type=quote&ref=ukcalc
  const service = { web: 'Website or web application', data: 'Data analysis or dashboard' }[params.get('service')];
  if (service) form.elements.service.value = service;
  if (params.get('type') === 'quote') {
    form.querySelector('[data-enquiry-type]').value = 'quote';
    submit.textContent = 'Request a quote';
    document.querySelector('h1').textContent = 'Request a quote';
  }
  const ref = params.get('ref');
  if (ref && /^[a-z0-9-]{1,80}$/.test(ref)) form.querySelector('[data-referring-project]').value = ref;

  const fieldsWithErrors = new Set();
  const showError = (field, message) => {
    const input = form.elements[field];
    const el = document.getElementById(`${input.id}-error`);
    input.setAttribute('aria-invalid', 'true');
    el.textContent = message;
    el.hidden = false;
    fieldsWithErrors.add(field);
  };
  const clearErrors = () => {
    for (const field of fieldsWithErrors) {
      const input = form.elements[field];
      input.removeAttribute('aria-invalid');
      document.getElementById(`${input.id}-error`).hidden = true;
    }
    fieldsWithErrors.clear();
    summary.hidden = true;
  };

  const values = () => Object.fromEntries(new FormData(form));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    status.innerHTML = '';
    const errors = validateEnquiry(values());
    if (errors.length) {
      const seen = new Set();
      const list = summary.querySelector('ul');
      list.innerHTML = '';
      for (const { field, message } of errors) {
        if (seen.has(field)) continue;
        seen.add(field);
        showError(field, message);
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${form.elements[field].id}`;
        a.textContent = message;
        li.append(a);
        list.append(li);
      }
      summary.hidden = false;
      summary.focus();
      return;
    }

    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = 'Sending…';
    const result = await submitEnquiry(fetch.bind(window), [...new FormData(form)]);
    submit.disabled = false;
    submit.textContent = original;

    if (result.ok) {
      form.hidden = true;
      status.className = 'form-status form-status-ok';
      status.innerHTML = '<h2>Thank you — your enquiry has been sent</h2><p>I will read it and reply by email. A copy of what you sent is not emailed to you, so keep a note if you need one.</p>';
    } else {
      status.className = 'form-status form-status-error';
      status.innerHTML = '';
      const h = document.createElement('h2');
      h.textContent = 'Your enquiry could not be sent';
      const p = document.createElement('p');
      p.append('Nothing was lost — your answers are still in the form. Please try again, or email ');
      const a = document.createElement('a');
      a.href = `mailto:${email}`;
      a.textContent = email;
      p.append(a, ' directly.');
      status.append(h, p);
    }
    status.focus();
  });
}
