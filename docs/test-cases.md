# Test cases: Dynamic Form Renderer

| | |
| --- | --- |
| Status | Approved |
| Version | 0.1 |
| Date | 2026-11-13 |
| Owner | Dariush Hadipour |
| Inputs | [prd.md](prd.md) v0.2, [test-strategy.md](test-strategy.md) v0.1, [api-contract.md](api-contract.md) v0.1 |
| Structure based on | ISO/IEC/IEEE 29119-3 chain: feature set, test condition, test case (with expected result); test procedures are the automated tests themselves |
| Companion documents | [traceability-matrix.md](traceability-matrix.md) |

---

## 0. Version history

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-11-13 | First draft. |

## 1. How to read this document

- IDs are stable: `TC-U` unit, `TC-C` component, `TC-E` engine and integration, `TC-P` page, Playground and app, `TC-A` accessibility, `TC-S` static, build and tooling, `TC-M` manual.
- "Covers" lists the PRD requirement, edge case or acceptance IDs the case protects. The traceability matrix is generated from these lists.
- Where a case says "table", it is one automated test driven by a table of inputs and expected outputs, so adding a row adds a case.
- Cases describe behavior, not implementation; they stay valid if internals change.

## 2. Unit tests (`core/`, kind definitions, resolver, catalog)

