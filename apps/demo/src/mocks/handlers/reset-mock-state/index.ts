import { attempts } from '../attempts';

/** Forgets the per-form counters ("fails once, then works"). Tests call this between cases. */
function resetMockState(): void {
  attempts.load.clear();
  attempts.submit.clear();
}

export { resetMockState };
