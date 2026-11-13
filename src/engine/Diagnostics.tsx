import type { Issue, RejectionReason } from '../core/issues';
import { t } from '../i18n/t';
import { Alert } from '../ui';

const REJECTION_TEXT: Record<RejectionReason, string> = {
  invalid: 'rejected_invalid',
  outdated: 'rejected_outdated',
  'unknown-required-kind': 'rejected_unknown_required_kind',
  'duplicate-name': 'rejected_duplicate_name',
};

export const describeIssue = (issue: Issue): string => `${issue.path}: ${issue.message}`;

/**
 * Developer-facing detail. The text for the person is Persian; what went wrong in the payload is
 * for developers, so it stays English and left-to-right inside the right-to-left page.
 */
export function TechnicalDetails({ lines }: { lines: readonly string[] }) {
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

/** Why a payload cannot be shown (ADR-0011): one message per reason, naming the field if there is one. */
export function RejectionAlert({
  reason,
  issues,
}: {
  reason: RejectionReason;
  issues: readonly Issue[];
}) {
  const field = issues.find((issue) => issue.field !== undefined)?.field ?? '';
  return (
    <Alert tone="error" title={t('rejected_title')}>
      <p>{t(REJECTION_TEXT[reason], { field })}</p>
      <TechnicalDetails lines={issues.map(describeIssue)} />
    </Alert>
  );
}

/** What the normalizer tolerated, for example a skipped optional field. Shown only if there is any. */
export function WarningsAlert({ warnings }: { warnings: readonly Issue[] }) {
  if (warnings.length === 0) return null;
  return (
    <Alert tone="info" title={t('warnings_title', { count: warnings.length })}>
      <TechnicalDetails lines={warnings.map(describeIssue)} />
    </Alert>
  );
}
