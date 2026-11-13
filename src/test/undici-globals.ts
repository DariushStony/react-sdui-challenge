import { Blob, File } from 'node:buffer';
import { fetch, FormData, Headers, Request, Response } from 'undici';

// Why: jsdom replaces FormData and File with its own classes, but fetch is Node's. A jsdom FormData
// holding a File makes fetch fail with a content-length mismatch, and Node's FormData given a jsdom
// File silently sends the text "[object File]". Using one consistent family restores real multipart
// bodies in tests (ADR-0009). Blob is replaced too, so a File is still a kind of Blob: form
// libraries copy a value unless it is a Blob, and a File that is not one would be copied into a
// plain object without its name and size. Changing Node or undici versions can break this; the
// self-test next to it (multipart-shim.test.ts) fails loudly if that happens.
Object.assign(globalThis, { fetch, FormData, Headers, Request, Response, File, Blob });
