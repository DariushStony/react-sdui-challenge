import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type BaseSyntheticEvent,
  type ReactNode,
} from 'react';
import { useForm } from 'react-hook-form';
import type { FieldError } from '../../../core/issues/field-error';
import type { ServerErrors } from '../../../core/issues/server-errors';
import type { FormModel } from '../../../core/model/form-model';
import type { FormValues } from '../../../core/model/form-values';
import { FIELD_KINDS } from '../../../fields/field-kinds';
import { type FieldKind } from '../../../fields/define-field-kind/field-kind';
import { useMessages } from '../../../provider/use-messages';
import { useUiKit } from '../../../provider/use-ui-kit';
import { buildValuesSchema } from '../../build-values-schema';
import { FieldRenderer } from '../../field-renderer';
import type { SubmitOutcome } from '../../outcome';
import { createResolver } from '../../resolver/create-resolver';
import { type CodedError } from '../../resolver/coded-error';
import { SuccessPanel } from '../../success-panel';
import type { DynamicFormProps } from '../dynamic-form-props';
import { modelKey } from '../model-key';

/** Renders the form a model describes and runs it: validation, focus, submit and its outcomes. */
function DynamicForm({ model, onSubmit, kinds = FIELD_KINDS }: DynamicFormProps) {
  return <DynamicFormBody key={modelKey(model)} model={model} onSubmit={onSubmit} kinds={kinds} />;
}

type Phase =
  { readonly type: 'editing' } | { readonly type: 'succeeded'; readonly summary?: ReactNode };

// `focus` says whether the banner should take keyboard focus when it appears: the Retry button that
// was just pressed is gone, and without this focus would fall back to the top of the page.
type Banner =
  | { readonly type: 'network'; readonly focus: boolean }
  | { readonly type: 'server'; readonly errors: readonly FieldError[]; readonly focus: boolean };

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

function DynamicFormBody({
  model,
  onSubmit,
  kinds,
}: Pick<DynamicFormProps, 'model' | 'onSubmit'> & { kinds: readonly FieldKind[] }) {
  const { Alert, Button, Form, FormActions, VisuallyHidden } = useUiKit();
  const { t, describeError } = useMessages();
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
  const bannerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (banner?.focus) bannerRef.current?.focus();
  }, [banner]);

  // Set by the success panel's two actions: that panel (and the button just pressed) is unmounted,
  // so the first field takes focus once the form is back.
  const focusFirstField = useRef(false);
  const firstFieldName = model.fields[0]?.name;
  useEffect(() => {
    if (phase.type !== 'editing' || !focusFirstField.current) return;
    focusFirstField.current = false;
    if (firstFieldName !== undefined) form.setFocus(firstFieldName);
  }, [phase, firstFieldName, form]);

  const showServerErrors = (errors: ServerErrors) => {
    const known = new Set(model.fields.map((field) => field.name));
    const unplaced: FieldError[] = [...errors.form];
    let firstWithError: string | undefined;
    for (const [name, list] of Object.entries(errors.fields)) {
      if (known.has(name)) form.setError(name, coded(list));
      else unplaced.push(...list);
    }
    firstWithError = model.fields.find((field) => errors.fields[field.name] !== undefined)?.name;
    // A field with an error takes the focus; the banner only does when there is no such field.
    setBanner(
      unplaced.length > 0
        ? { type: 'server', errors: unplaced, focus: firstWithError === undefined }
        : null,
    );
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
      setBanner({ type: 'network', focus: true });
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
        onEdit={() => {
          focusFirstField.current = true;
          setPhase({ type: 'editing' });
        }}
        onNew={() => {
          focusFirstField.current = true;
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

      {model.fields.map((field, index) => (
        <FieldRenderer
          key={field.name}
          field={field}
          kind={kindOf(field.kind)}
          control={form.control}
          // By position, not by name: a name is server data and may hold spaces, or differ from
          // another only by a suffix such as "-error", either of which would break the ids.
          id={`${uid}-field-${index}`}
        />
      ))}

      {banner?.type === 'network' ? (
        <Alert
          ref={bannerRef}
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
        <Alert ref={bannerRef} tone="error" title={t('form_errors_title')}>
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

export { DynamicForm };
