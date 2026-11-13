/** The caller's signal (if any) combined with a time limit: whichever ends first aborts the request. */
function withTimeout(signal: AbortSignal | undefined, timeoutMs: number): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal === undefined ? timeout : AbortSignal.any([signal, timeout]);
}

export { withTimeout };
