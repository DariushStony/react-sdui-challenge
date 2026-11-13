import type { FieldError } from '../core/issues';
import type { Messages } from './messages';
import type { Translator } from './translator';

type Params = Readonly<Record<string, string | number>>;

const PLACEHOLDER = /\{(\w+)(?:\|(\w+))?\}/g;

/**
 * Builds the translator for a set of messages. Everything that depends on the language (the
 * templates, how numbers are written, the names of the byte units) comes from `messages`, so the
 * rest of the library never knows which language it is speaking.
 */
function createTranslator(messages: Messages): Translator {
  const { locale, catalog } = messages;

  // No thousands separator: a limit such as 1900 reads better as 1900 than as 1,900.
  // Enough digits that a limit reads as it was written; 0.005 must not show as 0.01.
  const plain = new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: 20 });
  const oneDecimal = new Intl.NumberFormat(locale, {
    useGrouping: false,
    maximumFractionDigits: 1,
  });

  // Binary units, matching how sizes are read from the payload (core/sizes.ts). The names come from
  // the catalog like every other piece of text.
  const units: readonly (readonly [factor: number, name: string])[] = [
    [1024 ** 3, catalog['unit_gigabyte'] ?? 'GB'],
    [1024 ** 2, catalog['unit_megabyte'] ?? 'MB'],
    [1024, catalog['unit_kilobyte'] ?? 'KB'],
    [1, catalog['unit_byte'] ?? 'B'],
  ];

  const formatNumber = (value: number): string => plain.format(value);

  const formatBytes = (bytes: number): string => {
    const [factor, name] =
      units.find(([unitFactor]) => bytes >= unitFactor) ?? units[units.length - 1]!;
    return `${oneDecimal.format(bytes / factor)} ${name}`;
  };

  // A gap in the catalog or in the params is a bug in data, not in the user's input. It stays visible
  // (the key or the {placeholder} shows) and is logged once, so it is found without flooding the console.
  const warned = new Set<string>();
  const warnOnce = (id: string, message: string): void => {
    if (warned.has(id)) return;
    warned.add(id);
    console.warn(`[i18n] ${message}`);
  };

  const hasMessage = (key: string): boolean => Object.hasOwn(catalog, key);

  const formatParam = (value: string | number, format: string | undefined): string => {
    if (typeof value === 'string') return value;
    return format === 'size' ? formatBytes(value) : formatNumber(value);
  };

  const t = (key: string, params: Params = {}): string => {
    const template = hasMessage(key) ? catalog[key] : undefined;
    if (template === undefined) {
      warnOnce(`key:${key}`, `no text for "${key}"`);
      return key;
    }
    return template.replace(
      PLACEHOLDER,
      (placeholder, name: string, format: string | undefined) => {
        const value = params[name];
        if (value === undefined) {
          warnOnce(`param:${key}:${name}`, `"${key}" needs the parameter "${name}"`);
          return placeholder;
        }
        return formatParam(value, format);
      },
    );
  };

  const lacksParams = (template: string, params: Params): boolean =>
    [...template.matchAll(PLACEHOLDER)].some((match) => params[match[1] ?? ''] === undefined);

  const describeError = (error: FieldError): string => {
    const template = hasMessage(error.code) ? catalog[error.code] : undefined;
    // `params` is optional on the wire. A known code that needs values it was not given would show raw
    // {placeholders}, so it falls through to the server's text or the generic one instead.
    if (template !== undefined && !lacksParams(template, error.params ?? {})) {
      return t(error.code, error.params);
    }
    return error.message ?? t('unknown_error');
  };

  return { locale, t, describeError, hasMessage, formatNumber, formatBytes };
}

export { createTranslator };
