import type { TextField } from '../text-field';
import type { TextareaField } from '../textarea-field';
import type { NumberField } from '../number-field';
import type { SelectField } from '../select-field';
import type { FileField } from '../file-field';

type FieldModel = TextField | TextareaField | NumberField | SelectField | FileField;

export type { FieldModel };
