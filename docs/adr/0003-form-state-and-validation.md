# ADR-0003: react-hook-form with zod and a small custom resolver

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | FR-17 to FR-21, FR-26, NFR-09, TR-02; TDD section 9.6; risk R-1 |

## Context and problem statement

Fields are dynamic, rules come from the server, files are part of the form, and each error needs a stable code plus parameters (for example the file name and the size limit) so Persian text can be built later.

## Decision drivers

- Dynamic fields without hand-written state plumbing.
- Typing in one field should not re-render the others.
- Validation rules as data, tested without a DOM.
- Error params must survive from the rule to the message.

## Considered options

1. Formik.
2. Plain React state and our own validators.
3. react-hook-form with the stock zod resolver.
4. react-hook-form for state, zod for the schema, and our own small resolver that keeps `code` and `params`.

## Decision outcome

**Option 4.** react-hook-form (with `Controller`) manages state, touched tracking and focus on error. zod is used twice: to parse the payload at the boundary and to build the values schema from each kind's `valueSchema`. The stock resolver keeps only an issue's `type` and `message`; our resolver (about 25 lines) maps each zod issue to `{ code, params }`.

### Consequences

- Good: one validation library used for two jobs; params reach the message catalog; no extra resolver dependency if the check below confirms it is unneeded.
- Bad: we own and must test the resolver; a library upgrade could change zod's issue shape.

### Confirmation

Phase 0 re-checks that the stock resolver cannot carry params; if it can, this ADR is superseded by Option 3. **Phase 0 result (2026-11-13):** `@hookform/resolvers` 7.0.6 with zod 4.6.7 returned only `{ type, message }` for a custom issue that carried `params` (and, with `criteriaMode: 'all'`, a `types` map of the same message); the params were dropped. The custom resolver stays. Resolver unit tests cover codes, params, nested file errors and async refinements. Performance check: a render-count test shows typing in one field does not re-render another.

## Notes

Formik re-renders the whole form by default and has less active maintenance; plain state would mean rebuilding touched, dirty and focus logic that react-hook-form already provides.
