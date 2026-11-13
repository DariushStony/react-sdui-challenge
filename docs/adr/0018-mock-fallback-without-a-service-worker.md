# ADR-0018: The mock answers inside the page when a service worker cannot start

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | NFR-07, NFR-10, EC-17, EC-23, AC-22; ADR-0005 |

## Context and problem statement

ADR-0005 mocks the backend with MSW: a service worker answers the app's requests in the browser. That works in every normal browser (checked in Chrome, Firefox and WebKit), but some places do not register a service worker at all: a Firefox private window, an embedded browser or web view (the browser pane inside an editor or chat app is one), a locked-down corporate profile. There the page used to show "the mock could not start" and then a failed load, so a reviewer who opens the project in such a place sees a dead demo even though nothing is wrong with the code.

## Decision drivers

- A person who runs the project must see a working form wherever the page can run at all.
- The application code must keep using plain `fetch` (TR-04), and the handlers must stay the single source of the mock's behaviour.
- No second server process, and nothing extra in the main chunk (NFR-09).

## Considered options

1. Keep the worker only and show the message (ADR-0005 as it was).
2. Try the worker; if the browser refuses it, answer `fetch` in the page with the same handlers, using MSW's experimental network API and its fetch interceptor.
3. Use the fetch interceptor everywhere and drop the worker.
4. A fake inside the API client.

## Decision outcome

**Option 2.** `startMocks` tries a list of ways in order: the service worker, then `fetch` interception. The first that starts wins; the status says which (`on` via `service-worker` or `fetch`). Only when every way fails does the app show the message with all the reasons (EC-17). `VITE_ENABLE_MOCKS=false` still turns everything off.

The worker stays first because it is the real thing: requests leave the page, appear in the browser's network panel and can be seen by tools that watch the network. Option 3 would lose that. Option 4 was rejected in ADR-0005 for the same reason as before: it skips the real network path.

### Consequences

- Good: the demo works in a Firefox private window and in embedded browsers; one list of handlers serves the worker, the fallback and the tests; the fallback is its own tiny lazy chunk that shares the handlers with the worker, and the main chunk is unchanged (132 kB gzip, budget 150).
- Bad: `msw/experimental` is an experimental API of MSW 3, and the interceptor package is a direct dependency of the demo. Both are pinned to exact versions and a test (TC-P10) fails if the API changes. In fallback mode requests are not in the network panel (MSW still logs them to the console), and only `fetch` is intercepted, which is all the API client uses.

### Confirmation

TC-P09 (the order of the ways, the reasons when all fail, off), TC-P10 (the fallback answers a form request and a multipart submission with the shared handlers and puts `fetch` back when switched off), and TC-M04: Chrome, Firefox and WebKit with service workers hidden, in development and in the production build, plus the browser pane of the Claude app where registration fails; the form loads, a server-side error shows for the brand `bad`, a submission succeeds and a flaky load recovers on retry.
