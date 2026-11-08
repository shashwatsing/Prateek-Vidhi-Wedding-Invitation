import { settings } from './settings.js';
import { createRsvpStore } from './rsvp-store.js';
import { getGoogleFormLinks } from './google-forms.js';

const cover = document.querySelector('.cover');
const invitation = document.querySelector('.invitation');
const openButton = document.querySelector('.open-invitation');
const replayButton = document.querySelector('footer button');
const heroTitle = document.querySelector('.hero h1');
let opening = false;
heroTitle.tabIndex = -1;
document.body.style.overflow = 'hidden';

openButton.addEventListener('click', () => {
  if (opening) return;
  opening = true;
  openButton.disabled = true;
  cover.classList.add('is-opening');
  invitation.classList.add('revealed');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.setTimeout(() => {
    cover.hidden = true;
    invitation.inert = false;
    invitation.removeAttribute('aria-hidden');
    document.body.style.overflow = '';
    heroTitle.focus({ preventScroll: true });
  }, reducedMotion ? 20 : 1850);
});

replayButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  opening = false;
  openButton.disabled = false;
  cover.hidden = false;
  cover.classList.remove('is-opening');
  invitation.classList.remove('revealed');
  invitation.inert = true;
  invitation.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'hidden';
  openButton.focus({ preventScroll: true });
});

const days = Math.max(0, Math.ceil((Date.parse(settings.weddingDate) - Date.now()) / 86400000));
if (days > 0) {
  const countdown = document.createElement('p');
  countdown.className = 'countdown';
  const number = document.createElement('span');
  number.textContent = String(days);
  countdown.append(number, ' days until a new beginning');
  document.querySelector('#celebration').append(countdown);
}

let storage;
try { storage = window.localStorage; } catch { storage = null; }
const store = createRsvpStore({ settings, hostname: window.location.hostname, storage });
const form = document.querySelector('#rsvp-form');
const submitButton = form.querySelector('[type="submit"]');
const notice = document.querySelector('#rsvp-mode-notice');
const errorMessage = document.querySelector('#rsvp-error');
const thanks = document.querySelector('#rsvp-thanks');
const guestCount = document.querySelector('#guest-count');
const guestCountLabel = form.querySelector('[for="guest-count"]');
let savedRecord = null;
let saving = false;

if (store.mode === 'preview' && store.canSubmit) {
  notice.textContent = 'Local preview: test replies are saved only in this browser. They are not sent to the hosts.';
  form.querySelector('.privacy-note').textContent = 'Preview replies stay on this device. You can download your own reply after saving.';
} else if (!store.canSubmit) {
  notice.textContent = store.unavailableMessage;
  submitButton.disabled = true;
  submitButton.textContent = 'RSVP not open yet';
  form.querySelector('.privacy-note').textContent = 'No reply will be sent until the hosts open RSVP collection.';
} else {
  notice.hidden = true;
  form.querySelector('.privacy-note').textContent = 'Your reply is sent securely to the hosts through Formspree.';
}

function syncAttendance() {
  const attendance = form.elements.attending.value;
  for (const radio of form.querySelectorAll('input[name="attending"]')) {
    radio.closest('label').classList.toggle('chosen', radio.checked);
  }
  guestCount.hidden = attendance === 'no';
  guestCount.disabled = attendance === 'no';
  guestCountLabel.hidden = attendance === 'no';
}
for (const radio of form.querySelectorAll('input[name="attending"]')) radio.addEventListener('change', syncAttendance);

function displayReply(record) {
  savedRecord = record;
  const { reply } = record;
  form.hidden = true;
  thanks.hidden = false;
  document.querySelector('#reply-status').textContent = store.mode === 'preview' ? 'Saved on this device only' : 'Your reply has been sent';
  document.querySelector('#reply-heading').textContent = store.mode === 'preview' ? 'Your preview reply is saved.' : reply.attending === 'yes' ? 'See you at the wedding!' : 'You’ll be missed.';
  document.querySelector('#reply-description').textContent = reply.attending === 'yes'
    ? `${reply.name}, your reply is for ${reply.guests} ${reply.guests === 1 ? 'guest' : 'guests'}.`
    : `${reply.name}, your reply says you won’t be able to attend.`;
  document.querySelector('#reply-note').textContent = store.mode === 'preview'
    ? 'This is a local test. Nothing was sent to the hosts, and other devices cannot see this reply.'
    : record.cached === false
      ? 'Your reply was sent, but this browser could not remember it. You can download a copy below.'
      : 'You can send a revised reply here. The hosts will receive it as a new submission.';
  thanks.tabIndex = -1;
  thanks.focus({ preventScroll: true });
}

document.querySelector('#edit-reply').addEventListener('click', () => {
  form.hidden = false;
  thanks.hidden = true;
  const reply = savedRecord.reply;
  for (const field of ['name', 'email', 'message']) form.elements[field].value = reply[field];
  form.elements.attending.value = reply.attending;
  guestCount.value = String(reply.guests || 1);
  syncAttendance();
  form.elements.name.focus({ preventScroll: true });
});

document.querySelector('#download-reply').addEventListener('click', () => {
  if (!savedRecord) return;
  const data = { event: settings.eventId, ...savedRecord };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rsvp-${settings.eventId}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (saving || !store.canSubmit) return;
  errorMessage.hidden = true;
  saving = true;
  submitButton.disabled = true;
  submitButton.textContent = store.mode === 'preview' ? 'Saving preview…' : 'Sending your reply…';
  try {
    const data = Object.fromEntries(new FormData(form));
    const record = await store.save(data);
    displayReply(record);
  } catch (error) {
    errorMessage.textContent = error.message || 'We couldn’t save your reply. Please try again.';
    errorMessage.hidden = false;
  } finally {
    saving = false;
    submitButton.disabled = false;
    submitButton.textContent = 'Send with love ↗';
  }
});

const previousReply = store.canSubmit ? store.load() : null;
if (previousReply) displayReply(previousReply);
syncAttendance();

// Google handles submissions and confirmation within the embedded form.
// Never infer successful submission from an iframe load event.
if (settings.rsvp.mode === 'google-forms') {
  form.hidden = true;
  thanks.hidden = true;
  const panel = document.createElement('div');
  panel.className = 'google-rsvp';
  const links = getGoogleFormLinks(settings.rsvp.googleFormUrl);
  if (!links) {
    const message = document.createElement('p');
    message.className = 'preview-notice';
    message.textContent = 'RSVP collection is not open yet. Please check back after the hosts finish setting it up.';
    panel.append(message);
  } else {
    const fallback = document.createElement('a');
    fallback.className = 'text-link';
    fallback.href = links.responder;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'Open RSVP form in a new tab ↗';
    const frame = document.createElement('iframe');
    frame.src = links.embed;
    frame.title = 'RSVP for Prateek and Vidhi’s wedding';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    const note = document.createElement('p');
    note.className = 'privacy-note';
    note.textContent = 'Submit your reply in the Google Form below and wait for its confirmation.';
    panel.append(fallback, note, frame);
  }
  document.querySelector('.rsvp-card').append(panel);
}
