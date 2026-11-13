# ADR-0006: One multipart request for values and files

| | |
| --- | --- |
| Status | Accepted |
| Date | 2026-11-13 |
| Deciders | Dariush Hadipour |
| Related | FR-28, FR-30, A-2, A-3, NG-5; TDD sections 6.4 and 9 |

## Context and problem statement

The submission carries text values and files. There are two common designs: one `multipart/form-data` request, or separate uploads of each file to storage through presigned URLs followed by a small JSON request that references them.

## Decision drivers

- The brief asks for a single call that sends everything.
- Simplicity of the mock and of the tests.
- Honest treatment of the cases where the simple design stops being enough.

## Considered options

| | One multipart request | Presigned URLs, then JSON |
| --- | --- | --- |
| Payload size | Limited by the server's request-body limit | Files go straight to storage; the API sees small JSON |
| Retry | The whole request is retried | Failed files can be retried one by one |
| Progress | Needs XHR or streams (not available in `fetch` upload) | Per-file progress is natural |
| Backend work | One endpoint | Endpoint to issue URLs, storage setup, a finalize step |
| Atomicity | Values and files succeed or fail together | Partial states (files uploaded, submission not) must be cleaned up |
| Security | Server sees and can scan the bytes | Storage rules and URL expiry must be configured and checked |

## Decision outcome

**One multipart request.** Each field is appended by its kind; files go under the field name, repeated for multiple files; the client never sets `Content-Type`, so the browser adds the boundary. A size written in MB means 1024 x 1024 bytes in the legacy shape; the v2 shape states bytes.

### Consequences

- Good: one endpoint, one mock handler, one test path; values and files are atomic.
- Bad: no upload progress without extra work; large files stress the API server; a failed submit resends every file.

### Confirmation

A component integration test asserts one request with all values and every file under the same key, and a `Content-Type` that starts with `multipart/form-data; boundary=`.

## Notes

Presigned uploads are the right move when files are large (tens of MB) or when per-file retry and progress matter. The API boundary in `api/` is where that change would go; the form engine would not change. Revisit if the real backend requires it.
