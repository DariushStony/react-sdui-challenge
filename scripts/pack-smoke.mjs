// Packs the renderer and uses it from a clean project, the way a consumer would (TC-S14, ADR-0014).
// It checks what a test inside the repository cannot: that the published `exports` and files are
// right, that the peer dependencies are enough, and that the package renders without the workspace.
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
  for (const target of [
    manifest.exports['.'].default,
    manifest.exports['.'].types,
    manifest.exports['./styles.css'],
    manifest.exports['./tokens.css'],
  ]) {
    if (!existsSync(join(installed, target)))
      throw new Error(`The package lists ${target}, which is not in it`);
  }
  if (existsSync(join(installed, 'src')))
    throw new Error('The sources are in the package; only dist should be');

  writeFileSync(
    join(dir, 'render.mjs'),
    `import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { DynamicForm, normalize } from '@dynamic-form/renderer';

const parsed = normalize({ schemaVersion: 2, fields: [{ kind: 'text', name: 'nick', label: 'Nickname', rules: { required: true } }] }, 'smoke');
if (!parsed.ok) throw new Error('the payload was refused: ' + JSON.stringify(parsed.issues));
const html = renderToString(createElement(DynamicForm, { model: parsed.model, onSubmit: async () => ({ ok: true }) }));
for (const part of ['<form', '<label', 'Nickname', '<input']) {
  if (!html.includes(part)) throw new Error('the rendered form lacks ' + part + ': ' + html);
}
console.log('rendered', html.length, 'characters of HTML');
`,
  );
  console.log(run('node', ['render.mjs'], dir).trim());
  console.log(`Packed ${tarball}, installed it with npm, and rendered a form from it.`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
