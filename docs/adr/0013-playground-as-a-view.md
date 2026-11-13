# ADR-0013: The Playground is a view over the same engine, with a dry-run submit

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | FR-35 to FR-37, AC-17, R-5, A-5; TDD sections 6.3 and 11 |

## Context and problem statement

A reader should be able to see the renderer react to different payloads without editing code. This must not grow into a second product or a second implementation of the renderer.

## Decision drivers

- Show generality quickly.
- Zero duplicated rendering or validation logic.
- Easy to remove if time is short.

## Considered options

1. No Playground.
2. A visual builder (add and remove fields, edit properties).
3. A JSON editor with presets and a live preview built from `normalize` and `DynamicForm`.

## Decision outcome

**Option 3.** A view switched through the URL hash (no router dependency). It offers presets taken from the mock fixtures (the original sample, a v2 form, an unknown optional kind, an unknown required kind, a server-error scenario) or pasted JSON, shows parse diagnostics from `normalize`, and previews with the real `DynamicForm`. Its `onSubmit` is a dry run that displays the request that would be sent, so it needs no `api/` code.

### Consequences

- Good: very little code; it exercises the same boundary the app uses; it is the first thing to cut.
- Bad: a small extra surface to test; no visual editing.

### Confirmation

A test pastes broken JSON and expects diagnostics without a crash (AC-17); a lint rule forbids `playground/` from importing `api/`.

## Notes

A visual builder was rejected: it needs its own validation, state and tests, and the brief does not ask for it.
