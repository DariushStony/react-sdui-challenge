// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const BASE = read('apps/demo/src/base.css');
const TOKENS = read('packages/renderer/src/default-kit/tokens.css');

function variable(css: string, name: string): string {
  const value = new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`).exec(css)?.[1];
  if (value === undefined) throw new Error(`${name} is not a six-digit colour in the stylesheet`);
  return value;
}

// WCAG 2.2: relative luminance of an sRGB colour, then (lighter + 0.05) / (darker + 0.05).
function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light = 0, dark = 0] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// TC-S18, ADR-0020: the JSON box has its own background, and every colour drawn on it has to stay
// readable. Changing the background (or a colour) must not silently break WCAG AA: 4.5:1 for text,
// 3:1 for the box's border against it.
describe('the colours of the JSON box', () => {
  const background = variable(BASE, '--demo-syntax-background');

  it.each([
    ['keys', variable(BASE, '--demo-syntax-key')],
    ['strings', variable(BASE, '--demo-syntax-string')],
    ['numbers', variable(BASE, '--demo-syntax-number')],
    ['literals', variable(BASE, '--demo-syntax-literal')],
    ['punctuation', variable(BASE, '--demo-syntax-punctuation')],
    ['text that is not JSON', variable(TOKENS, '--df-color-danger')],
    ['the text itself (caret)', variable(TOKENS, '--df-color-text')],
  ])('%s are readable on the background', (_name, colour) => {
    expect(contrast(colour, background)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the border of the box visible against the background', () => {
    expect(contrast(variable(TOKENS, '--df-color-border'), background)).toBeGreaterThanOrEqual(3);
  });

  // The copy and the text area share a transparent 1px border so their text lines up; the text area
  // must then paint the real border over it, or the box has no visible edge.
  it('paints the border of the box on the text area, not only on the copy', () => {
    const css = read('apps/demo/src/playground/json-editor/styles.module.css');
    expect(css).toMatch(/^\.editor \.input \{[^}]*border-color:\s*var\(--df-color-border\)/m);
  });

  it('is drawn behind the text by the editor', () => {
    expect(read('apps/demo/src/playground/json-editor/styles.module.css')).toMatch(
      /background:\s*var\(--demo-syntax-background\)/,
    );
  });
});
