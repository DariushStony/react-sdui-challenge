# Test strategy: Dynamic Form Renderer

| | |
| --- | --- |
| Status | Approved |
| Version | 0.1 |
| Date | 2026-11-13 |
| Owner | Dariush Hadipour |
| Inputs | [prd.md](prd.md) v0.7, [tdd.md](tdd.md) v0.1, [api-contract.md](api-contract.md) v0.2, ADR-0003, 0005, 0009, 0010 |
| Structure based on | ISO/IEC/IEEE 29119-3 (project test strategy: scope, risks, levels, techniques, environment, criteria); ISTQB terminology |
| Companion documents | [test-cases.md](test-cases.md), [traceability-matrix.md](traceability-matrix.md) |

---

## 0. Version history

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-11-13 | First draft. |

## 1. Purpose and scope

Say what we test, at which level, with which tools, and what "good enough" means, so that effort goes to the behavior that would hurt most if it broke. Test items are the whole application: the pure core, field kinds, the engine, the API client against the mock, the Playground, the style and module rules, and the build.

Out of scope: load and stress testing, automated cross-browser runs, visual regression, and testing against a real backend (none exists yet).

## 2. Approach: risk first

Tests are chosen from the risks below, highest first. Each product risk names the level where it is cheapest to catch.

| ID | Product risk | Impact | Likelihood | Primary level | Test cases |
| --- | --- | --- | --- | --- | --- |
| PR-1 | Files are lost or corrupted on submit (wrong encoding, manual `Content-Type`, missing parts) | High | Medium | Integration with MSW multipart parsing | TC-E09, TC-S08 |
| PR-2 | A legacy or v2 payload is parsed wrongly, so a wrong form renders silently | High | Medium | Unit, table-driven | TC-U04 to TC-U12 |
| PR-3 | A rule is applied wrongly (size units, accept matching, number parsing, Persian digits) | High | Medium | Unit with boundary values | TC-U01 to TC-U03, TC-U13 to TC-U16 |
| PR-4 | Server `422` errors do not reach the right field, or data is lost after an error | High | Medium | Integration | TC-E12, TC-E13, TC-E14 |
| PR-5 | Keyboard or screen-reader users cannot complete the form (file control, focus after error) | High | Medium | Component, a11y, keyboard test | TC-C08, TC-A01 to TC-A03 |
| PR-6 | Unknown kinds, versions or broken payloads crash or blank the page | Medium | Medium | Unit and integration | TC-U09 to TC-U11, TC-E05, TC-P05 |
| PR-7 | Direction-sensitive CSS sneaks in | Medium | Medium | Style lint, `ltr` render test | TC-S02, TC-E16 |
| PR-8 | A new field kind needs engine changes (extensibility promise broken) | Medium | Low | Unit (fake kind) | TC-U21 |
| PR-9 | The mock does not start in production preview | Medium | Low | Build smoke | TC-S05, TC-P04 |
| PR-10 | Module boundaries erode over time | Medium | Medium | Lint fixtures | TC-S01 |

## 3. Test levels and types

| Level or type | What it covers | Tools | Rules |
| --- | --- | --- | --- |
| Static | Types, lint (type-aware), module boundaries, style rules, formatting | `tsc`, oxlint, stylelint, Prettier | Runs in `check`, the hook and CI |
| Unit | `core/` helpers, normalizer, kind definitions, resolver, form-data builder, server-error parser, message catalog | Vitest, no DOM | Pure functions; table-driven for parsers and rules; test-first |
| Component | Field components and `ui/` primitives rendered alone | Testing Library, user-event, jsdom | Query by role and label; no snapshots |
| Integration | `DynamicForm` with an injected `onSubmit`; the full flow through `api/` and the MSW Node server, including real multipart parsing | Vitest, MSW 3, jsdom with the undici shim | `onUnhandledFrame: 'error'`; override handlers per test to force statuses |
| Accessibility | Axe on the loaded, error and success states; one keyboard-only run of the whole form | vi-axe, user-event | Zero violations; no pointer events in the keyboard test |
| Build smoke | `build` then `preview` serve the form through the mock | script plus a manual check in a real browser | Automated part checks the artifacts; the browser check is manual |
| Manual | Screen-reader spot check, Chrome/Firefox/Safari smoke, visual check in `rtl` and `ltr`, long-text wrapping | Browser, VoiceOver | Recorded in the test log |

