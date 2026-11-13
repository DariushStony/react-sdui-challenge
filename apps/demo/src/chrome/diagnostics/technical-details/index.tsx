import { t } from '../../../messages/t';

/**
 * Developer-facing detail. The text for the person is Persian; what went wrong in the payload is
 * for developers, so it stays English and left-to-right inside the right-to-left page.
 */
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

export { TechnicalDetails };
