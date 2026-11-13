// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const json = (path: string) => JSON.parse(read(path)) as Record<string, Record<string, string>>;

// TC-S17, ADR-0019: the page is Persian, so the font is Vazirmatn, and it has to reach every part
// of the page. Three things can silently stop that: the font is never loaded, the stack does not
// name it, or the form controls (which do not inherit a font by themselves) ignore it.
describe('the Vazirmatn font', () => {
  it('is named first in the design tokens', () => {
    expect(read('packages/renderer/src/default-kit/tokens.css')).toMatch(
      /--df-font-family:\s*Vazirmatn\s*,/,
    );
  });

  it('is loaded by the app from a pinned package, so it works offline', () => {
    expect(read('apps/demo/src/main.tsx')).toContain(
      "'vazirmatn/Vazirmatn-variable-font-face.css'",
    );
    const version = json('apps/demo/package.json')['dependencies']?.['vazirmatn'];
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it.each([
    [
      'text input, text area and select',
      'packages/renderer/src/default-kit/control-styles/styles.module.css',
      '.control',
    ],
    ['button', 'packages/renderer/src/default-kit/button/styles.module.css', '.button'],
  ])('is inherited by the %s', (_name, path, selector) => {
    const css = read(path);
    const rule = css.slice(css.indexOf(`${selector} {`));
    expect(rule.slice(0, rule.indexOf('}'))).toMatch(/font:\s*inherit\s*;/);
  });
});
