# ADR-0019: Vazirmatn, self-hosted, and controls that inherit the page font

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | FR-38, NFR-10; ADR-0007, ADR-0014 |

## Context and problem statement

The page is Persian. The design tokens already named Vazirmatn first in the font stack (`--df-font-family`), but nothing loaded the font, so a computer without it installed fell back to Tahoma or the system font. Worse, form controls (text inputs, text areas, selects, buttons) do not inherit the page font in browsers: they use the system's control font unless a stylesheet says `font: inherit`. So even a computer that had the font showed every field in another typeface.

## Decision drivers

- The whole page, including every control, must be set in the same Persian font, on any computer.
- It must work offline and without a request to a third party (the demo runs from a local build).
- The library must stay reusable: it should not force a font file on a host.
- Latest versions of everything.

## Considered options

1. Load the font from a CDN (Google Fonts or a font host).
2. Bundle the font from an npm package in the app, and make the library's controls inherit the font.
3. Bundle the font inside the library.

## Decision outcome

**Option 2.** The demo imports `vazirmatn/Vazirmatn-Variable-font-face.css` from the pinned `vazirmatn` package (33.0.3): one variable WOFF2 file (about 111 kB, every weight from 100 to 900), loaded with `font-display: swap`. Vite hashes and bundles it, so it is served by the app itself. The library keeps naming Vazirmatn first in its token, and its text input, text area, select and button now say `font: inherit`, so a host that loads any font gets it in the controls too.

The font is Vazirmatn, the maintained successor of Vazir (same designer, same letterforms, plus a variable font and better Latin glyphs). Code is the one exception: the Playground's JSON box and the request preview use a monospace font, with Vazirmatn after it only for Persian text inside strings, because the coloured copy of the JSON (ADR-0020) must line up with the text area character by character.

### Consequences

- Good: every page, field, button and message is set in Vazirmatn offline; a host chooses its own font by loading it, and the controls follow.
- Bad: 111 kB more to download on the first visit (cached after that; it is not JavaScript, so the 150 kB budget for application code is unaffected).

### Confirmation

TC-S17 (the token names the font, the app imports it from a pinned package, the controls and the button inherit the font; `check:dist` fails a build that has no Vazirmatn file) and TC-M05: Chrome, Firefox and WebKit read the computed font of the body, an input, a select and a button as Vazirmatn, the font face is loaded with status 200, and axe reports no violations.
