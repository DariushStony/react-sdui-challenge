# Dynamic Form Renderer

A React app that fetches a form description from the server, renders it, validates it and sends everything back in one multipart request. The backend is mocked in the browser, so it runs with no server.

The car form in the brief is only one example payload. The renderer is generic, and a small Playground shows it reacting to any payload you paste.

## Quick start

Needs Node 26.13.1 or later (see `.nvmrc`) and pnpm 12.18 (the `packageManager` field; Corepack fetches it). The project tracks the newest releases of its tooling.

```bash
pnpm install     # or: npm install
pnpm dev         # or: npm run dev
```

Open the printed address. The form from the brief loads at once; the page is Persian and right-to-left.

| Address | What you see |
| --- | --- |
| `#/forms/car` | The sample from the brief (the default) |
| `#/forms/car-v2` | The same form in the explicit v2 payload shape, with rules and descriptions |
| `#/forms/unknown-optional`, `#/forms/unknown-required` | A field kind this client does not know: skipped with a warning, or a clear refusal |
| `#/forms/outdated`, `#/forms/broken`, `#/forms/duplicate-names` | A newer schema version, a payload that is not a form, two fields with one name |
| `#/forms/missing`, `#/forms/flaky-load` | A 404, and a 500 that works on the second try (Retry) |
| `#/forms/flaky-submit`, `#/forms/closed` | A submit that fails once, and a form the server refuses |
| `#/playground` | Pick a preset or paste JSON; see the preview, the diagnostics and a dry-run submit |

Typing `bad` as the brand of `car-v2` makes the mock answer with a server-side validation error.

## Scripts

| Script | What it does |
| --- | --- |
| `dev`, `build`, `preview` | Vite development server, production build, and a server for the build |
| `test` | All tests once |
| `coverage` | The tests with a coverage report for the pure logic (`core/` and the field definitions), which must stay at 90 percent of lines or more |
| `check` | Type-check, oxlint (type-aware), stylelint, Prettier and the tests: the one command that must pass before a commit |
| `check:dist` | After `build`: the demo's JavaScript is at most 150 kB gzip and the mock is its own chunk |
| `build:lib` | Builds the renderer package (`packages/renderer/dist`: an ES module, its stylesheet, the tokens and type declarations) |
| `pack:smoke` | Packs the renderer, installs the tarball in a clean project with npm, and renders a form from it |

A pre-commit hook (husky and lint-staged) runs the linters on staged files, and the CI workflow runs `check`, `build`, `check:dist`, `pack:smoke` and `coverage` with pnpm, and `check` with npm.

## How it works

The repository is a pnpm workspace with two parts:

- **`packages/renderer`** is the library (`@dynamic-form/renderer`). It knows nothing about the network or this app.
- **`apps/demo`** is the app built on it: the API client, the mock backend, the pages and the Playground. It imports the library through its public entry only.

```
GET /api/forms/:id --> normalize() --> FormModel --> <DynamicForm onSubmit> --> FormData --> POST
   (any wire shape)    one boundary    canonical      validation, focus,         one multipart
                                       model          field components           request
```

In the library (`packages/renderer/src`). Every name is kebab-case, and a module is a folder with one export in its `index.ts(x)` and its test and stylesheet beside it (ADR-0016; `tests/tooling/conventions.test.ts` enforces it):

- **`core/`** is plain TypeScript with no React. `normalize` turns the legacy payload from the brief or the v2 payload into one canonical model, or refuses it with a typed reason. Validation rules are data, applied by the same functions in the browser, in tests and in the Playground.
- **`fields/`** has one folder per field kind: a pure `definition` (reading, rules, default value, what to send) and a `component`. Two lists, `FIELD_DEFINITIONS` and `FIELD_KINDS`, are the registry.
- **`engine/`** renders any model with react-hook-form and zod. It has no network code: the owner passes `onSubmit` and gets the outcome back, so the page, the tests and the Playground each supply their own.
- **`ui-kit/`** is the contract with a design system: the components the form needs and their props. **`default-kit/`** is the library's own implementation (CSS Modules and design tokens). The engine and the fields render through the contract, so a host can bring its own.
- **`i18n/`** and **`provider/`** hold the messages (Persian and English are shipped; the locale decides how numbers are written) and `DynamicFormProvider`, which gives the form a design system and a language.
- **`src/index.ts`** and **`src/core-entry.ts`** are the two public entries (client side, and logic with no React); the package's `exports` make nothing else reachable. Only what is needed is exported (ADR-0017; a test pins the list).

