/**
 * The ids a field gives its label, hint and error area, derived from the control's id. Kit-independent:
 * the field components and any kit's `Field` agree on these names.
 */
export function fieldIds(id: string): { label: string; description: string; error: string } {
  return { label: `${id}-label`, description: `${id}-description`, error: `${id}-error` };
}
