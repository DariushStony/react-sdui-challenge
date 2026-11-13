import { fieldIds } from '../field-ids';

/** The `aria-describedby` value for a control: only the parts that are on screen. */
function describedBy(
  id: string,
  parts: { readonly description: boolean; readonly error: boolean },
): string | undefined {
  const ids = fieldIds(id);
  const listed: string[] = [];
  if (parts.description) listed.push(ids.description);
  if (parts.error) listed.push(ids.error);
  return listed.length > 0 ? listed.join(' ') : undefined;
}

export { describedBy };
