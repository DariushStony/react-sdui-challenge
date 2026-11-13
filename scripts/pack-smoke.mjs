// Packs the renderer and uses it from a clean project, the way a consumer would (TC-S14, ADR-0014).
// It checks what a test inside the repository cannot: that the published `exports` and files are
// right, that the types work for every way of resolving modules, that the client entry is marked and
// the logic entry has no React, and that the package renders with only its peer dependencies.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();
const run = (command, args, cwd) =>
  execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });

const workspace = JSON.parse(
  readFileSync(join(root, 'packages', 'renderer', 'package.json'), 'utf8'),
);
const peers = Object.entries(workspace.devDependencies)
  .filter(([name]) => name in workspace.peerDependencies)
  .map(([name, version]) => `${name}@${version}`);

const CONSUMER = `import {
  DynamicForm,
  DynamicFormProvider,
  defaultUiKit,
  enMessages,
  type Messages,
  type SubmitOutcome,
  type UiKit,
} from '@dynamic-form/renderer';
import {
  buildFormData,
  normalize,
  parseServerErrors,
  validateValues,
  type FormModel,
  type ParseResult,
} from '@dynamic-form/renderer/core';

const parsed: ParseResult = normalize({}, 'x');
const kit: UiKit = { ...defaultUiKit };
const messages: Messages = enMessages;

export function check(model: FormModel): SubmitOutcome | typeof DynamicForm | typeof DynamicFormProvider {
  const body: FormData = buildFormData(model, {});
  const errors: Record<string, unknown> = validateValues(model, {});
  void [parsed, kit, messages, body, errors, parseServerErrors({}, [])];
  // A number is not a form id: the declarations must really type the API, not turn it into any.
  // @ts-expect-error
  normalize({}, 1);
  return { ok: true };
}
`;

const RENDER = `import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { DynamicForm, DynamicFormProvider, defaultUiKit, enMessages } from '@dynamic-form/renderer';
import { normalize } from '@dynamic-form/renderer/core';

const parsed = normalize({ schemaVersion: 2, fields: [{ kind: 'text', name: 'nick', label: 'Nickname', rules: { required: true } }] }, 'smoke');
if (!parsed.ok) throw new Error('the payload was refused: ' + JSON.stringify(parsed.issues));
const form = (extra) => createElement(DynamicForm, { model: parsed.model, onSubmit: async () => ({ ok: true }), ...extra });

const html = renderToString(form());
for (const part of ['<form', '<label', 'Nickname', '<input']) {
  if (!html.includes(part)) throw new Error('the rendered form lacks ' + part + ': ' + html);
}
console.log('rendered', html.length, 'characters of HTML');

// A host's own language and design component, from the packed package (ADR-0015).
const kit = { ...defaultUiKit, Button: ({ children }) => createElement('button', { 'data-kit': 'smoke' }, children) };
const custom = renderToString(createElement(DynamicFormProvider, { ui: kit, messages: enMessages }, form()));
for (const part of ['Submit', 'data-kit="smoke"', 'Nickname']) {
  if (!custom.includes(part)) throw new Error('the form with a custom kit and language lacks ' + part + ': ' + custom);
}
console.log('rendered again with an English catalog and a custom button');
`;

const dir = mkdtempSync(join(tmpdir(), 'renderer-smoke-'));
try {
  run('pnpm', ['run', 'build:lib'], root);
  run('pnpm', ['pack', '--pack-destination', dir], join(root, 'packages', 'renderer'));
  const tarball = readdirSync(dir).find((name) => name.endsWith('.tgz'));
  if (tarball === undefined) throw new Error('pnpm pack produced no tarball');

  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'consumer', private: true, type: 'module' }),
  );
  run('npm', ['install', '--no-audit', '--no-fund', join(dir, tarball), ...peers], dir);

  const installed = join(dir, 'node_modules', '@dynamic-form', 'renderer');
  const manifest = JSON.parse(readFileSync(join(installed, 'package.json'), 'utf8'));
  const main = manifest.exports['.'];
  const core = manifest.exports['./core'];
  for (const target of [
    main.default,
    main.types,
    core.default,
    core.types,
    manifest.exports['./styles.css'],
    manifest.exports['./tokens.css'],
  ]) {
    if (!existsSync(join(installed, target)))
      throw new Error(`The package lists ${target}, which is not in it`);
  }
  if (existsSync(join(installed, 'src')))
    throw new Error('The sources are in the package; only dist should be');

  // The client entry is marked for frameworks with server components; the logic entry has no React.
  if (!readFileSync(join(installed, main.default), 'utf8').startsWith('"use client"')) {
    throw new Error('the client entry must start with "use client"');
  }
  const logic = readFileSync(join(installed, core.default), 'utf8');
  if (/from\s*["']react/.test(logic) || logic.startsWith('"use client"')) {
    throw new Error('the logic entry must not import React or be marked "use client"');
  }

  // Are the types right for every way of resolving modules a consumer might use?
  // (The two stylesheets are not code; the tool would report them as unresolvable.)
  run(
    'npx',
    [
      'attw',
      join(dir, tarball),
      '--profile',
      'esm-only',
      '--no-emoji',
      '--exclude-entrypoints',
      './styles.css',
      './tokens.css',
    ],
    root,
  );

  // Type-check a small consumer with strict settings in both resolution modes: a broken declaration
  // file would otherwise turn every type into `any` without a single error.
  writeFileSync(join(dir, 'consumer.ts'), CONSUMER);
  for (const resolution of ['bundler', 'nodenext']) {
    const config = {
      compilerOptions: {
        strict: true,
        noEmit: true,
        module: resolution === 'nodenext' ? 'nodenext' : 'esnext',
        moduleResolution: resolution,
        target: 'es2023',
        lib: ['es2023', 'dom'],
        skipLibCheck: false,
        types: [],
      },
      files: ['consumer.ts'],
    };
    writeFileSync(join(dir, `tsconfig.${resolution}.json`), JSON.stringify(config));
    run(join(root, 'node_modules', '.bin', 'tsc'), ['-p', `tsconfig.${resolution}.json`], dir);
  }

  writeFileSync(join(dir, 'render.mjs'), RENDER);
  console.log(run('node', ['render.mjs'], dir).trim());
  console.log(
    `Packed ${tarball}, installed it with npm, type-checked a consumer, and rendered a form from it.`,
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
