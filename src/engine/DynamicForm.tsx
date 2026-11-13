import { useId, useMemo, useRef, useState, type BaseSyntheticEvent, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import type { FieldError, ServerErrors } from '../core/issues';
import type { FormModel, FormValues } from '../core/model';
import { FIELD_KINDS, type FieldKind } from '../fields';
import { describeError, t } from '../i18n/t';
import { Alert, Button, Form, FormActions, VisuallyHidden } from '../ui';
import { buildValuesSchema } from './build-values-schema';
import { FieldRenderer } from './FieldRenderer';
import type { SubmitOutcome } from './outcome';
import { createResolver, type CodedError } from './resolver';
import { SuccessPanel } from './SuccessPanel';

export type { SubmitOutcome } from './outcome';

export type DynamicFormProps = {
  model: FormModel;
  /** Sends the values and says how it went. The engine has no network code of its own. */
  onSubmit: (values: FormValues) => Promise<SubmitOutcome>;
  /** The kinds to render with; the default is the app's registry. Tests pass their own. */
  kinds?: readonly FieldKind[];
};

// A different model object is a different form, so it starts with its own state. Keying on the
// object (not on its contents) means nothing typed into one form can leak into the next.
const keys = new WeakMap<FormModel, number>();
let nextKey = 0;
function keyOf(model: FormModel): number {
  let key = keys.get(model);
  if (key === undefined) {
    key = nextKey++;
    keys.set(model, key);
  }
  return key;
}

/** Renders the form a model describes and runs it: validation, focus, submit and its outcomes. */
export function DynamicForm({ model, onSubmit, kinds = FIELD_KINDS }: DynamicFormProps) {
  return <DynamicFormBody key={keyOf(model)} model={model} onSubmit={onSubmit} kinds={kinds} />;
}

type Phase =
  { readonly type: 'editing' } | { readonly type: 'succeeded'; readonly summary?: ReactNode };
type Banner =
  | { readonly type: 'network' }
  | { readonly type: 'server'; readonly errors: readonly FieldError[] };

function kindFrom(byKind: ReadonlyMap<string, FieldKind>, kindName: string): FieldKind {
  const kind = byKind.get(kindName);
  if (kind === undefined) throw new Error(`No field kind "${kindName}" is registered`);
  return kind;
}

function initialValues(model: FormModel, byKind: ReadonlyMap<string, FieldKind>): FormValues {
  return Object.fromEntries(
    model.fields.map((field) => [
      field.name,
      kindFrom(byKind, field.kind).definition.defaultValue(field),
    ]),
  );
}

function coded(errors: readonly FieldError[]): CodedError {
  const first = errors[0]?.code ?? 'invalid';
  return { type: first, message: first, detail: errors };
}

function DynamicFormBody({ model, onSubmit, kinds }: Required<DynamicFormProps>) {
  const uid = useId();
  const byKind = useMemo(
    () => new Map<string, FieldKind>(kinds.map((kind) => [kind.definition.kind, kind])),
    [kinds],
  );
  const kindOf = (kindName: string): FieldKind => kindFrom(byKind, kindName);

  const resolver = useMemo(
    () =>
      createResolver(
        buildValuesSchema(
          model,
          kinds.map((kind) => kind.definition),
        ),
      ),
    [model, kinds],
  );
  const defaultValues = useMemo(() => initialValues(model, byKind), [model, byKind]);

  // Errors show after a field was left, then follow every change (ADR-0010). Nothing here reads
  // form state at this level, so typing re-renders only the field being typed in.
  const form = useForm<FormValues>({
    resolver,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const [phase, setPhase] = useState<Phase>({ type: 'editing' });
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const [banner, setBanner] = useState<Banner | null>(null);

  const showServerErrors = (errors: ServerErrors) => {
    const known = new Set(model.fields.map((field) => field.name));
    const unplaced: FieldError[] = [...errors.form];
    let firstWithError: string | undefined;
    for (const [name, list] of Object.entries(errors.fields)) {
      if (known.has(name)) form.setError(name, coded(list));
      else unplaced.push(...list);
    }
    firstWithError = model.fields.find((field) => errors.fields[field.name] !== undefined)?.name;
    setBanner(unplaced.length > 0 ? { type: 'server', errors: unplaced } : null);
    if (firstWithError !== undefined) form.setFocus(firstWithError);
  };

  const send = async (values: FormValues) => {
    // A second submit while one is in flight (double click, Enter) is ignored, not queued.
    if (inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setBanner(null);

    let outcome: SubmitOutcome;
    try {
      outcome = await onSubmit(values);
    } catch {
      // An owner that throws did not reach the server as far as we can tell: same as a network failure.
      outcome = { ok: false, kind: 'network' };
    }
    inFlight.current = false;
    setSubmitting(false);

    if (outcome.ok) {
      setPhase(
        outcome.summary === undefined
          ? { type: 'succeeded' }
          : { type: 'succeeded', summary: outcome.summary },
      );
    } else if (outcome.kind === 'network') {
      setBanner({ type: 'network' });
    } else {
      showServerErrors(outcome.errors);
    }
  };

  // Built when an event fires, not during render: `send` reads a ref.
  const submit = (event?: BaseSyntheticEvent) => form.handleSubmit(send)(event);

  if (phase.type === 'succeeded') {
    return (
      <SuccessPanel
        {...(phase.summary === undefined ? {} : { summary: phase.summary })}
        onEdit={() => setPhase({ type: 'editing' })}
        onNew={() => {
          form.reset(defaultValues);
          setBanner(null);
          setPhase({ type: 'editing' });
        }}
      />
    );
  }

  return (
    <Form onSubmit={(event) => void submit(event)}>
      {model.fields.length === 0 ? <Alert tone="info">{t('form_empty')}</Alert> : null}

      {model.fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          kind={kindOf(field.kind)}
          control={form.control}
          id={`${uid}-${field.name}`}
        />
      ))}

      {banner?.type === 'network' ? (
        <Alert
          tone="error"
          title={t('network_error_title')}
          action={
            <Button variant="secondary" onClick={() => void submit()}>
              {t('retry')}
            </Button>
          }
        >
          {t('network_error')}
        </Alert>
      ) : null}
      {banner?.type === 'server' ? (
        <Alert tone="error" title={t('form_errors_title')}>
          {banner.errors.map((error, index) => (
            <p key={`${error.code}-${index}`}>{describeError(error)}</p>
          ))}
        </Alert>
      ) : null}

      <FormActions>
        <Button type="submit" busy={submitting} disabled={model.fields.length === 0}>
          {t('submit')}
        </Button>
      </FormActions>
      <VisuallyHidden live>{submitting ? t('submitting') : ''}</VisuallyHidden>
    </Form>
  );
}
