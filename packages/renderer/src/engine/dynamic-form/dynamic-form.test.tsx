import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vi-axe';
import type { FormModel } from '../../core/model/form-model';
import type { FormValues } from '../../core/model/form-values';
import type { TextField } from '../../core/model/text-field';
import { FIELD_KINDS } from '../../fields/field-kinds';
import { defineFieldKind } from '../../fields/define-field-kind/define-field-kind';
import { type FieldKind } from '../../fields/define-field-kind/field-kind';
import type { FieldComponentProps } from '../../fields/component';
import { normalize } from '../../fields/definitions/normalize';
import { TextComponent } from '../../fields/text/component';
import { setDocumentDirection } from '../../i18n/direction/set-document-direction';
import { t } from '../../test/t';
import { DynamicForm } from './dynamic-form';
import { type SubmitOutcome } from '../outcome';

// TC-E06, TC-E07, TC-E08, TC-E10, TC-E11, TC-E16, TC-E17, TC-E18 and the outcome handling behind
// TC-E12 to TC-E15, with a stub onSubmit: the engine has no network code (TDD 6.3).
function modelFrom(fields: object[], formId = 'car'): FormModel {
  const result = normalize({ schemaVersion: 2, fields }, formId);
  if (!result.ok) throw new Error(JSON.stringify(result.issues));
  return result.model;
}

const carFields = [
  { kind: 'text', name: 'brand', label: 'برند', rules: { required: true, maxLength: 10 } },
  {
    kind: 'number',
    name: 'year',
    label: 'سال ساخت',
    rules: { min: 1900, max: 2024, integer: true },
  },
  {
    kind: 'select',
    name: 'fuel',
    label: 'نوع سوخت',
    options: [
      { value: 'petrol', label: 'بنزین' },
      { value: 'gas', label: 'گاز' },
    ],
    rules: { required: true },
  },
  { kind: 'textarea', name: 'notes', label: 'توضیحات' },
  {
    kind: 'file',
    name: 'photos',
    label: 'تصاویر',
    multiple: true,
    rules: { accept: ['image/*'], maxBytes: 10 },
  },
];

const png = (name: string, content = 'x') =>
  new File([content], name, { type: 'image/png', lastModified: 1 });

type Submit = (values: FormValues) => Promise<SubmitOutcome>;

function renderForm(
  options: { model?: FormModel; onSubmit?: Submit; kinds?: readonly FieldKind[] } = {},
) {
  const onSubmit = vi.fn<Submit>(options.onSubmit ?? (async () => ({ ok: true })));
  const model = options.model ?? modelFrom(carFields);
  const user = userEvent.setup();
  const ui = (m: FormModel) => (
    <DynamicForm
      model={m}
      onSubmit={onSubmit}
      {...(options.kinds ? { kinds: options.kinds } : {})}
    />
  );
  const result = render(ui(model));
  return { ...result, user, onSubmit, rerenderWith: (m: FormModel) => result.rerender(ui(m)) };
}

const brand = () => screen.getByRole('textbox', { name: /برند/ });
const year = () => screen.getByRole('textbox', { name: /سال ساخت/ });
const fuel = () => screen.getByRole('combobox', { name: /نوع سوخت/ });
const submit = () => screen.getByRole('button', { name: t('submit') });
const fileInput = (container: HTMLElement) => {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('no file input');
  return input;
};

async function fillValid(ctx: ReturnType<typeof renderForm>) {
  await ctx.user.type(brand(), 'پژو');
  await ctx.user.type(year(), '2020');
  await ctx.user.selectOptions(fuel(), 'gas');
  await ctx.user.upload(fileInput(ctx.container), png('a.png'));
}

beforeEach(() => {
  vi.spyOn(URL, 'createObjectURL').mockImplementation(
    (blob) => `blob:${blob instanceof File ? blob.name : 'x'}`,
  );
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  setDocumentDirection('rtl', 'fa');
});

// Element ids are derived by the form, never from a field name: a name is server data. Two names
// that differ only by a suffix, or a name with a space, must not produce clashing or broken ids.
describe('element ids', () => {
  const trickyFields = [
    { kind: 'text', name: 'a', label: 'الف', description: 'توضیح', rules: { required: true } },
    { kind: 'text', name: 'a-error', label: 'ب' },
    { kind: 'text', name: 'first name', label: 'نام', description: 'یک توضیح' },
    { kind: 'text', name: 'empty', label: 'خالی', description: '' },
    { kind: 'file', name: 'x', label: 'فایل' },
    { kind: 'text', name: 'x-button', label: 'دکمه' },
  ];

  it('gives every element a unique id, and every reference points at an element that exists', async () => {
    const ctx = renderForm({ model: modelFrom(trickyFields) });
    // The required field fails, so the form stays and its error areas are referenced too.
    await ctx.user.click(submit());

    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);

    const references = [
      ...document.querySelectorAll('[aria-describedby], [aria-labelledby]'),
    ].flatMap((element) =>
      [element.getAttribute('aria-describedby'), element.getAttribute('aria-labelledby')]
        .filter((value): value is string => value !== null)
        .flatMap((value) => value.split(/\s+/)),
    );
    expect(references.length).toBeGreaterThan(0);
    for (const reference of references) expect(ids, `#${reference}`).toContain(reference);
  });
});

