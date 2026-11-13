import type { FormModel } from '../../../core/model/form-model';
import type { FormValues } from '../../../core/model/form-values';
import { type FieldKind } from '../../../fields/define-field-kind/field-kind';
import type { SubmitOutcome } from '../../outcome';

type DynamicFormProps = {
  /**
   * The form to render, from `normalize`. The form keeps what was typed while the model's content stays
   * the same, so it is safe to build an identical model on every render; a model with different
   * content starts a new form.
   */
  model: FormModel;
  /** Sends the values and says how it went. The engine has no network code of its own. */
  onSubmit: (values: FormValues) => Promise<SubmitOutcome>;
  /** The field kinds to render with; the renderer's own five when omitted. Only tests pass their own. */
  kinds?: readonly FieldKind[] | undefined;
};

export type { DynamicFormProps };
