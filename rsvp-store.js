export function validateReply(input) {
  const name = String(input.name ?? '').trim();
  const email = String(input.email ?? '').trim().toLowerCase();
  const attending = input.attending;
  const guests = attending === 'no' ? 0 : Number(input.guests);
  const message = String(input.message ?? '').trim();
  if (name.length < 2 || name.length > 100) throw new Error('Please enter your full name (2–100 characters).');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
  if (!['yes', 'no'].includes(attending)) throw new Error('Please choose whether you can attend.');
  if (!Number.isInteger(guests) || guests < 0 || guests > 10 || (attending === 'yes' && guests < 1)) throw new Error('Please choose between 1 and 10 guests.');
  if (message.length > 1000) throw new Error('Please keep your note under 1,000 characters.');
  return { name, email, attending, guests, message };
}

export function createRsvpStore({ settings, hostname, storage, fetchImpl = globalThis.fetch }) {
  const mode = settings.rsvp.mode;
  const endpoint = settings.rsvp.formspreeEndpoint.trim();
  const localHost = ['localhost', '127.0.0.1', '::1', '[::1]', ''].includes(hostname);
  const endpointValid = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint);
  const canSubmit = (mode === 'preview' && localHost) || (mode === 'formspree' && endpointValid);
  const key = `wedding-rsvp:${settings.eventId}:${mode}:${endpoint}`;
  const unavailableMessage = mode === 'preview'
    ? 'RSVP collection is not open yet. Please check back after the hosts finish setting it up.'
    : 'RSVP is temporarily unavailable. Please contact the hosts.';

  function load() {
    try {
      const record = JSON.parse(storage?.getItem(key) ?? 'null');
      if (!record || !record.reply || record.mode !== mode || typeof record.savedAt !== 'string') return null;
      return { ...record, reply: validateReply(record.reply) };
    } catch { return null; }
  }

  async function save(input) {
    if (!canSubmit) throw new Error(unavailableMessage);
    const reply = validateReply(input);
    if (input.website) throw new Error('Your reply could not be accepted.');
    const savedAt = new Date().toISOString();
    if (mode === 'formspree') {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...reply, event: settings.eventId, wedding_date: settings.weddingDate, submitted_at: savedAt }),
          signal: controller.signal,
        });
        if (!response.ok) {
          if (response.status === 429) throw new Error('Too many replies were sent recently. Please wait a moment and try again.');
          throw new Error('Your reply hasn’t been accepted. Please try again or contact the hosts.');
        }
      } catch (error) {
        if (error.name === 'AbortError') throw new Error('We couldn’t confirm your reply in time. Please check your connection or contact the hosts before trying again.');
        throw error;
      } finally { clearTimeout(timer); }
    }
    const record = { mode, savedAt, reply };
    let cached = false;
    try {
      if (!storage) throw new Error('Browser storage unavailable');
      storage.setItem(key, JSON.stringify(record));
      cached = true;
    } catch {
      if (mode === 'preview') throw new Error('This browser cannot save the preview reply. Allow local storage and try again. Nothing was sent.');
    }
    return { ...record, cached };
  }

  return { mode, canSubmit, unavailableMessage, load, save };
}
