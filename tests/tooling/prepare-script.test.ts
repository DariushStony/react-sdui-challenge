// @vitest-environment node
import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// TC-S07: installing from a zip download (no .git folder) must not fail because of the git hook
// setup (TR-09, ADR-0012). We run the project's own `prepare` script in a folder without .git.
describe('prepare script', () => {
  it('succeeds when there is no .git folder', () => {
    const root = process.cwd();
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
      scripts: { prepare: string };
    };
    const dir = mkdtempSync(join(tmpdir(), 'no-git-'));
    try {
      const env = {
        ...process.env,
        PATH: `${join(root, 'node_modules', '.bin')}:${process.env['PATH'] ?? ''}`,
      };
      expect(() =>
        execSync(pkg.scripts.prepare, { cwd: dir, env, stdio: 'pipe', shell: '/bin/sh' }),
      ).not.toThrow();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