// A button that is activated and then removed from the page takes keyboard focus with it, and focus
// falls back to the top of the page. After each outcome, focus goes to where the person works next.
describe('focus after an outcome', () => {
  const failing: Submit = async () => ({ ok: false, kind: 'network' });

  it('moves focus to the network error, again after a failed Retry', async () => {
    const ctx = renderForm({ onSubmit: failing });
    await fillValid(ctx);
    await ctx.user.click(submit());
    expect(await screen.findByRole('alert')).toHaveFocus();

    await ctx.user.click(screen.getByRole('button', { name: t('retry') }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus());
  });

  it('moves focus to the form-level alert when the server names no field of the form', async () => {
    const ctx = renderForm({
      onSubmit: async () => ({
        ok: false,
        kind: 'validation',
        errors: { fields: {}, form: [{ code: 'form_closed', message: 'بسته است' }] },
      }),
    });
    await fillValid(ctx);
    await ctx.user.click(submit());

    expect(await screen.findByRole('alert')).toHaveFocus();
  });

  it.each([['edit_again'], ['new_form']])(
    'moves focus to the first field after "%s", because the panel with the button is gone',
    async (action) => {
      const ctx = renderForm();
      await fillValid(ctx);
      await ctx.user.click(submit());
      await ctx.user.click(await screen.findByRole('button', { name: t(action) }));

      expect(brand()).toHaveFocus();
    },
  );
});

describe('structure', () => {
  it('renders every field by its kind, in the order of the form', () => {
    const { container } = renderForm();
    const labels = [...container.querySelectorAll('label')].map((l) =>
      l.textContent?.replace('*', ''),
    );
    expect(labels).toEqual(['برند', 'سال ساخت', 'نوع سوخت', 'توضیحات', 'تصاویر']);
    expect(screen.getByRole('textbox', { name: /توضیحات/ })).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('leaves validation to the app', () => {
    const { container } = renderForm();
    expect(container.querySelector('form')).toHaveAttribute('novalidate');
  });

  it('says so, and cannot be submitted, when the form has no fields (EC-01)', () => {
    renderForm({ model: modelFrom([]) });
    expect(screen.getByText(t('form_empty'))).toBeInTheDocument();
    expect(submit()).toBeDisabled();
  });
});

describe('validation timing', () => {
  it('shows no error before a field has been left', async () => {
    const { user } = renderForm();
    await user.click(brand());
    expect(screen.queryByText(t('required'))).not.toBeInTheDocument();
  });

  it('shows the error after leaving an empty required field, then follows every change', async () => {
    const { user } = renderForm();
    await user.click(brand());
    await user.tab();
    expect(screen.getByText(t('required'))).toBeInTheDocument();

    await user.type(brand(), 'پژو');
    await waitFor(() => expect(screen.queryByText(t('required'))).not.toBeInTheDocument());

    await user.clear(brand());
    expect(await screen.findByText(t('required'))).toBeInTheDocument();
  });

  it('reads Persian digits and shows the bound in Persian digits', async () => {
    const { user } = renderForm();
    await user.type(year(), '۱۸۰۰');
    await user.tab();
    expect(await screen.findByText(t('too_small', { min: 1900 }))).toBeInTheDocument();
    expect(screen.getByText(t('too_small', { min: 1900 }))).toHaveTextContent('۱۹۰۰');
  });

  it('blocks a required select that has no options (EC-02)', async () => {
    const model = modelFrom([
      { kind: 'select', name: 'fuel', label: 'نوع سوخت', options: [], rules: { required: true } },
    ]);
    const { user, onSubmit } = renderForm({ model });
    await user.click(submit());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(t('required'))).toBeInTheDocument();
  });
});

describe('an invalid submit', () => {
  it('sends nothing, shows every error and focuses the first invalid control', async () => {
    const { user, onSubmit } = renderForm();
    await user.click(submit());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findAllByText(t('required'))).toHaveLength(2);
    expect(brand()).toHaveFocus();
    expect(brand()).toHaveAttribute('aria-invalid', 'true');
  });

  it('focuses the file picker when the file field is the first invalid one', async () => {
    const model = modelFrom([
      { kind: 'text', name: 'a', label: 'الف' },
      { kind: 'file', name: 'photos', label: 'تصاویر', rules: { required: true } },
    ]);
    const { user } = renderForm({ model });
    await user.click(submit());
    expect(await screen.findByText(t('required'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(t('choose_file')) })).toHaveFocus();
  });

  it('checks files at once, without waiting for a submit', async () => {
    const { user, container } = renderForm();
    await user.upload(fileInput(container), png('big.png', 'x'.repeat(11)));
    expect(
      await screen.findByText(t('file_too_large', { file: 'big.png', maxBytes: 10 })),
    ).toBeInTheDocument();
  });
});

describe('a valid submit', () => {
  it('hands the values, as typed, and the files to onSubmit', async () => {
    const ctx = renderForm();
    await fillValid(ctx);
    await ctx.user.click(submit());
    await waitFor(() => expect(ctx.onSubmit).toHaveBeenCalledTimes(1));
    const values = ctx.onSubmit.mock.calls[0]?.[0];
    expect(values).toMatchObject({ brand: 'پژو', year: '2020', fuel: 'gas', notes: '' });
    const photos = values?.['photos'];
    expect(Array.isArray(photos) && photos.map((f) => f.name)).toEqual(['a.png']);
  });

  it('ignores a second submit while the first is in flight, and says it is busy', async () => {
    let release: (outcome: SubmitOutcome) => void = () => undefined;
    const ctx = renderForm({ onSubmit: () => new Promise((resolve) => (release = resolve)) });
    await fillValid(ctx);
    await ctx.user.click(submit());
    await waitFor(() => expect(submit()).toHaveAttribute('aria-busy', 'true'));
    await ctx.user.click(submit());
    await ctx.user.keyboard('{Enter}');
    expect(ctx.onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByText(t('submitting'))).toHaveAttribute('aria-live', 'polite');

    release({ ok: true });
    expect(await screen.findByRole('status')).toBeInTheDocument();
  });
});

describe('a submit that bypasses the button', () => {
  it('is ignored too while one is in flight (the engine guards itself, not only the button)', async () => {
    let release: (outcome: SubmitOutcome) => void = () => undefined;
    const ctx = renderForm({ onSubmit: () => new Promise((resolve) => (release = resolve)) });
    await fillValid(ctx);
    await ctx.user.click(submit());
    await waitFor(() => expect(submit()).toHaveAttribute('aria-busy', 'true'));

    const form = ctx.container.querySelector<HTMLFormElement>('form');
    if (!form) throw new Error('no form');
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(ctx.onSubmit).toHaveBeenCalledTimes(1);

    release({ ok: true });
    await screen.findByRole('status');
  });
});

describe('after a successful submit', () => {
  async function succeed() {
    const ctx = renderForm();
    await fillValid(ctx);
    await ctx.user.click(submit());
    const panel = await screen.findByRole('status');
    return { ...ctx, panel };
  }

  it('shows a success panel that takes focus, instead of the form', async () => {
    const { panel } = await succeed();
    expect(panel).toHaveFocus();
    expect(within(panel).getByText(t('submit_success_title'))).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /برند/ })).not.toBeInTheDocument();
  });

  it('"Edit and resubmit" brings the form back with the same values and files', async () => {
    const { user } = await succeed();
    await user.click(screen.getByRole('button', { name: t('edit_again') }));
    expect(brand()).toHaveValue('پژو');
    expect(year()).toHaveValue('2020');
    expect(fuel()).toHaveValue('gas');
    expect(screen.getByText('a.png')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('"New form" brings back an empty form', async () => {
    const { user } = await succeed();
    await user.click(screen.getByRole('button', { name: t('new_form') }));
    expect(brand()).toHaveValue('');
    expect(year()).toHaveValue('');
    expect(fuel()).toHaveValue('');
    expect(screen.queryByText('a.png')).not.toBeInTheDocument();
  });
});

describe('other outcomes', () => {
  it('puts a server error under its field, keeps the data and focuses the field', async () => {
    const ctx = renderForm({
      onSubmit: async () => ({
        ok: false,
        kind: 'validation',
        errors: { fields: { brand: [{ code: 'too_long', params: { max: 3 } }] }, form: [] },
      }),
    });
    await fillValid(ctx);
    await ctx.user.click(submit());
    expect(await screen.findByText(t('too_long', { max: 3 }))).toBeInTheDocument();
    expect(brand()).toHaveAttribute('aria-invalid', 'true');
    expect(brand()).toHaveFocus();
    expect(brand()).toHaveValue('پژو');
    expect(year()).toHaveValue('2020');
    expect(screen.getByText('a.png')).toBeInTheDocument();
  });

  it('clears a server error as soon as the person edits that field', async () => {
    const ctx = renderForm({
      onSubmit: async () => ({
        ok: false,
        kind: 'validation',
        errors: {
          fields: { brand: [{ code: 'brand_not_allowed', message: 'این برند مجاز نیست' }] },
          form: [],
        },
      }),
    });
    await fillValid(ctx);
    await ctx.user.click(submit());
    expect(await screen.findByText('این برند مجاز نیست')).toBeInTheDocument();
    await ctx.user.type(brand(), 'ی');
    await waitFor(() => expect(screen.queryByText('این برند مجاز نیست')).not.toBeInTheDocument());
  });

  it('shows form-level server errors in an alert and keeps the data', async () => {
    const ctx = renderForm({
      onSubmit: async () => ({
        ok: false,
        kind: 'validation',
        errors: { fields: {}, form: [{ code: 'form_closed', message: 'فرم بسته است' }] },
      }),
    });
    await fillValid(ctx);
    await ctx.user.click(submit());
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(t('form_errors_title'));
    expect(alert).toHaveTextContent('فرم بسته است');
    expect(brand()).toHaveValue('پژو');
    expect(submit()).not.toHaveAttribute('aria-busy');
  });

  it('after a network failure shows an alert with Retry, keeps the data, and retries with the same values', async () => {
    const outcomes: SubmitOutcome[] = [{ ok: false, kind: 'network' }, { ok: true }];
    const ctx = renderForm({ onSubmit: async () => outcomes.shift() ?? { ok: true } });
    await fillValid(ctx);
    await ctx.user.click(submit());
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(t('network_error'));
    expect(brand()).toHaveValue('پژو');

    await ctx.user.click(within(alert).getByRole('button', { name: t('retry') }));
    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(ctx.onSubmit).toHaveBeenCalledTimes(2);
    expect(ctx.onSubmit.mock.calls[1]?.[0]).toMatchObject({ brand: 'پژو', year: '2020' });
  });

  it('treats an onSubmit that throws like a network failure', async () => {
    const ctx = renderForm({
      onSubmit: async () => {
        throw new Error('boom');
      },
    });
    await fillValid(ctx);
    await ctx.user.click(submit());
    expect(await screen.findByRole('alert')).toHaveTextContent(t('network_error'));
    expect(submit()).not.toHaveAttribute('aria-busy');
  });
});

describe('isolation and changes of the form', () => {
  it('does not re-render another field while typing in one', async () => {
    const renders: Record<string, number> = {};
    function CountingText(props: FieldComponentProps<TextField>) {
      renders[props.field.name] = (renders[props.field.name] ?? 0) + 1;
      return <TextComponent {...props} />;
    }
    const kinds = FIELD_KINDS.map((kind) =>
      kind.definition.kind === 'text'
        ? defineFieldKind('text', kind.definition, CountingText)
        : kind,
    );
    const model = modelFrom([
      { kind: 'text', name: 'a', label: 'الف' },
      { kind: 'text', name: 'b', label: 'ب' },
    ]);
    const { user } = renderForm({ model, kinds });
    const before = { ...renders };
    await user.type(screen.getByRole('textbox', { name: /الف/ }), 'پنج حرف');
    expect(renders['a']).toBeGreaterThan(before['a'] ?? 0);
    expect(renders['b']).toBe(before['b']);
  });

  it('starts fresh when the model changes (EC-16)', async () => {
    const { user, rerenderWith } = renderForm({
      model: modelFrom([{ kind: 'text', name: 'brand', label: 'برند' }], 'one'),
    });
    await user.type(brand(), 'پژو');
    expect(brand()).toHaveValue('پژو');
    rerenderWith(modelFrom([{ kind: 'text', name: 'brand', label: 'برند' }], 'two'));
    expect(brand()).toHaveValue('');
  });

  it('works in a left-to-right page too (FR-39)', async () => {
    setDocumentDirection('ltr', 'en');
    const { user, onSubmit } = renderForm();
    expect(document.documentElement.dir).toBe('ltr');
    await user.click(submit());
    expect(await screen.findAllByText(t('required'))).toHaveLength(2);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(brand()).toHaveFocus();
  });
});

describe('accessibility', () => {
  it('has no violations: initial, with errors, success and a network failure', async () => {
    const initial = renderForm();
    expect(await axe(initial.container)).toHaveNoViolations();
    await initial.user.click(submit());
    await screen.findAllByText(t('required'));
    expect(await axe(initial.container)).toHaveNoViolations();
    initial.unmount();

    const ok = renderForm();
    await fillValid(ok);
    await ok.user.click(submit());
    await screen.findByRole('status');
    expect(await axe(ok.container)).toHaveNoViolations();
    ok.unmount();

    const failing = renderForm({ onSubmit: async () => ({ ok: false, kind: 'network' }) });
    await fillValid(failing);
    await failing.user.click(submit());
    await screen.findByRole('alert');
    expect(await axe(failing.container)).toHaveNoViolations();
  });
});
