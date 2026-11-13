// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

// TC-S16, ADR-0017: export only what is needed. Two things are checked.
//   1. The package's two public entries list exactly the names below, and every name is used by the
//      demo app's own code or is on the short, justified list of names that only an integrator needs.
//   2. No module exports something that nothing else uses: a module is imported by another source
//      file or by an entry.
const root = process.cwd();
const renderer = join(root, 'packages', 'renderer', 'src');
const demo = join(root, 'apps', 'demo', 'src');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const isTest = (file: string) => /\.test\.(ts|tsx)$/.test(file) || /[\\/]test[\\/]/.test(file);
const files = [...walk(renderer), ...walk(demo)].filter((file) => /\.(ts|tsx)$/.test(file));
const text = (file: string) => readFileSync(file, 'utf8');

function exportedNames(entry: string): string[] {
  return [...text(entry).matchAll(/^export (?:type )?\{ (\w+) \} from /gm)].map((m) => m[1]!);
}

const ENTRIES = {
  '@dynamic-form/renderer': join(renderer, 'index.ts'),
  '@dynamic-form/renderer/core': join(renderer, 'core-entry.ts'),
};

// What the two entries export, exactly. Adding a name means adding it here, and saying why.
const EXPECTED: Record<string, string[]> = {
  '@dynamic-form/renderer': [
    'DynamicForm',
    'DynamicFormProvider',
    'SubmitOutcome',
    'defaultUiKit',
    'fieldIds',
    'UiKit',
    'createTranslator',
    'enMessages',
    'faMessages',
    'Messages',
  ],
  '@dynamic-form/renderer/core': [
    'normalize',
    'buildFormData',
    'validateValues',
    'parseServerErrors',
    'FormModel',
    'FormValues',
    'Issue',
    'ParseResult',
    'RejectionReason',
    'ServerErrors',
  ],
};

// Needed by someone who uses the package, though the demo app does not use it itself.
const FOR_INTEGRATORS: Record<string, string> = {
  DynamicFormProvider: 'gives the form a design system and a language (README, ADR-0015)',
  enMessages: 'the second shipped language (README)',
  faMessages: 'the default language, to override a message of it',
  UiKit: 'the type a design-system adapter must satisfy (README)',
  validateValues: 'applies the form rules again on a server (README, ADR-0017)',
};

describe('the public entries', () => {
  it.each(Object.entries(ENTRIES))('%s exports exactly the agreed names', (name, file) => {
    expect(exportedNames(file).toSorted()).toEqual(EXPECTED[name]!.toSorted());
  });

  it.each(Object.entries(ENTRIES))(
    '%s: every name is used by the demo, or is justified',
    (name, file) => {
      const demoCode = files
        .filter((f) => f.startsWith(demo) && !isTest(f))
        .map(text)
        .join('\n');
      const importedFromThisEntry = [
        ...demoCode.matchAll(new RegExp(`import (?:type )?\\{([^}]*)\\} from '${name}';`, 'g')),
      ]
        .flatMap((m) =>
          m[1]!.split(',').map(
            (part) =>
              part
                .trim()
                .replace(/^type /, '')
                .split(' as ')[0]!,
          ),
        )
        .filter(Boolean);
      const unused = exportedNames(file).filter(
        (n) => !importedFromThisEntry.includes(n) && FOR_INTEGRATORS[n] === undefined,
      );
      expect(unused, `exported but used by nothing: ${unused.join(', ')}`).toEqual([]);
    },
  );

  it('keeps the justified list honest: every name on it is really exported', () => {
    const all = Object.values(ENTRIES).flatMap(exportedNames);
    expect(Object.keys(FOR_INTEGRATORS).filter((n) => !all.includes(n))).toEqual([]);
  });
});

describe('the modules', () => {
  const entryFiles = new Set(Object.values(ENTRIES));
  const resolveSpec = (spec: string, from: string): string | undefined => {
    const base = resolve(dirname(from), spec);
    return [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      join(base, 'index.ts'),
      join(base, 'index.tsx'),
    ].find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
  };

  // Which source file imports which, by relative path (the code is formatted, one import per statement).
  const importedBy = new Map<string, Set<string>>();
  for (const file of files) {
    for (const m of text(file).matchAll(/(?:from|import\()\s*'(\.[^']*)'/g)) {
      const target = resolveSpec(m[1]!, file);
      if (target === undefined) continue;
      if (!importedBy.has(target)) importedBy.set(target, new Set());
      importedBy.get(target)!.add(file);
    }
  }

  it('is found, so an empty scan cannot pass', () => {
    expect(importedBy.size).toBeGreaterThan(150);
  });

  it('exports nothing that no other source file or entry uses', () => {
    const dead = files
      .filter((file) => /[\\/]index\.tsx?$/.test(file) && !isTest(file) && !entryFiles.has(file))
      .filter((file) => /^export (type )?\{ /m.test(text(file)))
      .filter((file) => ![...(importedBy.get(file) ?? [])].some((importer) => !isTest(importer)))
      .map((file) => relative(root, file));
    expect(dead).toEqual([]);
  });
});
