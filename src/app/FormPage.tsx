import { useEffect, type ReactNode } from 'react';
import { HttpError } from '../api/client';
import { useFormQuery, useSubmitMutation } from '../api/queries';
import type { Issue, RejectionReason } from '../core/issues';
import type { FormModel } from '../core/model';
import { DynamicForm } from '../engine/DynamicForm';
import { FIELD_DEFINITIONS, normalize } from '../fields/definitions';
import { t } from '../i18n/t';
import { Alert, Button, Page, Spinner } from '../ui';

const REJECTION_TEXT: Record<RejectionReason, string> = {
  invalid: 'rejected_invalid',
  outdated: 'rejected_outdated',
  'unknown-required-kind': 'rejected_unknown_required_kind',
  'duplicate-name': 'rejected_duplicate_name',
};

// The text for the person is Persian; what went wrong in the payload is for developers, so it stays
// English and left-to-right inside the page's right-to-left flow.
function TechnicalDetails({ lines }: { lines: readonly string[] }) {
  if (lines.length === 0) return null;
  return (
    <details>
      <summary>{t('technical_details')}</summary>
      <ul dir="ltr">
        {lines.map((line, index) => (
          <li key={`${index}-${line}`}>
            <code>{line}</code>
          </li>
        ))}
      </ul>
    </details>
  );
}

const describeIssue = (issue: Issue) => `${issue.path}: ${issue.message}`;

function LoadedForm({ formId, model }: { formId: string; model: FormModel }) {
  const submit = useSubmitMutation(formId, model, FIELD_DEFINITIONS);
  return <DynamicForm model={model} onSubmit={(values) => submit.mutateAsync(values)} />;
}

/**
 * The page for one form id. It loads the form, says so when that fails or when the payload cannot be
 * shown, and owns the submission: it sends the request and gives the engine the outcome (TDD 6.3).
 */
export function FormPage({ formId, notice }: { formId: string; notice?: ReactNode }) {
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
    const field = parsed.issues.find((issue) => issue.field !== undefined)?.field ?? '';
    content = (
      <Alert tone="error" title={t('rejected_title')}>
        <p>{t(REJECTION_TEXT[parsed.reason], { field })}</p>
        <TechnicalDetails lines={parsed.issues.map(describeIssue)} />
      </Alert>
    );
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
