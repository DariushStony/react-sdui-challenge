import { useMemo, type ReactNode } from 'react';
import { createTranslator } from '../../i18n/create-translator';
import type { Messages } from '../../i18n/messages';
import type { UiKit } from '../../ui-kit/ui-kit';
import { MessagesContext } from '../messages-context';
import { UiKitContext } from '../ui-kit-context';

type Props = {
  /** The design components to render with; the library's own kit when omitted. */
  ui?: UiKit;
  /** The language to speak; Persian when omitted. */
  messages?: Messages;
  children: ReactNode;
};

/**
 * Gives the renderer a design system and a language. Each is optional and changes only what it is
 * given, so providers can be nested: an inner one overrides an outer one for just that part.
 */
function DynamicFormProvider({ ui, messages, children }: Props) {
  const translator = useMemo(
    () => (messages === undefined ? undefined : createTranslator(messages)),
    [messages],
  );
  const withUi = ui === undefined ? children : <UiKitContext value={ui}>{children}</UiKitContext>;
  return translator === undefined ? (
    withUi
  ) : (
    <MessagesContext value={translator}>{withUi}</MessagesContext>
  );
}

export { DynamicFormProvider };
