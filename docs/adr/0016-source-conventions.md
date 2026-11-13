# ADR-0016: Source conventions: kebab-case folders, one named export per file

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | NFR-05, NFR-11, NFR-12; ADR-0014 |

## Context and problem statement

The developer wants a uniform, predictable source tree: every name in kebab-case, a thing and its related files together, and exports that can be found at the bottom of a file instead of scattered through it.

## Decision drivers

- A reader can predict where anything is and what a file offers.
- A convention that tooling enforces fails the build, as the other rules do (ADR-0008, ADR-0012).
- A public entry file of a library must be able to list its API.

## Considered options

1. A written convention.
2. Strict: every module is a folder; each file has exactly one `export { X };` statement at the bottom (no inline `export`), types included, each type in its own file; only the package's public entry file may list several re-exports.
3. One value export per file plus an `export type { ... }` line for its types.

## Decision outcome

**Option 2**, chosen by the developer.

- **Names:** every file and folder is kebab-case (the `*.test.*` and `*.module.css` suffixes stay).
- **Folder per module:** a module is a folder named for it. The one export is in `index.ts` or `index.tsx`; its stylesheet is `styles.module.css`, its test `index.test.ts(x)`, and private helpers sit beside it, each in its own file with one export. A type used outside its file lives in its own file (`button-props.ts`).
- **Exports:** a file has exactly one named export, written as `export { X };` (or `export type { X };`) after the code. No `export function`, `export const` or `export default` anywhere. The only exemption is each package's public entry file (`src/index.ts`), which re-exports the API.
- A tooling test scans the tree and fails on a name that is not kebab-case, a second export, an inline export or a default export.

### Consequences

- Good: one place to look; imports are folder paths; a split module cannot grow a second responsibility unnoticed; the public API is one file.
- Bad: many small files and folders; a type shared by many files needs its own file; a one-time mechanical migration of the whole tree.

### Confirmation

The conventions test (TC-S12) runs in `check` and fails with the offending file and line.

## Notes

The migration is done folder by folder, each in its own commit, with the full check green in between; the conventions test lists the folders already migrated until the last one is done.
