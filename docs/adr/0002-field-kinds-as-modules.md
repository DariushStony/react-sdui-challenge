# ADR-0002: Field kinds as modules registered in one list

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | NFR-04, AC-21, G-4; TDD sections 4 and 6 |

## Context and problem statement

A new field kind must not force edits in the renderer, the validator and the normalizer. A `switch` on `kind` in each of those places makes every new kind a multi-file change.

## Decision drivers

- Adding a kind is local: one folder and one list entry.
- Pure logic stays testable without React.
- The normalizer, validator and renderer agree on the same set of kinds.

## Considered options

1. A `switch` on `kind` in the renderer, the validator and the normalizer.
2. A component map for rendering only; validation and parsing stay as switches.
3. Kind modules: a pure `definition` (wire parsing, value schema, default value, encoding) plus a `Component`, collected in one list; the definitions are injected into the normalizer.

## Decision outcome

**Option 3.** `fields/<kind>/` holds `definition.ts` and `Component.tsx`. `fields/index.ts` exports `FIELD_KINDS`, the only registry. `createNormalizer(definitions)` takes the list, so a test can pass a fake kind.

### Consequences

- Good: adding a kind touches one folder and one line; the renderer never changes; definitions run in a Node test.
- Bad: more files per kind than a switch; a shared interface to learn; the two `text` and `number` kinds both claim legacy `type: "input"` and must split on `props.type`.

### Confirmation

A test registers a fake kind and renders, validates and submits it with no change to the engine (AC-21). The renderer contains no `switch` on `kind`.
