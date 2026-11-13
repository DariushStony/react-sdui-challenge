# ADR-0008: Logical CSS properties only, enforced by a style lint

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | NFR-02, FR-38, FR-39, AC-18, AC-20, EC-15; TDD section 10.2 |

## Context and problem statement

The default language is Persian (right to left), and the layout should keep working if the direction changes. Physical properties such as `margin-right` silently break that.

## Decision drivers

- Direction-agnostic styles by construction, not by review.
- A check that fails the build.

## Considered options

1. A written convention only.
2. A style lint that rejects physical properties and keywords.

## Decision outcome

**Option 2.** stylelint 17 with `stylelint-plugin-logical-css` (rules `logical-css/*`). Direction-insensitive sizing properties (`width`, `height`, `min-*`, `max-*`) are allowed through the plugin's `ignore` option. Four-value `margin`, `padding` and `inset` shorthands are physical by position, so a core `declaration-property-value-disallowed-list` rule bans them. The check runs in `lint-staged`, in `check` and in CI.

### Consequences

- Good: `margin-right`, `padding-left`, `left`, `border-right`, `text-align: left` and `float: left` fail the lint; CSS Modules (`composes`, `:global`) parse fine.
- Bad: one more dev dependency; the plugin supports stylelint up to major 17, so stylelint is pinned to `^17`; the plugin does not catch four-value shorthands by itself.

### Confirmation

An experiment on 2026-11-13 confirmed each rule. AC-20 keeps a failing fixture stylesheet in the lint tests. A render test under `dir="ltr"` shows nothing breaks (AC-18).
