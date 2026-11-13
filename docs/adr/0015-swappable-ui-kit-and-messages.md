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

### As built

- `ui-kit/` holds the contract (`UiKit`, the props of every component, `fieldIds`, `describedBy`); `default-kit/` implements it; `provider/` holds the two contexts, the hooks and `DynamicFormProvider`. Only the provider's contexts name the default kit and the Persian catalog.
- The page chrome (page, nav, section, spinner) and the alerts that present a rejected payload moved to the demo (`apps/demo/src/chrome`); the demo has its own messages and translator, built with the same `createTranslator`.
- `Messages` is `{ locale, catalog }`: the locale decides how numbers are written and the catalog holds the templates and the names of the byte units. Persian and English are shipped; a test keeps their keys identical.
- The test kit (`src/test/test-ui-kit/index.tsx`, in the repository and not in the package) is the working example of what a kit author must do: wire the label, hint and error ids with `fieldIds`, make the alert root focusable, pass the file picker its `describedBy`, `onBlur` and `buttonRef`, and honour `disabled`. The props of the contract say so, and the same engine tests run against both kits, including the file field.
- The hooks (`useUiKit`, `useMessages`) are internal; a host reaches the engine only through the provider (ADR-0017). `Messages` describes text and number formatting, not layout: the page sets `dir` and `lang`.
- The design tokens are CSS variables named `--df-*`, so they cannot collide with the page's own, and the page can override them to retheme the default kit.

### Confirmation

A contract test runs the same assertions against the default kit and a deliberately different test kit; a test renders the form with a Persian and an English catalog; lint forbids the engine and fields from importing the default kit.
