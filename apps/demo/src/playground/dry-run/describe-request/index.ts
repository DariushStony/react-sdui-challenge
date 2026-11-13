/** The request the real client would send, as text: same body, nothing sent (ADR-0013). */
function describeRequest(formId: string, body: FormData): string {
  const parts = [...body.entries()].map(([name, value]) =>
    typeof value === 'string'
      ? `${name}: ${JSON.stringify(value)}`
      : `${name}: ${value.name} (${value.type}, ${value.size} bytes)`,
  );
  return [
    `POST /api/forms/${encodeURIComponent(formId)}/submissions`,
    'Content-Type: multipart/form-data (the browser adds the boundary)',
    '',
    ...parts,
  ].join('\n');
}

export { describeRequest };