The proportions are intentional: many fast unit tests, a medium number of component tests, a few high-value integration tests. There is no browser end-to-end suite; the full-App integration test with the MSW Node server covers the same path at much lower cost and flakiness (see the decision in section 8).

## 4. Test design techniques

- **Equivalence classes and boundary values:** `min`/`max`, `maxLength`, `maxBytes` (limit, limit plus one byte), `maxFiles`, empty and one-element lists.
- **Decision tables:** legacy-to-canonical mapping; unknown-kind policy (optional or required, legacy or v2); status code to client behavior.
- **State transition testing:** the page state machine in TDD section 8 (loading, error, ready, submitting, success, back to editing).
- **Error guessing:** the edge-case list (PRD section 10).
- **Experience-based checks:** the manual list in section 7.

## 5. Test environment and data

- Node 26.13.1 or newer (`.nvmrc`; a test reads the installed packages so the claim cannot drift from what the tooling supports); jsdom as the default test environment with the multipart shim (ADR-0009), which has its own self-test (TC-S08).
- MSW Node server with the same handlers the browser uses; fixtures from `mocks/fixtures/` (see the API contract, section 5).
- No real network, no real time: no test sleeps; fake timers only where a test is about time, and never for the success flow.
- Files in tests are small in-memory `File` objects built by a helper.
- Deterministic ids: the engine takes ids from a stable counter in tests.

## 6. Entry and exit criteria

| Stage | Criteria |
| --- | --- |
| Entry for a change | Requirement IDs it covers are named in the commit or the test; relevant test cases exist in [test-cases.md](test-cases.md) |
| Exit for a phase | New and existing tests pass; `check` passes; no new lint suppressions without a written reason; the traceability matrix row is updated |
| Exit for the release | Every Must requirement has at least one passing test case; zero axe violations; the manual list in section 7 is done and recorded; `check` passes under pnpm and npm; the production preview works |

## 7. Manual checklist (recorded in the final test log)

| ID | Check |
| --- | --- |
| TC-M01 | VoiceOver pass over the form: labels, errors, file control, success panel |
| TC-M02 | Chrome, Firefox and Safari load the production preview, submit with two images, see the success panel |
| TC-M03 | Visual check in `rtl` and `ltr`: spacing, alignment, long labels and options wrap (EC-15) |
| RV-1 | Code review: user-visible strings come from the catalog; no `dangerouslySetInnerHTML`; files are read only for previews (NFR-08) |
| RV-2 | Code review: comments explain why; each significant decision has an ADR; README states install, run, test, extend (NFR-11) |

## 8. Decisions about test scope

- **No Playwright end-to-end suite.** The service worker path is covered by the build smoke and the manual browser check; every other behavior is reachable in jsdom with real multipart parsing. Revisit only if time remains after the release criteria are met.
- **No snapshot tests.** They freeze markup, not behavior, and would fight the design system's evolution.
- **No global coverage threshold.** Coverage is reported; the target is 90 percent of lines in `core/` and `fields/*/definition.ts`, where logic lives. Coverage never replaces a requirement-based test.
- **Test-first for pure logic** (parsers, size and digit helpers, accept matching, rule schemas, the resolver); tests accompany the feature in the same commit elsewhere.

## 9. Defects and reporting

A failing test or a manual finding is fixed in the phase that found it when small, or recorded as a defect in the test log with the requirement ID, steps and expected result. CI is the source of truth for the automated results; the manual checklist results and any open defects are summarized in the release test log.

## 10. Roles

One developer owns writing, running and reviewing tests. Review is done by reading the traceability matrix against the Must list and by running the exit criteria in section 6.
