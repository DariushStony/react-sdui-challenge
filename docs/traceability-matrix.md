# Traceability matrix: Dynamic Form Renderer

| | |
| --- | --- |
| Status | Draft, in review |
| Version | 0.1 |
| Date | 2026-11-13 |
| Owner | Dariush Hadipour |
| Inputs | [prd.md](prd.md) v0.2, [test-cases.md](test-cases.md) v0.1 |
| Structure based on | Bidirectional requirements traceability matrix |
| Companion documents | [test-strategy.md](test-strategy.md) |

---

## 0. Version history

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-11-13 | First version, derived from the Covers column of the test cases. |

## 1. How to read this document

- **Forward (requirement to test):** the tables below. Every requirement, edge case and acceptance criterion in the PRD appears once, with the test cases that protect it.
- **Backward (test to requirement):** the `Covers` column of [test-cases.md](test-cases.md). A test case with no requirement would be a smell.
- **Status** values: Planned, In progress, Passing, Failing, Manual done. All rows start as Planned and change as the implementation phases finish.
- The tables were generated from the two documents; when either changes, regenerate and check that no row says **none**.

## 2. Coverage summary

| Kind | Count | With at least one test case |
| --- | --- | --- |
| Functional requirements (FR) | 39 | 39 |
| Non-functional requirements (NFR) | 12 | 12 |
| Technical requirements (TR) | 10 | 10 |
| Edge cases (EC) | 17 | 17 |
| Acceptance criteria (AC) | 23 | 23 |

## 3. Matrix

### 3.1 Functional requirements

