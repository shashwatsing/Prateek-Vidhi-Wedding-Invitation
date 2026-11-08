import test from 'node:test';
import assert from 'node:assert/strict';
import { createRsvpStore, validateReply } from '../rsvp-store.js';

const reply = { name: 'Preview Guest', email: 'guest@example.invalid', attending: 'yes', guests: '2', message: 'Test reply' };
const config = (mode = 'preview') => ({ eventId: 'test-wedding', weddingDate: '2027-03-01T00:00:00+05:30', rsvp: { mode, formspreeEndpoint: mode === 'formspree' ? 'https://formspree.io/f/testform' : '' } });
function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('local replies persist and update without any network request', async () => {
  const storage = memoryStorage();
  const options = { settings: config(), hostname: '127.0.0.1', storage, fetchImpl: () => { throw new Error('Unexpected network request'); } };
  const store = createRsvpStore(options);
  assert.equal((await store.save(reply)).cached, true);
  assert.equal(createRsvpStore(options).load().reply.guests, 2);
  await store.save({ ...reply, attending: 'no', guests: 5 });
  assert.equal(createRsvpStore(options).load().reply.guests, 0);
});

test('published preview mode refuses to pretend a real RSVP was collected', async () => {
  const store = createRsvpStore({ settings: config(), hostname: 'example.github.io', storage: memoryStorage() });
  assert.equal(store.canSubmit, false);
  await assert.rejects(store.save(reply), /not open yet/);
  assert.equal(store.load(), null);
});

test('invalid form endpoint is disabled', async () => {
  const settings = config('formspree');
  settings.rsvp.formspreeEndpoint = 'http://formspree.io/f/testform';
  const store = createRsvpStore({ settings, hostname: 'localhost', storage: memoryStorage() });
  await assert.rejects(store.save(reply), /temporarily unavailable/);
});

test('live collection requires remote acceptance and does not upload preview records', async () => {
  const storage = memoryStorage();
  await createRsvpStore({ settings: config(), hostname: 'localhost', storage }).save(reply);
  let calls = 0;
  const store = createRsvpStore({
    settings: config('formspree'), hostname: 'example.github.io', storage,
    fetchImpl: async (url, request) => {
      calls++;
      assert.equal(url, 'https://formspree.io/f/testform');
      assert.equal(request.headers.Accept, 'application/json');
      assert.equal(JSON.parse(request.body).guests, 2);
      return { ok: true, status: 200 };
    },
  });
  assert.equal(store.load(), null);
  assert.equal(calls, 0);
  assert.equal((await store.save(reply)).mode, 'formspree');
  assert.equal(calls, 1);
  assert.equal(store.load().reply.name, reply.name);
});

test('remote errors never create a successful local receipt', async () => {
  const store = createRsvpStore({ settings: config('formspree'), hostname: 'example.github.io', storage: memoryStorage(), fetchImpl: async () => ({ ok: false, status: 429 }) });
  await assert.rejects(store.save(reply), /wait a moment/);
  assert.equal(store.load(), null);
});

test('storage failure is an error in preview and a warning after successful delivery', async () => {
  const storage = { getItem: () => null, setItem: () => { throw new Error('Blocked'); } };
  const local = createRsvpStore({ settings: config(), hostname: 'localhost', storage });
  await assert.rejects(local.save(reply), /Nothing was sent/);
  const remote = createRsvpStore({ settings: config('formspree'), hostname: 'example.github.io', storage, fetchImpl: async () => ({ ok: true, status: 200 }) });
  assert.equal((await remote.save(reply)).cached, false);
});

test('invalid fields are rejected before saving', () => {
  assert.throws(() => validateReply({ ...reply, email: 'invalid' }), /email/);
  assert.throws(() => validateReply({ ...reply, guests: 100 }), /1 and 10/);
  assert.throws(() => validateReply({ ...reply, attending: 'maybe' }), /whether/);
  assert.throws(() => validateReply({ ...reply, message: 'a'.repeat(1001) }), /1,000/);
});
