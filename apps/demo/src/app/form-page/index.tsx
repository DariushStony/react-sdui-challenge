import { useEffect, type ReactNode } from 'react';
import { HttpError } from '../../api/client/http-error';
import { useFormQuery } from '../../api/queries/use-form-query';
import { useSubmitMutation } from '../../api/queries/use-submit-mutation';
import { DynamicForm, defaultUiKit } from '@dynamic-form/renderer';
import { normalize, type FormModel } from '@dynamic-form/renderer/core';
import { RejectionAlert } from '../../chrome/diagnostics/rejection-alert';
import { TechnicalDetails } from '../../chrome/diagnostics/technical-details';
import { describeIssue } from '../../chrome/diagnostics/describe-issue';
import { Page } from '../../chrome/page';
import { Spinner } from '../../chrome/spinner';
import { t } from '../../messages/t';

const { Alert, Button } = defaultUiKit;

function LoadedForm({ formId, model }: { formId: string; model: FormModel }) {
  const submit = useSubmitMutation(formId, model);
  return <DynamicForm model={model} onSubmit={(values) => submit.mutateAsync(values)} />;
}

/**
 * The page for one form id. It loads the form, says so when that fails or when the payload cannot be
 * shown, and owns the submission: it sends the request and gives the engine the outcome (TDD 6.3).
 */
function FormPage({ formId, notice }: { formId: string; notice?: ReactNode }) {
  const query = useFormQuery(formId, normalize);
  const parsed = query.data;

  // Warnings are for developers: a skipped optional field should be findable in the console.
  useEffect(() => {
    if (parsed?.ok !== true) return;
    for (const warning of parsed.warnings) {
      console.warn(`[form ${formId}] ${describeIssue(warning)}`);
    }
  }, [formId, parsed]);

  let title = t('form_default_title');
  let content: ReactNode;

  if (query.isError) {
    const detail =
      query.error instanceof HttpError ? `HTTP ${query.error.status}` : query.error.message;
    content = (
      <Alert
        tone="error"
        title={t('load_error_title')}
        action={
          <Button busy={query.isFetching} onClick={() => void query.refetch()}>
            {t('retry')}
          </Button>
        }
      >
        <p>{t('load_error')}</p>
        <TechnicalDetails lines={[detail]} />
      </Alert>
    );
  } else if (parsed === undefined) {
    content = <Spinner label={t('loading_form')} />;
  } else if (!parsed.ok) {
    content = <RejectionAlert reason={parsed.reason} issues={parsed.issues} />;
  } else {
    title = parsed.model.title ?? title;
    content = <LoadedForm formId={formId} model={parsed.model} />;
  }

  return (
    <Page title={title}>
      {notice}
      {content}
    </Page>
  );
}

export { FormPage };
