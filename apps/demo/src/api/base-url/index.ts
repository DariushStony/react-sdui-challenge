// Node's fetch (used in tests) rejects relative URLs, so requests are always absolute. In the
// browser this is the page's own origin, which is where the real or mocked API lives.
function apiUrl(path: string): string {
  const origin = typeof location === 'undefined' ? 'http://localhost' : location.origin;
  return new URL(path, origin === 'null' ? 'http://localhost' : origin).href;
}

export { apiUrl };
