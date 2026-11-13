import type { FormModel } from '../../../core/model/form-model';
import type { FormValues } from '../../../core/model/form-values';
import { type FieldKind } from '../../../fields/define-field-kind/field-kind';
import type { SubmitOutcome } from '../../outcome';

type DynamicFormProps = {
  model: FormModel;
  /** Sends the values and says how it went. The engine has no network code of its own. */
  onSubmit: (values: FormValues) => Promise<SubmitOutcome>;
  /** The kinds to render with; the default is the app's registry. Tests pass their own. */
  kinds?: readonly FieldKind[];
};

export type { DynamicFormProps };
