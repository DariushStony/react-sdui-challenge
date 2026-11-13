// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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
  const pkg = readJson(join(process.cwd(), 'package.json'));
  const ours = (pkg['engines'] as { node: string }).node;
  // The lowest version each part of our range allows: what a person on that Node would run.
  const floors = ours
    .split('||')
    .map((term) => parse(term.replace(/[^\d.]/g, '')))
    .filter((version) => version[0] > 0);
  const names = [
    ...Object.keys((pkg['dependencies'] ?? {}) as object),
    ...Object.keys((pkg['devDependencies'] ?? {}) as object),
  ];

  it('names at least one Node version', () => {
    expect(floors.length).toBeGreaterThan(0);
  });

  it.each(names)('is supported by %s on every Node version we claim to support', (name) => {
    const path = join(process.cwd(), 'node_modules', name, 'package.json');
    if (!existsSync(path)) return;
    const range = (readJson(path)['engines'] as { node?: string } | undefined)?.node;
    if (range === undefined) return;
    for (const floor of floors) expect(allows(range, floor), `${name} needs ${range}`).toBe(true);
  });
});
