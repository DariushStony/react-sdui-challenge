import type { FieldError } from '../core/issues';

type Params = Readonly<Record<string, string | number>>;

/** What the components use to say something: built from `Messages` by `createTranslator`. */
type Translator = {
  readonly locale: string;
  /** Text for a key, with parameters filled in. A missing key returns the key itself. */
  t: (key: string, params?: Params) => string;
  /** The text for an error: the catalog's text for its code, else the server's message, else generic. */
  describeError: (error: FieldError) => string;
  hasMessage: (key: string) => boolean;
  formatNumber: (value: number) => string;
  formatBytes: (bytes: number) => string;
};

export type { Translator };
