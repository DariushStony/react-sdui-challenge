# Traceability matrix: Dynamic Form Renderer

| | |
| --- | --- |
| Status | Approved |
| Version | 1.8 |
| Date | 2026-11-13 |
| Owner | Dariush Hadipour |
| Inputs | [prd.md](prd.md) v0.7, [test-cases.md](test-cases.md) v0.10 |
| Structure based on | Bidirectional requirements traceability matrix |
| Companion documents | [test-strategy.md](test-strategy.md) |

---

## 0. Version history

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-11-13 | First version, derived from the Covers column of the test cases. |
| 0.2 | 2026-11-13 | Phase 0 finished: statuses set from the passing test cases (TC-S01 to TC-S04, TC-S07, TC-S08, TC-S10). |
| 0.3 | 2026-11-13 | Phase 1 finished: TC-U01, TC-U02, TC-U03 and TC-U22 pass. |
| 0.4 | 2026-11-13 | Phase 2 finished: TC-U04 to TC-U16, TC-U18, TC-U19, TC-U21 and TC-U23 pass. |
| 0.5 | 2026-11-13 | Phase 3 finished: TC-U17, TC-U20 and the new TC-U24 (unsafe field names) pass. |
| 0.6 | 2026-11-13 | Phase 4 finished: TC-C11 passes (the ui primitives exist and are axe-clean); TR-05 is now met. |
| 0.7 | 2026-11-13 | Phase 5 finished: TC-C01 to TC-C04, TC-C09 and TC-C10 pass (text, textarea, number and select components). |
| 0.8 | 2026-11-13 | Phase 6 finished: TC-C05 to TC-C08 pass (the file field: choose, list, remove, thumbnails, duplicates, keyboard). |
| 0.9 | 2026-11-13 | Phase 7 finished: TC-E06, TC-E07, TC-E08, TC-E10, TC-E11, TC-E16, TC-E17 and TC-E18 pass (the form engine with a stub onSubmit). |
| 1.0 | 2026-11-13 | Phase 8 finished: TC-E01 to TC-E05, TC-E09, TC-E12 to TC-E15, TC-P04 to TC-P06, TC-A01, TC-S05, TC-S06 and the new TC-U25 to TC-U28 pass (API client, mocks, app composition, bundle check). |
| 1.1 | 2026-11-13 | Phase 9 finished: TC-P01, TC-P02, TC-P03 and the new TC-U29, TC-C12, TC-E19 and TC-P07 pass (the Playground, shared diagnostics, nav). |
| 1.2 | 2026-11-13 | Phase 10: TC-A02, TC-A03, TC-S09, TC-M03, RV-1 and RV-2 are done (accessibility after interaction and by keyboard, coverage, reviews, visual check). Still open: VoiceOver (TC-M01), Firefox and Safari (TC-M02), and CI, which has not run on a server. |
| 1.3 | 2026-11-13 | Polish: TC-S11 passes (the supported Node versions match the installed dependencies; the floor was corrected to 22.22.2), and the page now names the document (TC-C12). |
| 1.4 | 2026-11-13 | Review fixes and phone-width bugs: TC-U30, TC-C13, TC-E20 and TC-P08 pass; edge cases EC-18 to EC-22 added to the PRD; Node, pnpm and the CI actions moved to the newest releases. |
| 1.5 | 2026-11-13 | Phase 11: the renderer is a workspace package used by the demo through its public API; TC-S13 and TC-S14 pass. |
| 1.6 | 2026-11-13 | Phase 12: the engine renders through a swappable UI kit and speaks through replaceable messages (Persian and English); TC-U31, TC-C14, TC-C15, TC-E21 and TC-S15 pass. |
| 1.7 | 2026-11-13 | Phase 13: the source trees follow the conventions of ADR-0016 (kebab-case, a folder per module, one export per file) and TC-S12 enforces them. |
| 1.8 | 2026-11-13 | ADR-0017: the public API is two small entries, pinned by TC-S16; TR-11 and TR-12 added; second review fixes (TC-U32, TC-C16, TC-E22); TC-M02 done in Chrome, Firefox and the WebKit engine, and axe run in real Chrome (TC-A04). |

