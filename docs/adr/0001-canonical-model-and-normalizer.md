# ADR-0001: Canonical model and a single normalizer boundary

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | FR-03 to FR-08, FR-16, EC-03 to EC-05, EC-14, A-7; TDD sections 5 and 9 |

## Context and problem statement

The brief shows one payload shape and invites a better one; the backend is still being built, so the final shape may differ again. The sample also has quirks: numbers as strings, `maxSize: "5MB"`, presentation data inside fields, a field type (`textarea`) outside the three named kinds, and no way to say "required".

## Decision drivers

- The sample from the brief must work unchanged.
- Rendering code must not depend on a wire format that may change.
- Failures must be explicit, not partial renders.

## Considered options

1. Render directly from the legacy payload.
2. Replace the shape with our own and reject the legacy one.
3. Convert every payload into one canonical model at one boundary; accept the legacy and a new v2 shape.

## Decision outcome

**Option 3.** `core/normalize` is the only code that reads wire fields. It returns a `ParseResult` (a model plus warnings, or a typed rejection). Everything else (engine, fields, Playground) sees only the canonical model.

### Consequences

- Good: a backend change touches the normalizer and the API contract only; the renderer stays simple; the legacy sample keeps working.
- Bad: one more layer and its tests; the legacy shape cannot express "required", so legacy fields are optional unless they carry an optional `required` key.

### Confirmation

Table-driven normalizer tests (one row per payload shape and quirk); a lint rule forbids `react` and DOM imports in `core/`.

## Notes

Option 1 was rejected because every quirk would leak into components. Option 2 was rejected because a reader who loads the original sample would see a failure.
