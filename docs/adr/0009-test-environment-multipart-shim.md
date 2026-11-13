# ADR-0009: jsdom test environment with an undici shim for multipart

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | FR-30, NFR-01, NFR-06, TR-06; TDD section 11; risk R-3 |

## Context and problem statement

Component and integration tests need a DOM and must exercise a real multipart `fetch`. In jsdom, `FormData` and `File` are jsdom's classes while `fetch` is Node's. An experiment on 2026-11-13 showed that a jsdom `FormData` holding a `File` makes `fetch` fail with a content-length mismatch, and that Node's `FormData` given a jsdom `File` silently sends the text "[object File]".

## Decision drivers

- Real multipart bodies in tests.
- The accessibility check needs jsdom.
- Few moving parts.

## Considered options

1. Run these tests in the Node environment (no DOM).
2. Use happy-dom, which handled the multipart case without help.
3. Keep jsdom and, in the test setup, replace the fetch family and `FormData` with `undici`'s and `File` with Node's `node:buffer` `File`.

## Decision outcome

**Option 3.** The axe-based accessibility library documents jsdom as required, which rules out making happy-dom the default. A short setup module assigns `fetch`, `FormData`, `Headers`, `Request`, `Response` from `undici` and `File` from `node:buffer` on `globalThis` before MSW starts. In the experiment this worked with user-event uploads, MSW multipart parsing and axe.

### Consequences

- Good: real multipart in component tests; accessibility checks keep working.
- Bad: one dev dependency (`undici`) and a shim that depends on Node and undici behavior; a toolchain upgrade can break it.

### Confirmation

The shim has its own test (a two-file multipart round trip through the handler) so an upgrade that breaks it fails loudly. Versions are pinned. The shim's dependencies also set the Node floor: `undici` 8 needs Node 22.19 and `jsdom` 31 needs 22.22.2, so the project's `engines` follows the newest Node (26.13.1 now); a tooling test compares it with the installed packages.
