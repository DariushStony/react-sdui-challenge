// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import stylelint from 'stylelint';

// TC-S02: direction-sensitive CSS must fail the style lint (ADR-0008). Each row is one stylesheet
// fixture run through the project's real stylelint configuration.
async function rulesReportedFor(code: string): Promise<string[]> {
  const result = await stylelint.lint({
    code,
    codeFilename: 'fixture.module.css',
    configFile: '.stylelintrc.json',
  });
  return (result.results[0]?.warnings ?? []).map((warning) => warning.rule);
}

const PROPS = 'logical-css/require-logical-properties';
const KEYWORDS = 'logical-css/require-logical-keywords';
const SHORTHAND = 'declaration-property-value-disallowed-list';

describe('style lint rejects physical CSS', () => {
  it.each([
    ['margin-right', '.a { margin-right: 1rem; }', PROPS],
    ['padding-left', '.a { padding-left: 4px; }', PROPS],
    ['left', '.a { left: 0; }', PROPS],
    ['border-right', '.a { border-right: 1px solid red; }', PROPS],
    ['text-align: left', '.a { text-align: left; }', KEYWORDS],
    ['float: left', '.a { float: left; }', KEYWORDS],
    ['four-value margin', '.a { margin: 0 1rem 0 2rem; }', SHORTHAND],
    ['four-value padding', '.a { padding: 1px 2px 3px 4px; }', SHORTHAND],
  ])('%s', async (_name, css, rule) => {
    expect(await rulesReportedFor(css)).toContain(rule);
  });
});

describe('style lint accepts logical CSS', () => {
  it.each([
    [
      'logical longhands',
      '.a { margin-inline-start: 1rem; padding-block: 2px; inset-inline-start: 0; }',
    ],
    ['logical keywords', '.a { text-align: start; float: inline-start; }'],
    ['direction-insensitive sizes', '.a { width: 10px; max-width: 100%; height: 2px; }'],
    ['two-value and one-value shorthands', '.a { margin: 0 1rem; padding: 4px; }'],
    ['css modules syntax', '.a { composes: b; }\n:global(.x) .a { margin-inline: 1rem; }'],
  ])('%s', async (_name, css) => {
    expect(await rulesReportedFor(css)).toEqual([]);
  });
});

// TC-M03 / EC-15: a long label, option or file name with no spaces must wrap instead of widening the
// page. jsdom has no layout, so this pins the one declaration that does it; the visual check is manual.
describe('base styles keep long text inside the page', () => {
  const base = readFileSync(join(process.cwd(), 'apps', 'demo', 'src', 'base.css'), 'utf8');

  it('lets text wrap anywhere, which also lowers the minimum width of grid and flex items', () => {
    expect(base).toMatch(/body\s*{[^}]*overflow-wrap:\s*anywhere/);
  });

  it('keeps preformatted text scrolling inside its own box', () => {
    expect(base).toMatch(/pre\s*{[^}]*max-inline-size:\s*100%[^}]*overflow:\s*auto/);
  });
});

// A grid column sized `auto` is as wide as its widest content, so one long unbreakable line (a
// request shown in a `pre`, a file name) makes a whole panel wider than a phone. `minmax(0, 1fr)`
// lets the column shrink and the content scroll or wrap instead. Found in a real browser at 375 px.
describe('grid containers in ui/ can shrink below their content', () => {
  const dir = join(process.cwd(), 'packages', 'renderer', 'src', 'ui');
  const files = readdirSync(dir).filter((name) => name.endsWith('.module.css'));

  it.each(files)('%s', (name) => {
    const css = readFileSync(join(dir, name), 'utf8');
    const grids = [...css.matchAll(/([^{}]+)\{([^{}]*display:\s*grid[^{}]*)\}/g)];
    for (const [, selector, body] of grids) {
      expect(body, `${selector?.trim()} in ${name}`).toMatch(
        /grid-template-columns:\s*minmax\(0,\s*1fr\)/,
      );
    }
  });
});
