// @vitest-environment node
import { BUDGET_BYTES, evaluateDist, type Manifest } from '../../scripts/check-dist.mjs';

// TC-S05, TC-S06: the production build keeps the mock out of the main bundle and the app JavaScript
// within budget (NFR-09). The rules are a pure function of the build manifest, so they are tested
// here without building; CI runs the script against the real `dist/`.
const sizes: Record<string, number> = {
  'assets/index.js': 100_000,
  'assets/vendor.js': 30_000,
  'assets/mock.js': 160_000,
};
const gzip = (file: string) => sizes[file] ?? 0;

const manifest: Manifest = {
  'index.html': {
    file: 'assets/index.js',
    isEntry: true,
    imports: ['vendor.js'],
    dynamicImports: ['src/mocks/browser.ts'],
    css: ['assets/index.css'],
  },
  'vendor.js': { file: 'assets/vendor.js' },
  'src/mocks/browser.ts': { file: 'assets/mock.js', isDynamicEntry: true },
};

describe('evaluateDist', () => {
  it('counts the entry and what it imports statically, and not the lazy chunk', () => {
    const report = evaluateDist(manifest, gzip);
    expect(report.appBytes).toBe(130_000);
    expect(report.appFiles.toSorted()).toEqual(['assets/index.js', 'assets/vendor.js']);
    expect(report.lazyFiles).toEqual(['assets/mock.js']);
    expect(report.problems).toEqual([]);
  });

  it('allows exactly the budget and fails one byte over it', () => {
    expect(evaluateDist(manifest, gzip, { budgetBytes: 130_000 }).problems).toEqual([]);
    const over = evaluateDist(manifest, gzip, { budgetBytes: 129_999 });
    expect(over.problems).toHaveLength(1);
    expect(over.problems[0]).toMatch(/budget/i);
  });

  it('uses 150 kB gzip as the default budget', () => {
    expect(BUDGET_BYTES).toBe(150_000);
  });

  it('fails when the mock is imported statically, because it is then in the main bundle', () => {
    const eager: Manifest = {
      ...manifest,
      'index.html': { ...manifest['index.html']!, imports: ['vendor.js', 'src/mocks/browser.ts'] },
    };
    const report = evaluateDist(eager, gzip);
    expect(report.problems.join('\n')).toMatch(/budget/i);
    expect(report.problems.join('\n')).toMatch(/lazy|separate/i);
  });

  it('fails when nothing is loaded lazily, which means the mock is not a separate chunk', () => {
    const { 'src/mocks/browser.ts': _mock, ...rest } = manifest;
    const report = evaluateDist(rest, gzip);
    expect(report.problems.join('\n')).toMatch(/lazy|separate/i);
  });

  it('fails when the manifest has no entry', () => {
    expect(
      evaluateDist({ 'vendor.js': { file: 'assets/vendor.js' } }, gzip).problems.join(),
    ).toMatch(/entry/i);
  });
});
