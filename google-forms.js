// Only accept Google's normal responder URLs, never edit/admin links.
export function getGoogleFormLinks(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || url.port || url.username || url.password) return null;
    if (!/^\/forms\/d\/(?:e\/)?[A-Za-z0-9_-]+\/viewform\/?$/.test(url.pathname)) return null;
    url.search = '';
    url.hash = '';
    const responder = url.href;
    url.searchParams.set('embedded', 'true');
    return { responder, embed: url.href };
  } catch { return null; }
}
