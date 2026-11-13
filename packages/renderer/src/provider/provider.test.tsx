import { render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { defaultUiKit } from '../default-kit';
import { enMessages } from '../i18n/en-messages';
import type { UiKit } from '../ui-kit';
import { DynamicFormProvider } from './dynamic-form-provider';
import { useMessages } from './use-messages';
import { useUiKit } from './use-ui-kit';

// ADR-0015: a host gives the renderer its design system and its language through one provider. With
// nothing given, the defaults apply, so <DynamicForm> works with no setup at all.
const otherKit: UiKit = {
  ...defaultUiKit,
  Button: ({ children }) => <button data-kit="other">{children}</button>,
};

const wrap =
  (
    props: Parameters<typeof DynamicFormProvider>[0] extends infer P ? Omit<P, 'children'> : never,
  ) =>
  ({ children }: { children: ReactNode }) => (
    <DynamicFormProvider {...props}>{children}</DynamicFormProvider>
  );

describe('without a provider', () => {
  it('uses the default UI kit', () => {
    expect(renderHook(() => useUiKit()).result.current).toBe(defaultUiKit);
  });

  it('speaks Persian', () => {
    const { t, locale } = renderHook(() => useMessages()).result.current;
    expect(locale).toBe('fa-IR');
    expect(t('submit')).toBe('ارسال');
  });
});

describe('DynamicFormProvider', () => {
  it('gives its UI kit to the components below it', () => {
    const { result } = renderHook(() => useUiKit(), { wrapper: wrap({ ui: otherKit }) });
    expect(result.current).toBe(otherKit);
  });

  it('gives its messages to the components below it', () => {
    const { result } = renderHook(() => useMessages(), { wrapper: wrap({ messages: enMessages }) });
    expect(result.current.locale).toBe('en-US');
    expect(result.current.t('submit')).toBe('Submit');
  });

  it('changes only what it is given: a provider with messages keeps the default kit', () => {
    const { result } = renderHook(() => useUiKit(), { wrapper: wrap({ messages: enMessages }) });
    expect(result.current).toBe(defaultUiKit);
  });

  it('lets an inner provider override an outer one', () => {
    const outer = ({ children }: { children: ReactNode }) => (
      <DynamicFormProvider ui={otherKit}>
        <DynamicFormProvider messages={enMessages}>{children}</DynamicFormProvider>
      </DynamicFormProvider>
    );
    const { result } = renderHook(() => ({ ui: useUiKit(), messages: useMessages() }), {
      wrapper: outer,
    });
    expect(result.current.ui).toBe(otherKit);
    expect(result.current.messages.t('submit')).toBe('Submit');
  });

  it('keeps the same translator while its messages object does not change', () => {
    const { result, rerender } = renderHook(() => useMessages(), {
      wrapper: wrap({ messages: enMessages }),
    });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('renders its children', () => {
    render(<DynamicFormProvider>اینجا</DynamicFormProvider>);
    expect(screen.getByText('اینجا')).toBeInTheDocument();
  });
});
