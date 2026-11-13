# Architecture decision records

One file per significant decision, in [MADR](https://adr.github.io/madr/) form (context, drivers, options, outcome, consequences, confirmation). This index is also the decision log: IDs are stable, files are never deleted, and a changed decision is a new ADR that supersedes the old one.

| ADR | Decision | Status |
| --- | --- | --- |
| [0001](0001-canonical-model-and-normalizer.md) | Canonical model and a single normalizer boundary accepting legacy and v2 payloads | Accepted |
| [0002](0002-field-kinds-as-modules.md) | Field kinds as modules registered in one list; definitions injected into the normalizer | Accepted |
| [0003](0003-form-state-and-validation.md) | react-hook-form with zod and a small custom resolver that keeps message codes and params | Accepted |
| [0004](0004-server-state-with-tanstack-query.md) | TanStack Query for the form fetch and the submit mutation | Accepted |
| [0005](0005-msw-mock-everywhere.md) | MSW in development, tests and production preview, with a visible failure message | Accepted |
| [0006](0006-single-multipart-submission.md) | One multipart request for values and files; presigned URLs considered | Accepted |
| [0007](0007-styling-and-ui-layer.md) | CSS Modules, design tokens and a `ui/` primitive layer with lint-enforced boundaries | Accepted |
| [0008](0008-logical-properties-only.md) | Logical CSS properties only, enforced by a style lint | Accepted |
| [0009](0009-test-environment-multipart-shim.md) | jsdom test environment with an undici shim for multipart | Accepted |
| [0010](0010-validation-timing-and-a11y.md) | Validation timing, focus management and announcement strategy | Accepted |
| [0011](0011-unknown-kinds-and-versioning.md) | Unknown-kind and schema-version policy | Accepted |
| [0012](0012-tooling-and-quality-gates.md) | Tooling: type-aware oxlint, stylelint, Prettier, husky and lint-staged, package-manager-agnostic scripts | Accepted |
| [0013](0013-playground-as-a-view.md) | The Playground is a view over the same engine, with a dry-run submit | Accepted |
| [0014](0014-renderer-as-a-workspace-package.md) | The renderer is a separate package in a pnpm workspace, used by the demo app through its public API | Accepted |
| [0015](0015-swappable-ui-kit-and-messages.md) | A swappable UI kit and message catalog, given through a provider (Adapter, Dependency Inversion) | Accepted |
| [0016](0016-source-conventions.md) | Source conventions: kebab-case folders, one named export per file, entry file exempt | Accepted |
| [0017](0017-export-only-what-is-needed.md) | Export only what is needed: two public entries (client and logic), pinned and checked by a test | Accepted |
| [0018](0018-mock-fallback-without-a-service-worker.md) | The mock answers inside the page (fetch interception) when a service worker cannot start | Accepted |
| [0019](0019-self-hosted-vazirmatn-font.md) | Vazirmatn, self-hosted; form controls inherit the page font | Accepted |
| [0020](0020-coloured-json-box-over-a-text-area.md) | A coloured JSON box: a small tokenizer drawn behind a real text area | Accepted |

Start a new ADR by copying [0000-template.md](0000-template.md).
