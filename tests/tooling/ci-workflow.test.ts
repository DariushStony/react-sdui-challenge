// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// TC-S10: the CI workflow must run the same `check` as the pre-commit path, on every push, with
// both package managers (TR-07, TR-08, ADR-0012). This is a cheap guard against a workflow edit
// that silently drops a gate.
describe('ci workflow', () => {
  const workflow = readFileSync(join(process.cwd(), '.github', 'workflows', 'ci.yml'), 'utf8');

  it('runs on every push', () => {
    expect(workflow).toMatch(/^on:\s*\n\s+push:/m);
  });

  it('runs check and build with pnpm', () => {
    expect(workflow).toContain('pnpm run check');
    expect(workflow).toContain('pnpm run build');
  });

  it('checks the built bundle after building it', () => {
    expect(workflow.indexOf('pnpm run check:dist')).toBeGreaterThan(
      workflow.indexOf('pnpm run build'),
    );
  });

  it('packs the renderer and renders a form from the tarball', () => {
    expect(workflow).toContain('pnpm run pack:smoke');
  });

  it('reports coverage of the pure logic', () => {
    expect(workflow).toContain('pnpm run coverage');
  });

  it('uses the Node version from .nvmrc in every job, so there is one place to bump it', () => {
    expect(workflow.match(/node-version-file: \.nvmrc/g)).toHaveLength(2);
    expect(workflow).not.toMatch(/node-version: \d/);
  });

  it('runs check with npm as well', () => {
    expect(workflow).toContain('npm run check');
  });
});
