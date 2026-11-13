# ADR-0011: Unknown-kind and schema-version policy

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | FR-05, FR-06, FR-07, FR-08, EC-13, AC-03, AC-04; TDD section 9.1 |

## Context and problem statement

The server can change faster than the client: it may send a field kind the client does not know, a rule key it does not know, or a newer schema version.

## Decision drivers

- Never render a wrong form silently.
- Do not let an optional unknown field take the whole form down.
- A form that cannot be submitted correctly must say so.

## Considered options

For an unknown kind:

1. Fail the whole form.
2. Show a visible placeholder for every unknown field.
3. Skip it if optional (with a developer warning); fail with a clear message naming the field if it is required.

For versions:

1. Ignore `schemaVersion`.
2. Gate on the major version; tolerate unknown minor additions.

## Decision outcome

Unknown kind: **option 3**. A payload without `schemaVersion` is legacy (version 1); an unsupported higher major version produces an explicit "client is outdated" state; unknown rule keys and unknown optional properties are ignored with a warning. Duplicate field names are rejected because two controls cannot share one submitted key.

### Consequences

- Good: new optional fields cannot break old clients; required ones cannot be dropped silently; the user sees a specific message in each case.
- Bad: in legacy payloads "required" is unknowable, so an unknown legacy kind is always treated as optional; a placeholder-style UI for unknown fields is not offered.

### Confirmation

Normalizer tests for each branch; component tests for the `Rejected` messages (AC-03, AC-04).
