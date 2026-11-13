# ADR-0007: CSS Modules, design tokens and a ui/ primitive layer

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | FR-14, NFR-02, NFR-03, TR-05; TDD sections 4.2 and 10.2 |

## Context and problem statement

There is no design system. The form engine must not depend on a styling solution, and the place where a design system plugs in has to be obvious.

## Decision drivers

- Business logic independent of styling.
- A clear, enforceable boundary.
- Works with a logical-properties style check (ADR-0008) and CSS variables for theming and direction.

## Considered options

1. Tailwind CSS utility classes in components.
2. CSS-in-JS.
3. Plain global CSS.
4. CSS Modules with CSS-variable tokens and a thin `ui/` layer.

## Decision outcome

**Option 4.** `ui/tokens.css` defines spacing, color, radius and type tokens as CSS variables. `ui/` exposes primitives (Field, TextInput, TextArea, Select, FileList, Button, Alert) whose styles live in CSS Modules. The engine and the field components use primitives and never import a stylesheet; a lint rule on `src/engine/**` rejects `*.css` imports. A server `size` hint maps to a token name; no raw CSS from the server is applied.

### Consequences

- Good: swapping the visual layer means changing `ui/` only; tokens make direction and theme changes cheap; stylelint can scan every stylesheet.
- Bad: the primitives are ours to write and test; no utility-class speed.

### Confirmation

The restricted-imports lint rule fails on a style import inside `engine/`; an axe test and a keyboard test cover the primitives.

## Notes

Superseded in part by ADR-0015: the `ui/` layer became the contract (`ui-kit/`) and its default implementation (`default-kit/`), and the engine renders through the contract.


Utility classes spread tokens across components and make a lint-enforced boundary much harder. CSS-in-JS adds runtime cost and a dependency without a benefit here.
