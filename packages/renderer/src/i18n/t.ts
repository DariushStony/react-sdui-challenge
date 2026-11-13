import type { FieldError } from '../core/issues';
import { faCatalog } from './catalog.fa';
import { formatBytes, formatNumber } from './format';

type Params = Readonly<Record<string, string | number>>;

const PLACEHOLDER = /\{(\w+)(?:\|(\w+))?\}/g;

const warned = new Set<string>();
// A gap in the catalog or in the params is a bug in data, not in the user's input. It stays visible
// (the key or the {placeholder} shows) and is logged once, so it is found without flooding the console.
function warnOnce(id: string, message: string): void {
  if (warned.has(id)) return;
  warned.add(id);
  console.warn(`[i18n] ${message}`);
}

function lacksParams(template: string, params: Params): boolean {
  return [...template.matchAll(PLACEHOLDER)].some((match) => params[match[1] ?? ''] === undefined);
}

export function hasMessage(key: string): boolean {
  return Object.hasOwn(faCatalog, key);
}

function formatParam(value: string | number, format: string | undefined): string {
  if (typeof value === 'string') return value;
  return format === 'size' ? formatBytes(value) : formatNumber(value);
}

/** Persian text for a key, with parameters filled in. A missing key returns the key itself. */
export function t(key: string, params: Params = {}): string {
  const template = hasMessage(key) ? faCatalog[key] : undefined;
  if (template === undefined) {
    warnOnce(`key:${key}`, `no text for "${key}"`);
    return key;
  }
  return template.replace(PLACEHOLDER, (placeholder, name: string, format: string | undefined) => {
    const value = params[name];
    if (value === undefined) {
      warnOnce(`param:${key}:${name}`, `"${key}" needs the parameter "${name}"`);
      return placeholder;
    }
    return formatParam(value, format);
  });
}

/**
 * The text for an error: the catalog's text for its code; otherwise the server's own message (the
 * contract lets the server send codes the client has never heard of); otherwise a generic message.
 */
export function describeError(error: FieldError): string {
  const template = hasMessage(error.code) ? faCatalog[error.code] : undefined;
  // `params` is optional on the wire. A known code that needs values it was not given would show raw
  // {placeholders}, so it falls through to the server's text or the generic one instead.
  if (template !== undefined && !lacksParams(template, error.params ?? {})) {
    return t(error.code, error.params);
  }
  return error.message ?? t('unknown_error');
}
