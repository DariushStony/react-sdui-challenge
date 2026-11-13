import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import type { ParseResult } from '../core/issues';
import type { KindDefinition } from '../core/kind';
import type { FormModel } from '../core/model';
import type { Normalizer } from '../core/normalize';
import { server } from '../test/server';
import { useFormQuery, useSubmitMutation } from './queries';

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

// api/ may depend on core/ only, so these tests use stand-ins for the normalizer and the kinds.
const emptyModel: FormModel = { formId: 'car', schemaVersion: 2, fields: [] };

describe('useFormQuery', () => {
  const fetched = { any: 'payload' };

  it('fetches the payload and caches whatever the normalizer makes of it', async () => {
    server.use(http.get('*/api/forms/car', () => HttpResponse.json(fetched)));
    const result: ParseResult = { ok: true, model: emptyModel, warnings: [] };
    const normalize = vi.fn<Normalizer>(() => result);

    const hook = renderHook(() => useFormQuery('car', normalize), { wrapper: wrapper() });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(normalize).toHaveBeenCalledWith(fetched, 'car');
    expect(hook.result.current.data).toBe(result);
  });

  it('hands the normalizer undefined for a body that is not JSON, so it can reject it', async () => {
    server.use(http.get('*/api/forms/car', () => new HttpResponse('nope', { status: 200 })));
    const normalize = vi.fn<Normalizer>(() => ({ ok: false, reason: 'invalid', issues: [] }));

    const hook = renderHook(() => useFormQuery('car', normalize), { wrapper: wrapper() });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(normalize).toHaveBeenCalledWith(undefined, 'car');
    expect(hook.result.current.data).toMatchObject({ ok: false, reason: 'invalid' });
  });

  it('exposes an HTTP failure as an error, and does not retry on its own', async () => {
    let calls = 0;
    server.use(
      http.get('*/api/forms/car', () => {
        calls += 1;
        return new HttpResponse(null, { status: 500 });
      }),
    );
    const normalize = vi.fn<Normalizer>();

    const hook = renderHook(() => useFormQuery('car', normalize), { wrapper: wrapper() });

    await waitFor(() => expect(hook.result.current.isError).toBe(true));
    expect(calls).toBe(1);
    expect(normalize).not.toHaveBeenCalled();
  });
});

const textKind: KindDefinition = {
  kind: 'text',
  fromV2: () => ({ ok: false, issues: [] }),
  valueSchema: () => {
    throw new Error('not used: the server validates in these tests');
  },
  defaultValue: () => '',
  appendTo: (field, value, body) => body.append(field.name, typeof value === 'string' ? value : ''),
};

const model: FormModel = {
  formId: 'car',
  schemaVersion: 2,
  fields: [
    { kind: 'text', name: 'brand', label: 'برند', required: true, rules: {} },
    { kind: 'text', name: 'trim', label: 'تیپ', required: false, rules: {} },
  ],
};

const textOf = (part: FormDataEntryValue | null): string => (typeof part === 'string' ? part : '');

describe('useSubmitMutation', () => {
  const run = async (values: Record<string, string>) => {
    const hook = renderHook(() => useSubmitMutation('car', model, [textKind]), {
      wrapper: wrapper(),
    });
    return hook.result.current.mutateAsync(values);
  };

  it('sends every field of the model as multipart and reports success', async () => {
    let sent: Record<string, string> = {};
    server.use(
      http.post('*/api/forms/car/submissions', async ({ request }) => {
        const form = await request.formData();
        sent = { brand: textOf(form.get('brand')), trim: textOf(form.get('trim')) };
        return HttpResponse.json({ id: 's1' }, { status: 201 });
      }),
    );

    expect(await run({ brand: 'پژو', trim: '' })).toEqual({ ok: true });
    expect(sent).toEqual({ brand: 'پژو', trim: '' });
  });

  it('reads a 422 into field errors and form errors, with unknown fields moved to the form', async () => {
    server.use(
      http.post('*/api/forms/car/submissions', () =>
        HttpResponse.json(
          {
            errors: {
              brand: [{ code: 'brand_not_allowed', message: 'مجاز نیست' }],
              ghost: [{ code: 'x' }],
            },
            formErrors: [{ code: 'form_closed' }],
          },
          { status: 422 },
        ),
      ),
    );

    expect(await run({ brand: 'bad', trim: '' })).toEqual({
      ok: false,
      kind: 'validation',
      errors: {
        fields: { brand: [{ code: 'brand_not_allowed', message: 'مجاز نیست' }] },
        form: [{ code: 'form_closed' }, { code: 'x' }],
      },
    });
  });

  it.each([
    ['an unexpected shape', { oops: 1 }],
    ['no errors in it', { errors: {}, formErrors: [] }],
  ])('treats a 422 with %s as a failure to retry', async (_name, body) => {
    server.use(
      http.post('*/api/forms/car/submissions', () => HttpResponse.json(body, { status: 422 })),
    );
    expect(await run({ brand: 'x', trim: '' })).toEqual({ ok: false, kind: 'network' });
  });

  it.each([500, 413])('treats status %d as a failure to retry', async (status) => {
    server.use(http.post('*/api/forms/car/submissions', () => new HttpResponse(null, { status })));
    expect(await run({ brand: 'x', trim: '' })).toEqual({ ok: false, kind: 'network' });
  });
});
