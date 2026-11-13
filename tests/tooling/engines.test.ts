// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

// NFR-10: the Node versions we say we support must be ones every dependency supports. This was wrong
// once: package.json said 22.12 while the test tooling (jsdom, undici) needs 22.22, and nothing
// failed until the tests were run on 22.12. Reading the installed packages keeps the claim honest.
type Version = readonly [number, number, number];

const readJson = (path: string) =>
  JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;

function parse(text: string): Version {
  const [major = 0, minor = 0, patch = 0] = text.split('.').map(Number);
  return [major, minor, patch];
}

const atLeast = (version: Version, floor: Version) =>
  version[0] !== floor[0]
    ? version[0] > floor[0]
    : version[1] !== floor[1]
      ? version[1] > floor[1]
      : version[2] >= floor[2];

// Only the two range forms Node packages use: `^x.y.z` (same major) and `>=x.y.z`.
function allows(range: string, version: Version): boolean {
  return range.split('||').some((term) => {
    const match = /^\s*(\^|>=)\s*(\d+(?:\.\d+){0,2})\s*$/.exec(term);
    if (match?.[1] === undefined || match[2] === undefined) return false;
    const floor = parse(match[2]);
    return atLeast(version, floor) && (match[1] === '>=' || version[0] === floor[0]);
  });
}

describe('allows (the range reader used below)', () => {
  it.each([
    ['^22.22.2 || ^24.15.0 || >=26.0.0', '22.22.2', true],
    ['^22.22.2 || ^24.15.0 || >=26.0.0', '22.12.0', false],
    ['^22.22.2 || ^24.15.0 || >=26.0.0', '23.0.0', false],
    ['^22.22.2 || ^24.15.0 || >=26.0.0', '27.1.0', true],
    ['>=22.19.0', '22.22.2', true],
    ['>=22.12', '22.12.0', true],
  ])('%s with %s is %s', (range, version, expected) => {
    expect(allows(range, parse(version))).toBe(expected);
  });
});

describe('package.json engines', () => {
  const rootDir = process.cwd();
  const pkg = readJson(join(rootDir, 'package.json'));
  const ours = (pkg['engines'] as { node: string }).node;
  // The lowest version each part of our range allows: what a person on that Node would run.
  const floors = ours
    .split('||')
    .map((term) => parse(term.replace(/[^\d.]/g, '')))
    .filter((version) => version[0] > 0);

  // Every workspace package declares its own dependencies, installed in its own node_modules or the root's.
  const packageDirs = [
    rootDir,
    ...['packages', 'apps'].flatMap((group) => {
      const base = join(rootDir, group);
      return existsSync(base) ? readdirSync(base).map((name) => join(base, name)) : [];
    }),
  ].filter((dir) => existsSync(join(dir, 'package.json')));

  const dependencies = packageDirs.flatMap((dir) => {
    const manifest = readJson(join(dir, 'package.json'));
    return [
      ...Object.keys((manifest['dependencies'] ?? {}) as object),
      ...Object.keys((manifest['devDependencies'] ?? {}) as object),
    ].map((name) => ({ dir, name }));
  });

  it('names at least one Node version', () => {
    expect(floors.length).toBeGreaterThan(0);
  });

  it.each(dependencies.map(({ dir, name }) => [relative(rootDir, dir) || '.', name, dir] as const))(
    '%s: %s supports every Node version we claim to support',
    (_where, name, dir) => {
      const candidates = [join(dir, 'node_modules', name), join(rootDir, 'node_modules', name)];
      const path = candidates
        .map((base) => join(base, 'package.json'))
        .find((file) => existsSync(file));
      if (path === undefined) return;
      const range = (readJson(path)['engines'] as { node?: string } | undefined)?.node;
      if (range === undefined) return;
      for (const floor of floors) expect(allows(range, floor), `${name} needs ${range}`).toBe(true);
    },
  );
});
