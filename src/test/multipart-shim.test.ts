import { http, HttpResponse } from 'msw';
import { server } from './server';

// TC-S08: guards the jsdom multipart shim (ADR-0009). If a Node, jsdom or undici upgrade breaks it,
// this is the test that fails, before any feature test is confused by it.
describe('multipart shim', () => {
  it('delivers two files and a text field to the handler intact', async () => {
    server.use(
      http.post('http://localhost/echo', async ({ request }) => {
        const form = await request.formData();
        return HttpResponse.json({
          contentType: request.headers.get('content-type'),
          brand: form.get('brand'),
          files: form
            .getAll('car_images')
            .map((value) =>
              value instanceof File
                ? { name: value.name, size: value.size, type: value.type }
                : null,
            ),
        });
      }),
    );

    const body = new FormData();
    body.append('brand', 'پژو');
    body.append('car_images', new File(['aaa'], 'a.png', { type: 'image/png' }));
    body.append('car_images', new File(['bbbbb'], 'b.png', { type: 'image/png' }));

    const response = await fetch('http://localhost/echo', { method: 'POST', body });
    const echoed = (await response.json()) as {
      contentType: string;
      brand: string;
      files: ({ name: string; size: number; type: string } | null)[];
    };

    expect(echoed.contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(echoed.brand).toBe('پژو');
    expect(echoed.files).toEqual([
      { name: 'a.png', size: 3, type: 'image/png' },
      { name: 'b.png', size: 5, type: 'image/png' },
    ]);
  });

  it('keeps File a kind of Blob, so libraries that copy form values do not break a file apart', () => {
    // react-hook-form copies values and leaves a Blob alone but copies other objects property by
    // property; a File that is not a Blob would lose its name and size in that copy.
    expect(new File(['a'], 'a.txt')).toBeInstanceOf(Blob);
  });

  it('fails loudly for a request with no handler', async () => {
    await expect(fetch('http://localhost/not-mocked')).rejects.toThrow();
  });
});
