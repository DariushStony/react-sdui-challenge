# ADR-0010: Validation timing, focus management and announcement

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | FR-18 to FR-21, FR-31, NFR-01, AC-06, AC-11, AC-19; TDD sections 8.2 and 10.1 |

## Context and problem statement

Errors should help without nagging, be reachable by keyboard and screen-reader users, and not be announced twice.

## Decision drivers

- No error before the user has had a chance to type.
- WCAG 2.2 AA: error identification, labels, focus handling, status messages.
- Predictable behavior that tests can assert.

## Considered options

1. Validate on submit only.
2. Validate on every change.
3. Validate after the first blur and on submit, then on every change once a field shows an error.

## Decision outcome

**Option 3**, using react-hook-form's `onTouched` mode with `reValidateMode: 'onChange'`. On an invalid submit no request is sent and the engine focuses the first invalid control through the `inputRef` each component forwards (including the file control). Each field has a persistent error element linked with `aria-describedby`, rendered as a polite live region that is empty when valid; the control sets `aria-invalid`. Form-level messages use `role="alert"`; the success panel takes focus so the outcome is announced.

### Consequences

- Good: no premature errors; keyboard and screen-reader users land on the problem and hear its description; one consistent pattern for every kind.
- Bad: a live region that updates while the user types can be chatty for some screen readers; a manual screen-reader pass is still needed beyond the automated check.

### Confirmation

Tests assert the blur behavior, the focus target after a failed submit, `aria-invalid` and `aria-describedby`, and the axe check; keyboard-only operation is covered by a test that never uses the pointer.