| ID | Requirement | Pri | Test cases | Status |
| --- | --- | --- | --- | --- |
| FR-01 | The system shall fetch the payload from `GET /api/forms/{formId}`. | M | TC-E01, TC-E03 | Planned |
| FR-02 | While the payload loads, the system shall show a loading state. On failure it shall sho... | M | TC-E03, TC-E04 | Planned |
| FR-03 | The system shall convert every payload into the canonical model at a single boundary; n... | M | TC-U04 | Planned |
| FR-04 | The system shall accept both the legacy payload and the v2 payload. | M | TC-E02, TC-U04, TC-U07 | Planned |
| FR-05 | A payload without `schemaVersion` shall be treated as legacy. A payload with an unsuppo... | M | TC-E05, TC-U08 | Planned |
| FR-06 | An unknown field kind shall be skipped with a development warning when the field is opt... | M | TC-E05, TC-U09 | Planned |
| FR-07 | A payload that is not valid JSON or fails structural validation shall produce an error... | M | TC-E05, TC-U05, TC-U11 | Planned |
| FR-08 | Duplicate field names in one payload shall be rejected with an error state. | M | TC-E05, TC-U10 | Planned |
| FR-09 | The system shall render fields in payload order using the five kinds in section 5. | M | TC-C03, TC-E01, TC-U04 | Planned |
| FR-10 | Every field shall have a programmatically associated visible label. | M | TC-C01 | Planned |
| FR-11 | The system shall support `description` (hint text), `placeholder` and a default value. | S | TC-C10, TC-U23 | Planned |
| FR-12 | The system shall support `disabled` and `readOnly`. | S | TC-C09 | Planned |
| FR-13 | Select options shall come from the payload as a static list of `{value, label}`. | M | TC-C04, TC-U15 | Planned |
| FR-14 | Server-supplied presentation data (raw CSS, hex colors, margins) shall not be applied.... | M | TC-U06 | Planned |
| FR-15 | Number fields shall accept Persian and Arabic-Indic digits, the Arabic decimal separato... | M | TC-C02, TC-U02, TC-U14 | Planned |
| FR-16 | Legacy labels with a trailing colon shall be displayed without it. | S | TC-U04 | Planned |
| FR-17 | Validation rules shall come from the payload as data and be applied by pure functions t... | M | TC-U13, TC-U14, TC-U15, TC-U16 | Planned |
| FR-18 | The system shall validate after the first blur of a field and on submit; after a field... | M | TC-E07 | Planned |
| FR-19 | On an invalid submit the system shall send no request, show all errors and move focus t... | M | TC-E08 | Planned |
| FR-20 | Each error shall be shown next to its field, linked to the control through `aria-descri... | M | TC-C01 | Planned |
| FR-21 | Error text shall be produced from message codes by a Persian message catalog, with para... | M | TC-U17, TC-U20 | Planned |
| FR-22 | `pattern` shall be supported for text and textarea. | S | TC-U13 | Planned |
| FR-23 | A file field shall support multiple selection when the payload allows it. | M | TC-C05 | Planned |
| FR-24 | Each selected file shall be listed with its name and human-readable size; images shall... | M | TC-C05 | Planned |
| FR-25 | The user shall be able to remove any single file. | M | TC-C06 | Planned |
| FR-26 | Each file shall be checked against `accept`, `maxBytes` and (for the set) `maxFiles`, a... | M | TC-U03, TC-U16 | Planned |
| FR-27 | Selecting files again shall add to the list; a file with the same name, size and last-m... | S | TC-C07, TC-U22 | Planned |
| FR-28 | `MB` in a size shall mean 1024 x 1024 bytes. The v2 contract shall state sizes in bytes. | M | TC-U01, TC-U16 | Planned |
| FR-29 | Object URLs created for thumbnails shall be revoked when a file is removed or the field... | M | TC-C06 | Planned |
| FR-30 | The system shall send one `multipart/form-data` request to `POST /api/forms/{formId}/su... | M | TC-E09, TC-S08, TC-U18 | Planned |
| FR-31 | While a submission is in flight the submit control shall be disabled and a busy state a... | M | TC-E10 | Planned |
| FR-32 | On success the system shall show a success panel with two actions: "Edit and resubmit"... | M | TC-E11 | Planned |
| FR-33 | On `422` the system shall map each error to its field. An error for an unknown field na... | M | TC-E12, TC-E13, TC-U19 | Planned |
| FR-34 | On a network failure or `5xx` the system shall show a form-level alert with a Retry act... | M | TC-E14, TC-E15 | Planned |
| FR-35 | A separate view shall let the user choose a preset payload (the original brief sample,... | S | TC-P01 | Planned |
| FR-36 | The Playground shall render a live preview with the same renderer and show parse diagno... | S | TC-P02 | Planned |
| FR-37 | The Playground shall contain no rendering or validation logic of its own. | S | TC-P03 | Planned |
| FR-38 | The page shall default to `lang="fa"` and `dir="rtl"`. All user-visible strings shall c... | M | TC-E16, TC-U20 | Planned |
| FR-39 | The form shall render correctly when the direction is switched to `ltr`. | M | TC-E16, TC-M03 | Planned |

### 3.2 Non-functional requirements

| ID | Requirement | Pri | Test cases | Status |
| --- | --- | --- | --- | --- |
| NFR-01 | Usability, accessibility: The form shall conform to WCAG 2.2 level AA: real labels, pro... | M | TC-A01, TC-A02, TC-A03, TC-C01, TC-C08, TC-C11, TC-M01 | Planned |
| NFR-02 | Usability, internationalization: Styles shall use CSS logical properties and values onl... | M | TC-S02 | Planned |
| NFR-03 | Maintainability, modularity: The code shall be layered: schema contracts, engine, field... | M | TC-S01 | Planned |
| NFR-04 | Maintainability, extensibility: Adding a field kind shall require one new module and on... | M | TC-U21 | Planned |
| NFR-05 | Maintainability, type safety: Strict TypeScript (including `noUncheckedIndexedAccess` a... | M | TC-S03 | Planned |
| NFR-06 | Testability: Parsing, normalization, rule evaluation and the file module shall be unit-... | M | TC-S09 | Planned |
| NFR-07 | Reliability, fault tolerance: No failure of the network, the payload or the mock shall... | M | TC-P04, TC-P05 | Planned |
| NFR-08 | Security: Client checks are advisory; no user content is rendered as HTML; file content... | M | RV-1, TC-U13 | Planned |
| NFR-09 | Performance efficiency: Target: application JavaScript at most 150 kB gzip excluding th... | S | TC-E17, TC-S06 | Planned |
| NFR-10 | Portability, compatibility: Runs with Node 22.12 or later using npm or pnpm; supports c... | M | TC-M02, TC-S04, TC-S05 | Planned |
| NFR-11 | Maintainability, analyzability: Code comments explain why a decision was made, not what... | M | RV-2 | Planned |
| NFR-12 | Maintainability, process: Small commits with Conventional Commits messages; tests in th... | M | TC-S04, TC-S10 | Planned |

### 3.3 Technical requirements

| ID | Requirement | Test cases | Status |
| --- | --- | --- | --- |
| TR-01 | React 19, TypeScript 7 in strict mode, Vite 8. | TC-S03 | Planned |
| TR-02 | Form state: react-hook-form. Validation: zod, used both to parse the payload at the bou... | TC-U17 | Planned |
| TR-03 | Server state (fetch form, submit): TanStack Query. | TC-E03, TC-E04, TC-E14 | Planned |
| TR-04 | Mocking: MSW 3 handlers shared by the browser (development and production preview) and... | TC-S05 | Planned |
| TR-05 | Styling: CSS Modules and CSS-variable design tokens, with a thin `ui/` primitive layer.... | TC-S01, TC-S02 | Planned |
| TR-06 | Tests: Vitest, Testing Library, user-event, an axe-based accessibility check. Multipart... | TC-S08 | Planned |
| TR-07 | Quality gates: oxlint (type-aware), a CSS logical-properties linter, Prettier, and a Gi... | TC-S10 | Planned |
| TR-08 | Scripts shall not depend on a specific package manager; pnpm is the primary one and npm... | TC-S04 | Planned |
| TR-09 | Git hooks (husky, lint-staged) shall not fail an install when `.git` is missing. | TC-S07 | Planned |
| TR-10 | Documentation lives in `docs/`; `ai.md` at the repository root is authored solely by th... | RV-2 | Planned |

### 3.4 Acceptance criteria

| ID | Requirement | Test cases | Status |
| --- | --- | --- | --- |
| AC-01 | Given the legacy sample payload, when the page loads, then five kinds render in order w... | TC-E01, TC-U04 | Planned |
| AC-02 | Given a v2 payload, when the page loads, then the same renderer shows its fields with t... | TC-E02, TC-U07 | Planned |
| AC-03 | Given a payload with a higher unsupported major version, then an explicit outdated-clie... | TC-E05, TC-U08 | Planned |
| AC-04 | Given an unknown optional kind, then the other fields render and a development warning... | TC-E05, TC-U09 | Planned |
| AC-05 | Given a failing `GET`, then an error state with Retry appears; when Retry succeeds, the... | TC-E04 | Planned |
| AC-06 | Given a required text field, when the user focuses and leaves it empty, then a Persian... | TC-C01, TC-E07 | Planned |
| AC-07 | Given a number field with `min 1900`, when the user types `۱۸۰۰`, then it is read as 18... | TC-C02, TC-U14 | Planned |
| AC-08 | Given a file field with `accept image/*`, when the user adds a PDF, then the file is re... | TC-U16 | Planned |
| AC-09 | Given `maxBytes` of 5 MB, when a larger file is added, then it is rejected with the all... | TC-U16 | Planned |
| AC-10 | Given selected images, then each shows name, size and a thumbnail, and each can be remo... | TC-C05, TC-C06 | Planned |
| AC-11 | Given an invalid form, when the user submits, then no request is sent and focus moves t... | TC-E08 | Planned |
| AC-12 | Given a valid form with two files, when the user submits, then exactly one multipart re... | TC-E09, TC-P06 | Planned |
| AC-13 | Given a submission in flight, then the submit control is disabled and a second submissi... | TC-E10 | Planned |
| AC-14 | Given a `2xx` response, then a success panel appears; "Edit and resubmit" restores the... | TC-E11, TC-P06 | Planned |
| AC-15 | Given a `422` with a field error, then the message appears under that field and entered... | TC-E12, TC-E13 | Planned |
| AC-16 | Given a network failure during submit, then a form-level alert with Retry appears and e... | TC-E14 | Planned |
| AC-17 | Given the Playground, when a preset is chosen or JSON is pasted, then the preview updat... | TC-P01, TC-P02 | Planned |
| AC-18 | Given the default page, then `lang="fa"` and `dir="rtl"`; given `dir="ltr"`, then the f... | TC-E16 | Planned |
| AC-19 | Given the rendered form, then the automated accessibility test reports no violations, a... | TC-A01, TC-A03, TC-C08 | Planned |
| AC-20 | Given a stylesheet with a physical property such as `margin-right`, then the style chec... | TC-S02 | Planned |
| AC-21 | Given a new field kind module and its registry entry, then it renders and validates wit... | TC-U21 | Planned |
| AC-22 | Given `build` plus `preview`, then the form loads through the mock API. | TC-M02, TC-S05 | Planned |
| AC-23 | Given a number field without `integer`, then `12.5` and `-3` are accepted; given `integ... | TC-U14 | Planned |

### 3.5 Edge cases

| ID | Requirement | Test cases | Status |
| --- | --- | --- | --- |
| EC-01 | Payload has zero fields. | TC-E06 | Planned |
| EC-02 | Select with no options. | TC-E06 | Planned |
| EC-03 | Legacy `min`/`max` are strings (`"1900"`). | TC-U05 | Planned |
| EC-04 | Legacy `maxSize` is `"5MB"`, `"500KB"`, or malformed. | TC-U01 | Planned |
| EC-05 | Legacy `multiple` is absent. | TC-U04, TC-U05 | Planned |
| EC-06 | User types Persian or Arabic-Indic digits, a decimal part, or a minus sign. | TC-U02 | Planned |
| EC-07 | Same file chosen twice. | TC-C07, TC-U22 | Planned |
| EC-08 | File has no MIME type or no extension. | TC-U03 | Planned |
| EC-09 | A file is removed, then the same file is added again. | TC-C07, TC-U22 | Planned |
| EC-10 | Submit pressed twice quickly. | TC-E10 | Planned |
| EC-11 | `422` names a field that does not exist. | TC-E13, TC-U19 | Planned |
| EC-12 | `GET` returns HTML or a non-JSON body. | TC-U11 | Planned |
| EC-13 | Server sends an unknown rule key. | TC-U12 | Planned |
| EC-14 | Legacy `props.type` is something other than `text` or `number` (for example `email`). | TC-U05 | Planned |
| EC-15 | Very long label or option text. | TC-M03 | Planned |
| EC-16 | Payload changes between loads (different fields). | TC-E18 | Planned |
| EC-17 | Mock service worker cannot start. | TC-P04 | Planned |
