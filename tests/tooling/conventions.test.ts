// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// TC-S12, ADR-0016: the source tree follows the conventions, and this test is what keeps it so.
//   - every file and folder is kebab-case;
//   - a file with an export is `index.ts(x)` and has exactly one, written as `export { X };` (or
//     `export type { X };`) after the code: no inline export, no default export, no re-export;
//   - a stylesheet of a module is `styles.module.css`;
//   - a test exports nothing.
// A package's public entries (`src/index.ts` and `src/<name>-entry.ts`) are the one place that may list
// several re-exports.
const root = process.cwd();
const sourceRoots = ['packages', 'apps'].flatMap((group) =>
  readdirSync(join(root, group)).map((name) => join(root, group, name, 'src')),
);

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FILE = /^([a-z0-9]+(?:-[a-z0-9]+)*)(\.test|\.module|\.d)?\.(ts|tsx|css)$/;

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

// A package's public entries: `src/index.ts` and, for a second entry point, `src/<name>-entry.ts`.
const isEntry = (path: string) =>
  /packages[\\/][^\\/]+[\\/]src[\\/](index|[a-z0-9-]+-entry)\.ts$/.test(path);

/** What is wrong with one file, as plain sentences; empty when it follows the conventions. */
function violationsOf(path: string, text: string): string[] {
  const problems: string[] = [];
  const parts = path.split(/[\\/]/);
  const name = parts[parts.length - 1] ?? '';

  for (const folder of parts.slice(0, -1).slice(parts.lastIndexOf('src') + 1)) {
    if (!KEBAB.test(folder)) problems.push(`the folder "${folder}" is not kebab-case`);
  }
  if (!FILE.test(name)) problems.push(`the file name "${name}" is not kebab-case`);

  if (name.endsWith('.module.css') && name !== 'styles.module.css') {
    problems.push(`a module stylesheet must be named styles.module.css, not "${name}"`);
  }

  if (!/\.(ts|tsx)$/.test(name) || name.endsWith('.d.ts') || isEntry(path)) return problems;

  // Top-level statements start at column 0 (the code is formatted by Prettier).
  const exportLines = text.split('\n').filter((line) => /^export\b/.test(line));
  const isTest = /\.test\.(ts|tsx)$/.test(name);
  const statements: string[] = [];
  for (const line of exportLines) {
    if (/^export default\b/.test(line)) problems.push('uses a default export');
    else if (/^export\s+(\*|type\s+\*)/.test(line) || /\bfrom\s+['"]/.test(line)) {
      problems.push(`re-exports from another file: ${line.trim()}`);
    } else if (/^export\s+(type\s+)?\{[^}]*\};?\s*$/.test(line)) {
      statements.push(line);
      if (/,/.test(line)) problems.push(`exports more than one name: ${line.trim()}`);
    } else problems.push(`has an inline export: ${line.trim()}`);
  }
  if (statements.length > 1)
    problems.push(`has ${statements.length} export statements; one is allowed`);
  if (isTest && exportLines.length > 0) problems.push('a test file exports something');
  if (statements.length === 1 && !/^index\.(ts|tsx)$/.test(name)) {
    problems.push(`exports something but is "${name}"; a module's file is index.ts or index.tsx`);
  }
  return problems;
}

describe('violationsOf (the rules, shown on small examples)', () => {
  const ok = 'const a = 1;\n\nexport { a };\n';
  it.each([
    ['a module that follows the rules', 'src/a-b/index.ts', ok, []],
    ['a type module', 'src/a/index.ts', 'type A = 1;\n\nexport type { A };\n', []],
    ['a file with no export, any kebab name', 'src/setup.ts', 'const a = 1;\n', []],
    [
      'the package entry may re-export',
      'packages/x/src/index.ts',
      "export { a } from './a';\nexport { b } from './b';\n",
      [],
    ],
  ] as const)('accepts %s', (_name, path, text, expected) => {
    expect(violationsOf(path, text)).toEqual(expected);
  });

  it.each([
    ['an inline function export', 'src/a/index.ts', 'export function f() {}\n', /inline export/],
    ['an inline const export', 'src/a/index.ts', 'export const f = 1;\n', /inline export/],
    ['an inline type export', 'src/a/index.ts', 'export type A = 1;\n', /inline export/],
    ['an inline interface export', 'src/a/index.ts', 'export interface A {}\n', /inline export/],
    ['a default export', 'src/a/index.ts', 'const a = 1;\nexport default a;\n', /default export/],
    [
      'two exports in one statement',
      'src/a/index.ts',
      'const a = 1, b = 2;\nexport { a, b };\n',
      /more than one name/,
    ],
    [
      'two export statements',
      'src/a/index.ts',
      'const a = 1;\nconst b = 2;\nexport { a };\nexport { b };\n',
      /2 export statements/,
    ],
    ['a re-export', 'src/a/index.ts', "export { a } from './a';\n", /re-exports/],
    ['a star re-export', 'src/a/index.ts', "export * from './a';\n", /re-exports/],
    [
      'an export in a file that is not index',
      'src/a/helper.ts',
      'const a = 1;\nexport { a };\n',
      /index\.ts or index\.tsx/,
    ],
    [
      'an export in a test',
      'src/a/index.test.ts',
      'const a = 1;\nexport { a };\n',
      /test file exports/,
    ],
    ['a camelCase file', 'src/aB/index.ts', 'const a = 1;\n', /not kebab-case/],
    [
      'a camelCase folder',
      'src/foo/barBaz/index.ts',
      'const a = 1;\n',
      /"barBaz" is not kebab-case/,
    ],
    ['a PascalCase file', 'src/a/Button.tsx', 'const a = 1;\n', /not kebab-case/],
    [
      'a stylesheet with another name',
      'src/a/Button.module.css',
      '',
      /not kebab-case|styles\.module\.css/,
    ],
    ['a module stylesheet not named styles', 'src/a/button.module.css', '', /styles\.module\.css/],
  ] as const)('reports %s', (_name, path, text, expected) => {
    expect(violationsOf(path, text).join('\n')).toMatch(expected);
  });
});

describe('the source trees', () => {
  const files = sourceRoots.flatMap((dir) => walk(dir));

  it('are found, so an empty scan cannot pass', () => {
    expect(files.length).toBeGreaterThan(200);
  });

  it.each(sourceRoots.map((dir) => [relative(root, dir).split(sep).join('/'), dir] as const))(
    '%s follows the conventions',
    (_name, dir) => {
      const report = walk(dir).flatMap((file) => {
        const problems = violationsOf(file, readFileSync(file, 'utf8'));
        return problems.map((problem) => `${relative(root, file)}: ${problem}`);
      });
      expect(report).toEqual([]);
    },
  );
});
