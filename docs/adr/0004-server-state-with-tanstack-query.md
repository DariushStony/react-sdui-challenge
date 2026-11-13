# ADR-0004: TanStack Query for the form fetch and the submit mutation

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | FR-01, FR-02, FR-31, FR-34, TR-03; TDD section 6.4 |

## Context and problem statement

The app makes exactly two calls: a `GET` for the form and a `POST` for the submission. Both need loading, error, retry and cancellation behavior that is easy to get subtly wrong (double effects under React StrictMode, races when the form id changes, a request that never settles).

## Decision drivers

- Never leave the page in a permanent "loading" or blank state.
- Do not hand-write a remote-data state machine unless it is clearly smaller than the dependency.
- Keep the dependency list short and each entry justified.

## Considered options

1. A small hand-written hook around `fetch` and `AbortController`.
2. TanStack Query.
3. SWR.

## Decision outcome

**Option 2.** `useQuery` gives loading, error, retry and cancellation with StrictMode-safe behavior; `useMutation` models the submit lifecycle (idle, pending, success, error). This is a close call: the app does not need caching or deduplication, which are the library's best-known benefits. It is chosen to avoid owning cancellation and race logic, and to keep the submit state machine declarative.

### Consequences

- Good: fewer states to hand-test; retry is a method call; the query function runs `normalize`, so the cache holds a `ParseResult`, never raw JSON.
- Bad: one more dependency and a provider in every component test; developers must know its API; caching defaults need to be set (`staleTime`, `retry`) explicitly.

### Confirmation

Tests with `retry: false` cover the loading, error, retry and success paths. If the hand-written hook would be under about 40 lines with the same tests, revisit this ADR.

## Notes

SWR was not preferred because it has no first-class mutation lifecycle, which the submit flow needs.
