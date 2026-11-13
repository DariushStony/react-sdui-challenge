// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

// TC-S01: the module boundaries from TDD 4.2 must fail in lint, not only in review.
// Fixtures are written to a temporary folder and linted with the project's real config, so the
// intentionally bad files never appear in the repository or in the normal lint run.
const root = process.cwd();
const oxlintBin = join(root, 'node_modules', 'oxlint', 'bin', 'oxlint');

type Diagnostic = { code: string; filename: string };

function lint(files: Record<string, string>): Diagnostic[] {
  const dir = mkdtempSync(join(tmpdir(), 'boundary-'));
  try {
    copyFileSync(join(root, '.oxlintrc.json'), join(dir, '.oxlintrc.json'));
    for (const [path, content] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), content);
    }
    let output: string;
    try {
      output = execFileSync(
        process.execPath,
        [oxlintBin, '--config', '.oxlintrc.json', '--format', 'json', '.'],
        { cwd: dir, encoding: 'utf8' },
      );
    } catch (error) {
      // oxlint exits with 1 when it reports errors; the report is still on stdout.
      output = (error as { stdout?: string }).stdout ?? '';
    }
    return (JSON.parse(output) as { diagnostics: Diagnostic[] }).diagnostics;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const RESTRICTED = 'eslint(no-restricted-imports)';

const cases: { name: string; path: string; code: string; restricted: boolean }[] = [
  {
    name: 'engine imports a style module',
    path: 'src/engine/leak.ts',
    code: "import styles from '../ui/Field.module.css';\nexport default styles;\n",
    restricted: true,
  },
  {
    name: 'engine imports a side-effect stylesheet',
    path: 'src/engine/leak-effect.ts',
    code: "import '../ui/tokens.css';\n",
    restricted: true,
  },
  {
    name: 'engine imports the api client',
    path: 'src/engine/leak-api.ts',
    code: "import { fetchForm } from '../api/client';\nexport default fetchForm;\n",
    restricted: true,
  },
  {
    name: 'core imports react',
    path: 'src/core/leak-react.ts',
    code: "import { useState } from 'react';\nexport default useState;\n",
    restricted: true,
  },
  {
    name: 'core imports a field module',
    path: 'src/core/leak-fields.ts',
    code: "import { kinds } from '../fields';\nexport default kinds;\n",
    restricted: true,
  },
  {
    name: 'kind definition imports react',
    path: 'src/fields/text/definition.ts',
    code: "import { useState } from 'react';\nexport default useState;\n",
    restricted: true,
  },
  {
    name: 'field component imports the api client',
    path: 'src/fields/text/Component.tsx',
    code: "import { fetchForm } from '../../api/client';\nexport default fetchForm;\n",
    restricted: true,
  },
  {
    name: 'ui imports the engine',
    path: 'src/ui/leak.ts',
    code: "import { DynamicForm } from '../engine/DynamicForm';\nexport default DynamicForm;\n",
    restricted: true,
  },
  {
    name: 'api imports ui',
    path: 'src/api/leak.ts',
    code: "import { Field } from '../ui/Field';\nexport default Field;\n",
    restricted: true,
  },
  {
    name: 'playground imports the api client',
    path: 'src/playground/leak.ts',
    code: "import { submitForm } from '../api/client';\nexport default submitForm;\n",
    restricted: true,
  },
  {
    name: 'control: engine imports core and ui',
    path: 'src/engine/ok.ts',
    code: "import { parseSize } from '../core/sizes';\nimport { Field } from '../ui/Field';\nexport default [parseSize, Field];\n",
    restricted: false,
  },
  {
    name: 'control: core imports zod and itself',
    path: 'src/core/ok.ts',
    code: "import { z } from 'zod';\nimport { parseSize } from './sizes';\nexport default [z, parseSize];\n",
    restricted: false,
  },
  {
    name: 'control: ui imports its own stylesheet',
    path: 'src/ui/ok.ts',
    code: "import styles from './Field.module.css';\nexport default styles;\n",
    restricted: false,
  },
];

describe('module boundaries', () => {
  const diagnostics = lint(Object.fromEntries(cases.map((c) => [c.path, c.code])));

  it.each(cases)('$name', ({ path, restricted }) => {
    const restrictedHere = diagnostics.filter((d) => d.filename === path && d.code === RESTRICTED);
    expect(restrictedHere.length > 0).toBe(restricted);
  });
});
