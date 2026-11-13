import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { HttpError, fetchForm, submitForm } from './client';

// The client is the only place that calls fetch (TDD 6.4). It turns HTTP details into values the
// rest of the app can use, and never sets a Content-Type on the multipart request.
describe('fetchForm', () => {
  it('returns the parsed JSON body and asks for JSON', async () => {
    let accept: string | null = null;
    server.use(
      http.get('*/api/forms/car', ({ request }) => {
        accept = request.headers.get('accept');
        return HttpResponse.json({ fields: [] });
      }),
    );
    expect(await fetchForm('car')).toEqual({ fields: [] });
    expect(accept).toContain('application/json');
  });

  it('puts the form id in the path, encoded', async () => {
    server.use(
      http.get('*/api/forms/:id', ({ params }) => HttpResponse.json({ id: params['id'] })),
    );
    expect(await fetchForm('a b/c')).toEqual({ id: 'a b/c' });
  });

  it('returns undefined for a body that is not JSON, so the caller can report an invalid payload', async () => {
    server.use(
      http.get('*/api/forms/car', () => new HttpResponse('<html>oops</html>', { status: 200 })),
    );
    expect(await fetchForm('car')).toBeUndefined();
  });

  it.each([404, 500, 503])('throws an HttpError that carries the status %d', async (status) => {
    server.use(http.get('*/api/forms/car', () => new HttpResponse(null, { status })));
    const error = await fetchForm('car').catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(HttpError);
    expect(error instanceof HttpError && error.status).toBe(status);
  });

  it('rejects when the network fails', async () => {
    server.use(http.get('*/api/forms/car', () => HttpResponse.error()));
    await expect(fetchForm('car')).rejects.toThrow();
  });

  it('passes an abort signal to the request', async () => {
    server.use(http.get('*/api/forms/car', async () => new Promise<Response>(() => undefined)));
    const controller = new AbortController();
    const pending = fetchForm('car', controller.signal);
    controller.abort();
    await expect(pending).rejects.toThrow();
  });
});

const textOf = (part: FormDataEntryValue | null): string =>
  typeof part === 'string' ? part : '(not text)';

describe('submitForm', () => {
  const png = (name: string, content: string) => new File([content], name, { type: 'image/png' });

  it('sends one multipart request, with the browser adding the boundary, and both files intact', async () => {
    let seen:
      { contentType: string | null; fields: Record<string, string>; files: string[] } | undefined;
    server.use(
      http.post('*/api/forms/car/submissions', async ({ request }) => {
        const form = await request.formData();
        seen = {
          contentType: request.headers.get('content-type'),
          fields: { brand: textOf(form.get('brand')) },
          files: form
            .getAll('photos')
            .map((v) => (v instanceof File ? `${v.name}:${v.size}` : 'not a file')),
        };
        return HttpResponse.json({ id: 'sub_1' }, { status: 201 });
      }),
    );
    const body = new FormData();
    body.append('brand', 'پژو');
    body.append('photos', png('a.png', 'aaa'));
    body.append('photos', png('b.png', 'bbbbb'));

    const result = await submitForm('car', body);

    expect(result).toEqual({ type: 'success', body: { id: 'sub_1' } });
    expect(seen?.contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(seen?.fields).toEqual({ brand: 'پژو' });
    expect(seen?.files).toEqual(['a.png:3', 'b.png:5']);
  });

  it('reads a 422 as validation errors and returns the body', async () => {
    const errors = { errors: { brand: [{ code: 'required' }] } };
    server.use(
      http.post('*/api/forms/car/submissions', () => HttpResponse.json(errors, { status: 422 })),
    );
    expect(await submitForm('car', new FormData())).toEqual({ type: 'validation', body: errors });
  });

  it.each([400, 404, 413, 500, 503])('treats status %d as a failure to retry', async (status) => {
    server.use(http.post('*/api/forms/car/submissions', () => new HttpResponse(null, { status })));
    expect(await submitForm('car', new FormData())).toEqual({ type: 'network' });
  });

  it('treats a network error as a failure to retry, instead of throwing', async () => {
    server.use(http.post('*/api/forms/car/submissions', () => HttpResponse.error()));
    expect(await submitForm('car', new FormData())).toEqual({ type: 'network' });
  });

  it('counts a 2xx as success even when the body is empty or not JSON', async () => {
    server.use(
      http.post('*/api/forms/car/submissions', () => new HttpResponse(null, { status: 204 })),
    );
    expect(await submitForm('car', new FormData())).toEqual({ type: 'success', body: undefined });
  });
});