In the demo (`apps/demo/src`):

- **`chrome/`** is the page-level UI (page, nav, section, spinner, the alerts for a rejected payload) and **`messages/`** is the demo's own text: none of it is part of the form.
- **`api/`** is the only code that calls `fetch`; **`mocks/`** is the stand-in backend (MSW), shared by the browser and the tests.
- **`app/`** composes it all: providers, error boundary, the hash route, the form page. **`playground/`** is a thin view over the same engine.

Boundaries are enforced by lint (for example `core/` cannot import React, the Playground cannot import `api/`, and the demo cannot reach into the library's folders), and the stylesheets can use logical properties only, so the layout works in both directions.

## Using the renderer in another project

The package has two entries, and only what is needed is exported (ADR-0017):

| Entry | What it has |
| --- | --- |
| `@dynamic-form/renderer` (client side, marked `"use client"`) | `DynamicForm`, `DynamicFormProvider`, `defaultUiKit`, `fieldIds`, `createTranslator`, `faMessages`, `enMessages`; types `SubmitOutcome`, `UiKit`, `Messages` |
| `@dynamic-form/renderer/core` (no React, safe on a server) | `normalize`, `buildFormData`, `validateValues`, `parseServerErrors`; types `FormModel`, `FormValues`, `ParseResult`, `Issue`, `RejectionReason`, `ServerErrors` |

The peer dependencies are `react`, `react-dom`, `react-hook-form` and `zod` (and `@types/react` for TypeScript). Import the stylesheet and the design tokens once:

```tsx
import { useMemo } from 'react';
import { DynamicForm } from '@dynamic-form/renderer';
import { buildFormData, normalize, parseServerErrors } from '@dynamic-form/renderer/core';
import '@dynamic-form/renderer/styles.css';
import '@dynamic-form/renderer/tokens.css';

function MyForm({ payload }: { payload: unknown }) {
  const result = useMemo(() => normalize(payload, 'my-form'), [payload]);
  if (!result.ok) return <p>{result.reason}</p>; // 'invalid' | 'outdated' | 'unknown-required-kind' | 'duplicate-name'
  const { model } = result;

  return (
    <DynamicForm
      model={model}
      onSubmit={async (values) => {
        const response = await fetch('/api/submit', { method: 'POST', body: buildFormData(model, values) });
        if (response.ok) return { ok: true };
        if (response.status === 422) {
          const errors = parseServerErrors(await response.json(), model.fields.map((field) => field.name));
          if (errors) return { ok: false, kind: 'validation', errors };
        }
        return { ok: false, kind: 'network' };
      }}
    />
  );
}
```

The form keeps what was typed while the model's content stays the same, so building an identical model on every render is safe (`useMemo` only saves work). On a server, `validateValues(model, values)` applies the form's rules again to what arrived. Set `dir` and `lang` on your page: the messages describe text, not layout.

The library is built and packed with `pnpm build:lib` and `pnpm pack:smoke`. It is marked `private` and has a placeholder name; to publish it, rename it in `packages/renderer/package.json`, remove `private`, and run `pnpm publish` in that folder (only pnpm applies the `publishConfig` that points `exports` at `dist`; `prepack` builds first).

## Adding a field kind

This is a guide for working on the library itself: the five kinds are the library's own, and custom kinds are not part of the public API (ADR-0017).

1. Add its model type as a module in `packages/renderer/src/core/model/` (for example `rating-field/index.ts`) and add it to the `FieldModel` union in `core/model/field-model/index.ts`.
2. Create `packages/renderer/src/fields/<kind>/definition/index.ts` with `defineKind` (read legacy and v2, value schema, default value, `appendTo`) and `fields/<kind>/component/index.tsx`, which renders with `FieldFrame` and the components from `useUiKit()`.
3. Add one line to `FIELD_DEFINITIONS` (`fields/definitions/field-definitions/index.ts`) and one to `FIELD_KINDS` (`fields/field-kinds/index.ts`). A test fails if the two lists disagree.

The normalizer, validator, form data builder and renderer need no change.

## Your design system and your language

Nothing needs configuring: without a provider the form uses the default components and Persian. To use your own, pass a `UiKit` (your components mapped onto the contract's props) and `Messages` (a locale and a catalog):

```tsx
import { DynamicFormProvider, defaultUiKit, enMessages, type UiKit } from '@dynamic-form/renderer';

const myKit: UiKit = { ...defaultUiKit, Button: MyButton, TextInput: MyTextInput }; // replace as many as you like

<DynamicFormProvider ui={myKit} messages={enMessages}>
  <DynamicForm model={model} onSubmit={send} />
</DynamicFormProvider>;
```

The props of each component are `ComponentProps<UiKit['Button']>` and so on, and the comments on them say what the engine relies on: the alert's root must be focusable (`tabIndex={-1}`), a field's `error` may hold several lines, a control's `invalid` becomes `aria-invalid`, and the file picker gets `describedBy`, `onBlur` and `buttonRef`. A kit's `Field` must wire the label, hint and error with `fieldIds(id)`. `packages/renderer/src/test/test-ui-kit/index.tsx` is a complete second kit in the repository (not in the package), and the same engine tests run against it. Override one message with `{ ...enMessages, catalog: { ...enMessages.catalog, submit: 'Send it' } }`. The default kit's design tokens are CSS variables named `--df-*`; override them on any ancestor to retheme it.

## Tests

- **Unit:** the normalizer, every rule, the value schemas, the message catalog, the multipart builder.
- **Component:** each field and each default-kit component in jsdom with Testing Library, with an axe check.
- **Contract:** the same form tests run against the default kit and against a deliberately different kit, and in Persian and in English.
- **Integration:** the real form engine and the real app against the same mock handlers, over `fetch`, including a real multipart body with two files.
- **Accessibility:** axe on every state, and a whole submission with the keyboard alone.
- **Tooling:** lint boundaries, the style rules, the CI file, the Node range and the build output are tested too, and `pack:smoke` consumes the packed library from a clean project.

Real-browser and screen-reader checks are manual and listed in `docs/test-cases.md` (section 8).

## Accessibility and language

WCAG 2.2 AA is the target: real labels, descriptions and errors tied to their controls, a polite live region for errors, focus on the first invalid field, a success panel that takes focus, 24 px minimum targets, visible focus. The interface text lives in message catalogs (`i18n/fa-messages`, `i18n/en-messages`), and CSS has no left or right, so switching `dir` is enough. Accessibility was also checked with axe in real Chrome (colour contrast included) over every page state at phone and desktop width.

## Decisions and documents

Every significant decision is an ADR, and the requirements, design, API contract, test cases and a requirement-to-test matrix are in [`docs/`](docs/README.md). Start with the [PRD](docs/prd.md) and the [ADR index](docs/adr/README.md).

## Known limits

- The mock prefers a service worker (localhost or HTTPS). Where the browser will not register one, such as a Firefox private window or an embedded browser, the page answers `fetch` itself with the same handlers (ADR-0018). Set `VITE_ENABLE_MOCKS=false` to send requests to a real backend on the same origin.
- The mock library is a separate chunk of about 154 kB gzip that loads only when the mock is on.
- Upload progress and conditional field visibility are not built (see the PRD).
- Message templates have no plural forms (the English wording avoids counts), and number fields accept a period or the Persian decimal separator, whatever the locale of the messages.
- The default kit needs `tokens.css`; without it spacing and colours are missing.
- Checked in Chrome, Firefox and the WebKit engine (Safari's), at desktop and phone sizes; the Safari app itself and a screen-reader pass (VoiceOver) are still manual (`docs/test-cases.md`, section 8).

# Original task brief

The brief this project answers is kept below, unchanged except for heading levels.

### Task Description

We want to build a dynamic form builder in React that fetches its structure from a server and displays it on a page. The form will include three input types:

- Text input
- Select box
- File upload field

### Key Steps:

1. API Request: Send a request to retrieve the form structure from the server, which includes field types, labels, options, and validation rules.

2. Render the Form: Dynamically generate the form on the page based on the retrieved structure, creating the appropriate input fields (text, select, and file fields).

3. Submit Button: Add a submit button that collects all form data (including file uploads) when clicked.

4. Form Validation: Ensure that all required fields are filled out and meet validation rules (e.g., text length, required selections, file formats) before allowing submission.

5. Send Form Data: Once submitted, package and send the form data back to the server via another API call.

This approach allows for flexible forms that can be easily updated server-side without modifying the app’s code.


Sample response for getting form (Feel free to restructure the response if you think it would enhance clarity or effectiveness):

```
{"fields":[{"label":"برند:","name":"brand","props":{"color":"#000000","placeholder":"برند ماشین را وارد کنید","size":"large","type":"text"},"style":{"borderRadius":"5px","margin":"10px 0","padding":"8px"},"type":"input"},{"label":"مدل:","name":"model","props":{"color":"#000000","placeholder":"مدل ماشین را وارد کنید","size":"medium","type":"text"},"style":{"borderRadius":"5px","margin":"10px 0","padding":"8px"},"type":"input"},{"label":"سال ساخت:","name":"year","props":{"max":"2024","min":"1900","placeholder":"سال ساخت را وارد کنید","type":"number"},"style":{"borderRadius":"5px","margin":"10px 0","padding":"8px"},"type":"input"},{"label":"نوع سوخت:","name":"fuel_type","props":{"options":[{"label":"بنزین","value":"بنزین"},{"label":"گاز","value":"گاز"},{"label":"دیزل","value":"دیزل"},{"label":"الکتریکی","value":"الکتریکی"}]},"style":{"borderRadius":"5px","margin":"10px 0","padding":"8px"},"type":"select"},{"label":"رنگ ماشین:","name":"color","props":{"placeholder":"رنگ ماشین را وارد کنید","type":"text"},"style":{"borderRadius":"5px","margin":"10px 0","padding":"8px"},"type":"input"},{"label":"تعداد مالکین قبلی:","name":"previous_owners","props":{"min":"0","placeholder":"تعداد مالکین قبلی را وارد کنید","type":"number"},"style":{"borderRadius":"5px","margin":"10px 0","padding":"8px"},"type":"input"},{"label":"توضیحات وضعیت فنی:","name":"technical_condition","props":{"cols":50,"placeholder":"توضیحات درباره وضعیت فنی ماشین","rows":4},"style":{"borderRadius":"5px","margin":"10px 0","padding":"10px"},"type":"textarea"},{"label":"تصاویر ماشین:","name":"car_images","props":{"accept":"image/*","maxSize":"5MB","multiple":true},"style":{"margin":"10px 0"},"type":"file"}]}
```

Suppose the backend APIs are concurrently in the development process. So mock APIs in some way clean to continue your work.


### Implementation details


Try to write your code as **reusable** and **readable** as possible. The architecture of your code and where you integrate your design system within the project are important to us.

Also, don't forget to **document your code** and clear the reasons for all your decisions in the code.

It is more valuable to us that the project comes with unit tests.

Please fork this repository and add your code to that. Don't forget that your commits are so important.
So be sure that you're committing your code often with a proper commit message.


### We all use AI. Don't be ashamed

Everyone uses AI for everything. And we expect you to do the same. AI is a big part of our development process, and we care a lot about how you use AI tools during this task.

To earn our immunity after the AI takeover of Earth, we want to make sure you're using it properly.

Add a file named "ai.md" to your project. This file should contain the following information (the more explicit, the better):

1. What AI tools and models did you use?
2. Explain the different stages of software development where you used AI help. Describe how you used your tools at each stage.
3. We want to know how you prompt. So add your prompts to this file too. For each prompt, explain which stage you used it in, how you evaluated the result, and what you did to fix any misbehavior.
4. Explain how you monitor your token usage and what you do to manage it. Link your tools or add your helper prompts.

*There's a sample.ai.md file in the project representing the expected template. Don't forget: "ai.md" is the only file we expect you to write entirely by yourself.*
