# ADR-0014: The renderer is a separate package in a pnpm workspace

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | NFR-03, NFR-04, TR-05; TDD section 4; ADR-0002, ADR-0013 |

## Context and problem statement

The renderer should be usable as a tool, not only as this app: if it is published later, its code must separate cleanly and work in another project. At the moment the engine, the field kinds and the design system live in one `src/` next to the API client, the mock, the pages and the Playground, held apart only by lint rules.

## Decision drivers

- Publishing later should be a build and a `publish`, not a refactor.
- A boundary that tooling enforces (a package cannot import what it does not declare), not one that review enforces.
- The demo app must prove the package works through its public API only.
- Limited time: one library package, not a family.

## Considered options

1. One package, folders only, with lint rules.
2. A pnpm workspace: `packages/<library>` and `apps/demo`.
3. Several small packages (core without React, React renderer, UI kit, messages).

## Decision outcome

**Option 2**, chosen by the developer. The library package (placeholder name `@dynamic-form/renderer`, renamed with one edit before publishing) holds `core/`, `fields/`, `engine/`, the default UI kit (ADR-0015) and the message catalog. The demo app holds the API client, the mock, the pages, the Playground and the test server. The library has no network code and no dependency on the app.

- The library's public API is one entry file (`src/index.ts`): the form component, the normalizer, the kind registry and `defineKind`, the provider, the types an integrator needs. The app imports only that entry; a lint rule forbids deep imports.
- `react`, `react-dom`, `react-hook-form` and `zod` are peer dependencies of the library; it has no runtime dependency of its own.
- The library builds with Vite library mode (ES module, CSS file for the default kit) and `tsc` for declarations; `exports` in its `package.json` lists the entry, the stylesheet and the types.
- Library tests run in the library; app tests (MSW, the undici shim, pages) run in the app; tooling tests stay at the repository root.

### Consequences

- Good: the dependency direction is enforced by what each `package.json` declares; the demo is a real consumer; a published package needs only a name and a version.
- Bad: workspace plumbing (scripts, TypeScript paths, CI) and a one-time move of every file; two test configurations.

### Confirmation

`pnpm pack` of the library installs in a clean directory and renders a form (a smoke test); lint fails a deep import from the app; the demo builds against the built package.

## Notes

Several small packages were rejected for now: the split points (core without React, UI kit) are already folders with enforced boundaries, so they can become packages later without changing the code.
