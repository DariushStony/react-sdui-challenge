// Checks the production build (TC-S05, TC-S06): the application JavaScript is within budget and the
// mock is a separate, lazily loaded chunk (ADR-0005, NFR-09). Run after `vite build`.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

/** 150 kB of gzip, counted the way build tools print it (1 kB = 1000 bytes). */
export const BUDGET_BYTES = 150_000;

/**
 * Judges a Vite build manifest. "Application JavaScript" is the entry plus everything it imports
 * statically; a chunk reached only through `import()` is loaded on demand and not counted.
 */
export function evaluateDist(manifest, gzipBytes, { budgetBytes = BUDGET_BYTES } = {}) {
  const problems = [];
  const entries = Object.keys(manifest).filter((key) => manifest[key]?.isEntry);
  if (entries.length === 0) problems.push('The build manifest has no entry chunk.');

  const app = new Set();
  const visit = (key) => {
    if (app.has(key) || manifest[key] === undefined) return;
    app.add(key);
    for (const imported of manifest[key].imports ?? []) visit(imported);
  };
  entries.forEach(visit);

  const appFiles = [...app].map((key) => manifest[key].file);
  const lazyFiles = Object.keys(manifest)
    .filter((key) => manifest[key]?.isDynamicEntry && !app.has(key))
    .map((key) => manifest[key].file);
  const appBytes = appFiles.reduce((sum, file) => sum + gzipBytes(file), 0);

  if (appBytes > budgetBytes) {
    problems.push(
      `Application JavaScript is ${appBytes} bytes gzip; the budget is ${budgetBytes}.`,
    );
  }
  if (lazyFiles.length === 0) {
    problems.push('No chunk is loaded lazily, so the mock is not a separate chunk.');
  }
  return { appFiles, lazyFiles, appBytes, problems };
}

/**
 * The page is Persian and the font comes from a package (ADR-0019). If a build dropped it, every
 * other check would still pass, so the build must contain the Vazirmatn file.
 */
export function fontProblems(assetFiles) {
  return assetFiles.some((file) => /^Vazirmatn.*\.woff2$/.test(file))
    ? []
    : ['No Vazirmatn .woff2 file is in dist/assets; the Persian font was not bundled.'];
}

function main() {
  const dist = join(process.cwd(), 'apps', 'demo', 'dist');
  const problems = [];
  for (const file of ['index.html', 'mockServiceWorker.js', '.vite/manifest.json']) {
    if (!existsSync(join(dist, file)))
      problems.push(`dist/${file} is missing; run the build first.`);
  }
  if (problems.length === 0) {
    const manifest = JSON.parse(readFileSync(join(dist, '.vite', 'manifest.json'), 'utf8'));
    const gzipBytes = (file) => gzipSync(readFileSync(join(dist, file))).length;
    const report = evaluateDist(manifest, gzipBytes);
    console.log(`Application JavaScript: ${report.appBytes} bytes gzip (budget ${BUDGET_BYTES}).`);
    console.log(`Loaded on demand: ${report.lazyFiles.join(', ') || 'nothing'}.`);
    problems.push(...report.problems);
    problems.push(...fontProblems(readdirSync(join(dist, 'assets'))));
  }
  for (const problem of problems) console.error(problem);
  process.exitCode = problems.length === 0 ? 0 : 1;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href)
  main();