## 1. How to read this document

- **Forward (requirement to test):** the tables below. Every requirement, edge case and acceptance criterion in the PRD appears once, with the test cases that protect it.
- **Backward (test to requirement):** the `Covers` column of [test-cases.md](test-cases.md). A test case with no requirement would be a smell.
- **Status** values: Planned, In progress (some of its test cases pass), Passing (all of them pass), Failing, Manual done. Rows change as the implementation phases finish; "Passing" means the automated cases ran green locally and under `check`. A few rows are held at In progress by judgment when their cases prove only part of the requirement.
- The tables were generated from the two documents; when either changes, regenerate and check that no row says **none**.

## 2. Coverage summary

| Kind | Count | With at least one test case |
| --- | --- | --- |
| Functional requirements (FR) | 39 | 39 |
| Non-functional requirements (NFR) | 12 | 12 |
| Technical requirements (TR) | 12 | 12 |
| Edge cases (EC) | 22 | 22 |
| Acceptance criteria (AC) | 23 | 23 |

## 3. Matrix

### 3.1 Functional requirements

| ID | Requirement | Pri | Test cases | Status |
| --- | --- | --- | --- | --- |
| FR-01 | The system shall fetch the payload from `GET /api/forms/{formId}`. | M | TC-E01, TC-E03, TC-U25, TC-U27, TC-U28 | Passing |
| FR-02 | While the payload loads, the system shall show a loading state. On failure it shall sho... | M | TC-E03, TC-E04, TC-P08, TC-U26 | Passing |
| FR-03 | The system shall convert every payload into the canonical model at a single boundary; n... | M | TC-E22, TC-U04, TC-U26 | Passing |
| FR-04 | The system shall accept both the legacy payload and the v2 payload. | M | TC-E02, TC-U04, TC-U07 | Passing |
| FR-05 | A payload without `schemaVersion` shall be treated as legacy. A payload with an unsuppo... | M | TC-E05, TC-U08 | Passing |
| FR-06 | An unknown field kind shall be skipped with a development warning when the field is opt... | M | TC-E05, TC-U09 | Passing |
| FR-07 | A payload that is not valid JSON or fails structural validation shall produce an error... | M | TC-E05, TC-E19, TC-U05, TC-U11, TC-U24 | Passing |
| FR-08 | Duplicate field names in one payload shall be rejected with an error state. | M | TC-E05, TC-E19, TC-U10 | Passing |
| FR-09 | The system shall render fields in payload order using the five kinds in section 5. | M | TC-C03, TC-E01, TC-U04 | Passing |
| FR-10 | Every field shall have a programmatically associated visible label. | M | TC-C01 | Passing |
| FR-11 | The system shall support `description` (hint text), `placeholder` and a default value. | S | TC-C10, TC-U23 | Passing |
| FR-12 | The system shall support `disabled` and `readOnly`. | S | TC-C09, TC-C13, TC-C16 | Passing |
| FR-13 | Select options shall come from the payload as a static list of `{value, label}`. | M | TC-C04, TC-U15 | Passing |
| FR-14 | Server-supplied presentation data (raw CSS, hex colors, margins) shall not be applied.... | M | TC-U06 | Passing |
| FR-15 | Number fields shall accept Persian and Arabic-Indic digits, the Arabic decimal separato... | M | TC-C02, TC-U02, TC-U14 | Passing |
| FR-16 | Legacy labels with a trailing colon shall be displayed without it. | S | TC-U04 | Passing |
| FR-17 | Validation rules shall come from the payload as data and be applied by pure functions t... | M | TC-U13, TC-U14, TC-U15, TC-U16, TC-U32 | Passing |
| FR-18 | The system shall validate after the first blur of a field and on submit; after a field... | M | TC-E07 | Passing |
| FR-19 | On an invalid submit the system shall send no request, show all errors and move focus t... | M | TC-E08 | Passing |
| FR-20 | Each error shall be shown next to its field, linked to the control through `aria-descri... | M | TC-C01 | Passing |
| FR-21 | Error text shall be produced from message codes by a message catalog, with parameters (... | M | TC-E21, TC-U17, TC-U20, TC-U31 | Passing |
| FR-22 | `pattern` shall be supported for text and textarea. | S | TC-U13 | Passing |
| FR-23 | A file field shall support multiple selection when the payload allows it. | M | TC-C05 | Passing |
| FR-24 | Each selected file shall be listed with its name and human-readable size; images shall... | M | TC-C05 | Passing |
| FR-25 | The user shall be able to remove any single file. | M | TC-C06 | Passing |
| FR-26 | Each file shall be checked against `accept`, `maxBytes` and (for the set) `maxFiles`, a... | M | TC-U03, TC-U16, TC-U30 | Passing |
| FR-27 | Selecting files again shall add to the list; a file with the same name, size and last-m... | S | TC-C07, TC-U22 | Passing |
| FR-28 | `MB` in a size shall mean 1024 x 1024 bytes. The v2 contract shall state sizes in bytes. | M | TC-U01, TC-U16 | Passing |
| FR-29 | Object URLs created for thumbnails shall be revoked when a file is removed or the field... | M | TC-C06 | Passing |
| FR-30 | The system shall send one `multipart/form-data` request to `POST /api/forms/{formId}/su... | M | TC-E09, TC-S08, TC-U18, TC-U25, TC-U32 | Passing |
| FR-31 | While a submission is in flight the submit control shall be disabled and a busy state a... | M | TC-E10 | Passing |
| FR-32 | On success the system shall show a success panel with two actions: "Edit and resubmit"... | M | TC-E11 | Passing |
| FR-33 | On `422` the system shall map each error to its field. An error for an unknown field na... | M | TC-E12, TC-E13, TC-U19, TC-U26, TC-U30, TC-U32 | Passing |
| FR-34 | On a network failure or `5xx` the system shall show a form-level alert with a Retry act... | M | TC-E14, TC-E15, TC-P08, TC-U25, TC-U26 | Passing |
| FR-35 | A separate view shall let the user choose a preset payload (the original brief sample,... | S | TC-P01, TC-P07, TC-U29 | Passing |
| FR-36 | The Playground shall render a live preview with the same renderer and show parse diagno... | S | TC-P02, TC-U29 | Passing |
| FR-37 | The Playground shall contain no rendering or validation logic of its own. | S | TC-P03, TC-U29 | Passing |
| FR-38 | The page shall default to `lang="fa"` and `dir="rtl"`. All user-visible strings shall c... | M | TC-E16, TC-E21, TC-U20, TC-U31 | Passing |
| FR-39 | The form shall render correctly when the direction is switched to `ltr`. | M | TC-E16, TC-M03 | Passing |

### 3.2 Non-functional requirements

| ID | Requirement | Pri | Test cases | Status |
| --- | --- | --- | --- | --- |
| NFR-01 | Usability, accessibility: The form shall conform to WCAG 2.2 level AA: real labels, pro... | M | TC-A01, TC-A02, TC-A03, TC-A04, TC-C01, TC-C08, TC-C11, TC-C12, TC-C16, TC-E20, TC-M01 | In progress |
| NFR-02 | Usability, internationalization: Styles shall use CSS logical properties and values onl... | M | TC-S02 | Passing |
| NFR-03 | Maintainability, modularity: The code shall be layered: schema contracts, engine, field... | M | TC-C14, TC-S01, TC-S13, TC-S14, TC-S15, TC-S16 | Passing |
| NFR-04 | Maintainability, extensibility: Adding a field kind shall require one new module and on... | M | TC-U21 | Passing |
| NFR-05 | Maintainability, type safety: Strict TypeScript (including `noUncheckedIndexedAccess` a... | M | TC-S03, TC-S12 | Passing |
| NFR-06 | Testability: Parsing, normalization, rule evaluation and the file module shall be unit-... | M | TC-S09 | Passing |
| NFR-07 | Reliability, fault tolerance: No failure of the network, the payload or the mock shall... | M | TC-P04, TC-P05 | Passing |
| NFR-08 | Security: Client checks are advisory; no user content is rendered as HTML; file content... | M | RV-1, TC-U13 | Passing |
| NFR-09 | Performance efficiency: Target: application JavaScript at most 150 kB gzip excluding th... | S | TC-E17, TC-S06 | Passing |
| NFR-10 | Portability, compatibility: Runs with Node 26.13.1 or later using npm or pnpm; supports... | M | TC-M02, TC-S04, TC-S05, TC-S11, TC-S14 | Passing |
| NFR-11 | Maintainability, analyzability: Code comments explain why a decision was made, not what... | M | RV-2, TC-S12 | Passing |
| NFR-12 | Maintainability, process: Small commits with Conventional Commits messages; tests in th... | M | TC-S04, TC-S10 | In progress |

### 3.3 Technical requirements

| ID | Requirement | Test cases | Status |
| --- | --- | --- | --- |
| TR-01 | React 19, TypeScript 7 in strict mode, Vite 8. | TC-S03 | Passing |
| TR-02 | Form state: react-hook-form. Validation: zod, used both to parse the payload at the bou... | TC-U17 | Passing |
| TR-03 | Server state (fetch form, submit): TanStack Query. | TC-E03, TC-E04, TC-E14, TC-U26 | Passing |
| TR-04 | Mocking: MSW 3 handlers shared by the browser (development and production preview) and... | TC-S05, TC-U27 | Passing |
| TR-05 | Styling: CSS Modules and CSS-variable design tokens, with a thin `ui/` primitive layer.... | TC-C14, TC-C15, TC-C16, TC-S01, TC-S02, TC-S15 | Passing |
| TR-06 | Tests: Vitest, Testing Library, user-event, an axe-based accessibility check. Multipart... | TC-S08 | Passing |
| TR-07 | Quality gates: oxlint (type-aware), a CSS logical-properties linter, Prettier, and a Gi... | TC-S10 | In progress |
| TR-08 | Scripts shall not depend on a specific package manager; pnpm is the primary one and npm... | TC-S04 | Passing |
| TR-09 | Git hooks (husky, lint-staged) shall not fail an install when `.git` is missing. | TC-S07 | Passing |
| TR-10 | Documentation lives in `docs/`; `ai.md` at the repository root is authored solely by th... | RV-2 | Passing |
| TR-11 | The package exports only what is needed: two public entries (client and logic), the lis... | TC-S16 | Passing |
| TR-12 | The packed package type-checks for a strict consumer under `bundler` and `nodenext`, ma... | TC-S14 | Passing |

### 3.4 Acceptance criteria

| ID | Requirement | Test cases | Status |
| --- | --- | --- | --- |
| AC-01 | Given the legacy sample payload, when the page loads, then five kinds render in order w... | TC-E01, TC-U04 | Passing |
| AC-02 | Given a v2 payload, when the page loads, then the same renderer shows its fields with t... | TC-E02, TC-U07 | Passing |
| AC-03 | Given a payload with a higher unsupported major version, then an explicit outdated-clie... | TC-E05, TC-E19, TC-U08 | Passing |
| AC-04 | Given an unknown optional kind, then the other fields render and a development warning... | TC-E05, TC-E19, TC-U09 | Passing |
| AC-05 | Given a failing `GET`, then an error state with Retry appears; when Retry succeeds, the... | TC-E04 | Passing |
| AC-06 | Given a required text field, when the user focuses and leaves it empty, then a Persian... | TC-C01, TC-E07 | Passing |
| AC-07 | Given a number field with `min 1900`, when the user types `۱۸۰۰`, then it is read as 18... | TC-C02, TC-U14 | Passing |
| AC-08 | Given a file field with `accept image/*`, when the user adds a PDF, then the file is re... | TC-U16 | Passing |
| AC-09 | Given `maxBytes` of 5 MB, when a larger file is added, then it is rejected with the all... | TC-U16 | Passing |
| AC-10 | Given selected images, then each shows name, size and a thumbnail, and each can be remo... | TC-C05, TC-C06 | Passing |
| AC-11 | Given an invalid form, when the user submits, then no request is sent and focus moves t... | TC-E08 | Passing |
| AC-12 | Given a valid form with two files, when the user submits, then exactly one multipart re... | TC-E09, TC-P06 | Passing |
| AC-13 | Given a submission in flight, then the submit control is disabled and a second submissi... | TC-E10 | Passing |
| AC-14 | Given a `2xx` response, then a success panel appears; "Edit and resubmit" restores the... | TC-E11, TC-P06 | Passing |
| AC-15 | Given a `422` with a field error, then the message appears under that field and entered... | TC-E12, TC-E13 | Passing |
| AC-16 | Given a network failure during submit, then a form-level alert with Retry appears and e... | TC-E14 | Passing |
| AC-17 | Given the Playground, when a preset is chosen or JSON is pasted, then the preview updat... | TC-P01, TC-P02 | Passing |
| AC-18 | Given the default page, then `lang="fa"` and `dir="rtl"`; given `dir="ltr"`, then the f... | TC-E16 | Passing |
| AC-19 | Given the rendered form, then the automated accessibility test reports no violations, a... | TC-A01, TC-A03, TC-A04, TC-C08 | Passing |
| AC-20 | Given a stylesheet with a physical property such as `margin-right`, then the style chec... | TC-S02 | Passing |
| AC-21 | Given a new field kind module and its registry entry, then it renders and validates wit... | TC-U21 | Passing |
| AC-22 | Given `build` plus `preview`, then the form loads through the mock API. | TC-M02, TC-S05 | Passing |
| AC-23 | Given a number field without `integer`, then `12.5` and `-3` are accepted; given `integ... | TC-U14 | Passing |

### 3.5 Edge cases

| ID | Requirement | Test cases | Status |
| --- | --- | --- | --- |
| EC-01 | Payload has zero fields. | TC-E06 | Passing |
| EC-02 | Select with no options. | TC-E06 | Passing |
| EC-03 | Legacy `min`/`max` are strings (`"1900"`). | TC-U05 | Passing |
| EC-04 | Legacy `maxSize` is `"5MB"`, `"500KB"`, or malformed. | TC-U01 | Passing |
| EC-05 | Legacy `multiple` is absent. | TC-U04, TC-U05 | Passing |
| EC-06 | User types Persian or Arabic-Indic digits, a decimal part, or a minus sign. | TC-U02, TC-U14 | Passing |
| EC-07 | Same file chosen twice. | TC-C07, TC-U22 | Passing |
| EC-08 | File has no MIME type or no extension. | TC-U03 | Passing |
| EC-09 | A file is removed, then the same file is added again. | TC-C07, TC-U22 | Passing |
| EC-10 | Submit pressed twice quickly. | TC-E10 | Passing |
| EC-11 | `422` names a field that does not exist. | TC-E13, TC-U19 | Passing |
| EC-12 | `GET` returns HTML or a non-JSON body. | TC-U11 | Passing |
| EC-13 | Server sends an unknown rule key. | TC-U12 | Passing |
| EC-14 | Legacy `props.type` is something other than `text` or `number` (for example `email`). | TC-U05 | Passing |
| EC-15 | Very long label or option text. | TC-M03 | Passing |
| EC-16 | Payload changes between loads (different fields). | TC-E18, TC-E22 | Passing |
| EC-17 | Mock service worker cannot start. | TC-P04 | Passing |
| EC-18 | A field name that the form cannot store: it has a quote, or is `constructor`, `prototyp... | TC-U30 | Passing |
| EC-19 | `accept` is `*/*` (or `*`). | TC-U30 | Passing |
| EC-20 | The browser reports "offline" or the server never answers. | TC-P08 | Passing |
| EC-21 | A `422` field with an empty list of errors, or an error code with no `params` that its... | TC-E20, TC-U30 | Passing |
| EC-22 | A disabled or read-only file field; a long file name on a phone. | TC-C13 | Passing |
