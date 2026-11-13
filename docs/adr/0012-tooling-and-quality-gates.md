# ADR-0012: Tooling and quality gates

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | NFR-05, NFR-10, NFR-12, TR-07 to TR-09; TDD section 12 |

## Context and problem statement

Quality rules (strict types, boundaries, style, formatting, tests) only help if a command enforces them locally, in a hook and in CI, and if a newcomer can run them with the package manager they already have.

## Decision drivers

- Fast feedback and one command that matches CI.
- Enforce the module boundaries and the logical-properties rule mechanically.
- No install failure for someone who downloaded a zip without `.git`.

## Considered options

1. ESLint with typescript-eslint, Prettier, no hooks.
2. oxlint (including type-aware rules), stylelint, Prettier, husky with lint-staged, CI.
3. Biome.

## Decision outcome

**Option 2.** Package manager: pnpm is primary; scripts avoid pnpm-only commands so `npm install` and `npm run check` also work (an experiment on 2026-11-13 passed the whole check under both). oxlint runs with `--type-aware` using `oxlint-tsgolint`, with `typescript/no-floating-promises` and `typescript/no-explicit-any` as errors and the `jsx-a11y` plugin on; module boundaries use `no-restricted-imports` overrides per folder (verified to flag both default and side-effect style imports). `ignorePatterns` includes `node_modules`. The `prepare` script is `husky || true`. A pre-commit hook runs `lint-staged`; CI runs `check` and `build` on every push.

### Consequences

- Good: one `check` command everywhere; boundary and style rules fail fast; the `jsx-a11y` rules catch real accessibility mistakes.
- Bad: several tools to keep compatible (stylelint pinned to 17); type-aware linting depends on a separate binary package; hooks add about a second to each commit.

### Confirmation

CI runs `check` and `build`; the hook is exercised by committing a deliberately bad stylesheet in a throwaway checkout during setup.
