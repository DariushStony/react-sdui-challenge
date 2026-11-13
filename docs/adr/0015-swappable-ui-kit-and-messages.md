# ADR-0015: A swappable UI kit and message catalog, given through a provider

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | TR-05, NFR-02, FR-38; ADR-0007, ADR-0014 |

## Context and problem statement

The brief stresses where the design system is integrated. Today the field components import the project's own `ui/` primitives and the Persian catalog directly, so a host with its own design system or language cannot use the renderer without editing it.

## Decision drivers

- A host brings its own design system and its own language without touching the engine.
- Dependency inversion: the engine and the fields depend on an interface, not on a concrete kit.
- A good default, so the library works with no configuration.

## Considered options

1. Bundled UI, restyled only through CSS variables.
2. A `UiKit` interface (the controls and containers the renderer needs) and a message catalog, both passed through a provider; the library ships a default of each.
3. Headless: no UI shipped.

## Decision outcome

**Option 2**, chosen by the developer. Patterns: Adapter (a host maps its components onto `UiKit`), Dependency Inversion and Strategy (the provider chooses the implementation), Registry (kinds, as in ADR-0002).

- `UiKit` lists the visual pieces the engine and the fields use: form and actions, field frame, text input, text area, select, button, alert, file picker and file list, visually hidden text. Page chrome (page, nav, section, spinner) is not part of it: it belongs to the app.
- `Messages` is the catalog (key to template) plus the number and size formatting; the library ships the Persian catalog. Components read both through hooks (`useUiKit`, `useMessages`); pure helpers take the translator as an argument.
- `DynamicFormProvider` takes optional `ui` and `messages`; without it the defaults apply, so `<DynamicForm>` works alone.

### Consequences

- Good: the engine has no import of a concrete control; a second kit or language is a prop; the default kit is just one implementation, tested against the same contract.
- Bad: components read two contexts; every component test supplies the defaults (a small helper).

### Confirmation

A contract test runs the same assertions against the default kit and a deliberately different test kit; a test renders the form with a Persian and an English catalog; lint forbids the engine and fields from importing the default kit.
