// @vitest-environment node
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
