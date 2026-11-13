// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// TC-E16 (the static half): the page is Persian and right-to-left before any script runs (PRD FR-38).
describe('index.html', () => {
  const html = readFileSync(join(process.cwd(), 'apps', 'demo', 'index.html'), 'utf8');
  const root = /<html\b[^>]*>/.exec(html)?.[0] ?? '';

  it('declares Persian and right-to-left on the root element', () => {
    expect(root).toMatch(/\blang="fa"/);
    expect(root).toMatch(/\bdir="rtl"/);
  });

  it('is responsive: it sets the viewport', () => {
    expect(html).toMatch(/<meta\s+name="viewport"/);
  });

  // Before the app mounts, and if it never does, the tab still has a title in the page's language.
  it('has a Persian title for the moments before the app sets its own', () => {
    const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
    expect(title).toMatch(/[\u0600-\u06FF]/);
  });
});
