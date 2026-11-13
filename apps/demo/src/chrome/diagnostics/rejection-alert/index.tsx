import { Alert, type Issue, type RejectionReason } from '@dynamic-form/renderer';
import { t } from '../../../messages/t';
import { TechnicalDetails } from '../technical-details';
import { describeIssue } from '../describe-issue';

const REJECTION_TEXT: Record<RejectionReason, string> = {
  invalid: 'rejected_invalid',
  outdated: 'rejected_outdated',
  'unknown-required-kind': 'rejected_unknown_required_kind',
  'duplicate-name': 'rejected_duplicate_name',
};

/** Why a payload cannot be shown (ADR-0011): one message per reason, naming the field if there is one. */
function RejectionAlert({ reason, issues }: { reason: RejectionReason; issues: readonly Issue[] }) {
  const field = issues.find((issue) => issue.field !== undefined)?.field ?? '';
  return (
    <Alert tone="error" title={t('rejected_title')}>
      <p>{t(REJECTION_TEXT[reason], { field })}</p>
      <TechnicalDetails lines={issues.map(describeIssue)} />
    </Alert>
  );
}

export { RejectionAlert };
