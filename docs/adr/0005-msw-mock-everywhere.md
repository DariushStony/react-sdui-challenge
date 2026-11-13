# ADR-0005: MSW in development, tests and production preview

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | NFR-07, NFR-10, AC-22, EC-17, TR-04; TDD sections 2 and 11 |

## Context and problem statement

The backend is still under development, so the app needs a realistic mock. Anyone who runs `build` and `preview` should still see a working form, and tests should exercise the same network path as the app.

## Decision drivers

- Network-level mocking so application code uses real `fetch` everywhere.
- The same handlers in the browser and in tests.
- A reader running a production preview must not see a dead page.

## Considered options

1. MSW (service worker in the browser, request interception in Node).
2. json-server or a similar local server.
3. A fake implementation inside the API client.

## Decision outcome

**Option 1, enabled in development, tests and production preview.** Handlers are shared; a service-worker file is served from `public/` (created with `msw init`); `VITE_ENABLE_MOCKS=false` turns it off. The worker is loaded with a dynamic import so it is outside the main chunk. Tests start the Node server with `onUnhandledFrame: 'error'` (MSW 3 renamed the old `onUnhandledRequest` option; the old key is a type error and would be ignored).

If the worker cannot register, the app shows a visible message with the reason instead of a blank page.

### Consequences

- Good: real multipart bodies are parsed by the handler; `422` and network failures are reachable in tests and in the Playground; no extra server process.
- Bad: a worker file lives in the repository; the lazily loaded mocking chunk measured about 153 kB gzip in an experiment on 2026-11-13; service workers need `localhost` or HTTPS and may be blocked in some private-browsing modes.

### Confirmation

An experiment on 2026-11-13 showed `build` plus `preview` rendering the form through the worker in a real Chrome, with a multipart POST reaching the handler intact. AC-22 and a test for the failure message keep it true.

## Notes

json-server needs a second process and does not parse multipart without extra code. A fake inside the client would skip the real network path and make the "realistic mock" requirement meaningless.
