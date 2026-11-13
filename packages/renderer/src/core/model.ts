// The canonical model: the only representation of a form that the rest of the app reads. Every
// payload shape is converted into this at one boundary (ADR-0001, TDD section 5).

export type FieldSize = 'small' | 'medium' | 'large';

type FieldBase = {
  /** Unique within a form; also the name of the submitted part. */
  readonly name: string;
  /** Display text with any trailing colon already removed. */
  readonly label: string;
  readonly description?: string;
  readonly placeholder?: string;
  /** False for legacy payloads unless they say otherwise; the legacy shape cannot express it. */
  readonly required: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  /** A design-token name, never CSS (FR-14). */
  readonly size?: FieldSize;
};

type StringRules = {
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
};

export type TextField = FieldBase & {
  readonly kind: 'text';
  readonly defaultValue?: string;
  readonly rules: StringRules;
};

export type TextareaField = FieldBase & {
  readonly kind: 'textarea';
  readonly defaultValue?: string;
  readonly rules: StringRules;
};

export type NumberField = FieldBase & {
  readonly kind: 'number';
  readonly defaultValue?: string;
  readonly rules: {
    readonly min?: number;
    readonly max?: number;
    readonly integer?: boolean;
  };
};

export type SelectField = FieldBase & {
  readonly kind: 'select';
  readonly defaultValue?: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
};

export type FileField = FieldBase & {
  readonly kind: 'file';
  readonly multiple: boolean;
  readonly rules: {
    readonly accept?: readonly string[];
    readonly maxBytes?: number;
    readonly maxFiles?: number;
  };
};

export type FieldModel = TextField | TextareaField | NumberField | SelectField | FileField;

export type FormModel = {
  readonly formId: string;
  /** 1 means the legacy payload shape. */
  readonly schemaVersion: 1 | 2;
  readonly title?: string;
  readonly fields: readonly FieldModel[];
};

/** What a field holds while the user edits: text for most kinds, a list of files for `file`. */
export type FieldValue = string | File[];
export type FormValues = Record<string, FieldValue>;
