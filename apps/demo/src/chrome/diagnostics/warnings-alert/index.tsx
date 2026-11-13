import { Alert, type Issue } from '@dynamic-form/renderer';
import { t } from '../../../messages/t';
import { TechnicalDetails } from '../technical-details';
import { describeIssue } from '../describe-issue';

/** What the normalizer tolerated, for example a skipped optional field. Shown only if there is any. */
function WarningsAlert({ warnings }: { warnings: readonly Issue[] }) {
  if (warnings.length === 0) return null;
  return (
    <Alert tone="info" title={t('warnings_title', { count: warnings.length })}>
      <TechnicalDetails lines={warnings.map(describeIssue)} />
    </Alert>
  );
}

export { WarningsAlert };
