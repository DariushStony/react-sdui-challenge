import { v2CarPayload } from '../../v2-car';

// The Playground's "server error" preset: a normal form whose dry-run submit answers with errors.
const serverErrorPayload: unknown = {
  ...(v2CarPayload as object),
  formId: 'server-error',
  title: 'سناریوی خطای سرور',
};

export { serverErrorPayload };
