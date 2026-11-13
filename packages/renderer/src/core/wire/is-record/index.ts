import type { Raw } from '../raw';

function isRecord(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export { isRecord };
