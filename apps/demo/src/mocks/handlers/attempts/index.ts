// The mock implements both endpoints with real server-side rules (API contract section 5), so every
// path of the client can be reached without a backend. "Real" means it parses the multipart body and
// validates with the same rules as the browser, not that it stores anything.

const attempts = { load: new Map<string, number>(), submit: new Map<string, number>() };

export { attempts };
