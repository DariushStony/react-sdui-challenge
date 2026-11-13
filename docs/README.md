# Documentation

Documents for the Dynamic Form Renderer. Code is written only after the documents it depends on are approved.

## Document map

| # | Document | Path | Purpose | Reference standard | Status | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Product Requirements (PRD) | [prd.md](prd.md) | What we build and why; functional, non-functional and technical requirements; acceptance criteria | ISO/IEC/IEEE 29148, ISO/IEC 25010 | Approved (v0.2) | The challenge brief |
| 2 | Technical Design (TDD) | [tdd.md](tdd.md) | How we build it: structure, data flow, modules | IEEE 1016 viewpoints, C4 model | Approved (v0.1) | 1 |
| 3 | Architecture Decision Records | [adr/](adr/README.md) | One file per significant decision, plus an index that doubles as the decision log | MADR | Accepted (13 ADRs) | 2 |
| 4 | API contract | api-contract.md | Legacy and v2 payloads, submission, error format, with examples | OpenAPI 3.1 conventions | Not started | 1, 2 |
| 5 | Test strategy | test-strategy.md | Levels, tools, risks, what is and is not tested | ISO/IEC/IEEE 29119-3 | Not started | 1, 2 |
| 6 | Test cases | test-cases.md | Test conditions and cases | ISO/IEC/IEEE 29119-3 | Not started | 1, 5 |
| 7 | Traceability matrix | traceability-matrix.md | Requirement, test and status | Bidirectional RTM | Not started | 1, 6 |
| 8 | Implementation plan | implementation-plan.md | Ordered phases, files, tests and commits per phase | Vertical slices | Not started | 1 to 7 |

`ai.md` at the repository root is written only by the developer and is not part of this set.

## Writing order

```
PRD  ->  TDD + ADRs  ->  API contract  ->  Test strategy  ->  Test cases + Traceability  ->  Implementation plan  ->  code
```

## Rules for these documents

- **Header:** each document starts with a table: status, version, date, owner, inputs, reference standard.
- **Statuses:** draft, in review, approved, superseded.
- **IDs are stable and never reused:** `FR-`, `NFR-`, `TR-`, `EC-`, `AC-`, `A-` in the PRD; `ADR-NNNN` for decisions; `TC-` for test cases.
- **Decisions:** every significant decision is an ADR. No decision lives only in a conversation.
- **Language:** English. The user interface is Persian.
