// @vitest-environment node
import { rewriteDeclaration } from '../../scripts/fix-declarations.mjs';

// TC-S14 (declarations): the compiler writes `from './engine/dynamic-form'`, which a consumer using
// Node's ESM rules (`moduleResolution: nodenext`) cannot resolve, so every type becomes `any`. The build
// rewrites each relative specifier to a path with its extension.
const exists = (files: string[]) => (path: string) => files.includes(path);

describe('rewriteDeclaration', () => {
  const dir = '/pkg/dist';
  const files = exists([
    '/pkg/dist/a.d.ts',
    '/pkg/dist/engine/form/index.d.ts',
    '/pkg/dist/engine/form/props.d.ts',
  ]);

  it.each([
    ["import { A } from './a';", "import { A } from './a.js';"],
    ["export type { B } from './engine/form';", "export type { B } from './engine/form/index.js';"],
    [
      'import type { C } from "./engine/form/props";',
      'import type { C } from "./engine/form/props.js";',
    ],
    ["type T = import('./engine/form').T;", "type T = import('./engine/form/index.js').T;"],
  ])('rewrites %s', (input, expected) => {
    expect(rewriteDeclaration(input, dir, files)).toBe(expected);
  });

  it('leaves packages, absolute paths and files that are not there alone', () => {
    const text =
      "import { z } from 'zod';\nimport type { R } from 'react';\nimport x from './missing';\n";
    expect(rewriteDeclaration(text, dir, files)).toBe(text);
  });

  it('resolves a specifier from the folder of the file that holds it', () => {
    expect(rewriteDeclaration("import { A } from '../a';", '/pkg/dist/engine', files)).toBe(
      "import { A } from '../a.js';",
    );
  });
});
