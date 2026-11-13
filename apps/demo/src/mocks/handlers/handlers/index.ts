import { delay, http, HttpResponse, type JsonBodyType } from 'msw';
import {
  normalize,
  validateValues,
  type FormModel,
  type FormValues,
} from '@dynamic-form/renderer/core';
import { FORM_PAYLOADS } from '../../fixtures/scenarios/form-payloads';
import { attempts } from '../attempts';

function countAttempt(counter: Map<string, number>, formId: string): number {
  const count = (counter.get(formId) ?? 0) + 1;
  counter.set(formId, count);
  return count;
}

const json = (body: unknown, status = 200) => HttpResponse.json(body as JsonBodyType, { status });

function modelOf(formId: string): FormModel | undefined {
  const payload = FORM_PAYLOADS[formId];
  if (payload === undefined) return undefined;
  const result = normalize(payload, formId);
  return result.ok ? result.model : undefined;
}

// Text parts are strings; file parts are Files. A text field that receives a file counts as empty.
function valuesFrom(model: FormModel, form: FormData): FormValues {
  return Object.fromEntries(
    model.fields.map((field) => {
      if (field.kind === 'file') {
        return [field.name, form.getAll(field.name).filter((part) => typeof part !== 'string')];
      }
      const part = form.get(field.name);
      return [field.name, typeof part === 'string' ? part : ''];
    }),
  );
}

type WireError = { code: string; params?: Record<string, string | number>; message?: string };

function checkSubmission(model: FormModel, form: FormData): Record<string, WireError[]> {
  // The same rules the form applies in the browser, applied again to what arrived.
  const errors: Record<string, WireError[]> = { ...validateValues(model, valuesFrom(model, form)) };

  // A rule only the server knows, with text only the server owns.
  if (form.get('brand') === 'bad') {
    errors['brand'] = [
      ...(errors['brand'] ?? []),
      { code: 'brand_not_allowed', message: 'این برند در سامانه پذیرفته نمی‌شود.' },
    ];
  }

  const known = new Set(model.fields.map((field) => field.name));
  for (const name of new Set(form.keys())) {
    if (!known.has(name)) {
      errors[name] = [{ code: 'unknown_field', message: `فیلد «${name}» در این فرم وجود ندارد.` }];
    }
  }
  return errors;
}

const handlers = [
  http.get('*/api/forms/:formId', async ({ params }) => {
    const formId = String(params['formId']);
    await delay();

    if (formId === 'flaky-load' && countAttempt(attempts.load, formId) === 1) {
      return new HttpResponse(null, { status: 500 });
    }
    const payload = FORM_PAYLOADS[formId];
    if (payload === undefined) return new HttpResponse(null, { status: 404 });
    return json(payload);
  }),

  http.post('*/api/forms/:formId/submissions', async ({ params, request }) => {
    const formId = String(params['formId']);
    await delay();

    // A form that cannot be shown cannot be submitted either.
    const model = modelOf(formId);
    if (model === undefined) return new HttpResponse(null, { status: 404 });

    if (formId === 'flaky-submit' && countAttempt(attempts.submit, formId) === 1) {
      return new HttpResponse(null, { status: 500 });
    }
    if (formId === 'closed') {
      const message = 'این فرم دیگر پذیرای پاسخ نیست.';
      return json({ formErrors: [{ code: 'form_closed', message }] }, 422);
    }

    const form = await request.formData();
    const errors = checkSubmission(model, form);
    if (Object.keys(errors).length > 0) return json({ errors }, 422);

    const files = [...form.values()]
      .filter((part): part is File => typeof part !== 'string')
      .map((file) => ({ name: file.name, size: file.size }));
    return json(
      { id: `sub_${Date.now().toString(36)}`, receivedAt: new Date().toISOString(), files },
      201,
    );
  }),
];

export { handlers };
