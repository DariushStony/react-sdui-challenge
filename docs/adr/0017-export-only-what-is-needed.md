# ADR-0017: Export only what is needed; two public entries

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | NFR-03, NFR-05, TR-11, TR-12; ADR-0014, ADR-0015, ADR-0016; TDD section 4 |

## Context and problem statement

After the renderer became a package (ADR-0014) its public entry listed 76 names, most of them there because they were once convenient: every default component, every field type, the registry, the hooks, the helpers the demo used to reach into. An API that large is a promise nobody can keep and a surface nobody can learn, and several of its names clashed with react-hook-form's (`FieldError`, `FieldValue`, `Form`). The developer asked to export only what is really needed. A review of the packed package also found that one bundle mixed React-free logic with React code, so a server component could not call `normalize`.

## Decision drivers

- A symbol is public only if somebody outside the package needs it.
- The public surface should be learnable in one screen.
- Logic that has no React must be usable where React cannot run (a server, a server component).
- The rule must be checked by a test, as the other rules are.

## Considered options

1. Keep the large entry and document it.
2. One small entry.
3. Two small entries: the client side (the form, and what a host gives it) and the logic (no React), with a test that pins both lists and finds modules nothing uses.

## Decision outcome

**Option 3.** A name is exported from an entry only if the demo app's own code uses it or it is on a short, justified list of names an integrator needs (`DynamicFormProvider`, `enMessages`, `faMessages`, `UiKit`, `validateValues`).

`@dynamic-form/renderer` (marked `"use client"`):
`DynamicForm`, `DynamicFormProvider`, `defaultUiKit`, `fieldIds`, `createTranslator`, `faMessages`, `enMessages`, and the types `SubmitOutcome`, `UiKit`, `Messages`.

`@dynamic-form/renderer/core` (no React, safe on a server):
`normalize`, `buildFormData`, `validateValues`, `parseServerErrors`, and the types `FormModel`, `FormValues`, `ParseResult`, `Issue`, `RejectionReason`, `ServerErrors`.

What was removed, and what replaced it:

| Removed | Instead |
| --- | --- |
| each default component (`Alert`, `Button`, `Field`, `Select`, `TextArea`, ...) | `defaultUiKit`; destructure what you need |
| the prop types of every component | `ComponentProps<UiKit['Button']>` |
| `useUiKit`, `useMessages`, `Translator`, `DynamicFormProps` | internal; the provider is the only way in |
| `FIELD_DEFINITIONS`, `buildValuesSchema`, `toFieldErrors`, `KindDefinition` | `buildFormData(model, values)` and `validateValues(model, values)`, which use the built-in kinds |
| `createNormalizer`, `defineKind`, `defineFieldKind`, `FIELD_KINDS`, `FieldKind`, the field model types | not public: the five kinds are the library's own (a custom kind would be a new decision) |
| `getDirection`, `setDocumentDirection` | the demo owns them (the library never used them) |
| `Normalizer`, `FieldError`, `FieldValue` | `typeof normalize` in the demo; internal |

Modules that nothing in the source used were deleted or moved to the test helpers (`MESSAGE_CODES`, `resetMockState`). A model's identity is its content (`modelKey`), so a host that rebuilds an identical model on every render keeps what was typed.

### Consequences

- Good: 20 public names instead of 76; no name clashes with react-hook-form; a server component can import `normalize`; the demo uses the package the way a stranger would.
- Bad: a host cannot add a field kind without changing the library; the demo's mock server reaches the form's rules through `validateValues` only, so any new need means a deliberate addition to the list.

### Confirmation

`tests/tooling/public-api.test.ts` (TC-S16) pins the two lists, fails for a name that neither the demo nor the justified list uses, and fails for a module whose export nothing else imports. `pack:smoke` (TC-S14) type-checks a consumer against the packed package, checks that the client entry starts with `"use client"` and that the logic entry imports no React.

## Notes

The packaging checks of the same change: declarations are rewritten to name their imports with `.js` so `nodenext` consumers get real types (`attw` checks it), `@types/react` is an optional peer, and the design tokens carry a `--df-` prefix and no longer force `color-scheme: light`.