| ID | Condition and action | Expected result | Covers |
| --- | --- | --- | --- |
| TC-U01 | `parseSize` table: `"5MB"`, `"500KB"`, `"1.5MB"`, `"5 mb"`, `"1024"`, `"0"`, `"abc"`, `""`, `"5TB"` | Bytes with 1024 base for valid input (`5MB` is 5242880); failure for malformed input; no unit means bytes | FR-28, EC-04 |
| TC-U02 | `toAsciiDigits` and `parseNumber` table: Persian digits, Arabic-Indic digits, `٫` decimal separator, minus sign variants, `1.2.3`, `--5`, `abc`, `""` | Normalized ASCII and a finite number, or a failure with `not_a_number` | FR-15, EC-06 |
| TC-U03 | `acceptMatches` table: `image/*` vs `image/png` and `application/pdf`; `.pdf` vs `a.PDF`; MIME exact; empty `file.type` with extension; no extension and no type | Matches as specified; unknown type and extension is rejected | FR-26, EC-08 |
| TC-U04 | Normalize the full legacy sample from the brief | A model with the sample's eight fields in order (kinds `text`, `text`, `number`, `select`, `text`, `number`, `textarea`, `file`); labels without trailing colon; no warnings except dropped presentation data; `required` is false everywhere | FR-03, FR-04, FR-09, FR-16, EC-05, AC-01 |
| TC-U05 | Legacy quirks table: `min`/`max` strings, non-numeric `min`, `props.type: "email"`, missing `props.type`, `multiple` absent | Numbers parsed; non-numeric makes the payload invalid; `email` becomes `text` with a warning; missing type is `text`; `multiple` false | FR-07, EC-03, EC-05, EC-14 |
| TC-U06 | Legacy presentation data: `props.color`, `style`, `props.size` of `large` and of `huge` | `size` token kept only for `small`, `medium`, `large`; everything else absent from the model | FR-14 |
| TC-U07 | Normalize the v2 example from the API contract | A model equal to the expected canonical model, including rules, options and `multiple` | FR-04, AC-02 |
| TC-U08 | Version gate table: no `schemaVersion`, `2`, `3`, `1.5`, `"2"` | Legacy, v2, `outdated`, `invalid`, `invalid` | FR-05, AC-03 |
| TC-U09 | Unknown kinds: v2 optional unknown, v2 required unknown, legacy unknown `type` | Skipped with a warning; rejected with the field name; skipped with a warning | FR-06, AC-04 |
| TC-U10 | Two fields with the same `name` | Rejected as `duplicate-name` naming the field | FR-08 |
| TC-U11 | Non-object, `fields` not an array, `null`, a string | Rejected as `invalid` with an issue path | FR-07, EC-12 |
| TC-U12 | v2 field with an unknown rule key and an unknown property | Ignored; one warning each; the form still parses | EC-13 |
| TC-U13 | Text rules table: `required`, `minLength`, `maxLength`, `pattern` (valid, non-matching, and a pattern that does not compile) | Codes `required`, `too_short`, `too_long`, `pattern_mismatch`; a broken pattern is ignored with a warning and never throws | FR-17, FR-22, NFR-08 |
| TC-U14 | Number rules table: `min`, `max`, `integer`, decimals, negatives, `abc`, empty with and without `required` | `too_small`, `too_big`, `not_an_integer` only with `integer`, `not_a_number`, `required`; decimals and negatives accepted otherwise | FR-15, FR-17, EC-06, AC-07, AC-23 |
| TC-U15 | Select rules: required empty, value not in options, valid value | `required`, `not_an_option`, no error | FR-13, FR-17 |
| TC-U16 | File rules with boundary values: no files with `required`; `accept` mismatch; size equal to and one byte over `maxBytes`; count equal to and one over `maxFiles` | Codes `required`, `file_type`, `file_too_large`, `too_many_files`; params carry the file name and limit; limit exactly met is valid | FR-17, FR-26, FR-28, AC-08, AC-09 |
| TC-U17 | Resolver maps a zod failure to field errors | Each issue becomes `{ code, params }` on the right field name, including a file field with two failing files | FR-21, TR-02 |
| TC-U18 | `buildFormData` with text, a Persian-digit number, an empty text, a select, a file field with 0, 1 and 2 files | Text parts as strings; number as ASCII; empty text as an empty string; files as repeated parts under the field name in order; no part for an empty file field | FR-30 |
| TC-U19 | `parseServerErrors` with known fields, an unknown field name, `formErrors`, an empty body, malformed body | Field errors on known names; unknown names and `formErrors` in `form`; malformed body treated as a generic failure | FR-33, EC-11 |
| TC-U20 | Message catalog | Every code in the API contract has Persian text; parameters are interpolated; a missing key returns the code and logs a development warning | FR-21, FR-38 |
| TC-U21 | Build a normalizer from a different list of kind definitions: one without `select`, and one whose `select` definition is replaced | A kind that is not in the list is skipped as unknown; the given definition is used instead of any built-in; the normalizer names no kind itself. (The component side of adding a kind is shown by the field tests and the README's "add a field kind" steps.) | NFR-04, AC-21 |
| TC-U22 | File list helper: add the same file twice, remove then re-add, add a file with the same name but a different size | Duplicates (name, size, last-modified) ignored; re-adding after removal accepted; same name with different size accepted | FR-27, EC-07, EC-09 |
| TC-U23 | Default values from each kind, with and without `defaultValue` | Strings or an empty list as specified | FR-11 |
| TC-U24 | A field named `a.b`, `a[0]` or `a]` in a legacy payload and in a v2 payload | The payload is rejected as invalid with a path to the name, because react-hook-form would read the name as a nested path | FR-07 |

## 3. Component tests (`fields/*/Component`, `ui/`)

| ID | Condition and action | Expected result | Covers |
| --- | --- | --- | --- |
| TC-C01 | Render a text field with a label, then an error | The control is found by its label; with an error, `aria-invalid="true"` and `aria-describedby` points at the error text | FR-10, FR-20, AC-06, NFR-01 |
| TC-C02 | Type `۱۳۹۸` into a number field | The control has a numeric input mode; the value reaches `onChange` as typed and is read as 1398 by the definition | FR-15, AC-07 |
| TC-C03 | Render a textarea field | Multi-line control with its label and placeholder | FR-09 |
| TC-C04 | Select field: options, the empty option, an error | All options listed; choosing one calls `onChange`; error wiring as in TC-C01 | FR-13 |
| TC-C05 | File field: add two images | Each file is listed with name and readable size; images show a thumbnail element; the control accepts `multiple` only when the field says so | FR-23, FR-24, AC-10 |
| TC-C06 | Remove one of two files; unmount the field | Only that file disappears; its object URL is revoked; all remaining URLs are revoked on unmount | FR-25, FR-29, AC-10 |
| TC-C07 | Re-select the same file; remove then add again | No duplicate; re-add accepted | FR-27, EC-07, EC-09 |
| TC-C08 | Operate the file field with the keyboard only | The visible label-button receives focus with a visible focus state; Enter or Space opens the picker; each remove button is reachable by Tab with an accessible name that includes the file name | NFR-01, AC-19 |
| TC-C09 | `disabled` and `readOnly` on text and select | Control is disabled or read-only; change events are ignored | FR-12 |
| TC-C10 | `description` and `placeholder` | Description is linked with `aria-describedby`; placeholder shown | FR-11 |
| TC-C11 | Axe on each primitive in `ui/` | No violations | NFR-01 |

## 4. Integration tests (`DynamicForm` and the full flow with MSW)

Engine tests inject `onSubmit`. Flow tests use the real `api/` client against the MSW Node server.

| ID | Condition and action | Expected result | Covers |
| --- | --- | --- | --- |
| TC-E01 | Load form `car` (legacy sample) | All eight fields (five kinds) render in order with labels and no trailing colon | FR-01, FR-09, AC-01 |
| TC-E02 | Load form `car-v2` | The v2 fields render with their rules applied (for example `maxLength` produces `too_long`) | FR-04, AC-02 |
| TC-E03 | Observe the page while the request is pending | A loading state appears first, then the form | FR-01, FR-02, TR-03 |
| TC-E04 | Load `flaky-load`, then press Retry; load `missing` | Error state with Retry; Retry shows the form; `missing` keeps the error state | FR-02, AC-05, TR-03 |
| TC-E05 | Load `outdated`, `unknown-required`, `unknown-optional`, `broken`, and a payload with duplicate names | Outdated-client message; error naming the field; the form renders without the unknown field; invalid-payload message; duplicate-name message | FR-05, FR-06, FR-07, FR-08, AC-03, AC-04 |
| TC-E06 | Payload with zero fields; select with no options | Empty-state message and disabled submit; disabled select with a message, and a required one blocks submission with a message | EC-01, EC-02 |
| TC-E07 | Required field: focus then leave empty; type a valid value; type an invalid one | No error before blur; Persian required error after blur; error clears on valid input; invalid input shows its error on the next change | FR-18, AC-06 |
| TC-E08 | Submit an invalid form with errors in two fields | No request is sent; both errors shown; focus is on the first invalid control | FR-19, AC-11 |
| TC-E09 | Fill a valid form with two images and submit | Exactly one request; `Content-Type` starts with `multipart/form-data; boundary=`; the handler sees every field and both files under the same key in order; the success panel appears | FR-30, AC-12 |
| TC-E10 | Hold the response, click submit twice | Submit control is disabled and a busy state is announced; one request only | FR-31, AC-13, EC-10 |
| TC-E11 | After success choose "Edit and resubmit", then "New form" | First: values and files are back as submitted. Second: an empty form | FR-32, AC-14 |
| TC-E12 | Submit `brand` equal to `bad` | `422`: the mock's fallback `message` (the code has no catalog text) is shown under the brand field; all other data intact | FR-33, AC-15 |
| TC-E13 | Submit to `closed`; send an unknown field name through an overridden handler | Both appear in the form-level alert, entered data intact | FR-33, AC-15, EC-11 |
| TC-E14 | Submit to `flaky-submit` | Form-level alert with Retry and data kept; Retry succeeds and shows the success panel | FR-34, AC-16, TR-03 |
| TC-E15 | Override the handler to return 503, then drop the connection | Same banner and behavior in both cases | FR-34 |
| TC-E16 | Render the form at default settings and again with `dir="ltr"` | Default is `lang="fa"` and `dir="rtl"`; under `ltr` every control, label and error is still present and ordered sensibly | FR-38, FR-39, AC-18 |
| TC-E17 | Type in one field while counting renders of another | The other field does not re-render | NFR-09 |
| TC-E18 | Load `car`, type values, then load `car-v2` | No value from the first form appears in the second | EC-16 |

## 5. Pages, Playground and application

| ID | Condition and action | Expected result | Covers |
| --- | --- | --- | --- |
| TC-P01 | Open the Playground, choose each preset | The preview and diagnostics update; the "unknown required" preset shows the rejection reason | FR-35, AC-17 |
| TC-P02 | Paste invalid JSON, then valid JSON | Diagnostics for the invalid text and no crash; valid text renders the form | FR-36, AC-17 |
| TC-P03 | Submit in the Playground preview | A dry-run result shows the request that would be sent; no network call happens | FR-37, ADR-0013 |
| TC-P04 | Make the mock worker fail to start | A visible message with the reason; the app still mounts | NFR-07, EC-17 |
| TC-P05 | Throw during render inside the app | The error boundary shows a fallback with a Reload action | NFR-07 |
| TC-P06 | The one full-App flow: load `car`, fill, add two images, submit, see the success panel | Same outcome as TC-E09 and TC-E11 through the real composition (providers, page switch, API client, MSW) | AC-12, AC-14 |

## 6. Accessibility

| ID | Condition and action | Expected result | Covers |
| --- | --- | --- | --- |
| TC-A01 | Axe on the loaded form (legacy and v2) | No violations | AC-19, NFR-01 |
| TC-A02 | Axe on the error state, the invalid form with errors, and the success panel | No violations | NFR-01 |
| TC-A03 | Complete a whole submission with the keyboard only (no pointer events) | Every control reachable and operable; focus lands on the first invalid control after a failed submit; the success panel takes focus | AC-19, NFR-01 |

## 7. Static, build and tooling

| ID | Condition and action | Expected result | Covers |
| --- | --- | --- | --- |
| TC-S01 | Lint fixtures: an engine file importing a stylesheet; a `core/` file importing `react`; a `playground/` file importing `api/`; a `ui/` file importing `engine/` | Each is reported as a restricted import | NFR-03, TR-05, ADR-0007 |
| TC-S02 | Style-lint fixture with `margin-right`, `padding-left`, `left`, `text-align: left` and a four-value `margin` | The lint fails on every line; logical equivalents pass | AC-20, NFR-02, TR-05 |
| TC-S03 | `tsc -b` with the strict flags; lint for `any` and floating promises | No errors; no suppressions without a written reason | NFR-05, TR-01 |
| TC-S04 | `check` from a clean install with npm, and with pnpm | Passes in both | NFR-10, NFR-12, TR-08 |
| TC-S05 | `build` then `preview`; request the page and the worker script; confirm the mock chunk is separate | Artifacts exist and the form renders through the mock (browser check in TC-M02) | AC-22, NFR-10, TR-04 |
| TC-S06 | Bundle budget script on `dist/` | Application JavaScript is at most 150 kB gzip, excluding the lazily loaded mock chunk | NFR-09 |
| TC-S07 | Run the `prepare` script in a directory without `.git` | Exits successfully | TR-09 |
| TC-S08 | Multipart self-test: a jsdom-environment test sends two files and reads them back in the handler | Names, sizes and the multipart `Content-Type` match | FR-30, ADR-0009, TR-06 |
| TC-S09 | Coverage report for `core/` and `fields/*/definition.ts` | Reported; target at least 90 percent of lines | NFR-06 |
| TC-S10 | The CI workflow file | It runs `check` and `build` on every push | NFR-12, TR-07 |

## 8. Manual

| ID | Check | Covers |
| --- | --- | --- |
| TC-M01 | VoiceOver pass: labels, errors, file control, success panel | NFR-01 |
| TC-M02 | Chrome, Firefox and Safari: production preview loads, submit with two images works | NFR-10, AC-22 |
| TC-M03 | Visual check in `rtl` and `ltr`; long label and option text wrap | EC-15, FR-39 |
| RV-1 | Review: catalog-only strings, no raw HTML, files only read for previews | NFR-08 |
| RV-2 | Review: why-comments, ADRs present, README complete | NFR-11, TR-10 |
