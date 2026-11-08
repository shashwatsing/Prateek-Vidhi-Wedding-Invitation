import test from 'node:test';
import assert from 'node:assert/strict';
import { getGoogleFormLinks } from '../google-forms.js';

test('accepts a responder URL and creates a Google embed URL', () => {
  const links = getGoogleFormLinks('https://docs.google.com/forms/d/e/example_form/viewform?usp=sharing');
  assert.equal(links.responder, 'https://docs.google.com/forms/d/e/example_form/viewform');
  assert.equal(links.embed, 'https://docs.google.com/forms/d/e/example_form/viewform?embedded=true');
});

test('rejects admin links and non-Google or unsafe URLs', () => {
  for (const input of ['', 'javascript:alert(1)', 'http://docs.google.com/forms/d/e/test/viewform', 'https://docs.google.com.attacker.invalid/forms/d/e/test/viewform', 'https://docs.google.com/forms/d/test/edit', 'https://forms.gle/test', 'https://user@docs.google.com/forms/d/test/viewform']) {
    assert.equal(getGoogleFormLinks(input), null);
  }
});
