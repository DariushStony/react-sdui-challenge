// The compiler writes declarations with extensionless specifiers (`from './engine/form'`). A consumer
// that resolves modules the way Node's ESM does (`moduleResolution: node16` or `nodenext`) cannot find
// those files, and with `skipLibCheck` every type quietly becomes `any`. This gives each relative
// specifier in the built declarations its real path, with the `.js` extension TypeScript expects.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*)(['"])(\.{1,2}\/[^'"]*)\2/g;

export function rewriteDeclaration(text, dir, exists) {
  return text.replace(SPECIFIER, (whole, lead, quote, spec) => {
    const target = resolve(dir, spec);
    if (exists(`${target}.d.ts`)) return `${lead}${quote}${spec}.js${quote}`;
    if (exists(join(target, 'index.d.ts')))
      return `${lead}${quote}${spec.replace(/\/$/, '')}/index.js${quote}`;
    return whole;
  });
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function main() {
  const dist = join(process.cwd(), 'packages', 'renderer', 'dist');
  let changed = 0;
  for (const file of walk(dist).filter((f) => f.endsWith('.d.ts'))) {
    const before = readFileSync(file, 'utf8');
    const after = rewriteDeclaration(before, dirname(file), existsSync);
    if (after !== before) {
      writeFileSync(file, after);
      changed++;
    }
  }
  console.log(`Declarations: ${changed} files now name their imports with an extension.`);
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href)
  main();
