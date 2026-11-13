import type { TextareaField } from '../../../core/model/textarea-field';
import type { TextField } from '../../../core/model/text-field';

// `text` and `textarea` differ only in the control; reading, rules and encoding are identical, so
// they share this module instead of repeating it.
type StringField = TextField | TextareaField;

export type { StringField };
